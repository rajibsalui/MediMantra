"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import ChatInterface from "@/components/chat/ChatInterface";
import { API_URL, SOCKET_URL } from "@/config/environment";

// This ensures the page is only rendered on the client side
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export default function PatientMessages() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // Redirect if not authenticated or not a patient
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "patient")) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="animate-pulse h-8 w-64 bg-slate-200 dark:bg-slate-700 rounded mb-6"></div>
          <div className="animate-pulse h-[calc(100vh-12rem)] bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Doctor Messages</h1>
        <ChatInterface />
      </div>
    </DashboardLayout>
  );
}
