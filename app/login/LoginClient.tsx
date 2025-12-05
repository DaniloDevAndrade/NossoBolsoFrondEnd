"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { toast } from "sonner"
import { X } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const [isForgotOpen, setIsForgotOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState("")
  const [isSendingReset, setIsSendingReset] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) return

    try {
      setIsLoading(true)
      toast.loading("Verificando credenciais...", { id: "login" })

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailOrPhone: email,
          password,
        }),
        credentials: "include",
      })

      let data: any = null
      try {
        data = await res.json()
      } catch (err) {
        console.error("Erro ao fazer parse do JSON de /auth/login:", err)
      }

      toast.dismiss("login")

      if (!res.ok) {
        const message = data?.message ?? "Não foi possível fazer login. Verifique os dados."
        toast.error(message)
        return
      }

      const userPhone: string | undefined = data?.userPhone
      const challengeId: string | undefined = data?.newChallengeId

      if (!userPhone || !challengeId) {
        console.error("Resposta de /auth/login incompleta:", data)
        toast.error("Resposta inválida do servidor. Tente novamente em alguns instantes.")
        return
      }

      toast.success("Código de login enviado via WhatsApp!")

      router.push(
        `/verificacao?userPhone=${encodeURIComponent(
          userPhone
        )}&from=login&challengeId=${encodeURIComponent(challengeId)}`
      )
    } catch (err) {
      console.error("Erro ao chamar /auth/login:", err)
      toast.dismiss("login")
      toast.error("Erro inesperado ao fazer login. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const openForgotModal = () => {
    setForgotEmail("")
    setIsForgotOpen(true)
  }

  const closeForgotModal = () => {
    if (isSendingReset) return
    setIsForgotOpen(false)
  }

  const handleForgotPassword = async () => {
    if (!forgotEmail.trim()) {
      toast.error("Preencha o email.")
      return
    }

    try {
      setIsSendingReset(true)
      toast.loading("Enviando código de recuperação...", {
        id: "forgot-password",
      })

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/password/forgot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      })

      let data: any = null
      try {
        data = await res.json()
      } catch (err) {
        console.error("Erro ao fazer parse do JSON de /auth/password/forgot:", err)
      }

      toast.dismiss("forgot-password")

      if (!res.ok) {
        const message =
          data?.message ?? "Não foi possível enviar o código de recuperação. Tente novamente."
        toast.error(message)
        return
      }

      const userPhone: string | undefined = data?.userPhone

      toast.success("Se o email estiver cadastrado, você receberá um código via WhatsApp.")

      setIsForgotOpen(false)

      if (userPhone) {
        router.push(`/verificacao?userPhone=${encodeURIComponent(userPhone)}&from=reset`)
      }
    } catch (err) {
      console.error("Erro ao chamar /auth/password/forgot:", err)
      toast.dismiss("forgot-password")
      toast.error("Erro inesperado ao enviar código de recuperação. Tente novamente.")
    } finally {
      setIsSendingReset(false)
    }
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Bem-vindo de volta</h1>
          <p className="text-muted-foreground">Entre para gerenciar suas finanças</p>
        </div>

        {/* Login Form */}
        <div className="bg-card/80 backdrop-blur-xl border border-border/20 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-input border-border/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Senha
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
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold disabled:opacity-60"
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="text-right">
            <button
              type="button"
              onClick={openForgotModal}
              className="text-sm mt-2 text-muted-foreground hover:text-primary transition-colors"
            >
              Esqueci minha senha
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Não tem uma conta?{" "}
              <Link href="/cadastro" className="text-primary hover:underline font-medium">
                Criar conta
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          Organize o dinheiro de vocês juntos
        </p>
      </div>

      {/* Modal Esqueci minha senha */}
      {isForgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-background border border-border/40 shadow-2xl p-6 relative">
            <button
              type="button"
              onClick={closeForgotModal}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-xl font-semibold text-foreground mb-2">Recuperar senha</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Informe o email cadastrado para enviarmos um código de recuperação via WhatsApp.
            </p>

            <div className="space-y-2 mb-6">
              <Label htmlFor="forgot-email" className="text-sm font-medium text-foreground">
                Email
              </Label>
              <Input
                id="forgot-email"
                type="email"
                placeholder="seu@email.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="bg-input border-border/40"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={closeForgotModal}
                disabled={isSendingReset}
                className="text-muted-foreground"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleForgotPassword}
                disabled={isSendingReset}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              >
                {isSendingReset ? "Enviando..." : "Enviar código"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
