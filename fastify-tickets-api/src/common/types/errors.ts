import type { DomainError } from '../errors/index.js';

// type that represents all sub-classes of DomainError, no matter how they are defined
export type DomainErrorClass = abstract new (...args: never[]) => DomainError;
