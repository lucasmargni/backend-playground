export const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number,
  message: string,
): Promise<T> => {
  let timerId: NodeJS.Timeout | undefined;

  const timeoutPromise: Promise<never> = new Promise(
    (_resolve: (value: never) => void, reject: (reason: Error) => void): void => {
      timerId = setTimeout((): void => reject(new Error(message)), timeoutMs);
    },
  );

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timerId);
  }
};
