// frontend/components/auth/ForgotPasswordForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {  Loader2, Stethoscope } from "lucide-react";

type FormData = {
  email: string;
  newPassword: string;
  confirmPassword: string;
};

export default function ForgotPasswordForm() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    email: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Handle change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  // Validation
  const validate = () => {
    const newErrors: Partial<FormData> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit to Flask backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            new_password: formData.newPassword,
            confirm_new_password: formData.confirmPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "An error occurred.");
      } else {
        toast.success("Password reset successful. Redirecting to login...");
        setTimeout(() => router.push("/"), 2000);
      }
    } catch (error) {
      console.log("Error: ", error);
      toast.error("Server error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sky-100 flex items-center justify-center p-4 font-sans">
      <Card className="w-full max-w-md  bg-white/90">
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
          <CardTitle className="text-3xl font-bold text-slate-800">Reset Password</CardTitle>
          <CardDescription className="text-slate-500">
            Enter your email and new password to reset your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2 py-1">
              <Label className="text-0.5xl" htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "border-destructive rounded-md  bg-gray-100" : "rounded-md  bg-gray-100"}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            {/* New Password */}
            <div className="space-y-2 py-1">
              <Label className="text-0.5xl" htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                name="newPassword"
                placeholder="Enter new password"
                autoComplete="new-password"
                value={formData.newPassword}
                onChange={handleChange}
                className={errors.newPassword ? "border-destructive rounded-md  bg-gray-100" : "rounded-md  bg-gray-100"}
              />
              {errors.newPassword && (
                <p className="text-sm text-destructive">{errors.newPassword}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2 py-1">
              <Label className="text-0.5xl" htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                placeholder="Confirm new password"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? "border-destructive rounded-md  bg-gray-100" : "rounded-md  bg-gray-100"}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex space-x-4 mt-6">
              <Button type="submit" className="flex-1 h-11 bg-sky-600 hover:bg-sky-700 text-0.5xl py-3" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="h-11 text-0.5xl bg-gray-100 hover:bg-gray-300"
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
