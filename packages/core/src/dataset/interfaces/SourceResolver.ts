import { DatasetSource } from "../value-objects/DatasetSource.js";
import { URI } from "../value-objects/URI.js";

export interface ResolvedSource {
  readonly uri: URI;
  readonly pathOrLocation: string;
  readonly mediaType?: string;
}

/**
 * Interface for resolving data sources to usable physical paths or locations.
 */
export interface SourceResolver {
  /**
   * Resolves a dataset source to a ResolvedSource descriptor.
   * @param source - The source to resolve
   * @returns A promise that resolves to a ResolvedSource
   */
  resolve(source: DatasetSource | URI): Promise<ResolvedSource>;
}
