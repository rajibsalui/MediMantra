"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { BackgroundBeams } from "../ui/aceternity/background-beams";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-hot-toast";

export default function LoginForm() {
  const router = useRouter();
  const { user, login, loginDoctor } = useAuth();
  const [isDoctor, setIsDoctor] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Use different login function based on user type
      if (isDoctor) {
        await loginDoctor(formData);
        toast.success("Doctor login successful!");
        router.push("/doctor/dashboard");
      } else {
        await login(formData);
        toast.success("Login successful!");
        router.push(`/${user.role}/dashboard`);
      }
    } catch (error) {
      console.error("Login failed:", error);
      toast.error(error.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    // This is a placeholder for future implementation
    try {
      setIsLoading(true);

      if (provider === "google") {
        // Placeholder for actual Google authentication
        toast.info("Google login will be implemented soon");
      } else if (provider === "facebook") {
        // Placeholder for actual Facebook authentication
        toast.info("Facebook login will be implemented soon");
      }
    } catch (error) {
      toast.error(error.message || `${provider} login failed`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden">
      <BackgroundBeams className="z-0" />
      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto w-full max-w-md">
          {/* Logo and heading */}
          <div className="mb-6 text-center">
            <Link href="/" className="inline-block mb-6">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                MediMantra
              </span>
            </Link>
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Please sign in to your account
            </p>
          </div>

          {/* User type toggle */}
          <div className="flex p-1 mb-8 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              className={cn(
                "flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                !isDoctor
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow"
                  : "text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
              )}
              onClick={() => setIsDoctor(false)}
            >
              Patient
            </button>
            <button
              type="button"
              className={cn(
                "flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                isDoctor
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow"
                  : "text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
              )}
              onClick={() => setIsDoctor(true)}
            >
              Doctor
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800"
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={isDoctor ? "doctor@example.com" : "patient@example.com"}
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, rememberMe: !!checked })
                    }
                  />
                  <Label
                    htmlFor="rememberMe"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    Remember me
                  </Label>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-medium"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : null}
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>

              <div className="mt-6 text-center">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Don't have an account?{" "}
                  <Link
                    href={isDoctor ? "/signup/doctor" : "/signup"}
                    className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </form>
          </motion.div>

          {/* OAuth buttons */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white dark:bg-slate-900 text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-11"
                disabled={isLoading}
                onClick={() => handleSocialLogin("google")}
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </Button>
              <Button
                variant="outline"
                className="h-11"
                disabled={isLoading}
                onClick={() => handleSocialLogin("facebook")}
              >
                <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
                Facebook
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
