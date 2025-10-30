// frontend/src/components/dash/BookAppointment.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

type Props = {
  appointmentId?: string | null;          // ID for edit mode
  onAppointmentSaved?: () => void;        // callback to refresh appointments
};

export default function BookAppointment({ appointmentId, onAppointmentSaved }: Props) {
  const [hospitalName, setHospitalName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const timeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

  // Fetch existing appointment if editing
  useEffect(() => {
    if (!token) {
      toast.error("Not authorized. Please log in.");
      return;
    }

    if (appointmentId) {
      setLoading(true);
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/appointment`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          const appt = data.appointments.find(((a: { _id: string; }) => a._id === appointmentId));
          if (!appt) {
            toast.error("Appointment not found");
            return;
          }
          setHospitalName(appt.hospital_name);
          setDate(appt.date);
          setTime(appt.time);
        })
        .catch(() => toast.error("Failed to load appointment"))
        .finally(() => setLoading(false));
    }
  }, [appointmentId, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!hospitalName || !date || !time) {
      setError("All fields are required");
      return;
    }

    setLoading(true);

    const method = appointmentId ? "PUT" : "POST";
    const url = appointmentId
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/appointment/${appointmentId}`
      : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/appointment`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ hospital_name: hospitalName, date, time }),
      });

      if (!res.ok) {
        const errData = await res.json();
        setError(errData.error || "Failed to save appointment");
        setLoading(false);
        return;
      }

      toast.success(`Appointment ${appointmentId ? "updated" : "booked"} successfully!`);

      // Trigger refresh in Dashboard
      if (onAppointmentSaved) onAppointmentSaved();

      // Clear form
      setHospitalName("");
      setDate("");
      setTime("");
    } catch (e) {
      console.error(e);
      setError("Something went wrong");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-2 space-y-3 ">
      <h2 className="text-4xl text-sky-700 font-bold mb-4">
        {" "}
        {appointmentId ? "Edit Appointment" : "Book Appointment"}
      </h2>
      <Card className="w-full shadow bg-white p-6 ">
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col">
              <label className="font-semibold mb-1">Hospital Name</label>
              <input
                type="text"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                placeholder="Enter hospital name"
                className="border rounded px-3 py-2"
                required
                />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border rounded px-3 py-2"
                required
                />
            </div>

            <div className="flex flex-col">
              <label className="font-semibold mb-1">Time</label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="border rounded px-3 py-2"
                required
              >
                <option value="">Select a time slot</option>
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>

            {error && <p className="text-red-600 text-center">{error}</p>}

            <div className="flex justify-between mt-8">
              <Button type="submit" className="flex-1 ml-40 mr-3 bg-sky-600 hover:bg-sky-700" disabled={loading}>
                {loading ? (appointmentId ? "Updating..." : "Booking...") : appointmentId ? "Update" : "Book"}
              </Button>
              <Button
                variant="outline"
                type="button"
                className="flex-1 mr-40 ml-3 bg-red-600 hover:bg-red-700 text-white hover:text-white"
                onClick={() => {
                  // Clear form and optionally go back to dashboard
                  setHospitalName("");
                  setDate("");
                  setTime("");
                  if (onAppointmentSaved) onAppointmentSaved();
                }}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
