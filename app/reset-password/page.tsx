"use client";

export const dynamic = "force-dynamic";

import ResetPasswordForm from "@/app/components/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <div className="auth-container">
      <ResetPasswordForm />
    </div>
  );
}
