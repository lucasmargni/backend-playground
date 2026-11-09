#!/usr/bin/env bash
# Runs every scenario × strategy combination from a clean database and stores each run's results.
set -euo pipefail

cd "$(dirname "$0")/.."

SCENARIOS=(same-seat random-seats)
STRATEGIES=(naive pessimistic)
RESULTS_DIR=load-tests/results
K6_IMAGE=grafana/k6:2.3.0
API_URL=http://localhost:3000

if ! curl -sf "${API_URL}/events" > /dev/null; then
  echo "API is not reachable at ${API_URL}. Start it with 'npm run dev' (ENABLE_BENCHMARK_ROUTES=true)." >&2
  exit 1
fi

sudo docker compose up -d --wait
rm -rf "$RESULTS_DIR"
mkdir -p "$RESULTS_DIR"

for scenario in "${SCENARIOS[@]}"; do
  for strategy in "${STRATEGIES[@]}"; do
    run_name="${scenario}--${strategy}"
    echo "=== ${run_name} ==="

    npm run --silent db:reset

    sudo docker run --rm -i --network host \
      --user "$(id -u):$(id -g)" \
      -v "$PWD/load-tests:/scripts" \
      "$K6_IMAGE" run \
      -e SCENARIO="$scenario" \
      -e STRATEGY="$strategy" \
      -e SUMMARY_FILE="/scripts/results/${run_name}.json" \
      /scripts/reservations.ts

    sudo docker compose exec -T postgres sh -c \
      'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tA -c "SELECT COUNT(*) FROM (SELECT seat_id FROM reservation_seats GROUP BY seat_id HAVING COUNT(*) > 1) AS duplicated_seats;"' \
      > "${RESULTS_DIR}/${run_name}.duplicates"
  done
done

echo
npm run --silent bench:report