//frontend/src/components/dashs/AppointmentsSection.tsx
"use client";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ClipboardClock, Pencil, Trash2 } from "lucide-react";
import BookAppointment from "../dash/BookAppointment";
import { Button } from "../ui/button";

type Appointment = {
  _id: string;
  hospital_name: string;
  date: string;
  time: string;
};

export default function AppointmentsSection() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);
  const [isEditing, setIsEditing] = useState(false);

  const fetchAppointments = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/appointment`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAppointments(data.appointments || []);
    } catch {
      toast.error("Failed to load appointments");
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleEdit = (id: string) => {
    setSelectedAppointmentId(id);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Unauthorized");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/appointment/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Failed to delete");

      setAppointments((prev) => prev.filter((a) => a._id !== id));
      toast.success("Appointment deleted successfully!");
    } catch {
      toast.error("Failed to delete appointment");
    }
  };

  // callback to refresh list when edit is done
  const handleAppointmentSaved = () => {
    setIsEditing(false);
    setSelectedAppointmentId(null);
    fetchAppointments();
  };

  const confirmDelete = (id: string) => {
    toast.custom(
      (t) => (
        <div className="bg-white shadow-xl rounded-lg p-5 border border-slate-200 flex flex-col items-center gap-3 w-80">
          <p className="text-slate-800 font-semibold text-center">
            Delete this appointment?
          </p>

          <div className="flex gap-3 mt-2">
            <Button
              onClick={() => {
                toast.dismiss(t.id);
                handleDelete(id);
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-md"
            >
              OK
            </Button>

            <Button
              onClick={() => toast.dismiss(t.id)}
              className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-1 rounded-md"
            >
              Cancel
            </Button>
          </div>
        </div>
      ),
      {
        duration: Infinity, // stays until user clicks something
      }
    );
  };

  if (isEditing) {
    return (
      <BookAppointment
        appointmentId={selectedAppointmentId}
        onAppointmentSaved={handleAppointmentSaved}
      />
    );
  }

  return (
    <Card className="shadow-md border bg-white relative w-full">
      <CardHeader>
        <CardTitle className="text-slate-800 text-2xl flex gap-4 items-center">
          <ClipboardClock />
          <p>Your Appointments</p>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {appointments.length === 0 ? (
          <p className="text-slate-600">No appointments booked yet.</p>
        ) : (
          <div className="relative w-full">
            <div className="react-calendar-wrapper relative z-10 overflow-visible">
              <Calendar
                className="w-full border-4 border-slate-300 rounded-lg shadow-sm p-2 overflow-visible text-xl [&_.react-calendar__tile]:border [&_.react-calendar__tile]:border-slate-200 [&_.react-calendar__tile]:p-2"
                tileClassName={({ date, view }) => {
                  if (view === "month") {
                    const localDate = new Date(
                      date.getTime() - date.getTimezoneOffset() * 60000
                    )
                      .toISOString()
                      .split("T")[0];

                    const hasAppointment = appointments.some(
                      (appt) => appt.date === localDate
                    );

                    return hasAppointment
                      ? "group relative border border-slate-400 bg-sky-100 hover:bg-sky-200 cursor-pointer overflow-visible"
                      : "border border-slate-200 overflow-visible";
                  }
                }}
                tileContent={({ date, view }) => {
                  const localDate = new Date(
                    date.getTime() - date.getTimezoneOffset() * 60000
                  )
                    .toISOString()
                    .split("T")[0];

                  const appts = appointments.filter(
                    (a) => a.date === localDate
                  );

                  if (view === "month" && appts.length > 0) {
                    return (
                      <div className="relative group w-full h-full overflow-visible">
                        <div className="w-2 h-2 bg-sky-800 rounded-full mx-auto mt-1 pointer-events-none"></div>

                        <div className="absolute hidden group-hover:flex flex-col gap-2 top-full left-1/2 -translate-x-1/2 mt-2 w-72 p-3 bg-white border border-slate-300 rounded-lg shadow-2xl z-[9999]">
                          {appts.map(({ _id, hospital_name, date, time }) => (
                            <div
                              key={_id}
                              className="p-3 rounded-md bg-slate-50 border border-slate-200"
                            >
                              <span className="font-semibold text-slate-800 block">
                                Hospital: {hospital_name}
                              </span>
                              <span className="text-slate-600 block text-sm">
                                Date: {date}
                              </span>
                              <span className="text-slate-600 block text-sm">
                                Time: {time}
                              </span>

                              <div className="flex gap-3 mt-3">
                                <div
                                  onClick={() => handleEdit(_id)}
                                  className="flex-1 text-center text-white bg-sky-600 rounded-md py-1.5 cursor-pointer hover:bg-sky-700 transition"
                                >
                                  <div className="flex items-center justify-center gap-2">
                                    <Pencil className="w-4 h-4" />
                                    <p>Edit</p>
                                  </div>
                                </div>

                                <div
                                  onClick={() => confirmDelete(_id)}
                                  className="flex-1 text-center text-white bg-red-600 rounded-md py-1.5 cursor-pointer hover:bg-red-700 transition"
                                >
                                  <div className="flex items-center justify-center gap-2">
                                    <Trash2 className="w-4 h-4" />
                                    <p>Delete</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
