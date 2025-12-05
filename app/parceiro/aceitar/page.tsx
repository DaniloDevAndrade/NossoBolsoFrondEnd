"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

export default function AceitarConvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<"form" | "success">("form");
  const [inviterName, setInviterName] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  });

  useEffect(() => {
    const code = searchParams.get("codigo");
    const name = searchParams.get("nome");

    if (code) setInviteCode(code);
    if (name) setInviterName(decodeURIComponent(name));
  }, [searchParams]);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Mesmo padrão do seu cadastro
  const nameRegex =
    /^[A-Za-zÀ-ÖØ-öø-ÿ]{2,}(?:\s[A-Za-zÀ-ÖØ-öø-ÿ]{2,})+$/;

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-]).{8,}$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!inviteCode) {
      toast.error("Convite inválido ou link incompleto.");
      return;
    }

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

    const payload = {
      inviteCode,
      name: formData.nome.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.senha,
    };

    try {
      setIsSubmitting(true);
      toast.loading("Criando sua conta e conectando ao parceiro...", {
        id: "accept-invite",
      });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/parther/acceptp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "include",
        }
      );

      let data: any = null;
      try {
        data = await res.json();
      } catch {
      }

      toast.dismiss("accept-invite");

      if (!res.ok) {
        const msg =
          data?.message ??
          "Não foi possível aceitar o convite. Tente novamente.";
        toast.error(msg);
        return;
      }
      const userPhone = data?.userPhone as string | undefined;
      const deliveryStatus = data?.deliveryStatus as
        | "sent"
        | "failed"
        | undefined;

      if (!userPhone) {
        console.error("API não retornou userPhone:", data);
        toast.success(
          "Conta criada e convite aceito. Agora você precisa verificar sua conta."
        );
      } else {
        if (deliveryStatus === "sent") {
          toast.success(
            "Conta criada, convite aceito e código enviado via WhatsApp."
          );
        } else {
          toast.success(
            "Conta criada e convite aceito. Não conseguimos enviar o código, você poderá reenviar na próxima tela."
          );
        }

        setStep("success");

        setTimeout(() => {
          router.replace(
            `/verificacao?userPhone=${encodeURIComponent(
              userPhone
            )}&from=invite`
          );
        }, 2000);
      }
    } catch (err) {
      console.error("Erro ao aceitar convite:", err);
      toast.dismiss("accept-invite");
      toast.error("Erro inesperado. Tente novamente mais tarde.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(0,255,127,0.05),transparent_50%)]" />
          <div className="absolute top-20 right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="bg-card/80 backdrop-blur-xl border border-primary/20 rounded-2xl p-12 shadow-[0_0_50px_rgba(0,255,127,0.1)] text-center">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-3">
              Conta criada com sucesso!
            </h1>
            <p className="text-muted-foreground mb-2">
              Você está conectado com {inviterName || "seu parceiro"}.
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecionando para verificação...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      <div className="absolute top-20 left-10 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse delay-700" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-primary/10 rounded-full" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-primary/5 rounded-full" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/logo.png"
            alt="NossoBolso"
            width={96}
            height={96}
            className="object-contain"
          />
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Aceitar convite
          </h1>
          {inviterName ? (
            <p className="text-muted-foreground">
              <span className="text-primary font-semibold">
                {inviterName}
              </span>{" "}
              convidou você para gerenciar as finanças juntos
            </p>
          ) : (
            <p className="text-muted-foreground">
              Complete seu cadastro para conectar-se
            </p>
          )}
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
                className="bg-input border-border/20 h-11"
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
                className="bg-input border-border/20 h-11"
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
                className="bg-input border-border/20 h-11"
              />
              <p className="text-xs text-muted-foreground">
                Mínimo 8 caracteres, com letra maiúscula, minúscula, número e
                símbolo.
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="confirmarSenha"
                className="text-foreground"
              >
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
                className="bg-input border-border/20 h-11"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-11 shadow-[0_0_20px_rgba(0,255,127,0.3)] disabled:opacity-60"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {isSubmitting
                ? "Criando conta..."
                : "Criar conta e conectar"}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          Ao criar sua conta, você se conectará automaticamente com{" "}
          {inviterName || "seu parceiro"}
        </p>
      </div>
    </div>
  );
}
