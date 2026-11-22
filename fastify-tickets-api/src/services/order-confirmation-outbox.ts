import type { Transaction } from '../common/types/index.js';
import { orderConfirmationOutbox } from '../db/schema.js';

export const insertOrderConfirmationNote = async (
  tx: Transaction,
  orderId: string,
): Promise<void> => {
  await tx.insert(orderConfirmationOutbox).values({ orderId });
};
