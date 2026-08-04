/**
 * Character encoding (e.g., 'UTF-8', 'ISO-8859-1').
 * Immutable value object.
 */
export class Encoding {
  private readonly value: string;

  constructor(value: string) {
    if (!value || typeof value !== "string") {
      throw new Error("Encoding must be a non-empty string");
    }
    // Common encodings: we could validate against a list, but for now just trim and uppercase
    const trimmed = value.trim();
    if (!trimmed) {
      throw new Error("Encoding must not be empty");
    }
    this.value = trimmed.toUpperCase();
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: Encoding): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }

  public static from(value: string): Encoding {
    return new Encoding(value);
  }
}
