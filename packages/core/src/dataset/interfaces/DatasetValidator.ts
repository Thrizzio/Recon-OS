import { Dataset } from "../entities/Dataset.js";

export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
  readonly warnings?: readonly string[];
}

/**
 * Interface for validating datasets against domain and structural invariants.
 */
export interface DatasetValidator {
  /**
   * Validates a dataset.
   * @param dataset - The dataset to validate
   * @returns A promise that resolves to a ValidationResult object
   */
  validate(dataset: Dataset): Promise<ValidationResult>;
}
