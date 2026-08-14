import { readFile } from "node:fs/promises";
import { extname, basename } from "node:path";
import { createHash } from "node:crypto";
import { DatasetId } from "../value-objects/DatasetId.js";
import { DatasetSource } from "../value-objects/DatasetSource.js";
import { DocumentId } from "../value-objects/DocumentId.js";
import { DocumentName } from "../value-objects/DocumentName.js";
import { DocumentFingerprint } from "../value-objects/DocumentFingerprint.js";
import { DocumentMetadata } from "../value-objects/DocumentMetadata.js";
import { MimeType } from "../value-objects/MimeType.js";
import { Document } from "../entities/Document.js";
import { DocumentType } from "../enums/DocumentType.js";
import { InvalidDocumentError, UnsupportedSourceError } from "../errors/DatasetError.js";
import { SourceResolver } from "../interfaces/SourceResolver.js";
import { FileLoader } from "../interfaces/FileLoader.js";

/**
 * Abstract base class for file-based {@link FileLoader} implementations.
 *
 * Encapsulates the shared pipeline common to all local file loaders:
 * reading raw bytes, computing a content fingerprint, strict UTF-8 decoding,
 * metadata extraction, and constructing a validated {@link Document} entity.
 *
 * Subclasses declare which file extensions they support and how to derive
 * {@link MimeType} and {@link DocumentType} from an extension, but do **not**
 * perform format-specific content parsing at this level.
 *
 * Dependency: receives a {@link SourceResolver} via constructor injection.
 * `BaseFileLoader` is unaware of whether the resolver targets a local file,
 * an HTTP URL, or any other source — that is the resolver's responsibility.
 *
 * @remarks
 * **Memory model:** `Document.content` is a `string`, so the full file content
 * must reside in memory before a `Document` can be constructed. This class
 * reads the file once into a `Buffer`, derives the fingerprint from the raw
 * bytes, then decodes to a `string`. No unnecessary duplicate buffers are kept.
 *
 * **DocumentId:** Derived from the SHA-256 hex digest of the raw file bytes.
 * This makes identity a deterministic function of content — same bytes produce
 * the same `DocumentId`, which is consistent with the existing repository's
 * immutable, content-addressed document semantics.
 */
export abstract class BaseFileLoader implements FileLoader {
    constructor(protected readonly resolver: SourceResolver) { }

    /**
     * Loads a single document from the given source.
     *
     * @param source - A `DatasetSource` identifying the file to load.
     * @param datasetId - The dataset this document belongs to.
     * @returns A validated {@link Document} entity.
     * @throws {UnsupportedSourceError} if the extension is not supported or the
     *   source cannot be resolved.
     * @throws {InvalidDocumentError} if the file content is not valid UTF-8 or
     *   the document fails domain validation.
     */
    public async load(source: DatasetSource, datasetId: DatasetId): Promise<Document> {
        const ext = this.extractExtension(source.getUri());
        this.assertSupportedExtension(ext, source.getUri());

        const resolved = await this.resolver.resolve(source);
        const rawBuffer = await readFile(resolved.pathOrLocation);

        // Compute fingerprint from the original bytes — before any string conversion
        const sha256hex = createHash("sha256").update(rawBuffer).digest("hex");
        const fingerprint = DocumentFingerprint.from(sha256hex, "SHA-256");

        // Strict UTF-8 decode — fatal: true throws TypeError on invalid sequences
        const content = this.decodeUtf8(rawBuffer, resolved.pathOrLocation);

        const mime = this.getMimeType(ext);
        const docType = this.getDocumentType(ext);
        const filename = basename(resolved.pathOrLocation);
        const sizeBytes = rawBuffer.byteLength;

        const metadata = DocumentMetadata.from({
            filename,
            extension: ext,
            mimeType: mime.getValue(),
            sourceUri: resolved.uri.getValue(),
            sourcePath: resolved.pathOrLocation,
            sizeBytes,
        });

        // DocumentId = SHA-256 hex of raw bytes: deterministic content-addressed identity
        const id = DocumentId.from(sha256hex);
        const name = DocumentName.from(filename);

        return new Document({
            id,
            datasetId,
            name,
            type: docType,
            content,
            fingerprint,
            metadata,
        });
    }

    /**
     * Returns the set of lowercase file extensions (without leading dot) that
     * this loader handles. Unsupported extensions are rejected before I/O.
     */
    protected abstract getSupportedExtensions(): ReadonlySet<string>;

    /**
     * Maps a supported lowercase extension to its {@link MimeType}.
     *
     * @param ext - Lowercase extension without leading dot, guaranteed to be in
     *   {@link getSupportedExtensions}.
     */
    protected abstract getMimeType(ext: string): MimeType;

    /**
     * Maps a supported lowercase extension to its {@link DocumentType}.
     *
     * @param ext - Lowercase extension without leading dot, guaranteed to be in
     *   {@link getSupportedExtensions}.
     */
    protected abstract getDocumentType(ext: string): DocumentType;

    /**
     * Extracts the lowercase extension (without leading dot) from a path or URI.
     */
    private extractExtension(uriOrPath: string): string {
        return extname(basename(uriOrPath)).replace(/^\./, "").toLowerCase();
    }

    /**
     * Asserts the extension is in the supported set.
     *
     * @throws {UnsupportedSourceError} if extension is empty or not supported.
     */
    private assertSupportedExtension(ext: string, uriOrPath: string): void {
        if (!ext || !this.getSupportedExtensions().has(ext)) {
            const supported = Array.from(this.getSupportedExtensions())
                .map((e) => `.${e}`)
                .join(", ");
            throw new UnsupportedSourceError(
                `Unsupported file extension "${ext ? `.${ext}` : "(none)"}" for source "${uriOrPath}". ` +
                `Supported extensions: ${supported}`,
            );
        }
    }

    /**
     * Decodes a `Buffer` to a UTF-8 string using strict mode.
     * Uses `TextDecoder` with `{ fatal: true }` so invalid byte sequences throw
     * a `TypeError` rather than being silently replaced with U+FFFD.
     *
     * @throws {InvalidDocumentError} if the buffer contains invalid UTF-8 bytes.
     */
    private decodeUtf8(buffer: Buffer, sourcePath: string): string {
        try {
            return new TextDecoder("utf-8", { fatal: true }).decode(buffer);
        } catch {
            throw new InvalidDocumentError(
                `File "${sourcePath}" contains invalid UTF-8 byte sequences and cannot be decoded`,
            );
        }
    }
}
