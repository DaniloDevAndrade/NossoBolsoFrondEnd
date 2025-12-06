"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Pencil,
  Trash2,
  Filter,
  CreditCard,
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";
import { AddExpenseModal } from "@/components/add-expense-modal";
import { AddIncomeModal } from "@/components/add-income-modal";
import { toast } from "sonner";

type TransactionType = "income" | "expense";

type Transaction = {
  id: string;
  type: TransactionType;
  description: string;
  category: string;
  value: number;
  date: string; // "YYYY-MM-DD"

  createdById: string;

  /**
   * ⚠️ Backend agora já devolve isso RESOLVIDO
   * de acordo com a conta logada:
   * - "Você"  -> este usuário
   * - "Parceiro" -> o outro usuário
   */
  responsible: "Você" | "Parceiro";

  // income
  receivedBy?: "Você" | "Parceiro" | "Compartilhado";

  // expense
  paidBy?: "Você" | "Parceiro";

  youPay?: number;
  partnerPays?: number;
  paymentMethod?: "cash" | "card";
  cardId?: string | null;
  cardName?: string | null;
  cardDigits?: string | null;

  installments?: number | null;
  currentInstallment?: number | null;
  installment?: string | null;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

export default function TransacoesPage() {
  const today = new Date();
  const currentMonth = String(today.getMonth() + 1).padStart(2, "0");
  const currentYear = String(today.getFullYear());

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);

  const [selectedType, setSelectedType] = useState<
    "todas" | "income" | "expense"
  >("todas");
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<string>(currentYear);
  const [selectedCategory, setSelectedCategory] = useState<string>("todas");

  /**
   * Agora o filtro de responsável é APENAS em cima do
   * que o backend manda em `transaction.responsible`,
   * exatamente como o Dashboard Individual faz.
   */
  const [selectedResponsible, setSelectedResponsible] = useState<
    "todos" | "voce" | "parceiro"
  >("todos");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(
    null
  );
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fetchTransactions = async () => {
    try {
      if (!API_URL) {
        console.error("NEXT_PUBLIC_API_URL não configurada");
        const msg = "Erro de configuração da API.";
        setError(msg);
        toast.error(msg);
        return;
      }

      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();

      if (selectedMonth) params.set("month", String(Number(selectedMonth)));
      if (selectedYear) params.set("year", selectedYear);

      if (selectedType && selectedType !== "todas") {
        params.set("type", selectedType);
      }

      if (selectedCategory !== "todas") {
        params.set("category", selectedCategory);
      }

      // ⚠️ NÃO enviamos "responsible" para a API.
      // O backend já devolve o campo de forma correta
      // de acordo com a conta logada. O filtro é só no front.
      const res = await fetch(`${API_URL}/transactions?${params.toString()}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const message = data?.message || "Erro ao carregar transações.";
        throw new Error(message);
      }

      if (!data || !Array.isArray(data.transactions)) {
        setTransactions([]);
        return;
      }

      setTransactions(data.transactions as Transaction[]);
    } catch (err: any) {
      console.error("[Transações] Erro ao buscar:", err);
      const msg = err.message ?? "Erro inesperado ao buscar transações.";
      setError(msg);
      toast.error(msg);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, selectedYear, selectedType, selectedCategory]);

  /**
   * 🔑 Filtro de RESPONSÁVEL:
   * - "voce"     => transactions com responsible === "Você"
   * - "parceiro" => transactions com responsible === "Parceiro"
   * - "todos"    => não filtra
   *
   * O valor de `responsible` já vem pronto do backend
   * com base em QUEM está logado (dinâmico).
   */
  const baseFilteredTransactions = transactions.filter((t) => {
    if (selectedResponsible === "voce") {
      return t.responsible === "Você";
    }
    if (selectedResponsible === "parceiro") {
      return t.responsible === "Parceiro";
    }
    return true; // "todos"
  });

  const sortedTransactions = [...baseFilteredTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const totalIncome = baseFilteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.value, 0);

  const totalExpense = baseFilteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.value, 0);

  const balance = totalIncome - totalExpense;

  const handleDeleteClick = (id: string) => {
    setTransactionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!transactionToDelete) return;

    const tx = transactions.find((t) => t.id === transactionToDelete);
    if (!tx) {
      setDeleteDialogOpen(false);
      setTransactionToDelete(null);
      return;
    }

    try {
      if (!API_URL) {
        console.error("NEXT_PUBLIC_API_URL não configurada");
        toast.error("Erro de configuração da API.");
        return;
      }

      const isExpense = tx.type === "expense";
      const path = isExpense
        ? `${API_URL}/transactions/expenses/${tx.id}`
        : `${API_URL}/transactions/incomes/${tx.id}`;

      const res = await fetch(path, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok && res.status !== 204) {
        const body = await res.json().catch(() => null);
        const message = body?.message || "Erro ao excluir transação.";
        throw new Error(message);
      }

      setTransactions((prev) => prev.filter((t) => t.id !== tx.id));
      toast.success("Transação excluída com sucesso.");
    } catch (err: any) {
      console.error("[Transações] Erro ao excluir:", err);
      toast.error(err.message ?? "Erro ao excluir transação.");
    } finally {
      setDeleteDialogOpen(false);
      setTransactionToDelete(null);
    }
  };

  const handleEditClick = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    if (transaction.type === "expense") {
      setIsExpenseModalOpen(true);
    } else {
      setIsIncomeModalOpen(true);
    }
  };

  const handleExpenseModalClose = (open: boolean) => {
    setIsExpenseModalOpen(open);
    if (!open) setEditingTransaction(null);
  };

  const handleIncomeModalClose = (open: boolean) => {
    setIsIncomeModalOpen(open);
    if (!open) setEditingTransaction(null);
  };

  const filteredTransactions = sortedTransactions;

  if (isLoading && filteredTransactions.length === 0 && !error) {
    return (
      <DashboardLayout>
        <div className="max-w-full animate-pulse">
          {/* Header skeleton */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="space-y-3 w-full sm:w-auto">
              <div className="h-7 sm:h-8 w-40 bg-muted/70 rounded-lg" />
              <div className="h-4 w-56 bg-muted/50 rounded-lg" />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="h-10 rounded-full bg-muted/70 flex-1 sm:flex-none sm:w-40" />
              <div className="h-10 rounded-full bg-muted/60 flex-1 sm:flex-none sm:w-40" />
            </div>
          </div>

          {/* Cards resumo skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-card border border-border/20 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="h-4 w-24 bg-muted/60 rounded-lg" />
                  <div className="w-9 h-9 rounded-xl bg-muted/50" />
                </div>
                <div className="h-6 w-32 bg-muted/70 rounded-lg" />
                <div className="h-3 w-20 bg-muted/50 rounded-lg mt-2" />
              </div>
            ))}
          </div>

          {/* Filtros skeleton */}
          <div className="bg-card border border-border/20 rounded-2xl p-4 sm:p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-5 h-5 bg-muted/60 rounded-md" />
              <div className="h-4 w-28 bg-muted/60 rounded-lg" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="h-3 w-20 bg-muted/50 rounded-lg" />
                  <div className="h-10 bg-muted/70 rounded-lg" />
                </div>
              ))}
            </div>
          </div>

          {/* Tabela skeleton */}
          <div className="bg-card border border-border/20 rounded-2xl overflow-hidden">
            <div className="h-10 bg-secondary/40" />
            <div className="divide-y divide-border/10">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-4 px-4 py-3 sm:px-6 sm:py-4 ${
                    idx % 2 === 0 ? "bg-card" : "bg-secondary/10"
                  }`}
                >
                  <div className="w-32 flex-shrink-0">
                    <div className="h-4 w-24 bg-muted/60 rounded-lg mb-2" />
                    <div className="h-3 w-16 bg-muted/40 rounded-lg" />
                  </div>
                  <div className="flex-1 flex flex-wrap gap-3 items-center justify-between ml-4">
                    <div className="h-4 w-32 bg-muted/60 rounded-lg" />
                    <div className="h-4 w-28 bg-muted/50 rounded-lg" />
                    <div className="h-4 w-24 bg-muted/50 rounded-lg" />
                    <div className="h-4 w-16 bg-muted/40 rounded-lg" />
                    <div className="h-4 w-20 bg-muted/40 rounded-lg" />
                    <div className="flex gap-2">
                      <div className="w-8 h-8 bg-muted/50 rounded-lg" />
                      <div className="w-8 h-8 bg-muted/50 rounded-lg" />
                    </div>
                  </div>
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Transações
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              Gerencie receitas e despesas do casal
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              onClick={() => setIsIncomeModalOpen(true)}
              size="sm"
              className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 flex-1 sm:flex-none shadow-lg shadow-green-500/20"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Nova receita</span>
              <span className="sm:hidden">Receita</span>
            </Button>
            <Button
              onClick={() => setIsExpenseModalOpen(true)}
              size="sm"
              className="bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 flex-1 sm:flex-none shadow-lg shadow-red-500/20"
            >
              <TrendingDown className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Nova despesa</span>
              <span className="sm:hidden">Despesa</span>
            </Button>
          </div>
        </div>

        {isLoading && filteredTransactions.length > 0 && (
          <p className="text-sm text-muted-foreground mb-4">
            Atualizando transações...
          </p>
        )}
        {error && <p className="text-sm text-destructive mb-4">{error}</p>}

        {/* Cards resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Receitas</p>
              <ArrowUpCircle className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-green-500">
              {formatCurrency(totalIncome)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Despesas</p>
              <ArrowDownCircle className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-red-500">
              {formatCurrency(totalExpense)}
            </p>
          </div>
          <div
            className={`bg-gradient-to-br ${
              balance >= 0
                ? "from-primary/10 to-primary/5 border-primary/20"
                : "from-red-500/10 to-red-500/5 border-red-500/20"
            } border rounded-2xl p-6`}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Saldo do Mês</p>
              <TrendingUp
                className={`w-5 h-5 ${
                  balance >= 0 ? "text-primary" : "text-red-500"
                }`}
              />
            </div>
            <p
              className={`text-2xl sm:text-3xl font-bold ${
                balance >= 0 ? "text-primary" : "text-red-500"
              }`}
            >
              {formatCurrency(balance)}
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-card border border-border/20 rounded-2xl p-4 sm:p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-base sm:text-lg font-semibold text-foreground">
              Filtros
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {/* Tipo */}
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm text-muted-foreground mb-1 block">
                Tipo
              </label>
              <Select
                value={selectedType}
                onValueChange={(v) => setSelectedType(v as any)}
              >
                <SelectTrigger className="bg-input border-border/20 h-9 sm:h-10 text-xs sm:text-sm">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="income">Receitas</SelectItem>
                  <SelectItem value="expense">Despesas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Mês */}
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm text-muted-foreground mb-1 block">
                Mês
              </label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="bg-input border-border/20 h-9 sm:h-10 text-xs sm:text-sm">
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="01">Janeiro</SelectItem>
                  <SelectItem value="02">Fevereiro</SelectItem>
                  <SelectItem value="03">Março</SelectItem>
                  <SelectItem value="04">Abril</SelectItem>
                  <SelectItem value="05">Maio</SelectItem>
                  <SelectItem value="06">Junho</SelectItem>
                  <SelectItem value="07">Julho</SelectItem>
                  <SelectItem value="08">Agosto</SelectItem>
                  <SelectItem value="09">Setembro</SelectItem>
                  <SelectItem value="10">Outubro</SelectItem>
                  <SelectItem value="11">Novembro</SelectItem>
                  <SelectItem value="12">Dezembro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Ano */}
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm text-muted-foreground mb-1 block">
                Ano
              </label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="bg-input border-border/20 h-9 sm:h-10 text-xs sm:text-sm">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Categoria */}
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm text-muted-foreground mb-1 block">
                Categoria
              </label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="bg-input border-border/20 h-9 sm:h-10 text-xs sm:text-sm">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as categorias</SelectItem>
                  <SelectItem value="Salário">Salário</SelectItem>
                  <SelectItem value="Freelance">Freelance</SelectItem>
                  <SelectItem value="Mercado">Mercado</SelectItem>
                  <SelectItem value="Contas">Contas</SelectItem>
                  <SelectItem value="Alimentação">Alimentação</SelectItem>
                  <SelectItem value="Transporte">Transporte</SelectItem>
                  <SelectItem value="Saúde">Saúde</SelectItem>
                  <SelectItem value="Entretenimento">Entretenimento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Responsável */}
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm text-muted-foreground mb-1 block">
                Responsável
              </label>
              <Select
                value={selectedResponsible}
                onValueChange={(v) => setSelectedResponsible(v as any)}
              >
                <SelectTrigger className="bg-input border-border/20 h-9 sm:h-10 text-xs sm:text-sm">
                  <SelectValue placeholder="Responsável" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="voce">Você</SelectItem>
                  <SelectItem value="parceiro">Parceiro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-card border border-border/20 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="text-left py-4 px-4 sm:px-6 text-sm font-semibold text-foreground">
                    Tipo
                  </th>
                  <th className="text-left py-4 px-4 sm:px-6 text-sm font-semibold text-foreground">
                    Descrição
                  </th>
                  <th className="text-left py-4 px-4 sm:px-6 text-sm font-semibold text-foreground">
                    Categoria
                  </th>
                  <th className="text-right py-4 px-4 sm:px-6 text-sm font-semibold text-foreground">
                    Valor
                  </th>
                  <th className="text-left py-4 px-4 sm:px-6 text-sm font-semibold text-foreground">
                    Responsável
                  </th>
                  <th className="text-left py-4 px-4 sm:px-6 text-sm font-semibold text-foreground">
                    Pagamento
                  </th>
                  <th className="text-center py-4 px-4 sm:px-6 text-sm font-semibold text-foreground">
                    Parcelas
                  </th>
                  <th className="text-left py-4 px-4 sm:px-6 text-sm font-semibold text-foreground">
                    Data
                  </th>
                  <th className="text-center py-4 px-4 sm:px-6 text-sm font-semibold text-foreground">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction, index) => (
                  <tr
                    key={transaction.id}
                    className={`border-t border-border/10 hover:bg-secondary/30 transition-colors ${
                      index % 2 === 0 ? "bg-card" : "bg-secondary/10"
                    }`}
                  >
                    <td className="py-4 px-4 sm:px-6">
                      {transaction.type === "income" ? (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-green-500" />
                          </div>
                          <span className="text-sm font-medium text-green-500">
                            Receita
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                            <TrendingDown className="w-4 h-4 text-red-500" />
                          </div>
                          <span className="text-sm font-medium text-red-500">
                            Despesa
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-foreground font-medium">
                      {(transaction.description?.trim() ||
                        transaction.category) ??
                        "-"}
                    </td>
                    <td className="py-4 px-4 sm:px-6">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium ${
                          transaction.type === "income"
                            ? "bg-green-500/10 text-green-500"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {transaction.category}
                      </span>
                    </td>
                    <td
                      className={`py-4 px-4 sm:px-6 text-right font-bold ${
                        transaction.type === "income"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.value)}
                    </td>
                    {/* 🔥 Responsável AGORA vem direto do backend (dinâmico) */}
                    <td className="py-4 px-4 sm:px-6 text-muted-foreground">
                      {transaction.responsible}
                    </td>
                    <td className="py-4 px-4 sm:px-6">
                      {transaction.type === "income" ? (
                        <span className="text-sm text-muted-foreground">
                          -
                        </span>
                      ) : transaction.paymentMethod === "card" ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-primary" />
                            <span className="text-sm text-foreground">
                              {transaction.cardName} ••••{" "}
                              {transaction.cardDigits}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Wallet className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-muted-foreground">
                            Dinheiro
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-center text-sm">
                      {transaction.type === "income" ||
                      transaction.paymentMethod !== "card" ? (
                        <span className="text-muted-foreground/50">-</span>
                      ) : transaction.installment ? (
                        <span className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded-md text-xs font-medium">
                          {transaction.installment}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/60">
                          À vista
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-muted-foreground">
                      {formatDateFromISO(transaction.date)}
                    </td>
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditClick(transaction)}
                          className="p-2 hover:bg-primary/10 rounded-lg transition-colors text-muted-foreground hover:text-primary"
                          aria-label="Editar transação"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(transaction.id)}
                          className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-muted-foreground hover:text-destructive"
                          aria-label="Excluir transação"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {!isLoading && filteredTransactions.length === 0 && (
                  <tr>
                    <td
                      className="py-6 px-4 sm:px-6 text-center text-sm text-muted-foreground"
                      colSpan={9}
                    >
                      Nenhuma transação encontrada para os filtros
                      selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modais */}
      <AddExpenseModal
        open={isExpenseModalOpen}
        onOpenChange={handleExpenseModalClose}
        editData={
          editingTransaction?.type === "expense"
            ? editingTransaction
            : undefined
        }
        onSaved={fetchTransactions}
      />

      <AddIncomeModal
        open={isIncomeModalOpen}
        onOpenChange={handleIncomeModalClose}
        editData={
          editingTransaction?.type === "income" ? editingTransaction : undefined
        }
        onSaved={fetchTransactions}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Excluir transação
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription className="text-muted-foreground px-2">
            Tem certeza que deseja excluir esta transação? Esta ação não pode
            ser desfeita.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border/50">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
