export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message);

    // change error name in logs to the corresponding class of each error
    this.name = new.target.name;
  }
}

export class NotFoundError extends DomainError {
  constructor(objectName: string, objectId: string) {
    super(`${objectName} ${objectId} not found`);
  }
}
