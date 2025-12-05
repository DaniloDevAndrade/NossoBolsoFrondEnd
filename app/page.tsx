"use client";

import { useEffect, useState } from "react"
import {
  ArrowRight,
  Check,
  CreditCard,
  Users,
  Heart,
  Shield,
  Sparkles,
  Star,
  X,
  BarChart3,
  Target,
  TrendingUp,
  MessageSquare,
  Smartphone,
  Eye,
  Bot,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

type StarPoint = {
  left: string
  top: string
  animationDelay: string
  opacity: number
}

export default function Home() {
  const [scrollY, setScrollY] = useState(0)

  // Para evitar hidratação quebrada com Math.random
  const [isClient, setIsClient] = useState(false)
  const [stars, setStars] = useState<StarPoint[]>([])

  useEffect(() => {
    window.scrollTo(0, 0)

    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })

    // marca que estamos no client e gera as estrelas UMA vez só
    setIsClient(true)
    setStars(
      Array.from({ length: 20 }, () => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 2}s`,
        opacity: Math.random() * 0.5 + 0.3,
      }))
    )

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#0C0C0C] text-white overflow-x-hidden relative">
      {/* Background animado fixo para toda a página */}
      <div className="fixed inset-0 bg-gradient-to-b from-black via-[#0C0C0C] to-black pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,127,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,127,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00FF7F] opacity-5 rounded-full blur-[120px] animate-pulse" />
        <div
          className="absolute top-1/2 right-1/4 w-96 h-96 bg-[#00FF7F] opacity-5 rounded-full blur-[120px] animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-0 left-1/3 w-96 h-96 bg-[#00FF7F] opacity-5 rounded-full blur-[120px] animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Conteúdo da página */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
          {/* Estrelas animadas – só no client, com valores fixos */}
          {isClient && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {stars.map((star, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-[#00FF7F] rounded-full animate-pulse"
                  style={{
                    left: star.left,
                    top: star.top,
                    animationDelay: star.animationDelay,
                    opacity: star.opacity,
                  }}
                />
              ))}
            </div>
          )}

          <div className="max-w-6xl mx-auto text-center relative z-10">
            <div className="mb-6 sm:mb-8 inline-flex items-center gap-2 px-4 py-2 bg-[#00FF7F]/10 border border-[#00FF7F]/30 rounded-full">
              <Sparkles className="h-4 w-4 text-[#00FF7F]" />
              <span className="text-sm sm:text-base text-[#00FF7F] font-semibold">
                Casais inteligentes já estão usando o NossoBolso
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 sm:mb-8 leading-tight">
              Pare de brigar por{" "}
              <span className="text-[#00FF7F] relative inline-block">
                dinheiro
                <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-[#00FF7F] to-transparent" />
              </span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-400 max-w-4xl mx-auto mb-8 sm:mb-12 leading-relaxed px-4">
              <span className="text-white font-semibold">90% dos casais brigam por dinheiro.</span> Transforme sua
              relação com <span className="text-[#00FF7F]">total transparência financeira</span> e construam juntos um
              futuro próspero.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-12 sm:mb-16 px-4">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-[#00FF7F] to-[#00CC66] text-black hover:shadow-[0_0_30px_rgba(0,255,127,0.5)] transition-all duration-300 text-base sm:text-lg px-8 py-6 rounded-xl font-bold group"
              >
                <Link href="/cadastro">
                  Começar agora grátis
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-2 border-[#00FF7F]/50 bg-transparent hover:bg-[#00FF7F]/10 text-[#00FF7F] text-base sm:text-lg px-8 py-6 rounded-xl font-semibold"
              >
                <Link href="/login">Entrar agora</Link>
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 text-sm sm:text-base text-gray-400 px-4">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-[#00FF7F] flex-shrink-0" />
                <span>30 dias grátis</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-[#00FF7F] flex-shrink-0" />
                <span>Sem cartão de crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-[#00FF7F] flex-shrink-0" />
                <span>Cancele quando quiser</span>
              </div>
            </div>
          </div>
        </section>

        {/* Sem Transparência vs Com NossoBolso */}
        <section className="relative py-12 sm:py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-full mb-6">
                <Heart className="h-4 w-4 text-red-400" />
                <span className="text-sm sm:text-base text-red-400 font-semibold">
                  O dinheiro não pode destruir seu amor
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight px-4">
                Evite brigas. Tenha <span className="text-[#00FF7F]">liberdade financeira</span> juntos.
              </h2>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed px-4">
                <span className="text-white font-semibold">A falta de comunicação sobre dinheiro</span> é a maior causa
                de conflitos em relacionamentos. <span className="text-[#00FF7F]">Transforme tensão em harmonia</span>{" "}
                com total transparência e construam um futuro próspero juntos.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
              <div className="bg-gradient-to-br from-red-950/30 to-[#0C0C0C] p-6 sm:p-8 lg:p-10 rounded-3xl border-2 border-red-500/30">
                <div className="text-5xl sm:text-6xl mb-6">😔</div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-6 text-red-400">Sem transparência</h3>
                <ul className="space-y-4 text-left">
                  {[
                    "Desconfiança constante sobre gastos",
                    "Discussões frequentes por dinheiro",
                    "Surpresas ruins no fim do mês",
                    "Estresse e ansiedade financeira diária",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <X className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-base sm:text-lg">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gradient-to-br from-[#00FF7F]/10 to-[#0C0C0C] p-6 sm:p-8 lg:p-10 rounded-3xl border-2 border-[#00FF7F]/50 relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-[#00FF7F] text-black px-3 py-1 rounded-full text-xs font-bold">
                  RECOMENDADO
                </div>
                <div className="text-5xl sm:text-6xl mb-6">😊</div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-6 text-[#00FF7F]">Com NossoBolso</h3>
                <ul className="space-y-4 text-left">
                  {[
                    "Total transparência entre o casal",
                    "Diálogos produtivos sobre finanças",
                    "Sem surpresas desagradáveis",
                    "Paz de espírito e harmonia total",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-[#00FF7F] flex-shrink-0 mt-0.5" />
                      <span className="text-white font-medium text-base sm:text-lg">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard Completo */}
        <section className="relative py-16 sm:py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#00FF7F] to-[#00CC66] rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(0,255,127,0.5)]">
                    <BarChart3 className="h-6 w-6 sm:h-7 sm:w-7 text-black" />
                  </div>
                  <span className="text-[#00FF7F] font-semibold text-lg sm:text-xl">Dashboard Completo</span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  Visualize tudo que importa em um só lugar
                </h2>
                <p className="text-lg sm:text-xl text-gray-400 leading-relaxed mb-8">
                  Tenha uma visão panorâmica das finanças do casal. Gráficos intuitivos, estatísticas em tempo real e
                  insights que ajudam vocês a tomarem as melhores decisões juntos.
                </p>
                <ul className="space-y-4">
                  {[
                    { text: "Saldo total do casal atualizado", pain: "Nunca mais perguntar 'quanto temos?'" },
                    { text: "Gráficos de receitas vs despesas", pain: "Identifique para onde vai o dinheiro" },
                    { text: "Transações recentes destacadas", pain: "Acompanhe cada movimentação" },
                    { text: "Resumo de todos os cartões", pain: "Controle total das faturas" },
                  ].map((item, i) => (
                    <li key={i} className="space-y-1">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-[#00FF7F]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="h-4 w-4 text-[#00FF7F]" />
                        </div>
                        <span className="text-lg text-white font-medium">{item.text}</span>
                      </div>
                      <p className="text-sm text-gray-500 ml-9">{item.pain}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0C0C0C] p-6 sm:p-8 rounded-3xl border-2 border-[#00FF7F]/30 shadow-[0_0_60px_rgba(0,255,127,0.2)]">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Saldo", value: "R$ 12.847,00", color: "text-[#00FF7F]" },
                      { label: "Despesas", value: "R$ 8.234,00", color: "text-red-400" },
                      { label: "Receitas", value: "R$ 15.200,00", color: "text-blue-400" },
                      { label: "Despesa de Cartões", value: "R$ 3.966,00", color: "text-red-400" },
                    ].map((stat, i) => (
                      <div key={i} className="bg-black/40 p-4 rounded-2xl border border-[#00FF7F]/20">
                        <p className="text-xs sm:text-sm text-gray-400 mb-1">{stat.label}</p>
                        <p className={`text-lg sm:text-xl font-bold ${stat.color}`}>{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-black/40 p-4 rounded-2xl border border-[#00FF7F]/20">
                    <p className="text-sm text-gray-400 mb-3">Gastos por Categoria</p>
                    <div className="space-y-3">
                      {[
                        { name: "Alimentação", percent: 35, color: "bg-[#00FF7F]" },
                        { name: "Transporte", percent: 25, color: "bg-blue-500" },
                        { name: "Lazer", percent: 20, color: "bg-yellow-500" },
                        { name: "Outros", percent: 20, color: "bg-purple-500" },
                      ].map((cat, i) => (
                        <div key={i}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400">{cat.name}</span>
                            <span className="text-white font-medium">{cat.percent}%</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                            <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${cat.percent}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Gestão de Cartões */}
        <section className="relative py-16 sm:py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
              <div className="order-2 md:order-1">
                <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0C0C0C] p-6 sm:p-8 rounded-3xl border-2 border-[#00FF7F]/30 shadow-[0_0_60px_rgba(0,255,127,0.2)]">
                  <div className="space-y-4">
                    {[
                      {
                        bank: "Nubank",
                        color: "from-purple-600 to-purple-800",
                        amount: "R$ 3.801,00",
                        limit: "5.000",
                      },
                      { bank: "Inter", color: "from-orange-600 to-orange-800", amount: "R$ 1.245,00", limit: "3.000" },
                      { bank: "Itaú", color: "from-blue-600 to-blue-800", amount: "R$ 892,00", limit: "2.000" },
                    ].map((card, i) => (
                      <div key={i} className={`bg-gradient-to-r ${card.color} p-5 sm:p-6 rounded-2xl`}>
                        <div className="flex justify-between items-center mb-4">
                          <CreditCard className="h-7 w-7 sm:h-8 sm:w-8 text-white/90" />
                          <span className="text-sm text-white/70">{card.bank}</span>
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-white mb-2">{card.amount}</div>
                        <div className="text-sm text-white/70 mb-3">de R$ {card.limit} limite</div>
                        <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-white rounded-full"
                            style={{
                              width: `${
                                (Number.parseFloat(
                                  card.amount.replace(/[^\d,]/g, "").replace(",", ".")
                                ) /
                                  Number.parseInt(card.limit)) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="order-1 md:order-2">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.5)]">
                    <CreditCard className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                  </div>
                  <span className="text-purple-400 font-semibold text-lg sm:text-xl">Gestão de Cartões</span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  Todos os cartões do casal em um só lugar
                </h2>
                <p className="text-lg sm:text-xl text-gray-400 leading-relaxed mb-8">
                  Acabou a confusão de não saber quanto ainda tem disponível. Visualize limites, faturas e despesas de
                  todos os cartões de crédito em tempo real.
                </p>
                <ul className="space-y-4">
                  {[
                    { text: "Visual incrivel com as cores do seu cartão", pain: "Nubank, Inter, Itaú, BB, Bradesco..." },
                    { text: "Limites e gastos atualizados", pain: "Evite ultrapassar o limite sem perceber" },
                    { text: "Alertas de vencimento de fatura", pain: "Nunca mais pague juros por atraso" },
                    { text: "Histórico completo de transações", pain: "Saiba exatamente onde gastou" },
                  ].map((item, i) => (
                    <li key={i} className="space-y-1">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="h-4 w-4 text-purple-400" />
                        </div>
                        <span className="text-lg text-white font-medium">{item.text}</span>
                      </div>
                      <p className="text-sm text-gray-500 ml-9">{item.pain}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Metas Conjuntas */}
        <section className="relative py-16 sm:py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.5)]">
                    <Target className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                  </div>
                  <span className="text-yellow-400 font-semibold text-lg sm:text-xl">Metas Conjuntas</span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  Realizem sonhos juntos, um passo de cada vez
                </h2>
                <p className="text-lg sm:text-xl text-gray-400 leading-relaxed mb-8">
                  Casa própria, viagem dos sonhos, carro novo? Definam metas conjuntas, acompanhem o progresso e
                  celebrem cada conquista como um casal unido.
                </p>
                <ul className="space-y-4">
                  {[
                    { text: "Crie metas ilimitadas", pain: "Casa, viagem, carro, reserva de emergência..." },
                    { text: "Defina prazos e valores", pain: "Saiba exatamente quanto poupar por mês" },
                    { text: "Visualize o progresso em tempo real", pain: "Celebre cada conquista juntos" },
                    { text: "Histórico de contribuições", pain: "Transparência total de quem contribuiu" },
                  ].map((item, i) => (
                    <li key={i} className="space-y-1">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="h-4 w-4 text-yellow-400" />
                        </div>
                        <span className="text-lg text-white font-medium">{item.text}</span>
                      </div>
                      <p className="text-sm text-gray-500 ml-9">{item.pain}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0C0C0C] p-6 sm:p-8 rounded-3xl border-2 border-yellow-500/30 shadow-[0_0_60px_rgba(234,179,8,0.2)]">
                <div className="space-y-4">
                  {[
                    { name: "Casa Própria", current: 45000, goal: 80000, color: "bg-blue-500" },
                    { name: "Viagem Europa", current: 8500, goal: 15000, color: "bg-green-500" },
                    { name: "Carro Novo", current: 12000, goal: 60000, color: "bg-purple-500" },
                  ].map((goal, i) => (
                    <div key={i} className="bg-black/40 p-5 rounded-2xl border border-yellow-500/20">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-1">{goal.name}</h3>
                          <p className="text-sm text-gray-400">
                            R${" "}
                            {goal.current.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}{" "}
                            de R${" "}
                            {goal.goal.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                        <div className="text-2xl">{goal.current >= goal.goal ? "🎉" : "💰"}</div>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden mb-2">
                        <div
                          className={`h-full ${goal.color} rounded-full transition-all duration-500`}
                          style={{ width: `${(goal.current / goal.goal) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 text-right">
                        {Math.round((goal.current / goal.goal) * 100)}% alcançado
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Controle de Receitas e Despesas */}
        <section className="relative py-16 sm:py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
              <div className="order-2 md:order-1">
                <div className="bg-black/40 p-6 sm:p-8 rounded-3xl border-2 border-[#00FF7F]/30 shadow-[0_0_60px_rgba(0,255,127,0.2)]">
                  <div className="space-y-3">
                    {[
                      {
                        type: "receita",
                        desc: "Salário João",
                        value: "+ R$ 6.500,00",
                        date: "05/01",
                        icon: "💰",
                        color: "text-green-400",
                      },
                      {
                        type: "receita",
                        desc: "Freelance Maria",
                        value: "+ R$ 2.800,00",
                        date: "10/01",
                        icon: "💵",
                        color: "text-green-400",
                      },
                      {
                        type: "despesa",
                        desc: "Mercado",
                        value: "- R$ 845,00",
                        date: "12/01",
                        icon: "🛒",
                        color: "text-red-400",
                      },
                      {
                        type: "despesa",
                        desc: "Conta de Luz",
                        value: "- R$ 280,00",
                        date: "15/01",
                        icon: "⚡",
                        color: "text-red-400",
                      },
                      {
                        type: "despesa",
                        desc: "Jantar Restaurante",
                        value: "- R$ 180,00",
                        date: "18/01",
                        icon: "🍽️",
                        color: "text-red-400",
                      },
                    ].map((transaction, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between bg-black/40 p-4 rounded-xl border border-[#00FF7F]/10"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{transaction.icon}</div>
                          <div>
                            <p className="text-white font-medium text-sm sm:text-base">{transaction.desc}</p>
                            <p className="text-xs text-gray-500">{transaction.date}</p>
                          </div>
                        </div>
                        <span className={`font-bold text-sm sm:text-base ${transaction.color}`}>
                          {transaction.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="order-1 md:order-2">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#00FF7F] to-[#00CC66] rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(0,255,127,0.5)]">
                    <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7 text-black" />
                  </div>
                  <span className="text-[#00FF7F] font-semibold text-lg sm:text-xl">Receitas e Despesas</span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  Cada centavo registrado, cada decisão informada
                </h2>
                <p className="text-lg sm:text-xl text-gray-400 leading-relaxed mb-8">
                  Registre todas as receitas e despesas do casal em segundos. Categorize, filtre e entenda exatamente
                  para onde está indo o dinheiro de vocês.
                </p>
                <ul className="space-y-4">
                  {[
                    { text: "Registro rápido de transações", pain: "Adicione em segundos pelo celular" },
                    { text: "Categorização automática", pain: "Alimentação, transporte, lazer..." },
                    { text: "Filtros por período e categoria", pain: "Encontre qualquer transação facilmente" },
                    { text: "Divisão customizável", pain: "50/50, proporcional ou customizada" },
                  ].map((item, i) => (
                    <li key={i} className="space-y-1">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-[#00FF7F]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="h-4 w-4 text-[#00FF7F]" />
                        </div>
                        <span className="text-lg text-white font-medium">{item.text}</span>
                      </div>
                      <p className="text-sm text-gray-500 ml-9">{item.pain}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* IA e Chatbot WhatsApp
        <section className="relative py-16 sm:py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                    <Bot className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                  </div>
                  <span className="text-blue-400 font-semibold text-lg sm:text-xl">Inteligência Artificial</span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  Seu assistente financeiro pessoal no WhatsApp
                </h2>
                <p className="text-lg sm:text-xl text-gray-400 leading-relaxed mb-8">
                  Converse com nossa IA sobre suas finanças pelo WhatsApp. Adicione despesas, tire dúvidas e receba
                  insights inteligentes sem nem abrir o app.
                </p>
                <ul className="space-y-4">
                  {[
                    { text: "Chatbot integrado ao WhatsApp", pain: "Gerencie finanças sem sair do WhatsApp" },
                    { text: "Adicione despesas por mensagem", pain: "'Gastei R$ 50 no mercado' - pronto!" },
                    { text: "Insights e recomendações da IA", pain: "Dicas personalizadas para economizar" },
                    { text: "Alertas inteligentes", pain: "Aviso de gastos excessivos em tempo real" },
                  ].map((item, i) => (
                    <li key={i} className="space-y-1">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="h-4 w-4 text-blue-400" />
                        </div>
                        <span className="text-lg text-white font-medium">{item.text}</span>
                      </div>
                      <p className="text-sm text-gray-500 ml-9">{item.pain}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0C0C0C] p-6 sm:p-8 rounded-3xl border-2 border-blue-500/30 shadow-[0_0_60px_rgba(59,130,246,0.2)]">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b border-blue-500/20">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">NossoBolso AI</p>
                      <p className="text-xs text-gray-400">Online</p>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    <div className="flex gap-2">
                      <div className="bg-blue-600/20 text-white p-3 rounded-2xl rounded-tl-none max-w-[85%]">
                        <p className="text-sm">Gastei R$ 120 no restaurante</p>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <div className="bg-[#00FF7F]/20 text-white p-3 rounded-2xl rounded-tr-none max-w-[85%]">
                        <p className="text-sm">
                          ✅ Despesa registrada! Categoria: Alimentação. Você gastou 45% do orçamento mensal desta
                          categoria.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <div className="bg-blue-600/20 text-white p-3 rounded-2xl rounded-tl-none max-w-[85%]">
                        <p className="text-sm">Quanto falta para a meta da viagem?</p>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <div className="bg-[#00FF7F]/20 text-white p-3 rounded-2xl rounded-tr-none max-w-[85%]">
                        <p className="text-sm">
                          Faltam R$ 6.500 para a meta "Viagem Europa". Vocês já economizaram 57%! 🎉
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-blue-500/20">
                    <div className="flex items-center gap-2 bg-black/40 p-3 rounded-xl">
                      <MessageSquare className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-400 flex-1">Digite sua mensagem...</span>
                      <Smartphone className="h-5 w-5 text-[#00FF7F]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section> */}

        {/* Visualização Individual */}
        <section className="relative py-16 sm:py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#1A1A1A] rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(102,204,255,0.5)]">
                    <Eye className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                  </div>
                  <span className="text-cyan-400 font-semibold text-lg sm:text-xl">Dados Individuais</span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  Transparência não significa perder a individualidade
                </h2>
                <p className="text-lg sm:text-xl text-gray-400 leading-relaxed mb-8">
                  Visualize suas próprias contribuições, despesas e metas individuais. Mantenha sua autonomia enquanto
                  constroem algo maior juntos.
                </p>
                <ul className="space-y-4">
                  {[
                    { text: "Visão individual das suas finanças", pain: "Suas receitas e despesas separadas" },
                    { text: "Seus cartões e limites", pain: "Acompanhe seus próprios gastos" },
                    { text: "Suas contribuições nas metas", pain: "Veja o quanto você contribuiu" },
                    { text: "Autonomia com transparência", pain: "O melhor dos dois mundos" },
                  ].map((item, i) => (
                    <li key={i} className="space-y-1">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-cyan-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="h-4 w-4 text-cyan-400" />
                        </div>
                        <span className="text-lg text-white font-medium">{item.text}</span>
                      </div>
                      <p className="text-sm text-gray-500 ml-9">{item.pain}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Minhas Receitas", value: "R$ 6.500", color: "text-green-400" },
                      { label: "Minhas Despesas", value: "R$ 3.200", color: "text-red-400" },
                    ].map((stat, i) => (
                      <div key={i} className="bg-black/40 p-4 rounded-2xl border border-cyan-500/20">
                        <p className="text-xs sm:text-sm text-gray-400 mb-1">{stat.label}</p>
                        <p className={`text-lg sm:text-xl font-bold ${stat.color}`}>{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-white mb-3">Meus Cartões</h4>
                    <div className="space-y-2">
                      {[
                        { bank: "Nubank", amount: "R$ 1.234", color: "bg-purple-600" },
                        { bank: "Inter", amount: "R$ 567", color: "bg-orange-600" },
                      ].map((card, i) => (
                        <div key={i} className={`${card.color} p-3 rounded-xl flex justify-between items-center`}>
                          <span className="text-sm text-white/90">{card.bank}</span>
                          <span className="text-sm font-bold text-white">{card.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-white mb-3">Minhas Contribuições</h4>
                    <div className="space-y-2">
                      {[
                        { meta: "Casa Própria", value: "R$ 25.000", percent: 56 },
                        { meta: "Viagem Europa", value: "R$ 5.000", percent: 59 },
                      ].map((contrib, i) => (
                        <div key={i} className="bg-black/40 p-3 rounded-xl border border-cyan-500/10">
                          <div className="flex justify-between mb-2">
                            <span className="text-xs text-gray-400">{contrib.meta}</span>
                            <span className="text-xs text-cyan-400">{contrib.percent}%</span>
                          </div>
                          <p className="text-sm font-semibold text-white">{contrib.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="relative py-16 sm:py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#00FF7F]/10 border border-[#00FF7F]/30 rounded-full mb-6">
                <Star className="h-4 w-4 text-[#00FF7F] fill-[#00FF7F]" />
                <span className="text-sm sm:text-base text-[#00FF7F] font-semibold">
                  Avaliação 4.9/5 de mais de 500 casais
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 leading-tight px-4">
                Casais que transformaram suas vidas
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  name: "Ana & Carlos",
                  text: '"Paramos de brigar por dinheiro. Agora conversamos abertamente sobre nossas finanças e estamos juntando para a casa própria!"',
                  savings: "Economizaram R$ 15.000 em 6 meses",
                },
                {
                  name: "Juliana & Pedro",
                  text: '"Finalmente temos clareza sobre nossos gastos. Conseguimos identificar despesas desnecessárias e aumentar nossa poupança."',
                  savings: "Reduziram gastos em 35%",
                },
                {
                  name: "Mariana & Lucas",
                  text: '"O NossoBolso salvou nosso casamento. A transparência total acabou com a desconfiança e fortaleceu nossa união."',
                  savings: "Alcançaram 3 metas em 1 ano",
                },
              ].map((testimonial, i) => (
                <div
                  key={i}
                  className="bg-gradient-to-br from-[#1A1A1A] to-[#0C0C0C] p-6 sm:p-8 rounded-3xl border-2 border-[#00FF7F]/20"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="h-5 w-5 text-[#00FF7F] fill-[#00FF7F]" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-6 leading-relaxed text-sm sm:text-base">{testimonial.text}</p>
                  <div className="border-t border-[#00FF7F]/20 pt-4">
                    <p className="font-semibold text-white mb-1">{testimonial.name}</p>
                    <p className="text-sm text-[#00FF7F]">{testimonial.savings}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="relative py-16 sm:py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8 sm:mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight px-4">
                Comece sua jornada de <span className="text-[#00FF7F]">liberdade financeira</span>
              </h2>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-400 leading-relaxed px-4">
                Junte-se a milhares de casais que já transformaram suas vidas financeiras
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0C0C0C] p-6 sm:p-8 lg:p-12 rounded-3xl border-2 border-[#00FF7F]/50 shadow-[0_0_80px_rgba(0,255,127,0.3)] mb-8 sm:mb-12 max-w-2xl mx-auto">
              <div className="mb-6">
                <div className="text-4xl sm:text-5xl md:text-6xl font-bold mb-2">
                  <span className="text-[#00FF7F]">R$ 29,90</span>
                  <span className="text-xl sm:text-2xl text-gray-400">/mês</span>
                </div>
                <p className="text-gray-400 text-sm sm:text-base">Para o casal completo</p>
              </div>

              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 text-left">
                {[
                  "Cartões ilimitados",
                  "Metas e objetivos sem limite",
                  "Todas as transações registradas",
                  // "Chatbot WhatsApp com IA",
                  "Relatórios detalhados",
                  "Suporte prioritário",
                  "30 dias grátis para testar",
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-[#00FF7F] flex-shrink-0" />
                    <span className="text-gray-300 text-sm sm:text-base">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                asChild
                size="lg"
                className="w-full bg-gradient-to-r from-[#00FF7F] to-[#00CC66] text-black hover:shadow-[0_0_40px_rgba(0,255,127,0.6)] transition-all duration-300 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-xl font-bold group mb-4"
              >
                <Link href="/cadastro">
                  Experimentar 30 dias grátis
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>

              <p className="text-xs sm:text-sm text-gray-500">
                Não precisa de cartão de crédito • Cancele quando quiser
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#00FF7F] flex-shrink-0" />
                <span>Dados 100% seguros e criptografados</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#00FF7F] flex-shrink-0" />
                <span>+2.000 casais ativos</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer className="relative py-8 sm:py-12 px-4 border-t border-[#1A1A1A] bg-[#0C0C0C]">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p className="text-sm sm:text-base mb-4">© 2025 NossoBolso. Todos os direitos reservados.</p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
            <Link href="#" className="hover:text-[#00FF7F] transition-colors">
              Termos de Uso
            </Link>
            <Link href="#" className="hover:text-[#00FF7F] transition-colors">
              Privacidade
            </Link>
            <Link href="#" className="hover:text-[#00FF7F] transition-colors">
              Suporte
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
