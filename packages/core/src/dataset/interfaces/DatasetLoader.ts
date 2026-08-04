import { Dataset } from "../entities/Dataset.js";
import { DatasetSource } from "../value-objects/DatasetSource.js";

/**
 * Interface for loading datasets from underlying sources.
 */
export interface DatasetLoader {
  /**
   * Loads a dataset from the specified DatasetSource.
   * @param source - The dataset source configuration
   * @returns A promise that resolves to the loaded Dataset aggregate
   */
  load(source: DatasetSource): Promise<Dataset>;
}
