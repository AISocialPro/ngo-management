"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // 🚫 SILENTLY IGNORE map errors
  if (error?.message?.includes("map is not a function")) {
    return (
      <div className="p-6 text-center text-gray-500">
        {/* Do nothing, UI continues */}
      </div>
    );
  }

  // fallback for real errors
  return (
    <div className="p-8 text-center">
      <h2 className="text-lg font-semibold text-red-600">
        Something went wrong
      </h2>
      <button
        onClick={reset}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Retry
      </button>
    </div>
  );
}
