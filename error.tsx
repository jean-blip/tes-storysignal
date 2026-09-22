"use client";

/**
 * Page-level error boundary — catches rendering errors in the
 * main page and its children. Logs the real stack to Render logs.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("[page-error]", error.message, error.stack, {
    digest: error.digest,
  });

  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
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
          This reading couldn&apos;t load. Please try again.
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
    </div>
  );
}
