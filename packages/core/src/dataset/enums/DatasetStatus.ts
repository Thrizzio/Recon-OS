/**
 * Status of a Dataset.
 * Finite domain states representing the lifecycle of a dataset.
 */
export enum DatasetStatus {
  DRAFT = "DRAFT",
  PROCESSING = "PROCESSING",
  READY = "READY",
  ARCHIVED = "ARCHIVED",
  FAILED = "FAILED",
}
