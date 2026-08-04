import { DatasetSource } from "../value-objects/DatasetSource.js";
import { URI } from "../value-objects/URI.js";

/**
 * Interface for extracting metadata from dataset sources or document URIs.
 */
export interface MetadataExtractor {
  /**
   * Extracts metadata from a source identifier.
   * @param source - The source or URI to extract metadata from
   * @returns A promise that resolves to a record of extracted metadata
   */
  extract(source: DatasetSource | URI | string): Promise<Record<string, unknown>>;
}
