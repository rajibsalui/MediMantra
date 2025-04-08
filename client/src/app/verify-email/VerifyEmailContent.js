"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";

export default function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const { verifyEmail, resendVerificationEmail } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState("idle"); // idle, loading, success, error
  const [resendStatus, setResendStatus] = useState("idle"); // idle, loading, success, error

  useEffect(() => {
    if (token) {
      verifyEmailToken(token);
    }
  }, [token]);

  const verifyEmailToken = async (token) => {
    setVerificationStatus("loading");
    try {
      await verifyEmail(token);
      setVerificationStatus("success");
      toast.success("Email verified successfully!");
    } catch (error) {
      setVerificationStatus("error");
      toast.error(error.message || "Failed to verify email");
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      toast.error("Email address is missing");
      return;
    }

    setResendStatus("loading");
    try {
      await resendVerificationEmail(email);
      setResendStatus("success");
      toast.success("Verification email sent successfully!");
    } catch (error) {
      setResendStatus("error");
      toast.error(error.message || "Failed to resend verification email");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Email Verification
        </h2>
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {!token ? (
            // No token provided - show instructions
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-blue-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Verify your email address
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        Thank you for registering! We've sent a verification link to your
                        email address. Please check your inbox and click the link to activate
                        your account.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-500 text-center">
                <p>
                  Didn't receive the email?{" "}
                  <button
                    onClick={handleResendEmail}
                    disabled={resendStatus === "loading"}
                    className="font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50"
                  >
                    {resendStatus === "loading" ? (
                      <>
                        <Loader2 className="animate-spin inline mr-1 h-4 w-4" />
                        Sending...
                      </>
                    ) : resendStatus === "success" ? (
                      "Email sent!"
                    ) : (
                      "Resend verification email"
                    )}
                  </button>
                </p>
              </div>

              <div className="text-center mt-6">
                <Link
                  href="/login"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Return to login
                </Link>
              </div>
            </div>
          ) : verificationStatus === "loading" ? (
            // Verifying token
            <div className="text-center py-8">
              <Loader2 className="animate-spin h-10 w-10 text-blue-500 mx-auto" />
              <p className="mt-4 text-gray-600">Verifying your email...</p>
            </div>
          ) : verificationStatus === "success" ? (
            // Success state
            <div className="text-center py-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg
                  className="h-6 w-6 text-green-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Email verified successfully!
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Your email has been verified. You can now log in to your account.
              </p>
              <div className="mt-6">
                <Link
                  href="/login"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Log in
                </Link>
              </div>
            </div>
          ) : (
            // Error state
            <div className="text-center py-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg
                  className="h-6 w-6 text-red-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Verification failed
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                The verification link is invalid or has expired.
              </p>
              <div className="mt-6 space-y-4">
                <button
                  onClick={handleResendEmail}
                  disabled={resendStatus === "loading" || !email}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {resendStatus === "loading" ? (
                    <>
                      <Loader2 className="animate-spin inline mr-1 h-4 w-4" />
                      Sending...
                    </>
                  ) : (
                    "Resend verification email"
                  )}
                </button>
                <Link
                  href="/login"
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Return to login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
