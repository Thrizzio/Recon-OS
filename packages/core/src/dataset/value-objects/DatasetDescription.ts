import { InvalidDatasetError } from "../errors/DatasetError.js";

/**
 * Optional description of a Dataset.
 * Immutable value object. Can be null or empty string to indicate no description.
 */
export class DatasetDescription {
  private readonly value: string | null;

  constructor(value: string | null) {
    if (value !== null && typeof value !== "string") {
      throw new InvalidDatasetError("DatasetDescription must be a string or null");
    }
    this.value = value === null ? null : value.trim();
  }

  public getValue(): string | null {
    return this.value;
  }

  public isEmpty(): boolean {
    return this.value === null || this.value === "";
  }

  public equals(other: DatasetDescription): boolean {
    if (this.isEmpty() && other.isEmpty()) {
      return true;
    }
    return this.value === other.value;
  }

  public toString(): string {
    return this.value ?? "";
  }

  public static from(value: string | null): DatasetDescription {
    return new DatasetDescription(value);
  }

  public static empty(): DatasetDescription {
    return new DatasetDescription(null);
  }
}
