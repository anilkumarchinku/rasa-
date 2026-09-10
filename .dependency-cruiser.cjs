/**
 * STARTER boundary rules — only universally-safe checks are active.
 * Real boundary rules must be derived from docs/ARCHITECTURE.md after human
 * review (GOVERN): add `not-reachable-from`/`not-to` rules that encode the
 * homes and boundaries that document approves. Do not let a tool prescribe
 * your architecture.
 */
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      comment: "Circular dependencies make consumer sweeps and staged migrations unreliable.",
      from: {},
      to: { circular: true },
    },
    {
      name: "no-client-to-server-internals",
      severity: "error",
      comment: "Browser and mobile code must use HTTP contracts, never server-only modules.",
      from: { path: "^apps/(web/(components|lib)|mobile)/" },
      to: { path: "^apps/web/server/" },
    },
    {
      name: "no-server-to-ui",
      severity: "error",
      comment: "Backend modules must not depend on rendered UI components.",
      from: { path: "^apps/web/server/" },
      to: { path: "^apps/web/components/" },
    },
    {
      name: "no-shared-package-to-app",
      severity: "error",
      comment: "Reusable packages cannot depend on an application entry point.",
      from: { path: "^packages/" },
      to: { path: "^apps/" },
    },
    {
      name: "no-mobile-to-web",
      severity: "error",
      comment: "The mobile application consumes shared packages, not web internals.",
      from: { path: "^apps/mobile/" },
      to: { path: "^apps/web/" },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    exclude: { path: "\\.(test|spec)\\.[jt]sx?$" },
    tsPreCompilationDeps: true,
  },
};
