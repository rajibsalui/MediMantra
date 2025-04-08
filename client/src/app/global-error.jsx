'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}) {
  useEffect(() => {
    console.error('Global Error:', error);
  }, [error]);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Try again
      </button>
    </div>
  );
}