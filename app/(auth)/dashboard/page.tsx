"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  CreditCard,
  Wallet,
  ArrowRightLeft,
  Target,
} from "lucide-react";
import { AddExpenseModal } from "@/components/add-expense-modal";
import { AddIncomeModal } from "@/components/add-income-modal";
import Link from "next/link";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/* ===================== TYPES ===================== */

type Transaction = {
  id: string;
  type: "income" | "expense";
  description: string;
  category: string;
  value: number;
  date: string;
  method?: string;
};

type CardOwner = "Você" | "Parceiro";

type CreditCardInstitution =
  | "NUBANK"
  | "INTER"
  | "ITAU"
  | "BANCO_DO_BRASIL"
  | "BRADESCO"
  | "SANTANDER"
  | "CAIXA"
  | "BTG_PACTUAL"
  | "C6_BANK"
  | "PAGBANK"
  | "OUTROS";

type CreditCardDTO = {
  id: string;
  name: string;
  institution: CreditCardInstitution;
  used: number;
  limit: number;
  lastDigits?: string;
  dueDay?: number | null;
  closingDay?: number | null;
  owner: CardOwner;
};

type GoalDTO = {
  id: string;
  name: string;
  current: number;
  target: number;
};

/* ===================== CARD THEMES (IGUAL /cartoes e Individual) ===================== */

const NOSSO_BOLSO_THEME = {
  primary: "#020617",
  secondary: "#22c55e",
} as const;

const bankThemes: Record<
  CreditCardInstitution,
  { primary: string; secondary: string }
> = {
  NUBANK: { primary: "#8A05BE", secondary: "#A855F7" },
  INTER: { primary: "#FF8700", secondary: "#FFA940" },
  ITAU: { primary: "#EC7000", secondary: "#F59E0B" },
  BANCO_DO_BRASIL: { primary: "#1D4ED8", secondary: "#FACC15" },
  BRADESCO: { primary: "#B91C1C", secondary: "#EF4444" },
  SANTANDER: { primary: "#B91C1C", secondary: "#DC2626" },
  CAIXA: { primary: "#005CA9", secondary: "#3B82F6" },
  BTG_PACTUAL: { primary: "#020617", secondary: "#1F2937" },
  C6_BANK: { primary: "#000000", secondary: "#111827" },
  PAGBANK: { primary: "#16A34A", secondary: "#22C55E" },
  OUTROS: NOSSO_BOLSO_THEME,
};

function getBankTheme(institution?: CreditCardInstitution | null) {
  if (!institution) return NOSSO_BOLSO_THEME;
  return bankThemes[institution] ?? NOSSO_BOLSO_THEME;
}

/* ===================== HELPERS ===================== */

