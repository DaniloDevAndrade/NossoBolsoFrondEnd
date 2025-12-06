"use server"
import { cookies } from "next/headers";

type MeResponse =
  | { user: { id: string; name: string; email: string; phone: string; verified: boolean; accountId: string | null } }
  | { message: string };

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  console.error(
    "ERRO CRÍTICO: NEXT_PUBLIC_API_URL não está definida. Configure a env no frontend em produção."
  );
}

export async function getCurrentUser() {
  
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  console.log(token)

  if (!token) {
    return null;
  }

  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      method: "GET",
      headers: {
        cookie: `access_token=${token}`,
      },
      cache: "no-store",
      credentials: "include"
    });

    console.log(res)

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
