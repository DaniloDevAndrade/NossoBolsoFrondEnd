"use server"

import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/get-current-user"
import LoginPage from "./LoginClient" // importando o DEFAULT

export default async function Login() {
  const user = await getCurrentUser()

  if (user) {
    redirect("/dashboard")
  }

  return <LoginPage />
}
