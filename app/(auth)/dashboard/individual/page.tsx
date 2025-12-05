"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  CreditCard,
  Wallet,
  ArrowRightLeft,
  User,
  Users,
} from "lucide-react";
import { AddExpenseModal } from "@/components/add-expense-modal";
import { AddIncomeModal } from "@/components/add-income-modal";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/* ===================== TYPES ===================== */

type Person = "you" | "partner";

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

/* ===================== CARD THEMES ===================== */

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

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const formatDateFromISO = (iso: string | undefined | null) => {
  if (!iso) return "-";
  const parts = iso.split("-");
  if (parts.length !== 3) return iso;
  const [year, month, day] = parts.map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("pt-BR");
};

/* ===================== PAGE ===================== */

export default function DashboardPage() {
  const [person, setPerson] = useState<Person>("you");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cards, setCards] = useState<CreditCardDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [person]);

  const loadData = async () => {
    if (!API_URL) {
      const msg = "Erro de configuração da API.";
      console.error(msg);
      setError(msg);
      toast.error(msg);
      return;
    }

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const responsible = person === "you" ? "voce" : "parceiro";

    try {
      setIsLoading(true);
      setError(null);

      const [txRes, cardsRes] = await Promise.all([
        fetch(
          `${API_URL}/transactions?month=${month}&year=${year}&responsible=${responsible}`,
          { credentials: "include" }
        ),
        fetch(`${API_URL}/credit-cards?month=${month}&year=${year}`, {
          credentials: "include",
        }),
      ]);

      const txBody = await txRes.json().catch(() => null);
      const cardsBody = await cardsRes.json().catch(() => null);

      if (!txRes.ok) {
        const msg = txBody?.message || "Erro ao carregar transações.";
        throw new Error(msg);
      }

      if (!cardsRes.ok) {
        const msg = cardsBody?.message || "Erro ao carregar cartões.";
        throw new Error(msg);
      }

      setTransactions(txBody?.transactions ?? []);
      setCards(cardsBody?.cards ?? []);
    } catch (err: any) {
      console.error("[Dashboard] Erro ao carregar dados:", err);
      const msg = err.message ?? "Erro inesperado ao carregar dashboard.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.value, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.value, 0);

  const balance = totalIncome - totalExpenses;

  const currentOwnerLabel: CardOwner = person === "you" ? "Você" : "Parceiro";
  const personCards = cards.filter((c) => c.owner === currentOwnerLabel);
  const totalCardsUsed = personCards.reduce((sum, c) => sum + (c.used ?? 0), 0);

  return (
    <DashboardLayout>
      <div className="max-w-full">
        {/* Header com seleção de pessoa */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 lg:mb-8">
          <div>
            <h1 className="text-2xl mt-3 sm:mt-0 sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
              Dashboard Individual
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
              Visão geral das finanças do casal, filtrada por responsável
            </p>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant={person === "you" ? "default" : "outline"}
              onClick={() => setPerson("you")}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4" />
              Você
            </Button>
            <Button
              variant={person === "partner" ? "default" : "outline"}
              onClick={() => setPerson("partner")}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4" />
              Parceiro
            </Button>
          </div>
        </div>

        {error && (
          <p className="text-sm text-destructive mb-4">
            {error}
          </p>
        )}

        {/* Main Stats Grid */}
        {isLoading ? (
          <StatsSkeleton />
        ) : (
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
              <p className="text-xs text-muted-foreground mt-2">
                Mês atual — {currentOwnerLabel}
              </p>
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
              <p className="text-xs text-muted-foreground mt-2">
                Total recebido por {currentOwnerLabel.toLowerCase()}
              </p>
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
              <p className="text-xs text-muted-foreground mt-2">
                Total gasto por {currentOwnerLabel.toLowerCase()}
              </p>
            </div>

            {/* Cards Summary */}
            <div className="bg-card/80 backdrop-blur-xl border border-border/20 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-red-500" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">
                Cartões ({currentOwnerLabel})
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-red-500">
                {formatCurrency(totalCardsUsed)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {personCards.length} cartão(ões) ativos
              </p>
            </div>
          </div>
        )}

        {/* Credit Cards Section */}
        <div className="bg-card/80 backdrop-blur-xl border border-border/20 rounded-2xl p-4 sm:p-6 shadow-lg mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-primary" />
              Cartões de Crédito — {currentOwnerLabel}
            </h2>
            <Link href="/dashboard/cartoes" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto border-primary/50 text-primary hover:bg-primary/10 bg-transparent"
              >
                Ver todos
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <CardsSkeleton />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {personCards.map((card) => {
                const used = card.used ?? 0;
                const usedPercentage =
                  card.limit > 0 ? Math.min((used / card.limit) * 100, 100) : 0;
                const theme = getBankTheme(card.institution);

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
                          <span>Usado (fatura atual)</span>
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

              {!isLoading && personCards.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhum cartão cadastrado para{" "}
                  {currentOwnerLabel.toLowerCase()}.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-card/80 backdrop-blur-xl border border-border/20 rounded-2xl p-4 sm:p-6 shadow-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
              <ArrowRightLeft className="w-6 h-6 text-primary" />
              Transações recentes — {currentOwnerLabel}
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
                onClick={() => setIsExpenseModalOpen(true)}
                size="sm"
                className="bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 flex-1 sm:flex-none shadow-lg shadow-red-500/20"
              >
                <TrendingDown className="w-4 h-4 mr-2" />
                Despesa
              </Button>
            </div>
          </div>

          {isLoading ? (
            <TransactionsSkeleton />
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
                        {/* <th className="text-left py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-muted-foreground hidden lg:table-cell">
                          Método
                        </th> */}
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
                          {/* <td className="py-3 sm:py-4 px-3 sm:px-4 text-sm sm:text-base text-muted-foreground hidden lg:table-cell">
                            {transaction.type === "expense"
                              ? transaction.method
                              : "-"}
                          </td> */}
                          <td className="py-3 sm:py-4 px-3 sm:px-4 text-sm sm:text-base text-muted-foreground hidden sm:table-cell whitespace-nowrap">
                            {formatDateFromISO(transaction.date)}
                          </td>
                        </tr>
                      ))}

                      {!isLoading && transactions.length === 0 && (
                        <tr>
                          <td
                            colSpan={6}
                            className="py-4 px-4 text-center text-sm text-muted-foreground"
                          >
                            Nenhuma transação encontrada para{" "}
                            {currentOwnerLabel.toLowerCase()} neste mês.
                          </td>
                        </tr>
                      )}
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

      {/* Modals */}
      <AddExpenseModal
        open={isExpenseModalOpen}
        onOpenChange={setIsExpenseModalOpen}
      />
      <AddIncomeModal
        open={isIncomeModalOpen}
        onOpenChange={setIsIncomeModalOpen}
      />
    </DashboardLayout>
  );
}

/* ===================== SKELETONS ===================== */

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl p-6 border border-border/30 bg-card/60 backdrop-blur-xl overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-muted/40 via-muted/20 to-muted/40 animate-pulse" />
          <div className="relative space-y-4">
            <div className="w-12 h-12 rounded-xl bg-muted/60" />
            <div className="h-3 w-24 bg-muted/60 rounded-full" />
            <div className="h-6 w-32 bg-muted/70 rounded-full" />
            <div className="h-3 w-20 bg-muted/50 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function CardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="relative overflow-hidden rounded-xl p-4 border border-border/20 bg-card/70 backdrop-blur-xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-muted/40 via-muted/20 to-muted/40 animate-pulse" />
          <div className="relative space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-muted/70 rounded-full" />
              <div className="h-5 w-5 bg-muted/60 rounded-full" />
            </div>
            <div className="h-3 w-32 bg-muted/60 rounded-full" />
            <div className="h-2 w-full bg-muted/50 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function TransactionsSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border/20 bg-card/70 backdrop-blur-xl">
      <div className="animate-pulse">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-4 py-3 border-b border-border/10"
          >
            <div className="w-8 h-8 rounded-lg bg-muted/60" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/3 bg-muted/60 rounded-full" />
              <div className="h-3 w-1/5 bg-muted/40 rounded-full" />
            </div>
            <div className="h-3 w-16 bg-muted/60 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
