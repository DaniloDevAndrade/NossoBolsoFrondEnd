"use server"
import { getCurrentUser } from "@/lib/get-current-user"
import { redirect } from "next/navigation"
import OnboardingClient from "./OnboardingClient"

export default async function OnboardingPage() {
  const user = await getCurrentUser()

  console.log(user)

  if (!user) {
    redirect("/login")
  }

  return <OnboardingClient />
}
