import Link from 'next/link';
import { Button } from '@/components/ui/button';
// This ensures the page is only rendered on the client side
export const dynamic = 'force-dynamic';
export const runtime = 'edge';
export default function Custom404() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-3xl font-bold mb-4">404 - Page Not Found</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        The page you are looking for doesn't exist or has been moved.
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
