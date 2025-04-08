import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Custom500() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-3xl font-bold mb-4">500 - Server Error</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Sorry, something went wrong on our server.
      </p>
      <Link href="/">
        <Button>Return to Home</Button>
      </Link>
    </div>
  );
}

// This ensures the page is server-side rendered
export function getStaticProps() {
  return {
    props: {}
  };
}
