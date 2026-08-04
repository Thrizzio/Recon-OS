/**
 * Processing state of a Document within a dataset.
 * Enum representing the finite set of stages a document can be in during processing.
 */
export enum ProcessingState {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  PROCESSED = "PROCESSED",
  FAILED = "FAILED",
  SKIPPED = "SKIPPED",
}
