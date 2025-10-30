"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import FaqWidget from "./FaqWidget";

type RoutineData = {
  name: string;
  symptoms?: string[];
  conditions?: string[];
  routine?: string;
};

export default function RoutinePlan() {
  const [routine, setRoutine] = useState<RoutineData | string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setRoutine("User not authenticated. Please log in again.");
      setLoading(false);
      return;
    }

    const fetchUserDetails = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/user", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();
        const user = data.user;

        setName(user.username);
        setEmail(user.email);
        setUserLoading(false);

        const routineRes = await fetch(
          `http://localhost:5000/api/routine?name=${encodeURIComponent(
            user.username
          )}&email=${encodeURIComponent(user.email)}`
        );

        const routineData = await routineRes.json();
        setRoutine(routineData.routinePlan);
      } catch (error) {
        console.error("Error:", error);
        toast.error("Error fetching routine data");
        setRoutine("Error fetching data.");
      } finally {
        setLoading(false);
        setUserLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  if (userLoading) {
    return (
      <div className="p-2 space-y-3">
        <h2 className="text-4xl text-sky-700 font-bold mb-4">
          Personalized Routine Plan
        </h2>
        <p>Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="p-2 space-y-3">
      <h2 className="text-4xl text-sky-700 font-bold mb-4">
        Personalized Routine Plan
      </h2>

      <Card className="bg-white shadow">
        <CardHeader>
          <CardTitle className="text-xl">User Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            <strong>Patient Name:</strong> {name}
          </p>
          <p>
            <strong>Email:</strong> {email}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white shadow" id="RoutinePlan">
        <CardHeader>
          <CardTitle className="text-xl">Recommended Routine</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading AI-generated routine plan...</p>
          ) : typeof routine === "string" ? (
            <p>{routine}</p>
          ) : routine && typeof routine === "object" ? (
            <div className="space-y-2 mt-4">
              {routine.routine
                ?.split("\n")
                .filter((line) => line.trim() !== "")
                .map((line, index) => {
                  const trimmed = line.trim();

                  // Detect section headings like "Morning Routine:" or "General Guidelines:"
                  if (/^[A-Z][\w\s]+:$/.test(trimmed)) {
                    return (
                      <h4 key={index} >
                        {trimmed.replace(/\*\*/g, "")}
                      </h4>
                    );
                  }

                  // Detect label + value like "Task: Exercise"
                  if (/^([A-Za-z\s]+):\s*(.*)/.test(trimmed)) {
                    const [label, ...rest] = trimmed.split(":");
                    return (
                      <p key={index}>
                        <strong>{label.replace(/\*\*/g, "").trim()}:</strong>{" "}
                        {rest.join(":").replace(/\*\*/g, "").trim()}
                      </p>
                    );
                  }

                  // Handle **bold text** in any sentence
                  const formattedText = trimmed.replace(
                    /\*\*(.*?)\*\*/g,
                    "<strong>$1</strong>"
                  );

                  // Default paragraph
                  return (
                    <p
                      key={index}
                      dangerouslySetInnerHTML={{ __html: formattedText }}
                    ></p>
                  );
                })}
            </div>
          ) : (
            <p>No routine plan available.</p>
          )}
        </CardContent>
      </Card>
      {!loading && <FaqWidget containerId="RoutinePlan" />}
    </div>
  );
}
