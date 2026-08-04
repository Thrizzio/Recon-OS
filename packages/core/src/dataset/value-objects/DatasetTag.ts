/**
 * Tag for categorizing a Dataset.
 * Immutable value object.
 */
export class DatasetTag {
  private readonly value: string;

  constructor(value: string) {
    if (!value || typeof value !== "string") {
      throw new Error("DatasetTag must be a non-empty string");
    }
    this.value = value.trim();
    if (!this.value) {
      throw new Error("DatasetTag must not be empty or only whitespace");
    }
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: DatasetTag): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }

  public static from(value: string): DatasetTag {
    return new DatasetTag(value);
  }
}
