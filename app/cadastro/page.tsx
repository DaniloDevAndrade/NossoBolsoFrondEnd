"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { formatPhoneInput, normalizePhone } from "@/lib/phone-formatter";

// Lê a URL da API em build-time (precisa de NEXT_PUBLIC_API_URL definida no frontend)
const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  // Isso vai aparecer no console do navegador em produção se a env não estiver setada
  console.error(
    "ERRO CRÍTICO: NEXT_PUBLIC_API_URL não está definida. Configure a env no frontend em produção."
  );
}

export default function CadastroPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    senha: "",
    confirmarSenha: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTelefoneChange = (value: string) => {
    const formatted = formatPhoneInput(value);
    handleChange("telefone", formatted);
  };

  const nameRegex =
    /^[A-Za-zÀ-ÖØ-öø-ÿ]{2,}(?:\s[A-Za-zÀ-ÖØ-öø-ÿ]{2,})+$/;

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-]).{8,}$/;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Proteção extra: se a env não estiver definida, não tenta bater na API
    if (!API_URL) {
      toast.error(
        "Configuração da API ausente. Tente novamente mais tarde ou contate o suporte."
      );
      console.error("Tentativa de submit sem NEXT_PUBLIC_API_URL configurada.");
      return;
    }

    try {
      if (!nameRegex.test(formData.nome)) {
        toast.error("Digite o nome completo.");
        return;
      }

      if (formData.senha !== formData.confirmarSenha) {
        toast.error("As senhas não coincidem.");
        return;
      }

      if (!passwordRegex.test(formData.senha)) {
        toast.error(
          "A senha deve ter no mínimo 8 caracteres, com letra maiúscula, minúscula, número e símbolo."
        );
        return;
      }

      let phone: string;
      try {
        phone = normalizePhone(formData.telefone);
      } catch {
        toast.error("Telefone inválido. Use o formato (11) 99999-9999.");
        return;
      }

      const payload = {
        name: formData.nome.trim(),
        email: formData.email.trim().toLowerCase(),
        phone,
        password: formData.senha,
      };

      setIsSubmitting(true);
      toast.loading("Criando sua conta...", { id: "register" });

      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const data = await res.json().catch(() => null);

      toast.dismiss("register");

      if (!res.ok) {
        toast.error(
          data?.message ?? "Erro ao criar conta. Tente novamente."
        );
        return;
      }

      const deliveryStatus = data?.deliveryStatus as
        | "sent"
        | "failed"
        | undefined;
      const status = data?.status as
        | "created"
        | "pending_verification"
        | undefined;

      if (deliveryStatus === "failed") {
        toast.error(
          data?.message ??
            "Conta criada, mas não conseguimos enviar o código via WhatsApp. Na próxima tela você poderá conferir e alterar o número."
        );
      } else if (status === "pending_verification") {
        toast.success(
          data?.message ??
            "Conta já criada, enviamos um novo código de verificação."
        );
      } else {
        toast.success(
          data?.message ??
            "Conta criada! Enviamos um código via WhatsApp."
        );
      }

      const userPhone = data?.userPhone as string | undefined;

      if (userPhone) {
        router.replace(
          `/verificacao?userPhone=${encodeURIComponent(
            userPhone
          )}&from=cadastro`
        );
      } else {
        console.warn(
          "Resposta do /auth/register não veio com userPhone. Redirecionando sem o parâmetro."
        );
        router.replace(`/verificacao?from=cadastro`);
      }
    } catch (err) {
      console.error(err);
      toast.dismiss("register");
      toast.error("Erro inesperado. Tente novamente mais tarde.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Animated background elements */}
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

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Criar conta
          </h1>
          <p className="text-muted-foreground">
            Comece a organizar suas finanças em casal
          </p>
        </div>

        {/* Registration Form */}
        <div className="bg-card/80 backdrop-blur-xl border border-border/20 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="nome" className="text-foreground">
                Nome completo
              </Label>
              <Input
                id="nome"
                type="text"
                placeholder="Seu nome"
                value={formData.nome}
                onChange={(e) => handleChange("nome", e.target.value)}
                required
                className="bg-input border-border/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                required
                className="bg-input border-border/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone" className="text-foreground">
                Telefone
              </Label>
              <Input
                id="telefone"
                type="tel"
                placeholder="(11) 99999-9999"
                value={formData.telefone}
                onChange={(e) => handleTelefoneChange(e.target.value)}
                maxLength={15}
                required
                className="bg-input border-border/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha" className="text-foreground">
                Senha
              </Label>
              <Input
                id="senha"
                type="password"
                placeholder="••••••••"
                value={formData.senha}
                onChange={(e) => handleChange("senha", e.target.value)}
                required
                className="bg-input border-border/20"
              />
              <p className="text-xs text-muted-foreground">
                Mínimo 8 caracteres, com letra maiúscula, minúscula, número e
                símbolo.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmarSenha" className="text-foreground">
                Confirmar senha
              </Label>
              <Input
                id="confirmarSenha"
                type="password"
                placeholder="••••••••"
                value={formData.confirmarSenha}
                onChange={(e) =>
                  handleChange("confirmarSenha", e.target.value)
                }
                required
                className="bg-input border-border/20"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
            >
              {isSubmitting ? "Criando conta..." : "Criar conta"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Já tem uma conta?{" "}
              <Link
                href="/login"
                className="text-primary hover:underline font-medium"
              >
                Entrar
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          Organize o dinheiro de vocês juntos
        </p>
      </div>
    </div>
  );
}
