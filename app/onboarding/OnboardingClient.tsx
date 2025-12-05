"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatPhoneInput, normalizePhone } from "@/lib/phone-formatter";

type OnboardingStatus = "initial" | "sent";

export default function OnboardingClient() {
  const router = useRouter();
  const [telefone, setTelefone] = useState("");
  const [status, setStatus] = useState<OnboardingStatus>("initial");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTelefoneChange = (value: string) => {
    const formatted = formatPhoneInput(value);
    setTelefone(formatted);
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    let normalizedPhone: string;
    try {
      normalizedPhone = normalizePhone(telefone);
    } catch {
      toast.error("Telefone inválido. Use o formato (11) 99999-9999.");
      return;
    }

    try {
      setIsSubmitting(true);
      toast.loading("Enviando convite...", { id: "invite-partner" });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/parther/invite`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ receiverPhone: normalizedPhone }),
          credentials: "include",
        }
      );
      
      const data = await res.json();


      toast.dismiss("invite-partner");

      if (!res.ok) {
        console.error("Erro ao enviar convite:", res.status, data);
        toast.error(
          data?.message ??
            "Não foi possível enviar o convite. Tente novamente em alguns instantes."
        );
        return;
      }

      // const { inviteId, inviteCode } = data;

      setStatus("sent");
      toast.success("Convite enviado via WhatsApp!");
    } catch (err) {
      console.error("Erro inesperado ao chamar /parther/invite:", err);
      toast.dismiss("invite-partner");
      toast.error(
        "Erro inesperado ao enviar o convite. Tente novamente em alguns instantes."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToDashboard = () => {
    router.push("/dashboard");
  };

  const handleSkip = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center">
            <Heart className="w-10 h-10 text-primary-foreground fill-primary-foreground" />
          </div>
        </div>

        <div className="bg-card border border-border/20 rounded-2xl p-10">
          {status === "initial" && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-3">
                  Vamos organizar o dinheiro de vocês juntos
                </h1>
                <p className="text-muted-foreground text-lg">
                  Conecte-se com seu parceiro para começar
                </p>
              </div>

              <form onSubmit={handleSendInvite} className="space-y-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="telefone"
                    className="text-foreground text-base"
                  >
                    Telefone do seu parceiro
                  </Label>
                  <Input
                    id="telefone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={telefone}
                    onChange={(e) => handleTelefoneChange(e.target.value)}
                    maxLength={15}
                    required
                    className="bg-input border-border/20 h-12 text-base"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-12 text-base"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando convite...
                    </>
                  ) : (
                    "Enviar convite"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={handleSkip}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Pular por enquanto
                </button>
              </div>
            </>
          )}

          {status === "sent" && (
            <div className="text-center py-4">
              <div className="w-20 h-20 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>

              <h2 className="text-2xl font-bold text-foreground mb-3">
                Convite enviado!
              </h2>

              <p className="text-muted-foreground text-lg mb-4">
                Agora seu parceiro precisa aceitar o convite para começar a usar
                o <span className="font-semibold">NossoBolso</span> com você.
              </p>

              <p className="text-sm text-muted-foreground mb-6">
                Enviamos o convite para{" "}
                <span className="text-foreground font-medium">
                  {telefone}
                </span>{" "}
                via WhatsApp.
              </p>

              <Button
                onClick={handleGoToDashboard}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-12 text-base"
              >
                Ir para o dashboard
              </Button>

              <p className="text-xs text-muted-foreground mt-4">
                Quando seu parceiro criar a conta e aceitar o convite, vocês
                passarão a compartilhar a mesma conta automaticamente.
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Transparência e organização para o casal
        </p>
      </div>
    </div>
  );
}
