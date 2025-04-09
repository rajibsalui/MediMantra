import { Suspense } from "react";
import VerifyEmailContent from "./VerifyEmailContent";

// This ensures the page is only rendered on the client side
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Email Verification
        </h2>
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center py-8">
            <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading verification page...</p>
          </div>
        </div>
      </div>
    </div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}

