"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Filter,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { AddExpenseModal } from "@/components/add-expense-modal";
import { toast } from "sonner";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type CardOwnerLabel = "Você" | "Parceiro";

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
  lastDigits: string;
  limit: number;
  used: number;
  dueDay: number | null;
  closingDay: number | null;
  owner: CardOwnerLabel;
  userId: string;
  isCurrentUserOwner: boolean;
};

type CardExpenseDTO = {
  id: string;
  description: string;
  category: string;
  value: number;
  date: string;
  installment: string | null;
  installmentGroupId: string | null;
  totalValue: number;
};

const parseInstallmentString = (installment?: string | null) => {
  if (!installment) return { current: 1, total: 1 };
  const [curStr, totStr] = installment.split("/");
  const cur = Number(curStr);
  const tot = Number(totStr);
  if (!Number.isFinite(tot) || tot < 1) return { current: 1, total: 1 };
  const safeCur = Number.isFinite(cur) && cur >= 1 ? cur : 1;
  return { current: safeCur, total: tot };
};

const formatDateFromISO = (iso: string | undefined | null) => {
  if (!iso) return "-";
  const base = iso.includes("T") ? iso.split("T")[0] : iso;
  const parts = base.split("-");
  if (parts.length !== 3) return iso;
  const [year, month, day] = parts.map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("pt-BR");
};

const bankThemes: Record<
  CreditCardInstitution,
  { primary: string; secondary: string; logo: string }
