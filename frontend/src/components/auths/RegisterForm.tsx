// frontend/components/auth/RegisterForm.tsx
"use client";

import { useState } from "react";
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

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    age: "",
    medicalConditions: "",
    symptoms: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Validation logic (same as old file)
  const validate = () => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.username.trim())
      newErrors.username = "Username is required";
    if (!emailRegex.test(formData.email))
      newErrors.email = "Invalid email";
    if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.age || isNaN(Number(formData.age)))
      newErrors.age = "Valid age is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirmPassword,
        gender: formData.gender,
        age: formData.age,
        known_medical_conditions: formData.medicalConditions
          .split(",")
          .map((c) => c.trim()),
        current_symptom: formData.symptoms,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Account created successfully!");
        router.push("/");
      } else {
        toast.error(data.error || "Registration failed");
      }
    } catch (error) {
      console.error("Error in fetch:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sky-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl  bg-white/90">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="flex items-center justify-center space-x-3 ">
            <div className="bg-white-600 text-sky-700">
              <Stethoscope className="text-bold text-5xl" />
            </div>
            <span className="text-4xl font-bold bg-gradient-to-r from-sky-500 to-emerald-600 bg-clip-text text-transparent">
              MedAI
            </span>
          </div>
          </div>
          <CardTitle className="text-3xl font-bold text-slate-800">Create Account</CardTitle>
          <CardDescription className="text-slate-500">
            Join MedAI to access your intelligent health companion
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username + Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-0.5xl" htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                  placeholder="Enter Username"
                  className={errors.username ? "border-destructive rounded-md  bg-gray-100" : "rounded-md  bg-gray-100" }
                />
                {errors.username && (
                  <p className="text-sm text-destructive">{errors.username}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-0.5xl" htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="Enter Email"
                  className={errors.email ? "border-destructive rounded-md  bg-gray-100" : "rounded-md  bg-gray-100"}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Password + Confirm Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-0.5xl" htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder="Enter Password"
                  className={errors.password ? "border-destructive rounded-md bg-gray-100" : "rounded-md bg-gray-100"}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-0.5xl" htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleChange("confirmPassword", e.target.value)
                  }
                  placeholder="Confirm Password"
                  className={errors.confirmPassword ? "border-destructive rounded-md bg-gray-100" : "rounded-md bg-gray-100"}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Age + Gender */}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-0.5xl" htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleChange("age", e.target.value)}
                  placeholder="Enter Age"
                  className={errors.age ? "border-destructive rounded-md bg-gray-100" : "rounded-md bg-gray-100"}
                />
                {errors.age && (
                  <p className="text-sm text-destructive">{errors.age}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-0.5xl" htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(val) => handleChange("gender", val)}
                >
                  <SelectTrigger
                    className={errors.gender ? "border-destructive rounded-md bg-gray-100 w-full" : "rounded-md bg-gray-100 w-full"}
                  >
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="text-sm text-destructive">{errors.gender}</p>
                )}
              </div>
            </div>

            {/* Medical Conditions */}
            <div className="space-y-2">
              <Label className="text-0.5xl" htmlFor="medicalConditions">
                Known Medical Conditions
              </Label>
              <Textarea
                id="medicalConditions"
                className="rounded-md bg-gray-100"
                value={formData.medicalConditions}
                onChange={(e) =>
                  handleChange("medicalConditions", e.target.value)
                }
                placeholder="Comma-separated conditions"
                rows={3}
              />
            </div>

            {/* Symptoms */}
            <div className="space-y-2">
              <Label className="text-0.5xl" htmlFor="symptoms">Current Symptoms</Label>
              <Textarea
                id="symptoms"
                className="rounded-md bg-gray-100"
                value={formData.symptoms}
                onChange={(e) => handleChange("symptoms", e.target.value)}
                placeholder="Comma-separated symptoms"
                rows={3}
              />
            </div>

            {/* Buttons */}
            <div className="flex space-x-6 py-3">
              <Button type="submit" className="flex-1 h-11 bg-sky-600 hover:bg-sky-700 text-0.5xl" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="text-0.5xl h-11 bg-gray-100 hover:bg-gray-300"
                onClick={() => router.push("/")}
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
