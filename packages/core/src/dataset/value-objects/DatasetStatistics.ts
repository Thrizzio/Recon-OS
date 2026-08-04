/**
 * Statistics for a Dataset.
 * Immutable value object.
 */
export class DatasetStatistics {
  private readonly documentCount: number;
  private readonly totalSizeBytes: number;
  private readonly averageSizeBytes: number;

  constructor(documentCount: number = 0, totalSizeBytes: number = 0, averageSizeBytes: number = 0) {
    if (documentCount < 0) {
      throw new Error("documentCount cannot be negative");
    }
    if (totalSizeBytes < 0) {
      throw new Error("totalSizeBytes cannot be negative");
    }
    if (averageSizeBytes < 0) {
      throw new Error("averageSizeBytes cannot be negative");
    }
    this.documentCount = documentCount;
    this.totalSizeBytes = totalSizeBytes;
    this.averageSizeBytes = averageSizeBytes;
  }

  public getDocumentCount(): number {
    return this.documentCount;
  }

  public getTotalSizeBytes(): number {
    return this.totalSizeBytes;
  }

  public getAverageSizeBytes(): number {
    return this.averageSizeBytes;
  }

  public equals(other: DatasetStatistics): boolean {
    return (
      this.documentCount === other.documentCount &&
      this.totalSizeBytes === other.totalSizeBytes &&
      this.averageSizeBytes === other.averageSizeBytes
    );
  }

  public toString(): string {
    return `Docs: ${this.documentCount}, Size: ${this.totalSizeBytes} bytes, Avg: ${this.averageSizeBytes} bytes`;
  }

  public static create(
    documentCount: number = 0,
    totalSizeBytes: number = 0,
    averageSizeBytes: number = 0,
  ): DatasetStatistics {
    return new DatasetStatistics(documentCount, totalSizeBytes, averageSizeBytes);
  }

  public withDocumentCount(documentCount: number): DatasetStatistics {
    return new DatasetStatistics(documentCount, this.totalSizeBytes, this.averageSizeBytes);
  }

  public withTotalSizeBytes(totalSizeBytes: number): DatasetStatistics {
    return new DatasetStatistics(this.documentCount, totalSizeBytes, this.averageSizeBytes);
  }

  public withAverageSizeBytes(averageSizeBytes: number): DatasetStatistics {
    return new DatasetStatistics(this.documentCount, this.totalSizeBytes, averageSizeBytes);
  }
}
