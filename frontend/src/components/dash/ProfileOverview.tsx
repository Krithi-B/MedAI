//frontend/src/components/dash/ProfileOverview.tsx
"use client";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Card, CardHeader, CardDescription } from "@/components/ui/card";
import { User } from "lucide-react";
import InitialsAvatar from "./InitialsAvatar";

type UserType = {
  username: string;
  age: number;
  gender: string;
  email: string;
  known_medical_conditions: string[];
  current_symptom: string;
};

export default function ProfileOverview() {
  const [user, setUser] = useState<UserType | null>(null);

  const fetchUserDetails = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("http://localhost:5000/api/user", {
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

  return (
    <Card className="shadow-md border bg-white flex flex-column gap-2 w-full items-start p-4">
      <CardHeader className="w-full text-left flex gap-3 items-center">
        <User className="text-bold" />
        <h3 className="font-semibold text-2xl w-full text-slate-800">
          Profile Overview
        </h3>
      </CardHeader>

      <CardDescription className="bg-white text-0.5xl flex flex-row items-center">
        <div className="text-5xl m-6">
          <InitialsAvatar name={user?.username || "N/A"} size={68} />
        </div>
        <div className="space-y-1 text-slate-700">
          <p>
            <strong>Name:</strong> {user?.username || "N/A"}
          </p>
          <p>
            <strong>Age:</strong> {user?.age || "N/A"}
          </p>
          <p>
            <strong>Gender:</strong> {user?.gender || "N/A"}
          </p>
          <p>
            <strong>Email:</strong> {user?.email || "N/A"}
          </p>
          <p>
            <strong>Medical Conditions:</strong>{" "}
            {user?.known_medical_conditions?.join(", ") || "None"}
          </p>
          <p>
            <strong>Current Symptoms:</strong>{" "}
            {user?.current_symptom || "N/A"}
          </p>
        </div>
      </CardDescription>
    </Card>
  );
}
