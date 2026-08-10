import { createHash } from "node:crypto";
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
 * Options for configuring ChecksumValidator behavior.
 */
export interface ChecksumValidatorOptions {
  /** Verify cryptographic fingerprint/checksum against document content (default: true) */
  readonly verifyFingerprints?: boolean;
  /** Check for corrupted character encodings like replacement character \uFFFD or null bytes (default: true) */
  readonly verifyEncoding?: boolean;
  /** Verify document size matches content length (default: true) */
  readonly verifySize?: boolean;
}

/**
 * Validates cryptographic checksums, content fingerprints, and character encoding integrity.
 * Operates in O(N) deterministic time without mutating document instances.
 */
export class ChecksumValidator implements DatasetValidator {
  public readonly name: string = "ChecksumValidator";
  private readonly options: ChecksumValidatorOptions;

  constructor(options: ChecksumValidatorOptions = {}) {
    this.options = {
      verifyFingerprints: options.verifyFingerprints ?? true,
      verifyEncoding: options.verifyEncoding ?? true,
      verifySize: options.verifySize ?? true,
    };
  }

  /**
   * Validates dataset documents for checksum accuracy and encoding integrity.
   * @param _dataset - The dataset instance
   * @param context - Validation context containing candidate documents
   */
  public validate(_dataset: Dataset, context?: DatasetValidationContext): ValidationResult {
    if (!context || !context.documents) {
      return ValidationResult.success();
    }

    return this.validateDocuments(context.documents);
  }

  /**
   * Validates an iterable of Document entities for checksum and encoding integrity.
   * @param documents - Documents to validate
   * @returns ValidationResult with diagnostic issues
   */
  public validateDocuments(documents: Iterable<Document>): ValidationResult {
    const issues: ValidationIssue[] = [];
    let index = 0;

    for (const doc of documents) {
      if (!doc || typeof doc.getContent !== "function") {
        issues.push({
          code: "INVALID_DOCUMENT_STRUCTURE",
          message: `Invalid document structure at index ${index}`,
          severity: ValidationSeverity.ERROR,
          field: `documents[${index}]`,
          context: { index },
        });
        index++;
        continue;
      }

      const docId = doc.getId().getValue();
      const content = doc.getContent();

      // 1. Content size validation
      if (this.options.verifySize) {
        const declaredSize = doc.getSize();
        const actualLength = content.length;
        if (declaredSize !== actualLength) {
          issues.push({
            code: "DOCUMENT_SIZE_MISMATCH",
            message: `Document "${docId}" declared size ${declaredSize} does not match content length ${actualLength}`,
            severity: ValidationSeverity.WARNING,
            field: `documents[${index}].size`,
            documentId: docId,
            context: { declaredSize, actualLength, index },
          });
        }
      }

      // 2. Character encoding integrity check
      if (this.options.verifyEncoding) {
        if (content.includes("\uFFFD")) {
          const charIndex = content.indexOf("\uFFFD");
          const lineNumber = content.substring(0, charIndex).split("\n").length;
          issues.push({
            code: "CORRUPTED_ENCODING",
            message: `Corrupted character encoding (Unicode replacement character \\uFFFD detected) in document "${docId}" at line ${lineNumber}`,
            severity: ValidationSeverity.ERROR,
            field: `documents[${index}].content`,
            documentId: docId,
            line: lineNumber,
            context: { charOffset: charIndex, lineNumber, index },
          });
        }

        if (content.includes("\u0000")) {
          const charIndex = content.indexOf("\u0000");
          const lineNumber = content.substring(0, charIndex).split("\n").length;
          issues.push({
            code: "INVALID_NULL_BYTE",
            message: `Unexpected null byte (\\u0000) detected in document "${docId}" content at line ${lineNumber}`,
            severity: ValidationSeverity.ERROR,
            field: `documents[${index}].content`,
            documentId: docId,
            line: lineNumber,
            context: { charOffset: charIndex, lineNumber, index },
          });
        }
      }

      // 3. Cryptographic fingerprint / checksum verification
      if (this.options.verifyFingerprints) {
        const fingerprint = doc.getFingerprint();
        if (fingerprint) {
          const algorithm = fingerprint.getAlgorithm().toLowerCase();
          const expectedChecksum = fingerprint.getChecksum().toLowerCase();

          try {
            const actualChecksum = ChecksumValidator.computeHash(content, algorithm);
            if (actualChecksum !== expectedChecksum) {
              issues.push({
                code: "CHECKSUM_MISMATCH",
                message: `Checksum mismatch for document "${docId}". Expected ${expectedChecksum}, calculated ${actualChecksum} (${fingerprint.getAlgorithm()})`,
                severity: ValidationSeverity.ERROR,
                field: `documents[${index}].fingerprint`,
                documentId: docId,
                context: {
                  expectedChecksum,
                  actualChecksum,
                  algorithm: fingerprint.getAlgorithm(),
                  index,
                },
              });
            }
          } catch (err: unknown) {
            const errMessage = err instanceof Error ? err.message : String(err);
            issues.push({
              code: "UNSUPPORTED_HASH_ALGORITHM",
              message: `Failed to verify checksum with algorithm "${fingerprint.getAlgorithm()}": ${errMessage}`,
              severity: ValidationSeverity.ERROR,
              field: `documents[${index}].fingerprint.algorithm`,
              documentId: docId,
              context: { algorithm: fingerprint.getAlgorithm(), index },
            });
          }
        }
      }

      index++;
    }

    if (issues.length > 0) {
      return ValidationResult.fromIssues(issues);
    }

    return ValidationResult.success();
  }

  /**
   * Computes cryptographic digest for content using specified algorithm.
   */
  public static computeHash(content: string, algorithm: string = "sha256"): string {
    const normAlgo = algorithm.toLowerCase().replace(/[^a-z0-9]/g, "");
    const hash = createHash(normAlgo);
    hash.update(content, "utf8");
    return hash.digest("hex");
  }
}
