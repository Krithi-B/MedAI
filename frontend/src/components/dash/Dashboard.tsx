//frontend/src/components/dash/Dashboard.tsx
"use client";
import {
  Sun,
  Moon,
  Sunrise,
  Stethoscope,
  Home,
  ClipboardList,
  Image as ImageIcon,
  Activity,
  FileChartColumn,
  Calculator,
  Pencil,
  LogOut,
  Calendar as cal,
} from "lucide-react";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RoutinePlan from "./RoutinePlan";
import ImageAnalyser from "./ImageAnalyser";
import Diagnosis from "./Diagnosis";
import DietPlan from "./DietPlan";
import ReportAnalyser from "./ReportAnalyser";
import BMICalculator from "./BMICalculator";
import BookAppointment from "./BookAppointment";
import ProfileOverview from "./ProfileOverview";
import MotivationalQuotes from "./MotivationalQuotes";
import AppointmentsSection from "./AppointmentsSection";

type UserType = {
  username: string;
  age: number;
  gender: string;
  email: string;
  known_medical_conditions: string[];
  current_symptom: string;
};

export default function Dashboard() {
  const [user, setUser] = useState<UserType | null>(null);
  const fetchUserDetails = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();

      const data = await res.json();
      setUser(data.user);
    } catch {
      toast.error("Failed to load user details");
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);
  const [activeTab, setActiveTab] = useState("home");
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/auths/login");
  };

  const currentHour = new Date().getHours();
  const getGreeting = () => {
    if (currentHour < 12) return { text: "Good Morning", icon: Sunrise };
    if (currentHour < 17) return { text: "Good Afternoon", icon: Sun };
    return { text: "Good Evening", icon: Moon };
  };

  const greeting = getGreeting();

  return (
    
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-sm flex flex-col">
        <div className="px-6 py-5 border-b">
          <div className="flex items-center justify-center space-x-3">
            <Stethoscope className="text-bold text-5xl text-sky-700" />
            <span className="text-4xl font-bold bg-gradient-to-r from-sky-500 to-emerald-600 bg-clip-text text-transparent">
              MedAI
            </span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-2">
          {[
            { key: "home", label: "Home", icon: Home },
            { key: "routine", label: "Routine Plan", icon: ClipboardList },
            { key: "image", label: "Image Analysis", icon: ImageIcon },
            { key: "diagnosis", label: "Diagnosis", icon: Activity },
            { key: "appointment", label: "Note Appointments", icon: cal },
            { key: "dietplan", label: "Diet Plan", icon: ClipboardList },
            { key: "report", label: "Report Analysis", icon: FileChartColumn },
            { key: "bmi", label: "BMI Calculator", icon: Calculator },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center space-x-3 w-full px-3 py-2 rounded-md font-medium transition ${
                activeTab === key
                  ? "bg-gradient-to-r from-sky-100 to-emerald-100 text-sky-700"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="p-3 border-t">
          <Button
            onClick={() => router.push("/auths/edit-user-details")}
            className=" w-full bg-sky-600 hover:bg-sky-700 text-white mb-2 flex items-center justify-center space-x-2"
            size="sm"
          >
            <Pencil className="h-4 w-4" />
            <span>Edit Profile</span>
          </Button>

          <Button
            variant="destructive"
            size="sm"
            className="w-full flex items-center justify-center space-x-2 hover:bg-red-700"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {activeTab === "home" && (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-sky-600 to-emerald-500 text-white rounded-xl shadow p-6 flex justify-between items-center">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  {greeting.text}, {user?.username || "User"}!
                </h1>
                <p className="mt-1 text-md opacity-90">
                 Welcome back to your MedAI dashboard. This platform helps you manage your health efficiently with the power of AI. From diet plans to image analysis, MedAI is your personalized health partner.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <ProfileOverview />
              <MotivationalQuotes />
            </div>

            <AppointmentsSection />
          </div>
        )}

        {activeTab === "routine" && <RoutinePlan />}
        {activeTab === "image" && <ImageAnalyser />}
        {activeTab === "diagnosis" && <Diagnosis />}
        {activeTab === "dietplan" && <DietPlan />}
        {activeTab === "report" && <ReportAnalyser />}
        {activeTab === "bmi" && <BMICalculator />}
        {activeTab === "appointment" && <BookAppointment />}
      </main>
    </div>
  );
}
