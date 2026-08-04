/**
 * Metadata for a Document.
 * Immutable value object wrapping a record of string to unknown.
 */
export class DocumentMetadata {
  private readonly map: Record<string, unknown>;

  constructor(map: Record<string, unknown> = {}) {
    // Defensive copy to avoid external mutation
    this.map = { ...map };
  }

  public get<T>(key: string): T | undefined {
    return this.map[key] as T | undefined;
  }

  public set<T>(key: string, value: T): DocumentMetadata {
    const newMap = { ...this.map };
    newMap[key] = value;
    return new DocumentMetadata(newMap);
  }

  public has(key: string): boolean {
    return Object.prototype.hasOwnProperty.call(this.map, key);
  }

  public keys(): string[] {
    return Object.keys(this.map);
  }

  public entries(): [string, unknown][] {
    return Object.entries(this.map);
  }

  public equals(other: DocumentMetadata): boolean {
    return JSON.stringify(this.map) === JSON.stringify(other.map);
  }

  public toString(): string {
    return JSON.stringify(this.map);
  }

  public static from(map: Record<string, unknown> = {}): DocumentMetadata {
    return new DocumentMetadata(map);
  }

  public static empty(): DocumentMetadata {
    return new DocumentMetadata();
  }
}
