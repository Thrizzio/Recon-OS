/**
 * Dashboard frontend skeleton for Recon-OS.
 *
 * Reserved for the web dashboard. No UI framework, routing, or components are
 * introduced in this phase. The package exposes its identity and the route
 * contract so the directory boundary exists for later work.
 */

export const WEB_NAME = "@recon-os/web";
export const WEB_VERSION = "0.0.0";

/** A dashboard route, used once the frontend framework is chosen. */
export interface DashboardRoute {
  path: string;
  title: string;
}
