import { Dataset } from "../entities/Dataset.js";
import { Document } from "../entities/Document.js";
import {
  DatasetValidator,
  DatasetValidationContext,
  ValidationIssue,
  ValidationSeverity,
} from "../interfaces/DatasetValidator.js";
import { ValidationResult } from "./ValidationResult.js";

/**
 * Validates document collections for ID uniqueness in O(N) deterministic time.
 * Prevents duplicated documents from corrupting indexing and benchmark metrics.
 */
export class DuplicateDocumentValidator implements DatasetValidator {
  public readonly name: string = "DuplicateDocumentValidator";

  /**
   * Validates dataset documents for duplicate IDs.
   * @param _dataset - The dataset instance being validated
   * @param context - Validation context containing candidate documents
   */
  public validate(_dataset: Dataset, context?: DatasetValidationContext): ValidationResult {
    if (!context || !context.documents) {
      return ValidationResult.success();
    }

    return this.validateDocuments(context.documents);
  }

  /**
   * Directly validates an iterable of Document entities for duplicate IDs.
   * @param documents - Documents to validate
   * @returns ValidationResult with diagnostic issues
   */
  public validateDocuments(documents: Iterable<Document>): ValidationResult {
    const issues: ValidationIssue[] = [];
    const seenIds = new Map<string, number>();

    let index = 0;
    for (const doc of documents) {
      if (!doc || typeof doc.getId !== "function") {
        issues.push({
          code: "INVALID_DOCUMENT_STRUCTURE",
          message: `Invalid document instance at index ${index}`,
          severity: ValidationSeverity.ERROR,
          field: `documents[${index}]`,
          context: { index },
        });
        index++;
        continue;
      }

      const idObj = doc.getId();
      if (!idObj || typeof idObj.getValue !== "function") {
        issues.push({
          code: "INVALID_DOCUMENT_ID",
          message: `Document at index ${index} is missing a valid DocumentId value object`,
          severity: ValidationSeverity.ERROR,
          field: `documents[${index}].id`,
          context: { index },
        });
        index++;
        continue;
      }

      const id = idObj.getValue();
      if (typeof id !== "string" || id.trim().length === 0) {
        issues.push({
          code: "INVALID_DOCUMENT_ID",
          message: `Document at index ${index} has empty or non-string ID`,
          severity: ValidationSeverity.ERROR,
          field: `documents[${index}].id`,
          context: { index },
        });
        index++;
        continue;
      }

      const firstSeen = seenIds.get(id);

      if (firstSeen !== undefined) {
        issues.push({
          code: "DUPLICATE_DOCUMENT_ID",
          message: `Duplicate document ID "${id}" detected at index ${index} (first seen at index ${firstSeen})`,
          severity: ValidationSeverity.ERROR,
          field: `documents[${index}].id`,
          documentId: id,
          context: {
            duplicateId: id,
            firstIndex: firstSeen,
            currentIndex: index,
          },
        });
      } else {
        seenIds.set(id, index);
      }

      index++;
    }

    if (issues.length > 0) {
      return ValidationResult.fromIssues(issues);
    }

    return ValidationResult.success();
  }
}
