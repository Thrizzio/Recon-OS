/**
 * Name of a Dataset.
 * Immutable value object.
 */
export class DatasetName {
  private readonly value: string;

  constructor(value: string) {
    if (!value || typeof value !== "string") {
      throw new Error("DatasetName must be a non-empty string");
    }
    this.value = value.trim();
    if (!this.value) {
      throw new Error("DatasetName must not be empty after trimming");
    }
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: DatasetName): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }

  public static from(value: string): DatasetName {
    return new DatasetName(value);
  }
}
