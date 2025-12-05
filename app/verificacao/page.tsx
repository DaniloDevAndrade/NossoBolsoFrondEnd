"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Smartphone, X } from "lucide-react";
import { toast } from "sonner";
import {
  formatPhoneForDisplay,
  formatPhoneInput,
  normalizePhone,
} from "@/lib/phone-formatter";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Flow = "cadastro" | "login" | "reset" | "invite";

export default function VerificacaoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [isChangePhoneOpen, setIsChangePhoneOpen] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [isChangingPhone, setIsChangingPhone] = useState(false);

  const fromParam = searchParams.get("from") || "cadastro";
  const from: Flow =
    fromParam === "login" ||
    fromParam === "reset" ||
    fromParam === "invite"
      ? fromParam
      : "cadastro";

  const isLoginFlow = from === "login";
  const isResetFlow = from === "reset";
  const isInviteFlow = from === "invite";

  const challengeId = searchParams.get("challengeId"); // usado no login
  const rawPhone = searchParams.get("userPhone");

  let userPhone: string | null = null;
  if (rawPhone) {
    try {
      userPhone = normalizePhone(rawPhone);
    } catch {
      userPhone = rawPhone;
    }
  }

  const formattedPhone = formatPhoneForDisplay(userPhone ?? rawPhone ?? "");

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    const newCode = pastedData.split("");

    if (newCode.length === 6 && newCode.every((char) => /^\d$/.test(char))) {
      setCode(newCode);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join("");

    if (fullCode.length !== 6) {
      toast.error("Digite o código completo de 6 dígitos.");
      return;
    }

    if (!API_URL) {
      toast.error("Erro de configuração da API.");
      return;
    }

    // Validações de contexto
    if (!isLoginFlow && !userPhone) {
      toast.error(
        "Erro interno: telefone não encontrado. Tente refazer o fluxo."
      );

      if (isResetFlow) router.push("/login");
      else router.push("/cadastro/inicio");
      return;
    }

    if (isResetFlow && !userPhone) {
      toast.error(
        "Erro interno: telefone não encontrado. Tente refazer o fluxo."
      );
      router.push("/login");
      return;
    }

    if (isLoginFlow && !challengeId) {
      toast.error(
        "Sessão de login inválida ou expirada. Faça login novamente."
      );
      router.push("/login");
      return;
    }

    try {
      toast.loading("Verificando código...", { id: "verify" });

      let res: Response;
      let data: any = null;

      if (!isLoginFlow && !isResetFlow) {
        // CADASTRO / INVITE
        const payload = {
          userPhone: userPhone,
          code: fullCode,
        };

        res = await fetch(`${API_URL}/auth/register/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "include",
        });
      } else if (isLoginFlow) {
        // LOGIN -> AGORA USA challengeId
        const payload = {
          challengeId,
          code: fullCode,
        };

        res = await fetch(`${API_URL}/auth/login/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "include",
        });
      } else {
        // RESET DE SENHA
        const payload = {
          userPhone,
          code: fullCode,
        };

        res = await fetch(`${API_URL}/auth/password/reset/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      try {
        data = await res.json();
      } catch (err) {
        console.log("Não foi possível fazer parse do JSON da resposta:", err);
      }

      toast.dismiss("verify");

      if (!res.ok) {
        toast.error(
          data?.message ??
            "Não foi possível verificar o código. Tente novamente."
        );
        return;
      }

      if (isResetFlow) {
        const resetToken = data?.resetToken as string | undefined;

        if (!resetToken) {
          toast.error(
            "Erro ao processar recuperação de senha. Tente refazer o fluxo."
          );
          router.push("/login");
          return;
        }

        toast.success("Código verificado! Agora defina uma nova senha.");
        router.push(`/nova-senha?token=${encodeURIComponent(resetToken)}`);
      } else if (isLoginFlow) {
        toast.success("Login realizado com sucesso!");
        router.push("/dashboard");
      } else if (isInviteFlow) {
        toast.success("Conta verificada com sucesso!");
        router.push("/dashboard");
      } else {
        toast.success("Conta verificada com sucesso!");
        router.push("/onboarding");
      }
    } catch (err) {
      console.error("Erro ao verificar código:", err);
      toast.dismiss("verify");
      toast.error(
        "Erro inesperado ao verificar código. Tente novamente mais tarde."
      );
    }
  };

  const handleResend = async () => {
    if (!API_URL) {
      toast.error("Erro de configuração da API.");
      return;
    }

    // Para CADASTRO / INVITE / RESET precisamos do telefone
    if (!isLoginFlow && !userPhone) {
      toast.error(
        "Erro interno: telefone não encontrado. Tente refazer o fluxo."
      );

      if (isResetFlow) router.push("/login");
      else router.push("/cadastro/inicio");

      return;
    }

    // Para LOGIN precisamos do challengeId
    if (isLoginFlow && !challengeId) {
      toast.error(
        "Sessão de login inválida ou expirada. Faça login novamente."
      );
      router.push("/login");
      return;
    }

    try {
      setIsResending(true);
      toast.loading("Enviando novo código...", { id: "resend" });

      let res: Response;
      let data: any = null;

      if (!isLoginFlow && !isResetFlow) {
        // CADASTRO / INVITE
        const payload = { userPhone };

        res = await fetch(`${API_URL}/auth/register/resend-code`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "include",
        });
      } else if (isLoginFlow) {
        // LOGIN -> AGORA USA challengeId
        const payload = { challengeId };

        res = await fetch(`${API_URL}/auth/login/resend-code`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "include",
        });
      } else {
        // RESET DE SENHA
        const payload = { userPhone };

        res = await fetch(`${API_URL}/auth/password/reset/resend`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      try {
        data = await res.json();
      } catch (err) {
        console.log(
          "Não foi possível fazer parse do JSON da resposta (resend):",
          err
        );
      }

      toast.dismiss("resend");

      if (!res.ok) {
        toast.error(
          data?.message ??
            "Não foi possível reenviar o código. Tente novamente em alguns instantes."
        );
        return;
      }

      toast.success("Novo código enviado via WhatsApp!");

      setCountdown(60);
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      console.error("Erro ao chamar endpoint de reenviar código:", err);
      toast.dismiss("resend");
      toast.error("Erro inesperado ao reenviar código. Tente novamente.");
    } finally {
      setIsResending(false);
    }
  };

  const isCodeComplete = code.every((digit) => digit !== "");

  const openChangePhoneModal = () => {
    setNewPhone("");
    setIsChangePhoneOpen(true);
  };

  const closeChangePhoneModal = () => {
    if (isChangingPhone) return;
    setIsChangePhoneOpen(false);
  };

  const handleNewPhoneChange = (value: string) => {
    setNewPhone(formatPhoneInput(value));
  };

  const handleConfirmChangePhone = async () => {
    if (!userPhone) {
      toast.error("Erro interno: telefone atual não encontrado.");
      return;
    }

    if (!newPhone.trim()) {
      toast.error("Preencha o novo telefone.");
      return;
    }

    if (!API_URL) {
      toast.error("Erro de configuração da API.");
      return;
    }

    let normalizedNewPhone: string;
    try {
      normalizedNewPhone = normalizePhone(newPhone);
    } catch (err) {
      toast.error("Telefone inválido. Use o formato (11) 99999-9999.");
      return;
    }

    try {
      setIsChangingPhone(true);
      toast.loading("Atualizando telefone...", { id: "change-phone" });

      const payload = {
        userPhone,
        newUserPhone: normalizedNewPhone,
      };

      const res = await fetch(
        `${API_URL}/auth/register/change-number`,
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
      } catch (err) {
        console.log(
          "Não foi possível fazer parse do JSON da resposta (change-number):",
          err
        );
      }

      toast.dismiss("change-phone");

      if (!res.ok) {
        toast.error(
          data?.message ??
            "Não foi possível alterar o telefone. Tente novamente."
        );
        return;
      }

      toast.success("Telefone atualizado e novo código enviado!");

      setIsChangePhoneOpen(false);
      setCode(["", "", "", "", "", ""]);
      setCountdown(60);

      router.replace(
        `/verificacao?userPhone=${encodeURIComponent(
          normalizedNewPhone
        )}&from=${from}`
      );
    } catch (err) {
      console.error("Erro ao chamar /auth/register/change-number:", err);
      toast.dismiss("change-phone");
      toast.error("Erro inesperado ao alterar telefone. Tente novamente.");
    } finally {
      setIsChangingPhone(false);
    }
  };

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
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Smartphone className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Verificação
          </h1>
          <p className="text-muted-foreground text-balance">
            Enviamos um código de 6 dígitos via WhatsApp para
          </p>
          <p className="text-foreground font-medium mt-1">
            {formattedPhone || "seu WhatsApp"}
          </p>

          {!isLoginFlow && !isResetFlow && (
            <Button
              variant="ghost"
              size="sm"
              onClick={openChangePhoneModal}
              className="mt-2 text-primary hover:bg-primary/5 font-medium"
            >
              Alterar telefone
            </Button>
          )}
        </div>

        <div className="bg-card/80 backdrop-blur-xl border border-border/20 rounded-2xl p-8 shadow-2xl">
          <div className="space-y-6">
            <div>
              <div className="flex gap-2 justify-center mb-6">
                {code.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) =>
                      handleChange(index, e.target.value.replace(/\D/g, ""))
                    }
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-14 text-center text-xl font-bold bg-input border-border/20 focus:border-primary"
                  />
                ))}
              </div>
            </div>

            <Button
              onClick={handleVerify}
              disabled={!isCodeComplete}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold disabled:opacity-50"
            >
              Verificar código
            </Button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Não recebeu o código?
              </p>
              {countdown > 0 ? (
                <p className="text-sm text-muted-foreground">
                  Reenviar em{" "}
                    <span className="text-primary font-medium">
                    {countdown}s
                  </span>
                </p>
              ) : (
                <Button
                  variant="ghost"
                  onClick={handleResend}
                  disabled={isResending}
                  className="text-primary font-medium"
                >
                  {isResending ? "Reenviando..." : "Reenviar código"}
                </Button>
              )}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Verifique também se o WhatsApp está com conexão ativa
        </p>
      </div>

      {/* Modal alterar telefone (somente cadastro/invite) */}
      {!isLoginFlow && !isResetFlow && isChangePhoneOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-background border border-border/40 shadow-2xl p-6 relative">
            <button
              type="button"
              onClick={closeChangePhoneModal}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-xl font-semibold text-foreground mb-2">
              Alterar telefone
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Informe o novo número de telefone para receber o código de
              verificação.
            </p>

            <div className="space-y-2 mb-6">
              <label
                htmlFor="novo-telefone"
                className="text-sm font-medium text-foreground"
              >
                Novo telefone
              </label>
              <Input
                id="novo-telefone"
                type="tel"
                placeholder="(11) 99999-9999"
                value={newPhone}
                maxLength={15}
                onChange={(e) => handleNewPhoneChange(e.target.value)}
                className="bg-input border-border/40"
              />
              <p className="text-xs text-muted-foreground">
                Use o formato (11) 99999-9999.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={closeChangePhoneModal}
                disabled={isChangingPhone}
                className="text-muted-foreground"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmChangePhone}
                disabled={isChangingPhone}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              >
                {isChangingPhone ? "Salvando..." : "Salvar novo telefone"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
