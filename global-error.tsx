"use client";

/**
 * Global error boundary — catches unhandled errors that escape
 * the root layout. Logs the real error + stack so production
 * crashes are debuggable instead of showing only a minified digest.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Log the ACTUAL error to Render's service logs
  console.error("[global-error]", error.message, error.stack, {
    digest: error.digest,
  });

  return (
    <html lang="en">
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#100d08",
          color: "#e8dcc8",
          fontFamily: "system-ui, sans-serif",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <div>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>
            Something went wrong
          </h2>
          <p style={{ opacity: 0.7, marginBottom: "1.5rem" }}>
            StorySignal hit an unexpected error. Please try again.
          </p>
          <button
            onClick={reset}
            style={{
              padding: "0.6rem 1.6rem",
              background: "#c9a84c",
              color: "#15120d",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
