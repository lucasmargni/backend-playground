export type ReservationExpiryJobData = {
  reservationId: string;
};

export type ReservationSweepJobData = Record<string, never>;

export type ReservationSweepResult = {
  expiredCount: number;
  failedCount: number;
  foundCount: number;
};
