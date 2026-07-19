/**
 * Command-line interface surface for Recon-OS.
 *
 * Reserved for the future CLI. The package currently exposes its identity and
 * the command contract; executable commands are added in a later phase. The
 * runnable entrypoint lives in `bin/recon.mjs` and prints identity only.
 */

/** The CLI binary name. */
export const CLI_NAME = "recon";
export const CLI_VERSION = "0.0.0";

/** The contract a CLI command implements. */
export interface Command {
  name: string;
  description: string;
  run(args: string[]): Promise<void>;
}
