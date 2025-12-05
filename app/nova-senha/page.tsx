// app/nova-senha/page.tsx
"use client";

import type React from "react";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { toast } from "sonner";

/* ====== COMPONENTE QUE USA useSearchParams ====== */

function NovaSenhaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetToken = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-]).{8,}$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (!resetToken) {
      toast.error("Sessão de recuperação inválida. Faça o processo novamente.");
      router.push("/login");
      return;
    }

    if (!password || !confirm) {
      toast.error("Preencha todos os campos de senha.");
      return;
    }

    if (password !== confirm) {
      toast.error("As senhas não conferem.");
      return;
    }

    if (!passwordRegex.test(password)) {
      toast.error(
        "A senha deve ter no mínimo 8 caracteres, com letra maiúscula, minúscula, número e símbolo."
      );
      return;
    }

    try {
      setIsLoading(true);
      toast.loading("Atualizando senha...", { id: "reset-password" });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/password/reset`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resetToken,
            newPassword: password,
          }),
          credentials: "include",
        }
      );

      let data: any = null;
      try {
        data = await res.json();
      } catch (err) {
        console.error(
          "Erro ao fazer parse do JSON de /auth/password/reset:",
          err
        );
      }

      toast.dismiss("reset-password");

      if (!res.ok) {
        const message =
          data?.message ??
          "Não foi possível atualizar a senha. Tente novamente.";

        if (res.status === 400 || res.status === 401 || res.status === 403) {
          toast.error(
            data?.message ??
              "Sessão de redefinição expirada. Faça o processo novamente."
          );
          router.push("/login");
          return;
        }

        toast.error(message);
        return;
      }

      toast.success("Senha redefinida com sucesso!");
      router.push("/dashboard");
    } catch (err) {
      console.error("Erro ao chamar /auth/password/reset:", err);
      toast.dismiss("reset-password");
      toast.error(
        "Erro inesperado ao redefinir senha. Tente novamente mais tarde."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isInvalid =
    !password ||
    !confirm ||
    password.length < 8 ||
    password !== confirm ||
    isLoading;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      <div className="absolute top-20 left-10 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse delay-700" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-primary/10 rounded-full" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-primary/5 rounded-full" />

      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-2xl flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="NossoBolso"
              width={96}
              height={96}
              className="object-contain"
            />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Definir nova senha
          </h1>
          <p className="text-muted-foreground">
            Escolha uma nova senha segura para sua conta.
          </p>
        </div>

        <div className="bg-card/80 backdrop-blur-xl border border-border/20 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Nova senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-input border-border/20"
              />
              <p className="text-xs text-muted-foreground">
                Mínimo 8 caracteres, com letra maiúscula, minúscula, número e
                símbolo.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm" className="text-foreground">
                Confirmar nova senha
              </Label>
              <Input
                id="confirm"
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className="bg-input border-border/20"
              />
            </div>

            <Button
              type="submit"
              disabled={isInvalid}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold disabled:opacity-60"
            >
              {isLoading ? "Salvando..." : "Salvar nova senha"}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Sua senha é armazenada de forma segura.
        </p>
      </div>
    </div>
  );
}

/* ====== PAGE WRAPPER COM SUSPENSE ====== */

export default function NovaSenhaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <p className="text-sm text-muted-foreground">
            Carregando página de redefinição...
          </p>
        </div>
      }
    >
      <NovaSenhaContent />
    </Suspense>
  );
}
