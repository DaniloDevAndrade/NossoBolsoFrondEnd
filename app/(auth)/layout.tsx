"use server";

import type { ReactNode } from "react";
import { getCurrentUser } from "@/lib/get-current-user";
import { redirect } from "next/navigation";
import { AuthProvider } from "@/components/providers/auth-provider";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <AuthProvider userId={user.id}>
      {children}
    </AuthProvider>
  );
}
