/**
 * MIME type (e.g., 'text/plain', 'application/pdf').
 * Immutable value object.
 */
export class MimeType {
  private readonly value: string;

  constructor(value: string) {
    if (!value || typeof value !== "string") {
      throw new Error("MimeType must be a non-empty string");
    }
    // Basic validation: should contain a slash and not contain disallowed characters
    const trimmed = value.trim();
    if (!trimmed.includes("/")) {
      throw new Error('MimeType must contain a slash (e.g., "text/plain")');
    }
    // Optional: more robust validation
    this.value = trimmed.toLowerCase();
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: MimeType): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }

  public static from(value: string): MimeType {
    return new MimeType(value);
  }
}
