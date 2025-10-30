// frontend/src/components/dash/Diagnosis.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import FaqWidget from "./FaqWidget";

type Patient = {
  username: string;
  email: string;
  current_symptom: string;
};

export default function Diagnosis() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [diagnosis, setDiagnosis] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch patient data
  useEffect(() => {
    const fetchPatientDetails = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("User not authenticated. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setPatient({
          username: data.profile.username,
          email: data.profile.email,
          current_symptom: data.profile.current_symptom,
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load patient profile");
      }
    };

    fetchPatientDetails();
  }, []);

  // Fetch diagnosis when patient data is ready
  useEffect(() => {
    const getDiagnosis = async () => {
      if (!patient?.current_symptom) return;

      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/diagnosis`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": token || "",
          },
          body: JSON.stringify({
            symptoms: patient.current_symptom,
            name: patient.username,
            email: patient.email,
          }),
        });

        if (!res.ok) throw new Error("Diagnosis API failed");
        const data = await res.json();
        setDiagnosis(data.diseases || []);
      } catch (err) {
        console.error(err);
        setError("Failed to generate diagnosis.");
        toast.error("Diagnosis API call failed");
      } finally {
        setLoading(false);
      }
    };

    getDiagnosis();
  }, [patient]);

  if (loading) {
    return (
      <div className="p-2 space-y-3" >
      <h2 className="text-4xl text-sky-700 font-bold mb-4">
        {" "}
        Diagnosis Report
      </h2>
        <p>Diagnosing based on symptoms...</p>
      </div>
    );
  }

  return (
    <div className="p-2 space-y-3" id="Diagnosis">
      <h1 className="text-4xl text-sky-700 font-bold mb-4">
      Diagnosis Report
      </h1>

      {error && (
        <p className="text-red-600 text-center mb-4 font-medium">{error}</p>
      )}

      {patient && (
        <Card className="shadow bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p>
              <strong>Name:</strong> {patient.username}
            </p>
            <p>
              <strong>Email:</strong> {patient.email}
            </p>
            <p>
              <strong>Reported Symptom:</strong> {patient.current_symptom}
            </p>
          </CardContent>
        </Card>
      )}

      {diagnosis.length > 0 && (
        <Card className="shadow bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Top 3 Possible Diagnoses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-1 text-slate-700 text-0.5xl">
              {diagnosis.slice(0, 3).map((disease, idx) => (
                <li key={idx}>{disease}</li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {diagnosis.length === 0 && !error && (
        <p className="text-center text-slate-600 mt-4">
          No diagnosis results available.
        </p>
      )}
      <FaqWidget containerId="Diagnosis"/>
    </div>
  );
}
