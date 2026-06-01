"use client";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body style={{ padding: 40, fontFamily: "monospace" }}>
        <h2>Error</h2>
        <p>{error?.message}</p>
        <pre>{error?.stack}</pre>
        <p>Digest: {error?.digest}</p>
      </body>
    </html>
  );
}
