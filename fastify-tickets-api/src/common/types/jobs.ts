export type ReservationExpiryJobData = {
  reservationId: string;
};

export type ReservationSweepJobData = Record<string, never>;

export type ReservationSweepResult = {
  expiredCount: number;
  failedCount: number;
  foundCount: number;
};

export type OrderRecoveryJobData = Record<string, never>;

export type OrderRecoveryResult = {
  foundCount: number;
  recoveredCount: number;
  failedCount: number;
  overdueCount: number;
};
