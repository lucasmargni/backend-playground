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

export class SeatsNotFoundError extends NotFoundError {
  public readonly seatIds: readonly string[];

  constructor(seatIds: readonly string[]) {
    super('Seats', seatIds.join(', '));

    this.seatIds = [...seatIds];
  }
}

export class DuplicateError extends DomainError {
  constructor(objectName: string, existingAttribute: string) {
    super(`There already exists a ${objectName} with the same ${existingAttribute}`);
  }
}

export class InvalidCredentialsError extends DomainError {
  constructor() {
    super('Invalid credentials');
  }
}

export class SeatsUnavailableError extends DomainError {
  public readonly seatIds: readonly string[];

  constructor(seatIds: readonly string[]) {
    super(`Seats ${seatIds.join(', ')} are not available`);

    this.seatIds = [...seatIds];
  }
}

export class UnknownUserError extends DomainError {
  constructor() {
    super('Unknown user');
  }
}
