// /components/dash/DietPlan.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import FaqWidget from "./FaqWidget";

export default function DietPlan() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dietPlan, setDietPlan] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch user profile & diet plan
  useEffect(() => {
    const fetchPatientDetails = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Not authorized. Please log in.");
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/api/user/profile", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        const { username, email } = data.profile;

        setName(username);
        setEmail(email);

        fetchDietPlan(username, email);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch patient details");
      }
    };

    const fetchDietPlan = async (fetchedName: string, fetchedEmail: string) => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:5000/api/dietplan?name=${encodeURIComponent(
            fetchedName
          )}&email=${encodeURIComponent(fetchedEmail)}`
        );
        if (!res.ok) throw new Error("Diet plan API failed");
        const data = await res.json();
        setDietPlan(data.dietPlan);
      } catch (err) {
        console.error(err);
        setDietPlan("Error generating diet plan.");
      } finally {
        setLoading(false);
      }
    };

    fetchPatientDetails();
  }, []);

  //   if (loading) {
  //   return (
  //     <div className="p-2 space-y-3" >
  //     <h2 className="text-4xl text-sky-700 font-bold mb-4">
  //       {" "}
  //       Personalized Diet Plan
  //     </h2>
  //       <p>Loading user data...</p>
  //     </div>
  //   );
  // }

  return (
    <div className="p-2 space-y-3">
      <h2 className="text-4xl text-sky-700 font-bold mb-4">
        {" "}
        Personalized Diet Plan
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

      <Card className="shadow bg-white" id="DietPlan">
        <CardHeader>
          <CardTitle className="text-xl">Recommended Diet</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mt-4">
            {loading ? (
              <p>Generating AI-based diet plan...</p>
            ) : (
              <div className="space-y-2">
                {dietPlan
                  ?.split("\n")
                  .filter((line) => line.trim() !== "")
                  .map((line, index) => {
                    const trimmed = line.trim();

                    // Detect section headings like "Breakfast:", "General Guidelines:"
                    if (/^[A-Z][\w\s]+:$/.test(trimmed)) {
                      return (
                        <h4 key={index} className="font-bold">
                          {trimmed.replace(/\*\*/g, "")}
                        </h4>
                      );
                    }

                    // Detect label + value like "Symptoms: vomiting, fever"
                    if (/^([A-Za-z\s]+):\s*(.*)/.test(trimmed)) {
                      const [label, ...rest] = trimmed.split(":");
                      return (
                        <p key={index}>
                          <strong>{label.replace(/\*\*/g, "").trim()}:</strong>{" "}
                          {rest.join(":").replace(/\*\*/g, "").trim()}
                        </p>
                      );
                    }

                    // Default paragraph
                    return <p key={index}>{trimmed.replace(/\*\*/g, "")}</p>;
                  })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {dietPlan && <FaqWidget containerId="DietPlan" />}
    </div>
  );
}
