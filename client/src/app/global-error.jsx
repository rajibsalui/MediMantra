'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function GlobalError({
  error,
  reset,
}) {
  useEffect(() => {
    console.error('Global Error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Sorry, a critical error occurred on our server.
          </p>
          <Button
            onClick={() => reset()}
            className="bg-primary hover:bg-primary/90"
          >
            Try again
          </Button>
        </div>
      </body>
    </html>
  );
}