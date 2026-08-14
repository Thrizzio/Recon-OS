import { stat } from "node:fs/promises";
import { resolve as resolvePath, extname, basename } from "node:path";
import { pathToFileURL } from "node:url";
import { DatasetSource } from "../value-objects/DatasetSource.js";
import { URI } from "../value-objects/URI.js";
import { UnsupportedSourceError } from "../errors/DatasetError.js";
import { ResolvedSource, SourceResolver } from "../interfaces/SourceResolver.js";

/**
 * MIME type map for the file extensions supported by {@link LocalFileLoader}.
 * Kept here so the resolver can populate `ResolvedSource.mediaType`.
 */
const EXTENSION_MIME_MAP: Record<string, string> = {
    txt: "text/plain",
    md: "text/markdown",
    markdown: "text/markdown",
    json: "application/json",
};

/**
 * Resolves local filesystem sources into {@link ResolvedSource} descriptors
 * that downstream loaders can consume.
 *
 * Responsibilities:
 * - Validate that the source type is `"file"`.
 * - Verify the path exists and is a regular file (not a directory).
 * - Produce a platform-correct `file:///` URI via {@link pathToFileURL}.
 * - Translate low-level filesystem errors into {@link UnsupportedSourceError}.
 *
 * This resolver does **not** read or parse file content.
 */
export class LocalFileSourceResolver implements SourceResolver {
    /**
     * Resolves a `DatasetSource` or `URI` to a {@link ResolvedSource}.
     *
     * @param source - Must be a `DatasetSource` with `type === "file"`, or a
     *   `URI` whose value is a local filesystem path.
     * @returns A promise resolving to a {@link ResolvedSource} with the absolute
     *   path, a platform-correct file URI, and the detected MIME type (if known).
     * @throws {UnsupportedSourceError} if the source type is not `"file"`, the
     *   path does not exist, is a directory, or cannot be accessed.
     */
    public async resolve(source: DatasetSource | URI): Promise<ResolvedSource> {
        const rawPath = this.extractPath(source);
        const absolutePath = resolvePath(rawPath);

        await this.validatePath(absolutePath);

        // pathToFileURL handles Windows drive letters (C:\) and path separators
        // correctly, producing well-formed file:///C:/... URIs. Never concatenate
        // "file://" + path manually.
        const fileUrl = pathToFileURL(absolutePath).href;
        const uri = URI.from(fileUrl);

        const ext = extname(basename(absolutePath)).replace(/^\./, "").toLowerCase();
        const mediaType = EXTENSION_MIME_MAP[ext];

        return {
            uri,
            pathOrLocation: absolutePath,
            mediaType,
        };
    }

    /**
     * Extracts the raw filesystem path from a `DatasetSource` or `URI`.
     *
     * @throws {UnsupportedSourceError} if the source type is not `"file"`.
     */
    private extractPath(source: DatasetSource | URI): string {
        if (source instanceof URI) {
            return source.getValue();
        }

        const type = source.getType();
        if (type !== "file") {
            throw new UnsupportedSourceError(
                `LocalFileSourceResolver only handles "file" sources, got "${type}"`,
            );
        }

        return source.getUri();
    }

    /**
     * Validates that the path exists, is readable, and is a regular file.
     *
     * @throws {UnsupportedSourceError} for ENOENT, EACCES, EISDIR, or unexpected
     *   stat errors, with the original cause preserved in the message.
     */
    private async validatePath(absolutePath: string): Promise<void> {
        let stats;
        try {
            stats = await stat(absolutePath);
        } catch (err) {
            const code = (err as { code?: string }).code;
            const reason =
                code === "ENOENT"
                    ? "does not exist"
                    : code === "EACCES"
                        ? "is not accessible (permission denied)"
                        : `could not be accessed (${code ?? "unknown error"})`;

            throw new UnsupportedSourceError(
                `Local file source "${absolutePath}" ${reason}`,
            );
        }

        if (!stats.isFile()) {
            throw new UnsupportedSourceError(
                `Local file source "${absolutePath}" is a directory, not a file`,
            );
        }
    }
}
