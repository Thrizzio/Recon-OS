import { InvalidDatasetError } from "../errors/DatasetError.js";

/**
 * Unique identifier for a Dataset.
 * Immutable value object.
 */
export class DatasetId {
  private readonly value: string;

  constructor(value: string) {
    if (!value || typeof value !== "string" || value.trim().length === 0) {
      throw new InvalidDatasetError("DatasetId must be a non-empty string");
    }
    this.value = value.trim();
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: DatasetId): boolean {
    return Boolean(other && this.value === other.value);
  }

  public toString(): string {
    return this.value;
  }

  public static from(value: string): DatasetId {
    return new DatasetId(value);
  }
}
