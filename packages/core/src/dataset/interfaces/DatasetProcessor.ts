import { Dataset } from "../entities/Dataset.js";

/**
 * Interface for processing datasets (e.g., transformation, enrichment).
 */
export interface DatasetProcessor {
  /**
   * Processes a dataset and returns the transformed dataset.
   * @param dataset - The input dataset
   * @returns A promise that resolves to the processed Dataset
   */
  process(dataset: Dataset): Promise<Dataset>;
}
