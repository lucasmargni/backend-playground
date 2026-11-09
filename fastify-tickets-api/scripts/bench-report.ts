import { readdir, readFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

type K6Metric = {
  values: Record<string, number>;
};

type K6Summary = {
  metrics: Record<string, K6Metric>;
};

type BenchmarkRow = {
  scenario: string;
  strategy: string;
  reservations: number;
  seatRows: number;
  duplicatedSeats: number;
  p95AllMs: number | null;
  p95CreatedMs: number | null;
  p95ConflictMs: number | null;
  avgCreatedMs: number | null;
  avgConflictMs: number | null;
};

type MetricLookup = {
  summary: K6Summary;
  metricName: string;
  stat: string;
};

const RESULTS_DIR: string = 'load-tests/results';
const RUN_NAME_SEPARATOR: string = '--';
const SUMMARY_EXTENSION: string = '.json';
const DUPLICATES_EXTENSION: string = '.duplicates';
const RESERVATION_REQUEST_NAME: string = 'reservation';
const HTTP_CREATED: number = 201;
const HTTP_CONFLICT: number = 409;
const RESERVATIONS_METRIC: string = 'reservations_created';
const SEATS_METRIC: string = 'seats_reserved';
const COUNT_STAT: string = 'count';
const P95_STAT: string = 'p(95)';
const AVG_STAT: string = 'avg';

const isK6Summary = (value: unknown): value is K6Summary => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'metrics' in value &&
    typeof value.metrics === 'object' &&
    value.metrics !== null
  );
};

const toReservationDurationMetric = (status?: number): string => {
  const statusFilter: string = status === undefined ? '' : `,status:${status}`;

  return `http_req_duration{name:${RESERVATION_REQUEST_NAME}${statusFilter}}`;
};

const readMetricValue = ({ summary, metricName, stat }: MetricLookup): number | null => {
  const metric: K6Metric | undefined = summary.metrics[metricName];

  const metricValue: number | undefined = metric?.values[stat];

  return metricValue !== undefined ? Math.round(metricValue) : null;
};

const readRun = async (runName: string): Promise<BenchmarkRow> => {
  const [scenario, strategy]: string[] = runName.split(RUN_NAME_SEPARATOR);

  if (scenario === undefined || strategy === undefined) {
    throw new Error(`Invalid run name "${runName}": expected "<scenario>--<strategy>"`);
  }

  const summaryPath: string = join(RESULTS_DIR, `${runName}${SUMMARY_EXTENSION}`);
  const duplicatesPath: string = join(RESULTS_DIR, `${runName}${DUPLICATES_EXTENSION}`);

  const [summaryText, duplicatesText]: [string, string] = await Promise.all([
    readFile(summaryPath, 'utf8'),
    readFile(duplicatesPath, 'utf8'),
  ]);

  const parsedSummary: unknown = JSON.parse(summaryText);

  if (!isK6Summary(parsedSummary)) {
    throw new Error(`Invalid k6 summary in ${summaryPath}: missing "metrics" object`);
  }

  const duplicatedSeats: number = Number(duplicatesText.trim());

  if (!Number.isInteger(duplicatedSeats)) {
    throw new Error(`Invalid duplicates count in ${duplicatesPath}: "${duplicatesText}"`);
  }

  return {
    scenario,
    strategy,
    reservations:
      readMetricValue({
        summary: parsedSummary,
        metricName: RESERVATIONS_METRIC,
        stat: COUNT_STAT,
      }) ?? 0,
    seatRows:
      readMetricValue({
        summary: parsedSummary,
        metricName: SEATS_METRIC,
        stat: COUNT_STAT,
      }) ?? 0,
    duplicatedSeats,
    p95AllMs: readMetricValue({
      summary: parsedSummary,
      metricName: toReservationDurationMetric(),
      stat: P95_STAT,
    }),
    p95CreatedMs: readMetricValue({
      summary: parsedSummary,
      metricName: toReservationDurationMetric(HTTP_CREATED),
      stat: P95_STAT,
    }),
    p95ConflictMs: readMetricValue({
      summary: parsedSummary,
      metricName: toReservationDurationMetric(HTTP_CONFLICT),
      stat: P95_STAT,
    }),
    avgCreatedMs: readMetricValue({
      summary: parsedSummary,
      metricName: toReservationDurationMetric(HTTP_CREATED),
      stat: AVG_STAT,
    }),
    avgConflictMs: readMetricValue({
      summary: parsedSummary,
      metricName: toReservationDurationMetric(HTTP_CONFLICT),
      stat: AVG_STAT,
    }),
  };
};

const fileNames: string[] = await readdir(RESULTS_DIR);
const runNames: string[] = fileNames
  .filter((fileName: string): boolean => fileName.endsWith(SUMMARY_EXTENSION))
  .map((fileName: string): string => basename(fileName, SUMMARY_EXTENSION));

if (runNames.length === 0) {
  throw new Error(`No k6 results found in ${RESULTS_DIR}. Run "npm run bench" first`);
}

const rows: BenchmarkRow[] = await Promise.all(runNames.map(readRun));
const sortedRows: BenchmarkRow[] = rows.toSorted(
  (rowA: BenchmarkRow, rowB: BenchmarkRow): number =>
    rowA.scenario.localeCompare(rowB.scenario) || rowA.strategy.localeCompare(rowB.strategy),
);

console.table(sortedRows);
