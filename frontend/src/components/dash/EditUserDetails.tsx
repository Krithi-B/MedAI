//frontend/src/components/dash/EditUserDetails.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Stethoscope } from "lucide-react";
import { toast } from "react-hot-toast";

export default function EditUserDetails() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    gender: "",
    age: "",
    medicalConditions: "",
    symptoms: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user details on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (response.ok) {
          const profile = data.profile;
          setFormData({
            username: profile.username || "",
            email: profile.email || "",
            gender: profile.gender || "",
            age: profile.age || "",
            medicalConditions:
              (profile.known_medical_conditions || []).join(", "),
            symptoms: profile.current_symptom || "",
          });
        } else {
          toast.error(data.error || "Failed to load profile");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("An error occurred while loading your profile.");
      }
    };

    fetchProfile();
  }, []);

  // Validation
  const validate = () => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!emailRegex.test(formData.email)) newErrors.email = "Invalid email";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.age || isNaN(Number(formData.age)))
      newErrors.age = "Valid age is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const payload = {
        username: formData.username,
        email: formData.email,
        gender: formData.gender,
        age: formData.age,
        known_medical_conditions: formData.medicalConditions
          .split(",")
          .map((c) => c.trim()),
        current_symptom: formData.symptoms,
      };

      const response = await fetch("http://localhost:5000/api/user/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Profile updated successfully!");
        router.push("/dashboard"); // Go back to dashboard
      } else {
        toast.error(data.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An error occurred while updating your details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sky-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white/90">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-3 ">
            <div className="bg-white-600 text-sky-700">
              <Stethoscope className="text-bold text-5xl" />
            </div>
            <span className="text-4xl font-bold bg-gradient-to-r from-sky-500 to-emerald-600 bg-clip-text text-transparent">
              MedAI
            </span>
          </div>
          <CardTitle className="text-3xl font-bold text-slate-800">
            Edit User Details
          </CardTitle>
          <CardDescription className="text-slate-500">
            Update your MedAI account information
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username + Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                  className="rounded-md bg-gray-100"
                />
                {errors.username && (
                  <p className="text-sm text-destructive">{errors.username}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="rounded-md bg-gray-100"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Age + Gender */}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleChange("age", e.target.value)}
                  className="rounded-md bg-gray-100"
                />
                {errors.age && (
                  <p className="text-sm text-destructive">{errors.age}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(val) => handleChange("gender", val)}
                >
                  <SelectTrigger className="rounded-md bg-gray-100 w-full">
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Medical Conditions */}
            <div className="space-y-2">
              <Label htmlFor="medicalConditions">
                Known Medical Conditions
              </Label>
              <Textarea
                id="medicalConditions"
                className="rounded-md bg-gray-100"
                value={formData.medicalConditions}
                onChange={(e) =>
                  handleChange("medicalConditions", e.target.value)
                }
                rows={3}
              />
            </div>

            {/* Symptoms */}
            <div className="space-y-2">
              <Label htmlFor="symptoms">Current Symptoms</Label>
              <Textarea
                id="symptoms"
                className="rounded-md bg-gray-100"
                value={formData.symptoms}
                onChange={(e) => handleChange("symptoms", e.target.value)}
                rows={3}
              />
            </div>

            {/* Buttons */}
            <div className="flex space-x-6 py-3">
              <Button
                type="submit"
                className="flex-1 h-11 bg-sky-600 hover:bg-sky-700 text-0.5xl"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="text-0.5xl h-11 bg-gray-100 hover:bg-gray-300"
                onClick={() => router.push("/dashboard")}
                disabled={isLoading}
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
