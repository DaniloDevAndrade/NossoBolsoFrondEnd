"use client"

import { Button } from "@/components/ui/button"
import { Check, Heart, Shield, TrendingUp, Wallet, Users, CreditCard, BarChart3, Menu, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Image src="/logo.png" alt="NossoBolso" width={32} height={32} className="object-contain sm:w-10 sm:h-10" />
            <span className="text-xl sm:text-2xl font-bold text-foreground">NossoBolso</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">
              Recursos
            </a>
            <a href="#benefits" className="text-muted-foreground hover:text-primary transition-colors">
              Benefícios
            </a>
            <a href="#pricing" className="text-muted-foreground hover:text-primary transition-colors">
              Preços
            </a>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-foreground hover:text-primary">
                Entrar
              </Button>
            </Link>
            <Link href="/cadastro/inicio">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Começar grátis</Button>
            </Link>
          </div>
          <button className="md:hidden text-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border/20">
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <a
                href="#features"
                className="text-muted-foreground hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Recursos
              </a>
              <a
                href="#benefits"
                className="text-muted-foreground hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Benefícios
              </a>
              <a
                href="#pricing"
                className="text-muted-foreground hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Preços
              </a>
              <div className="flex flex-col gap-2 pt-2">
                <Link href="/login">
                  <Button variant="ghost" className="w-full text-foreground hover:text-primary">
                    Entrar
                  </Button>
                </Link>
                <Link href="/cadastro/inicio">
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    Começar grátis
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="absolute top-20 left-10 w-64 h-64 sm:w-96 sm:h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-20 right-10 w-64 h-64 sm:w-96 sm:h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse delay-700" />

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-4 sm:mb-6">
              <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-primary" fill="currentColor" />
              <span className="text-xs sm:text-sm text-primary font-medium">Finanças para casais</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-foreground mb-4 sm:mb-6 text-balance px-2">
              Organize o dinheiro de{" "}
              <span className="text-primary bg-primary/10 px-2 sm:px-4 rounded-lg">vocês juntos</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto text-balance px-2">
              A plataforma completa para casais gerenciarem suas finanças compartilhadas de forma simples, transparente
              e colaborativa.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
              <Link href="/cadastro/inicio" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 text-base sm:text-lg px-6 sm:px-8 h-12 sm:h-14"
                >
                  Começar gratuitamente
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-border/20 text-foreground hover:bg-card text-base sm:text-lg px-6 sm:px-8 h-12 sm:h-14 bg-transparent"
              >
                Ver demonstração
              </Button>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-4">
              30 dias de teste grátis • Sem cartão de crédito
            </p>
          </div>

          {/* Hero Image/Dashboard Preview */}
          <div className="relative mt-8 sm:mt-16">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
            <div className="relative bg-card/80 backdrop-blur-xl border border-primary/20 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl">
              <div className="aspect-video bg-gradient-to-br from-background to-card rounded-xl sm:rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 sm:w-16 md:w-24 sm:h-16 md:h-24 text-primary mx-auto mb-2 sm:mb-4" />
                  <p className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground">Dashboard Preview</p>
                  <p className="text-xs sm:text-sm md:text-base text-muted-foreground px-4">
                    Visualize suas finanças em tempo real
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-20 px-4 bg-card/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 sm:mb-4">
              Recursos completos
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Tudo que você precisa para gerenciar suas finanças em casal em um só lugar
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {[
              {
                icon: Wallet,
                title: "Gestão de despesas",
                description: "Registre e categorize todas as despesas do casal com facilidade",
              },
              {
                icon: TrendingUp,
                title: "Controle de receitas",
                description: "Acompanhe as receitas individuais e compartilhadas",
              },
              {
                icon: CreditCard,
                title: "Gestão de cartões",
                description: "Organize e monitore todos os cartões de crédito em um só lugar",
              },
              {
                icon: Users,
                title: "Divisão inteligente",
                description: "50/50, proporcional ou customizada - você decide",
              },
              {
                icon: BarChart3,
                title: "Relatórios visuais",
                description: "Gráficos e estatísticas para entender seus gastos",
              },
              {
                icon: Shield,
                title: "Seguro e privado",
                description: "Seus dados protegidos com criptografia de ponta",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-card/80 backdrop-blur-xl border border-border/20 rounded-xl sm:rounded-2xl p-5 sm:p-6 hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/10"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                  <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-12 sm:py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 sm:mb-6">
                Por que escolher o NossoBolso?
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8">
                Desenvolvido especialmente para casais que desejam ter transparência, organização e harmonia financeira
                no relacionamento.
              </p>

              <div className="space-y-3 sm:space-y-4">
                {[
                  "Transparência total nas finanças do casal",
                  "Evite conflitos com divisão justa",
                  "Acompanhe gastos em tempo real",
                  "Planeje o futuro financeiro juntos",
                  "Interface intuitiva e fácil de usar",
                  "Sincronização automática entre parceiros",
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                    </div>
                    <p className="text-sm sm:text-base text-foreground">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mt-8 lg:mt-0">
              <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
              <div className="relative bg-card/80 backdrop-blur-xl border border-primary/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl">
                <div className="space-y-3 sm:space-y-4">
                  <div className="bg-background rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border/10">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <span className="text-xs sm:text-sm text-muted-foreground">Saldo do Mês</span>
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-primary">R$ 5.847,00</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-background rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-border/10">
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">Receitas</p>
                      <p className="text-lg sm:text-xl font-semibold text-primary">R$ 12.500</p>
                    </div>
                    <div className="bg-background rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-border/10">
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">Despesas</p>
                      <p className="text-lg sm:text-xl font-semibold text-destructive">R$ 6.653</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-12 sm:py-20 px-4 bg-card/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 sm:mb-4">
              Plano simples e transparente
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground px-4">
              Todos os recursos disponíveis. Sem pegadinhas.
            </p>
          </div>

          <div className="bg-card/80 backdrop-blur-xl border-2 border-primary/40 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 shadow-2xl shadow-primary/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 sm:px-6 py-1.5 sm:py-2 rounded-bl-xl sm:rounded-bl-2xl text-sm sm:text-base font-semibold">
              Mais popular
            </div>

            <div className="text-center mb-6 sm:mb-8 mt-8 sm:mt-0">
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">Plano Casal</h3>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary">R$ 19,90</span>
                <span className="text-sm sm:text-base text-muted-foreground">/mês</span>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground mt-2">30 dias de teste grátis</p>
            </div>

            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              {[
                "Usuários ilimitados (você e seu parceiro)",
                "Despesas e receitas ilimitadas",
                "Gestão completa de cartões de crédito",
                "Relatórios e gráficos detalhados",
                "Divisão customizável de despesas",
                "Sincronização em tempo real",
                "Suporte prioritário",
                "Atualizações gratuitas",
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                  </div>
                  <p className="text-sm sm:text-base text-foreground">{feature}</p>
                </div>
              ))}
            </div>

            <Link href="/cadastro/inicio" className="block">
              <Button
                size="lg"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-base sm:text-lg h-12 sm:h-14"
              >
                Começar teste gratuito
              </Button>
            </Link>

            <p className="text-center text-xs sm:text-sm text-muted-foreground mt-4">
              Cancele quando quiser, sem multas ou taxas
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-10" />
            <div className="relative z-10">
              <Heart className="w-12 h-12 sm:w-16 sm:h-16 text-primary mx-auto mb-4 sm:mb-6" fill="currentColor" />
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 sm:mb-4 text-balance px-2">
                Pronto para transformar suas finanças?
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
                Junte-se a milhares de casais que já organizam suas finanças com o NossoBolso
              </p>
              <Link href="/cadastro/inicio" className="inline-block w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 text-base sm:text-lg px-6 sm:px-8 h-12 sm:h-14"
                >
                  Começar agora gratuitamente
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 px-4 border-t border-border/20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div className="col-span-1 sm:col-span-2">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <Image
                  src="/logo.png"
                  alt="NossoBolso"
                  width={32}
                  height={32}
                  className="object-contain sm:w-10 sm:h-10"
                />
                <span className="text-xl sm:text-2xl font-bold text-foreground">NossoBolso</span>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground mb-4">
                A plataforma completa para casais gerenciarem suas finanças compartilhadas.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">Produto</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#features"
                    className="text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors"
                  >
                    Recursos
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors"
                  >
                    Preços
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">Empresa</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors"
                  >
                    Sobre
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors"
                  >
                    Contato
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/20 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-muted-foreground">
            <p>© 2025 NossoBolso. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
