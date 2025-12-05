"use server"
import { cookies } from "next/headers";

type MeResponse =
  | { user: { id: string; name: string; email: string; phone: string; verified: boolean; accountId: string | null } }
  | { message: string };

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    return null;
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      method: "GET",
      headers: {
        cookie: `access_token=${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    const data: MeResponse = await res.json();
    if ("user" in data) {
      return data.user;
    }

    return null;
  } catch (err) {
    console.error("Erro ao chamar /auth/me:", err);
    return null;
  }
}
