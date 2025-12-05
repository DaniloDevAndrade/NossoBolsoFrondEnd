"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { Users, UserPlus } from "lucide-react"

export default function InicioCadastroPage() {
  const router = useRouter()
  const [step, setStep] = useState<"question" | "link" | "sent">("question")
  const [telefone, setTelefone] = useState("")

  const handleTelefoneChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    let formatted = cleaned

    if (cleaned.length > 0) {
      formatted = "(" + cleaned.substring(0, 2)
      if (cleaned.length >= 3) {
        formatted += ") " + cleaned.substring(2, 7)
      }
      if (cleaned.length >= 8) {
        formatted += "-" + cleaned.substring(7, 11)
      }
    }

    setTelefone(formatted)
  }

  const handleLinkRequest = (e: React.FormEvent) => {
    e.preventDefault()
    setStep("sent")

    // Simulate API call to send link request
    setTimeout(() => {
      console.log("[v0] Link request sent to:", telefone)
    }, 1000)
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
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-2xl flex items-center justify-center">
            <Image src="/logo.png" alt="NossoBolso" width={96} height={96} className="object-contain" />
          </div>
        </div>

        {/* Question Step */}
        {step === "question" && (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Vamos começar!</h1>
              <p className="text-muted-foreground">Seu parceiro(a) já possui conta no NossoBolso?</p>
            </div>

            <div className="bg-card/80 backdrop-blur-xl border border-border/20 rounded-2xl p-8 shadow-2xl space-y-4">
              <Button
                onClick={() => router.push("/cadastro")}
                className="w-full h-auto py-6 bg-primary text-primary-foreground hover:bg-primary/90 flex flex-col items-center gap-2"
              >
                <UserPlus className="w-6 h-6" />
                <div>
                  <div className="font-semibold">Não, criar nova conta</div>
                  <div className="text-xs opacity-80">Cadastrar-se no NossoBolso</div>
                </div>
              </Button>
              
              <Button
                onClick={() => setStep("link")}
                variant="outline"
                className="w-full h-auto py-6 border-primary/20 hover:bg-primary/10 text-primary flex flex-col items-center gap-2 hover:text-primary"
              >
                <Users className="w-6 h-6" />
                <div>
                  <div className="font-semibold">Sim, já tem conta</div>
                  <div className="text-xs opacity-80">Vincular conta existente</div>
                </div>
              </Button>
              
            </div>
          </>
        )}

        {/* Link Account Step */}
        {step === "link" && (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Vincular conta</h1>
              <p className="text-muted-foreground">Informe o telefone do seu parceiro(a)</p>
            </div>

            <div className="bg-card/80 backdrop-blur-xl border border-border/20 rounded-2xl p-8 shadow-2xl">
              <form onSubmit={handleLinkRequest} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="telefone" className="text-foreground">
                    Telefone do parceiro(a)
                  </Label>
                  <Input
                    id="telefone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={telefone}
                    onChange={(e) => handleTelefoneChange(e.target.value)}
                    maxLength={15}
                    required
                    className="bg-input border-border/20"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enviaremos uma solicitação de vinculação para este número
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                  >
                    Enviar solicitação
                  </Button>

                  <Button type="button" variant="ghost" onClick={() => setStep("question")} className="w-full">
                    Voltar
                  </Button>
                </div>
              </form>
            </div>
          </>
        )}

        {/* Request Sent Step */}
        {step === "sent" && (
          <>
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Solicitação enviada!</h1>
              <p className="text-muted-foreground">
                Enviamos uma solicitação de vinculação para{" "}
                <span className="font-semibold text-foreground">{telefone}</span>
              </p>
            </div>

            <div className="bg-card/80 backdrop-blur-xl border border-border/20 rounded-2xl p-8 shadow-2xl">
              <div className="space-y-4 text-center">
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <p className="text-sm text-foreground">
                    Seu parceiro(a) receberá uma notificação e precisará aceitar a solicitação para vincular as contas.
                  </p>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Você será notificado assim que a solicitação for aceita.</p>
                  <p>Enquanto isso, você pode fazer login na sua conta.</p>
                </div>

                <Button
                  onClick={() => router.push("/login")}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold mt-6"
                >
                  Ir para login
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-8">Organize o dinheiro de vocês juntos</p>
      </div>
    </div>
  )
}
