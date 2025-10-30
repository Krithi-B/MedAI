// frontend/src/components/auth/LoginForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Loader2, Stethoscope } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type FormData = {
  username: string;
  email: string;
  password: string;
};

export default function LoginForm() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors: Partial<FormData> = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setServerError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Login successful!");

        localStorage.setItem("token", data.token);
        localStorage.setItem("patientName", formData.username);
        localStorage.setItem("patientEmail", formData.email);

        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } else {
        setServerError(data.error || "Login failed. Try again.");
        toast.error(data.error || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setServerError("An error occurred. Please try again later.");
      toast.error("Server error. Try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-100 p-6">
      <Card className="w-full max-w-md shadow-2xl rounded-2xl border border-slate-200 bg-white/90 backdrop-blur">
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
            Welcome Back
          </CardTitle>
          <CardDescription className="text-slate-500">
            Sign in to your MedAI account to continue
          </CardDescription>
        </CardHeader>

        <CardContent>
          {serverError && (
            <p className="text-red-600 text-sm mb-3 text-center font-medium">
              {serverError}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-700 text-0.5xl">
                Username
              </Label>
              <Input
                type="text"
                id="username"
                name="username"
                placeholder="Enter username"
                value={formData.username}
                onChange={handleChange}
                className={`rounded-md bg-gray-100 ${
                  errors.username ? "border-red-500" : "border-slate-200"
                } focus:ring-1 focus:ring-sky-500`}
              />
              {errors.username && (
                <p className="text-sm text-red-500">{errors.username}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 text-0.5xl">
                Email
              </Label>
              <Input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className={`rounded-md bg-gray-100 ${
                  errors.email ? "border-red-500" : "border-slate-300"
                } focus:ring-1 focus:ring-sky-500`}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 text-0.5xl">
                Password
              </Label>
              <Input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className={`rounded-md bg-gray-100 ${
                  errors.password ? "border-red-500" : "border-slate-300"
                } focus:ring-2 focus:ring-sky-500`}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Forgot password */}
            <div className="text-right">
              <Link
                href="/auths/forgot-password"
                className="text-sm font-medium text-sky-600 hover:text-shadow-sky-700"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full text-0.5xl h-11 rounded-md bg-sky-600 text-white font-semibold shadow-md hover:bg-sky-700 transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            {/* Links */}
            <div className="text-center text-sm text-slate-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/auths/register"
                className="font-medium text-sky-600 hover:text-sky-700"
              >
                Create Account
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
