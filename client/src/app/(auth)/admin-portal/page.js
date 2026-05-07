"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandLogo } from "@/components/common/BrandLogo";
import axios from "axios";

const adminLoginSchema = z.object({
  identifier: z.string().min(1, "Identifier is required"),
  password: z.string().min(1, "Password is required"),
});

export default function AdminPortalPage() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(adminLoginSchema),
    mode: "onChange",
  });

  const onSubmit = async (values) => {
    setSubmitError("");
    setSubmitSuccess("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      const adminKey = process.env.NEXT_PUBLIC_ADMIN_KEY;

      if (!adminKey) {
        setSubmitError("Admin access key is not configured.");
        return;
      }

      const response = await axios.post(
        `${apiUrl}/x-secure/admin-access/authenticate`,
        values,
        {
          headers: {
            "Content-Type": "application/json",
            "x-admin-key": adminKey,
          },
        }
      );

      if (response.data.success) {
        const { accessToken, refreshToken, user } = response.data.data;
        localStorage.setItem("agriculnet_access_token", accessToken);
        localStorage.setItem("agriculnet_refresh_token", refreshToken);
        setSubmitSuccess("Admin login successful. Redirecting...");
        router.push("/admin/dashboard");
      }
    } catch (error) {
      const message = error.response?.data?.message || "Authentication failed";
      setSubmitError(message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D3D22] flex items-center justify-center px-4">
      <Card className="w-full max-w-md rounded-[20px] p-8 bg-white">
        <div className="text-center mb-8">
          <div className="mx-auto flex justify-center">
            <BrandLogo className="h-12 w-[170px]" priority />
          </div>
          <div className="mt-4 inline-block px-4 py-1 bg-[#FDECEA] text-[#922B21] rounded-full text-sm font-medium">
            Restricted Access
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <Label>Email or Phone</Label>
            <Input
              placeholder="Enter your credentials"
              autoComplete="username"
              {...register("identifier")}
            />
            {errors.identifier && (
              <p className="mt-1 text-[12px] text-[#922B21]">{errors.identifier.message}</p>
            )}
          </div>

          <div>
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              {...register("password")}
            />
            {errors.password && (
              <p className="mt-1 text-[12px] text-[#922B21]">{errors.password.message}</p>
            )}
          </div>

          {submitError && (
            <p className="rounded-[12px] bg-[#FDECEA] px-4 py-3 text-[12px] text-[#922B21]">
              {submitError}
            </p>
          )}

          {submitSuccess && (
            <p className="rounded-[12px] bg-[#D4EDDA] px-4 py-3 text-[12px] text-[#1A5C2E]">
              {submitSuccess}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing In..." : "Sign In"}
          </Button>
        </form>

        <p className="mt-6 text-center text-[12px] text-[#6B7280]">
          Authorized personnel only. Unauthorized access is prohibited.
        </p>
      </Card>
    </div>
  );
}
