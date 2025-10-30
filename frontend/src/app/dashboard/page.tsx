"use client";

import ChatWidget from "@/components/dash/ChatWidget";
import Dashboard from "@/components/dash/Dashboard";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/auths/login"); // redirect if not logged in
    } else {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-lg text-slate-700">
        Checking authentication...
      </div>
    );
  }

  return isAuthenticated ? (
    <>
      <Dashboard />
      <ChatWidget />
    </>
  ) : null;
}
