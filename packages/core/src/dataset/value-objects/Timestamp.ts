import { InvalidDatasetError } from "../errors/DatasetError.js";

/**
 * Timestamp in ISO 8601 format.
 * Immutable value object.
 */
export class Timestamp {
  private readonly value: string; // ISO 8601 string

  constructor(value: string | Date) {
    let isoString: string;
    if (value instanceof Date) {
      if (isNaN(value.getTime())) {
        throw new InvalidDatasetError("Timestamp must be a valid Date object");
      }
      isoString = value.toISOString();
    } else if (typeof value === "string") {
      // Validate that it's a valid ISO string by trying to parse it
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new InvalidDatasetError("Timestamp must be a valid ISO 8601 string or Date object");
      }
      isoString = value;
    } else {
      throw new InvalidDatasetError("Timestamp must be a string or Date object");
    }
    this.value = isoString;
  }

  public getValue(): string {
    return this.value;
  }

  public toDate(): Date {
    return new Date(this.value);
  }

  public equals(other: Timestamp): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }

  public static now(): Timestamp {
    return new Timestamp(new Date());
  }

  public static from(value: string | Date): Timestamp {
    return new Timestamp(value);
  }
}