const formatDateFromISO = (iso: string | undefined | null) => {
  if (!iso) return "-";
  const parts = iso.split("-");
  if (parts.length !== 3) return iso;
  const [year, month, day] = parts.map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("pt-BR");
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const getMonthName = (month: number) => {
  const names = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  return names[month - 1] ?? "";
};

/**
 * Lógica de fatura: se já passou o fechamento, mostra próxima fatura.
 */
const getInitialBillingMonthYear = (
  closingDay?: number | null
): { month: number; year: number } => {
  const today = new Date();
  let month = today.getMonth() + 1; // 1-12
  let year = today.getFullYear();

  if (typeof closingDay === "number" && closingDay >= 1 && closingDay <= 31) {
    if (today.getDate() > closingDay) {
      month += 1;
      if (month === 13) {
        month = 1;
        year += 1;
      }
    }
  }

  return { month, year };
};

/* ===================== PAGE ===================== */

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cards, setCards] = useState<CreditCardDTO[]>([]);
  const [goals, setGoals] = useState<GoalDTO[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // mês/ano padrão para transações/metas
  const [currentMonth] = useState(() => new Date().getMonth() + 1);
  const [currentYear] = useState(() => new Date().getFullYear());

  // mês/ano de FATURA (cartões) com lógica de fechamento
  const [billingMonth, setBillingMonth] = useState<number>(currentMonth);
  const [billingYear, setBillingYear] = useState<number>(currentYear);
  const billingMonthLabel = getMonthName(billingMonth);

  const hasBillingInfo =
    !!billingMonthLabel && typeof billingYear === "number" && billingYear > 0;

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    const month = currentMonth;
    const year = currentYear;

    if (!API_URL) {
      console.error("NEXT_PUBLIC_API_URL não configurada");
      setError("Erro de configuração da API.");
      toast.error("Erro de configuração da API.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // 1) Transações (mês atual)
      const txRes = await fetch(
        `${API_URL}/transactions?month=${month}&year=${year}`,
        {
          credentials: "include",
        }
      );

      if (!txRes.ok) {
        const body = await txRes.json().catch(() => null);
        const msg = body?.message || "Erro ao carregar transações.";
        throw new Error(msg);
      }

      const txData = await txRes.json().catch(() => null);
      setTransactions(txData?.transactions ?? []);

      // 2) Metas (sem lógica de fechamento)
      const goalsRes = await fetch(`${API_URL}/goals`, {
        credentials: "include",
      });

      if (!goalsRes.ok) {
        const body = await goalsRes.json().catch(() => null);
        const msg = body?.message || "Erro ao carregar metas.";
        throw new Error(msg);
      }

      const goalsData = await goalsRes.json().catch(() => null);
      setGoals(goalsData?.goals ?? []);

      // 3) Cartões:
      //    3.1 Busca base sem filtro pra descobrir closingDay
      const baseRes = await fetch(`${API_URL}/credit-cards`, {
        credentials: "include",
      });
      const baseBody = await baseRes.json().catch(() => null);

      if (!baseRes.ok) {
        const msg = baseBody?.message || "Erro ao carregar cartões.";
        throw new Error(msg);
      }

      const baseCards = (baseBody?.cards as CreditCardDTO[]) ?? [];

      if (baseCards.length === 0) {
        setCards([]);
        setBillingMonth(currentMonth);
        setBillingYear(currentYear);
        return;
      }

      const referenceClosingDay = baseCards[0].closingDay ?? null;
      const { month: billingMonthCalc, year: billingYearCalc } =
        getInitialBillingMonthYear(referenceClosingDay);

      setBillingMonth(billingMonthCalc);
      setBillingYear(billingYearCalc);

      //    3.2 Busca de cartões já com mês/ano da fatura calculada
      const cardsRes = await fetch(
        `${API_URL}/credit-cards?month=${billingMonthCalc}&year=${billingYearCalc}`,
        {
          credentials: "include",
        }
      );
      const cardsBody = await cardsRes.json().catch(() => null);

      if (!cardsRes.ok) {
        const msg = cardsBody?.message || "Erro ao carregar cartões.";
        throw new Error(msg);
      }

      setCards(cardsBody?.cards ?? []);
    } catch (err: any) {
      console.error("[Dashboard] Erro geral:", err);
      const msg = err?.message || "Erro inesperado ao carregar o dashboard.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.value, 0);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.value, 0);

  const balance = totalIncome - totalExpenses;

  const totalCardsUsed = cards.reduce((sum, c) => sum + (c.used ?? 0), 0);

  /* ============ SKELETON INICIAL (primeiro load) ============ */
  if (
    isLoading &&
    transactions.length === 0 &&
    cards.length === 0 &&
    goals.length === 0 &&
    !error
  ) {
    return (
      <DashboardLayout>
        <div className="max-w-full animate-pulse">
          {/* Header skeleton */}
          <div className="mb-6 lg:mb-8">
            <div className="h-7 sm:h-8 w-40 bg-muted/70 rounded-lg mb-3" />
            <div className="h-4 w-64 bg-muted/50 rounded-lg" />
          </div>

          {/* Stats skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-card/80 border border-border/20 rounded-2xl p-6 shadow-lg space-y-4"
              >
                <div className="w-12 h-12 bg-muted/60 rounded-xl" />
                <div className="h-3 w-24 bg-muted/60 rounded-lg" />
                <div className="h-6 w-32 bg-muted/70 rounded-lg" />
                <div className="h-3 w-20 bg-muted/50 rounded-lg" />
              </div>
            ))}
          </div>

          {/* Cards skeleton */}
          <div className="bg-card/80 backdrop-blur-xl border border-border/20 rounded-2xl p-4 sm:p-6 shadow-lg mb-6 lg:mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="h-5 w-40 bg-muted/60 rounded-lg" />
              <div className="h-8 w-24 bg-muted/70 rounded-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={idx}
                  className="rounded-xl bg-muted/40 h-24 sm:h-28"
                />
              ))}
            </div>
          </div>

          {/* Goals skeleton */}
          <div className="bg-card/80 backdrop-blur-xl border border-border/20 rounded-2xl p-4 sm:p-6 shadow-lg mb-6 lg:mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="h-5 w-44 bg-muted/60 rounded-lg" />
              <div className="h-8 w-24 bg-muted/70 rounded-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={idx}
                  className="rounded-xl bg-muted/40 h-24 sm:h-28"
                />
              ))}
            </div>
          </div>

          {/* Recent transactions skeleton */}
          <div className="bg-card/80 backdrop-blur-xl border border-border/20 rounded-2xl p-4 sm:p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="h-5 w-52 bg-muted/60 rounded-lg" />
              <div className="flex gap-2">
                <div className="h-8 w-24 bg-muted/70 rounded-full" />
                <div className="h-8 w-24 bg-muted/70 rounded-full" />
              </div>
            </div>
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-3 border-b border-border/10 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-muted/60 rounded-lg" />
                    <div className="h-4 w-32 bg-muted/60 rounded-lg" />
                  </div>
                  <div className="h-4 w-24 bg-muted/50 rounded-lg" />
                  <div className="hidden md:block h-4 w-28 bg-muted/40 rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-full">
        {/* Header */}
        <div className="mb-4 lg:mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Dashboard
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
            Visão geral das finanças do casal
          </p>
        </div>

        {isLoading &&
          (transactions.length > 0 || cards.length > 0 || goals.length > 0) && (
            <p className="text-xs sm:text-sm text-muted-foreground mb-4">
              Atualizando dados do dashboard...
            </p>
          )}
        {error && (
          <p className="text-xs sm:text-sm text-destructive mb-4">{error}</p>
        )}

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          {/* Balance Card */}
          <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/30 rounded-2xl p-6 shadow-lg shadow-primary/10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Saldo do mês</p>
            <p
              className={`text-2xl sm:text-3xl font-bold ${
                balance >= 0 ? "text-primary" : "text-red-500"
              }`}
            >
              {formatCurrency(balance)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">Mês atual</p>
          </div>

          {/* Income Card */}
          <div className="bg-card/80 backdrop-blur-xl border border-border/20 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Receitas</p>
            <p className="text-2xl sm:text-3xl font-bold text-green-500">
              {formatCurrency(totalIncome)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">Total recebido</p>
          </div>

          {/* Expenses Card */}
          <div className="bg-card/80 backdrop-blur-xl border border-border/20 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-500" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Despesas</p>
            <p className="text-2xl sm:text-3xl font-bold text-red-500">
              {formatCurrency(totalExpenses)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">Total gasto</p>
          </div>

          {/* Cards Summary (com lógica de fatura) */}
          <div className="bg-card/80 backdrop-blur-xl border border-border/20 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-red-500" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">
              Cartões (Conta)
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-red-500">
              {formatCurrency(totalCardsUsed)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {hasBillingInfo ? (
                <>
                  Fatura de {billingMonthLabel} / {billingYear} · {cards.length}{" "}
                  cartão(ões) ativos
                </>
              ) : (
                <>{cards.length} cartão(ões) ativos</>
              )}
            </p>
          </div>
        </div>

        {/* Credit Cards Section (igual lógica do Individual) */}
        <div className="bg-card/80 backdrop-blur-xl border border-border/20 rounded-2xl p-4 sm:p-6 shadow-lg mb-6 lg:mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-primary" />
              Cartões de Crédito
            </h2>
            <Link href="/dashboard/cartoes">
              <Button
                variant="outline"
                size="sm"
                className="border-primary/50 text-primary hover:bg-primary/10 bg-transparent"
              >
                Ver todos
              </Button>
            </Link>
          </div>

          {cards.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum cartão cadastrado ainda.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cards.map((card) => {
                const used = card.used ?? 0;
                const usedPercentage =
                  card.limit > 0 ? Math.min((used / card.limit) * 100, 100) : 0;
                const theme = getBankTheme(card.institution);

                const billingText = hasBillingInfo
                  ? `Usado — Fatura de ${billingMonthLabel}/${billingYear}`
                  : "Usado (fatura atual)";

                return (
                  <Link key={card.id} href={`/dashboard/cartoes/${card.id}`}>
                    <div
                      className="relative overflow-hidden rounded-xl p-4 shadow-md transition-all hover:scale-105 cursor-pointer"
                      style={{
                        background: `linear-gradient(135deg, ${theme.primary}CC 0%, ${theme.secondary}88 100%)`,
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-bold">{card.name}</h3>
                        <CreditCard className="w-5 h-5 text-white/80" />
                      </div>
                      <div className="mb-2">
                        <div className="flex justify-between text-white text-xs mb-1">
                          <span>{billingText}</span>
                          <span className="font-semibold">
                            {formatCurrency(used)} /{" "}
                            {formatCurrency(card.limit)}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-white transition-all"
                            style={{ width: `${usedPercentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Goals Section */}
        <div className="bg-card/80 backdrop-blur-xl border border-border/20 rounded-2xl p-4 sm:p-6 shadow-lg mb-6 lg:mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
              <Target className="w-6 h-6 text-primary" />
              Metas Financeiras
            </h2>
            <Link href="/dashboard/metas">
              <Button
                variant="outline"
                size="sm"
                className="border-primary/50 text-primary hover:bg-primary/10 bg-transparent"
              >
                Ver todas
              </Button>
            </Link>
          </div>

          {goals.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma meta cadastrada ainda.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {goals.map((goal) => {
                const progress =
                  goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
                const isCompleted = progress >= 100;

                return (
                  <Link key={goal.id} href={`/dashboard/metas/${goal.id}`}>
                    <div
                      className={`bg-secondary/50 border rounded-xl p-4 transition-all hover:scale-105 cursor-pointer ${
                        isCompleted ? "border-primary/50" : "border-border/20"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-foreground">
                          {goal.name}
                        </h3>
                        {isCompleted && (
                          <span className="text-primary text-xl">🎉</span>
                        )}
                      </div>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-lg font-bold text-primary">
                          {formatCurrency(goal.current)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          / {formatCurrency(goal.target)}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden mb-1">
                        <div
                          className={`h-full transition-all ${
                            isCompleted ? "bg-primary" : "bg-primary/70"
                          }`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {progress.toFixed(0)}% completo
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-card/80 backdrop-blur-xl border border-border/20 rounded-2xl p-4 sm:p-6 shadow-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
              <ArrowRightLeft className="w-6 h-6 text-primary" />
              Transações recentes
            </h2>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                onClick={() => setIsIncomeModalOpen(true)}
                size="sm"
                className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 flex-1 sm:flex-none shadow-lg shadow-green-500/20"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Receita
              </Button>
              <Button
                onClick={() => setIsModalOpen(true)}
                size="sm"
                className="bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 flex-1 sm:flex-none shadow-lg shadow-red-500/20"
              >
                <TrendingDown className="w-4 h-4 mr-2" />
                Despesa
              </Button>
            </div>
          </div>

          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma transação registrada neste mês.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/20">
                        <th className="text-left py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-muted-foreground">
                          Tipo
                        </th>
                        <th className="text-left py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-muted-foreground">
                          Descrição
                        </th>
                        <th className="text-left py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-muted-foreground hidden md:table-cell">
                          Categoria
                        </th>
                        <th className="text-right py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-muted-foreground">
                          Valor
                        </th>
                        <th className="text-left py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-muted-foreground hidden sm:table-cell">
                          Data
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.slice(0, 5).map((transaction) => (
                        <tr
                          key={transaction.id}
                          className="border-b border-border/10 hover:bg-secondary/30 transition-colors"
                        >
                          <td className="py-3 sm:py-4 px-3 sm:px-4">
                            {transaction.type === "income" ? (
                              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-4 h-4 text-green-500" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                                <TrendingDown className="w-4 h-4 text-red-500" />
                              </div>
                            )}
                          </td>
                          <td className="py-3 sm:py-4 px-3 sm:px-4 text-sm sm:text-base text-foreground">
                            {(transaction.description?.trim() ||
                              transaction.category) ??
                              "-"}
                          </td>
                          <td className="py-3 sm:py-4 px-3 sm:px-4 hidden md:table-cell">
                            <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs sm:text-sm font-medium">
                              {transaction.category}
                            </span>
                          </td>
                          <td
                            className={`py-3 sm:py-4 px-3 sm:px-4 text-right font-semibold text-sm sm:text-base whitespace-nowrap ${
                              transaction.type === "income"
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          >
                            {transaction.type === "income" ? "+" : "-"}
                            {formatCurrency(transaction.value)}
                          </td>
                          <td className="py-3 sm:py-4 px-3 sm:px-4 text-sm sm:text-base text-muted-foreground hidden sm:table-cell whitespace-nowrap">
                            {formatDateFromISO(transaction.date)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Link href="/dashboard/transacoes">
                  <Button
                    variant="outline"
                    className="border-primary/50 text-primary hover:bg-primary/10 bg-transparent"
                  >
                    Ver todas as transações
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals (refaz o fetch ao salvar) */}
      <AddExpenseModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSaved={fetchDashboardData}
      />
      <AddIncomeModal
        open={isIncomeModalOpen}
        onOpenChange={setIsIncomeModalOpen}
        onSaved={fetchDashboardData}
      />
    </DashboardLayout>
  );
}