> = {
  NUBANK: { primary: "#8A05BE", secondary: "#A855F7", logo: "NU" },
  INTER: { primary: "#FF8700", secondary: "#FFA940", logo: "IN" },
  ITAU: { primary: "#EC7000", secondary: "#F59E0B", logo: "IT" },
  BANCO_DO_BRASIL: { primary: "#1D4ED8", secondary: "#FACC15", logo: "BB" },
  BRADESCO: { primary: "#CC092F", secondary: "#EF4444", logo: "BR" },
  SANTANDER: { primary: "#EC0000", secondary: "#DC2626", logo: "SA" },
  CAIXA: { primary: "#005CA9", secondary: "#3B82F6", logo: "CX" },
  BTG_PACTUAL: { primary: "#000000", secondary: "#1F2937", logo: "BT" },
  C6_BANK: { primary: "#000000", secondary: "#111827", logo: "C6" },
  PAGBANK: { primary: "#00A868", secondary: "#10B981", logo: "PB" },
  OUTROS: { primary: "#020617", secondary: "#22c55e", logo: "NB" },
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const getMonthName = (monthStr: string) => {
  const month = Number(monthStr);
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

const getInitialBillingMonthYear = (
  closingDay?: number | null
): { monthStr: string; yearStr: string } => {
  const today = new Date();
  let month = today.getMonth() + 1;
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

  return {
    monthStr: String(month).padStart(2, "0"),
    yearStr: String(year),
  };
};

export default function CardDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const cardId = params.id as string;

  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState<string>(
    String(today.getMonth() + 1).padStart(2, "0")
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    String(today.getFullYear())
  );

  const [hasAdjustedInitialFilter, setHasAdjustedInitialFilter] =
    useState(false);

  const [card, setCard] = useState<CreditCardDTO | null>(null);
  const [expenses, setExpenses] = useState<CardExpenseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expenseToDeleteId, setExpenseToDeleteId] = useState<string | null>(
    null
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fetchCardDetails = async () => {
    if (!API_URL) {
      const msg = "Erro de configuração da API.";
      console.error(msg);
      setError(msg);
      toast.error(msg);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const urlParams = new URLSearchParams();
      if (selectedMonth) urlParams.set("month", String(Number(selectedMonth)));
      if (selectedYear) urlParams.set("year", selectedYear);

      const res = await fetch(
        `${API_URL}/credit-cards/${cardId}?${urlParams.toString()}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const message = data?.message || "Erro ao carregar detalhes do cartão.";
        throw new Error(message);
      }

      const apiCard: CreditCardDTO = data.card;
      const apiExpenses: CardExpenseDTO[] = data.expenses ?? [];

      setCard(apiCard);
      setExpenses(apiExpenses);
    } catch (err: any) {
      console.error("[CardDetails] Erro ao buscar:", err);
      const msg =
        err.message ?? "Erro inesperado ao buscar detalhes do cartão.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (cardId) {
      fetchCardDetails();
    }
  }, [cardId, selectedMonth, selectedYear]);

  useEffect(() => {
    if (!card) return;
    if (hasAdjustedInitialFilter) return;

    const { monthStr, yearStr } = getInitialBillingMonthYear(card.closingDay);
    setSelectedMonth(monthStr);
    setSelectedYear(yearStr);
    setHasAdjustedInitialFilter(true);
  }, [card, hasAdjustedInitialFilter]);

  const handleBack = () => {
    router.push("/dashboard/cartoes");
  };

  const handleOpenNewExpense = () => {
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  const handleEditExpense = (expense: CardExpenseDTO) => {
    if (!card) return;

    const { current, total } = parseInstallmentString(expense.installment);

    const editDataForModal = {
      id: expense.id,
      value: expense.value,
      category: expense.category,
      description: expense.description,
      date: expense.date.includes("T")
        ? expense.date.split("T")[0]
        : expense.date,
      paidBy: card.isCurrentUserOwner
        ? ("Você" as CardOwnerLabel)
        : ("Parceiro" as CardOwnerLabel),
      paymentMethod: "card",
      cardId: card.id,
      cardName: card.name,
      cardDigits: card.lastDigits,
      installments: total > 1 ? total : 1,
      currentInstallment: current,
      installment: expense.installment,
    };

    setEditingExpense(editDataForModal);
    setIsModalOpen(true);
  };

  const handleModalOpenChange = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) setEditingExpense(null);
  };

  const handleDeleteClick = (id: string) => {
    setExpenseToDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!expenseToDeleteId) return;

    if (!API_URL) {
      console.error("NEXT_PUBLIC_API_URL não configurada");
      toast.error("Erro de configuração da API.");
      setDeleteDialogOpen(false);
      setExpenseToDeleteId(null);
      return;
    }

    try {
      const res = await fetch(
        `${API_URL}/transactions/expenses/${expenseToDeleteId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!res.ok && res.status !== 204) {
        const body = await res.json().catch(() => null);
        const message = body?.message || "Erro ao excluir despesa.";
        throw new Error(message);
      }

      setExpenses((prev) =>
        prev.filter((expense) => expense.id !== expenseToDeleteId)
      );
      toast.success("Despesa excluída com sucesso.");
    } catch (err: any) {
      console.error("[CardDetails] Erro ao excluir despesa:", err);
      toast.error(err.message ?? "Erro ao excluir despesa.");
    } finally {
      setDeleteDialogOpen(false);
      setExpenseToDeleteId(null);
    }
  };

  if (isLoading && !card && !error) {
    return (
      <DashboardLayout>
        <div className="max-w-full animate-pulse">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-4 sm:mb-6 hover:bg-secondary/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para cartões
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !card) {
    return (
      <DashboardLayout>
        <div className="max-w-full">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-4 sm:mb-6 hover:bg-secondary/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para cartões
          </Button>
          <p className="text-sm text-destructive mb-2">{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!card) {
    return (
      <DashboardLayout>
        <div className="max-w-full">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-4 sm:mb-6 hover:bg-secondary/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para cartões
          </Button>
          <p className="text-sm text-muted-foreground">
            Cartão não encontrado.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const theme = bankThemes[card.institution] ?? bankThemes["OUTROS"];

  const monthUsed = expenses.reduce((sum, expense) => sum + expense.value, 0);

  const used = card.used ?? 0;
  const usedPercentage =
    card.limit > 0 ? Math.min((used / card.limit) * 100, 100) : 0;
  const available = card.limit - used;
  const ownerLabel: CardOwnerLabel = card.isCurrentUserOwner
    ? "Você"
    : "Parceiro";

  const monthName = getMonthName(selectedMonth);

  return (
    <DashboardLayout>
      <div className="max-w-full">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-4 sm:mb-6 hover:bg-secondary/50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para cartões
        </Button>

        <div
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl mb-6 sm:mb-8"
          style={{
            background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
          }}
        >
          <div className="flex items-start justify-between mb-8 sm:mb-12">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center font-bold text-white text-xl sm:text-2xl">
              {theme.logo}
            </div>
            <CreditCard className="w-8 h-8 sm:w-10 sm:h-10 text-white/80" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                {card.name}
              </h3>
              <p className="text-white/80 text-base sm:text-lg">
                •••• {card.lastDigits}
              </p>
              <p className="text-white/70 text-xs sm:text-sm mt-1">
                Dono: {ownerLabel}
              </p>
            </div>

            <div>
              <p className="text-white/70 text-sm mb-1">Limite disponível</p>
              <p className="text-2xl sm:text-3xl font-bold text-white">
                {formatCurrency(available)}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-white/90 text-sm">
                <span>Utilizado</span>
                <span className="font-semibold">
                  {formatCurrency(used)} / {formatCurrency(card.limit)}
                </span>
              </div>
              <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all"
                  style={{ width: `${usedPercentage}%` }}
                />
              </div>
              <div className="flex flex-col sm:flex-row justify-between text-white/70 text-xs gap-1">
                <span>
                  Vencimento:{" "}
                  {typeof card.dueDay === "number" ? `dia ${card.dueDay}` : "—"}
                </span>
                <span>
                  Fechamento:{" "}
                  {typeof card.closingDay === "number"
                    ? `dia ${card.closingDay}`
                    : "—"}
                </span>
              </div>
            </div>
          </div>

          <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -left-8 -top-8 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div className="bg-card border border-border/20 rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">
                Total de despesas (parcelas desta fatura)
              </span>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-foreground">
              {formatCurrency(monthUsed)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Fatura de {monthName} / {selectedYear}
            </p>
          </div>

          <div className="bg-card border border-border/20 rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">
                Limite disponível
              </span>
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-green-500" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-foreground">
              {formatCurrency(available)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              de {formatCurrency(card.limit)}
            </p>
          </div>

          <div className="bg-card border border-border/20 rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">
                Total de transações
              </span>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-foreground">
              {expenses.length}
            </p>
            <p className="text-sm text-muted-foreground mt-2">Esta fatura</p>
          </div>
        </div>

        {isLoading && (
          <p className="text-sm text-muted-foreground mb-4">
            Atualizando dados do cartão...
          </p>
        )}

        <div className="bg-card border border-border/20 rounded-2xl p-4 sm:p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-base sm:text-lg font-semibold text-foreground">
              Filtros da fatura
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Mês da fatura
              </label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="bg-input border-border/20">
                  <SelectValue />
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
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Ano da fatura
              </label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="bg-input border-border/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border/20 rounded-2xl overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-border/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              Despesas do cartão
            </h2>
            <Button
              onClick={handleOpenNewExpense}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 w-full sm:w-auto shadow-lg shadow-red-500/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova despesa
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="text-left py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm font-semibold text-foreground">
                    Descrição
                  </th>
                  <th className="text-left py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm font-semibold text-foreground">
                    Categoria
                  </th>
                  <th className="text-right py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm font-semibold text-foreground">
                    Valor da parcela
                  </th>
                  <th className="text-right py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm font-semibold text-foreground">
                    Valor total
                  </th>
                  <th className="text-center py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm font-semibold text-foreground">
                    Parcelas
                  </th>
                  <th className="text-left py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm font-semibold text-foreground">
                    Data da compra
                  </th>
                  <th className="text-center py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm font-semibold text-foreground">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense, index) => (
                  <tr
                    key={expense.id}
                    className={`border-t border-border/10 hover:bg-secondary/30 transition-colors ${
                      index % 2 === 0 ? "bg-card" : "bg-secondary/10"
                    }`}
                  >
                    <td className="py-3 sm:py-4 px-3 sm:px-6 text-sm sm:text-base text-foreground font-medium">
                      {expense.description}
                    </td>
                    <td className="py-3 sm:py-4 px-3 sm:px-6">
                      <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs sm:text-sm font-medium">
                        {expense.category}
                      </span>
                    </td>
                    <td className="py-3 sm:py-4 px-3 sm:px-6 text-right font-bold text-sm sm:text-base text-foreground">
                      {formatCurrency(expense.value)}
                    </td>
                    <td className="py-3 sm:py-4 px-3 sm:px-6 text-right font-semibold text-xs sm:text-sm text-muted-foreground">
                      {formatCurrency(expense.totalValue)}
                    </td>
                    <td className="py-3 sm:py-4 px-3 sm:px-6 text-center text-muted-foreground text-xs sm:text-sm">
                      {expense.installment ? (
                        <span className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded-md text-xs font-medium">
                          {expense.installment}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">
                          À vista
                        </span>
                      )}
                    </td>
                    <td className="py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm text-muted-foreground">
                      {formatDateFromISO(expense.date)}
                    </td>
                    <td className="py-3 sm:py-4 px-3 sm:px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditExpense(expense)}
                          className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                          aria-label="Editar despesa"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(expense.id)}
                          className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-muted-foreground hover:text-destructive"
                          aria-label="Excluir despesa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {!isLoading && expenses.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-4 px-6 text-center text-sm text-muted-foreground"
                    >
                      Nenhuma despesa cadastrada para este cartão nesta fatura.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AddExpenseModal
        open={isModalOpen}
        onOpenChange={handleModalOpenChange}
        preselectedCardId={card.id}
        editData={editingExpense ?? undefined}
        onSaved={fetchCardDetails}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Excluir despesa
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Tem certeza que deseja excluir esta despesa? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
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
