"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Target,
  TrendingUp,
  Calendar,
  DollarSign,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { GoalModal } from "@/components/goal-modal";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type GoalDTO = {
  id: string;
  name: string;
  description?: string | null;
  target: number;
  current: number;
  deadline: string; // yyyy-MM-dd
  monthlyContribution: number;
  progress: number;
  isCompleted: boolean;
};

type ContributionDTO = {
  id: string;
  date: string; // yyyy-MM-dd ou ISO
  amount: number;
  source: "Você" | "Parceiro";
};

type ContributionSourceInternal = "voce" | "parceiro";

// ---- HELPERS DE MOEDA ----

const formatNumberToPtBR = (value: number) =>
  value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatCurrencyInput = (raw: string) => {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  const int = parseInt(digits, 10);
  const float = int / 100;
  return formatNumberToPtBR(float);
};

const parseCurrencyToNumber = (value: string): number => {
  if (!value) return 0;
  const normalized = value.replace(/\./g, "").replace(",", ".");
  const num = Number(normalized);
  return Number.isNaN(num) ? 0 : num;
};

const normalizeContributionSource = (
  value: ContributionDTO["source"] | ContributionSourceInternal
): ContributionSourceInternal => {
  switch (value) {
    case "Você":
    case "voce":
      return "voce";
    case "Parceiro":
    case "parceiro":
      return "parceiro";
    default:
      return "voce";
  }
};

// ---- HELPERS DE DATA (evitar drift de timezone) ----

const createDateFromISO = (iso: string | undefined | null): Date | null => {
  if (!iso) return null;
  const parts = iso.split("-");
  if (parts.length !== 3) return null;
  const [yearStr, monthStr, dayStr] = parts;
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day))
    return null;
  // Aqui usamos Date no modo "local" sem UTC, evitando cair no dia anterior
  return new Date(year, month - 1, day);
};

const formatDateFromISO = (iso: string | undefined | null) => {
  const d = createDateFromISO(iso);
  if (!d) return "-";
  return d.toLocaleDateString("pt-BR");
};

// ---- PRAZO: MESES E DIAS ----

const calculateRemainingTime = (deadlineStr: string): {
  months: number;
  days: number;
} => {
  const today = new Date();
  const todayMid = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const deadline = new Date(`${deadlineStr}T00:00:00`);

  if (deadline <= todayMid) {
    return { months: 0, days: 0 };
  }

  let months =
    (deadline.getFullYear() - todayMid.getFullYear()) * 12 +
    (deadline.getMonth() - todayMid.getMonth());

  const candidate = new Date(
    todayMid.getFullYear(),
    todayMid.getMonth() + months,
    todayMid.getDate()
  );

  if (candidate > deadline) {
    months -= 1;
  }

  if (months < 0) months = 0;

  let days = 0;

  if (months === 0) {
    const msDiff = deadline.getTime() - todayMid.getTime();
    days = Math.ceil(msDiff / (1000 * 60 * 60 * 24));
    if (days < 0) days = 0;
  }

  return { months, days };
};

const formatRemainingTimeLabel = (months: number, days: number): string | null => {
  if (months <= 0 && days <= 0) return null;

  if (months > 0 && days > 0) {
    return `Faltam ${months} mês${months > 1 ? "es" : ""} e ${days} dia${
      days > 1 ? "s" : ""
    }`;
  }

  if (months > 0) {
    return `Faltam ${months} mês${months > 1 ? "es" : ""}`;
  }

  return `Faltam ${days} dia${days > 1 ? "s" : ""}`;
};

export default function GoalDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const goalId = params.id as string;

  const [goal, setGoal] = useState<GoalDTO | null>(null);
  const [contributions, setContributions] = useState<ContributionDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isContributionModalOpen, setIsContributionModalOpen] =
    useState(false);
  const [editingContribution, setEditingContribution] =
    useState<ContributionDTO | null>(null);

  // form contribuição
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [source, setSource] = useState<ContributionSourceInternal>("voce");

  // modal de edição da meta (compartilhado)
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  // AlertDialog de exclusão de contribuição
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contributionToDeleteId, setContributionToDeleteId] = useState<
    string | null
  >(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fetchGoal = async () => {
    try {
      if (!API_URL) {
        const msg = "Erro de configuração da API.";
        console.error(msg);
        setError(msg);
        toast.error(msg);
        return;
      }

      setIsLoading(true);
      setError(null);

      const res = await fetch(`${API_URL}/goals/${goalId}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const message = data?.message || "Erro ao carregar meta.";
        throw new Error(message);
      }

      setGoal(data.goal);
      setContributions(data.contributions || []);
    } catch (err: any) {
      console.error("[GoalDetails] Erro ao buscar meta:", err);
      const msg = err.message ?? "Erro inesperado ao carregar meta.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (goalId) {
      fetchGoal();
    }
  }, [goalId]);

  const resetContributionForm = () => {
    setAmount("");
    setDate(new Date().toISOString().split("T")[0]);
    setSource("voce");
    setEditingContribution(null);
  };

  const handleAmountChange = (raw: string) => {
    const formatted = formatCurrencyInput(raw);
    setAmount(formatted);
  };

  const handleOpenNewContribution = () => {
    resetContributionForm();
    setIsContributionModalOpen(true);
  };

  const handleEditContribution = (contribution: ContributionDTO) => {
    setEditingContribution(contribution);
    setAmount(formatNumberToPtBR(contribution.amount));
    const rawDate = contribution.date.includes("T")
      ? contribution.date.split("T")[0]
      : contribution.date;
    setDate(rawDate);
    setSource(normalizeContributionSource(contribution.source));
    setIsContributionModalOpen(true);
  };

  const handleSaveContribution = async () => {
    if (!API_URL || !goalId) {
      toast.error("Erro de configuração da API.");
      return;
    }

    const amountNumber = parseCurrencyToNumber(amount);

    if (!amountNumber || amountNumber <= 0) {
      toast.error("Informe um valor válido maior que zero.");
      return;
    }

    if (!date) {
      toast.error("Informe a data da contribuição.");
      return;
    }

    const payload = {
      amount: amountNumber,
      date,
      source,
    };

    const isEdit = !!editingContribution;
    const url = isEdit
      ? `${API_URL}/goals/${goalId}/contributions/${editingContribution!.id}`
      : `${API_URL}/goals/${goalId}/contributions`;
    const method = isEdit ? "PUT" : "POST";
    const toastId = isEdit ? "update-contribution" : "create-contribution";

    try {
      toast.loading(
        isEdit ? "Atualizando contribuição..." : "Adicionando contribuição...",
        { id: toastId }
      );

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);
      toast.dismiss(toastId);

      if (!res.ok) {
        toast.error(
          data?.message ??
            (isEdit
              ? "Erro ao atualizar contribuição."
              : "Erro ao adicionar contribuição.")
        );
        return;
      }

      toast.success(
        data?.message ??
          (isEdit
            ? "Contribuição atualizada com sucesso."
            : "Contribuição adicionada com sucesso.")
      );
      resetContributionForm();
      setIsContributionModalOpen(false);
      fetchGoal();
    } catch (err) {
      console.error("[GoalDetails] Erro ao salvar contribuição:", err);
      toast.dismiss(toastId);
      toast.error("Erro inesperado ao salvar contribuição.");
    }
  };

  // Abre modal de edição da meta
  const handleOpenEditGoal = () => {
    if (!goal) return;
    setIsGoalModalOpen(true);
  };

  // Abre o AlertDialog para confirmar exclusão
  const handleDeleteContribution = (contributionId: string) => {
    setContributionToDeleteId(contributionId);
    setDeleteDialogOpen(true);
  };

  // Confirma exclusão
  const handleConfirmDelete = async () => {
    if (!API_URL || !goalId) {
      toast.error("Erro de configuração da API.");
      setDeleteDialogOpen(false);
      setContributionToDeleteId(null);
      return;
    }

    if (!contributionToDeleteId) {
      setDeleteDialogOpen(false);
      return;
    }

    const toastId = `delete-contribution-${contributionToDeleteId}`;

    try {
      toast.loading("Excluindo contribuição...", { id: toastId });

      const res = await fetch(
        `${API_URL}/goals/${goalId}/contributions/${contributionToDeleteId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      toast.dismiss(toastId);

      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => null);
        toast.error(data?.message ?? "Erro ao excluir contribuição.");
        return;
      }

      toast.success("Contribuição excluída com sucesso.");
      setContributions((prev) =>
        prev.filter((c) => c.id !== contributionToDeleteId)
      );
      fetchGoal();
    } catch (err) {
      console.error("[GoalDetails] Erro ao excluir contribuição:", err);
      toast.dismiss(toastId);
      toast.error("Erro inesperado ao excluir contribuição.");
    } finally {
      setDeleteDialogOpen(false);
      setContributionToDeleteId(null);
    }
  };

  // ======= ESTADOS INICIAIS (LOADING / ERRO / NOT FOUND) =======

  if (isLoading && !goal) {
    return (
      <DashboardLayout>
        <GoalDetailsSkeleton />
      </DashboardLayout>
    );
  }

  if (error && !goal) {
    return (
      <DashboardLayout>
        <div className="px-4 py-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/metas")}
            className="mb-4 hover:bg-secondary/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para metas
          </Button>
          <p className="text-sm text-destructive">{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!goal) {
    return (
      <DashboardLayout>
        <div className="px-4 py-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/metas")}
            className="mb-4 hover:bg-secondary/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para metas
          </Button>
          <p className="text-sm text-muted-foreground">Meta não encontrada.</p>
        </div>
      </DashboardLayout>
    );
  }

  // ======= DADOS CALCULADOS =======

  const progress =
    goal.progress ?? (goal.target > 0 ? (goal.current / goal.target) * 100 : 0);
  const isCompleted = goal.isCompleted ?? progress >= 100;
  const remaining = Math.max(goal.target - goal.current, 0);

  const { months: monthsToDeadline, days: daysToDeadline } =
    calculateRemainingTime(goal.deadline);
  const remainingTimeLabel = formatRemainingTimeLabel(
    monthsToDeadline,
    daysToDeadline
  );

  const deadlineDate = createDateFromISO(goal.deadline);

  // ======= RENDER PRINCIPAL =======

  return (
    <DashboardLayout>
      <div className="max-w-full">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/metas")}
          className="mb-4 sm:mb-6 hover:bg-secondary/50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para metas
        </Button>

        {/* Goal Visual Card */}
        <div
          className={`relative overflow-hidden rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl mb-6 sm:mb-8 ${
            isCompleted
              ? "bg-gradient-to-br from-primary via-primary/80 to-primary/60"
              : "bg-gradient-to-br from-primary/80 via-primary/60 to-primary/40"
          }`}
        >
          {/* Goal Header */}
          <div className="flex items-start justify-between mb-8 sm:mb-12">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center">
              {isCompleted ? (
                <span className="text-2xl sm:text-4xl">🎉</span>
              ) : (
                <Target className="w-6 h-6 sm:w-8 h-8 text-white" />
              )}
            </div>

            <div className="flex items-center gap-2">
              {isCompleted && (
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <p className="text-white font-bold text-sm">
                    Meta alcançada!
                  </p>
                </div>
              )}
              {/* Botão de editar meta */}
              <button
                type="button"
                onClick={handleOpenEditGoal}
                className="p-2 rounded-lg bg-white/15 hover:bg-white/25 transition-colors text-white"
                aria-label="Editar meta"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Goal Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                {goal.name}
              </h3>
              <p className="text-white/80 text-sm sm:text-base">
                {goal.description ||
                  "Defina uma descrição para detalhar melhor essa meta."}
              </p>
            </div>

            <div>
              <p className="text-white/70 text-sm mb-1">Progresso atual</p>
              <p className="text-2xl sm:text-3xl font-bold text-white">
                R$ {formatNumberToPtBR(goal.current)}
              </p>
              <p className="text-white/80 text-sm mt-1">
                de R$ {formatNumberToPtBR(goal.target)}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-white/90 text-sm">
                <span>Progresso</span>
                <span className="font-semibold">{progress.toFixed(0)}%</span>
              </div>
              <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-white/70 text-xs">
                <span>
                  Prazo:{" "}
                  {deadlineDate
                    ? deadlineDate.toLocaleDateString("pt-BR")
                    : "-"}
                </span>
                {!isCompleted && remainingTimeLabel && (
                  <span>{remainingTimeLabel}</span>
                )}
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -left-8 -top-8 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-card border border-border/20 rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">Valor atual</span>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-foreground">
              R$ {formatNumberToPtBR(goal.current)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {progress.toFixed(0)}% alcançado
            </p>
          </div>

          <div className="bg-card border border-border/20 rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">
                Falta atingir
              </span>
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-orange-500" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-foreground">
              R$ {formatNumberToPtBR(remaining)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {isCompleted
                ? "Meta completa!"
                : remainingTimeLabel ?? "Prazo encerrado"}
            </p>
          </div>

          <div className="bg-card border border-border/20 rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">
                Contribuição mensal
              </span>
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-foreground">
              R$ {formatNumberToPtBR(goal.monthlyContribution)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Média planejada por mês
            </p>
          </div>

          <div className="bg-card border border-border/20 rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">Prazo final</span>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-foreground">
              {deadlineDate
                ? deadlineDate.toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                  })
                : "-"}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {deadlineDate ? deadlineDate.getFullYear() : "--"}
            </p>
          </div>
        </div>

        {/* Contributions List */}
        <div className="bg-card border border-border/20 rounded-2xl overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-border/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              Histórico de contribuições
            </h2>
            <Dialog
              open={isContributionModalOpen}
              onOpenChange={(open) => {
                setIsContributionModalOpen(open);
                if (!open) resetContributionForm();
              }}
            >
              <DialogTrigger asChild>
                <Button
                  onClick={handleOpenNewContribution}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar valor
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border/20 max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-foreground">
                    {editingContribution
                      ? "Editar contribuição"
                      : "Adicionar contribuição"}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Valor (R$)</Label>
                    <Input
                      type="text"
                      inputMode="decimal"
                      placeholder="0,00"
                      value={amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      className="bg-input border-border/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">Data</Label>
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="bg-input border-border/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">Origem</Label>
                    <Select
                      value={source}
                      onValueChange={(v) =>
                        setSource(v as ContributionSourceInternal)
                      }
                    >
                      <SelectTrigger className="bg-input border-border/20 h-12">
                        <SelectValue placeholder="Selecione a origem" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="voce">Você</SelectItem>
                        <SelectItem value="parceiro">Parceiro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsContributionModalOpen(false)}
                    className="flex-1 border-border/50"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSaveContribution}
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {editingContribution ? "Atualizar" : "Adicionar"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="text-left py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm font-semibold text-foreground">
                    Data
                  </th>
                  <th className="text-right py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm font-semibold text-foreground">
                    Valor
                  </th>
                  <th className="text-left py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm font-semibold text-foreground">
                    Origem
                  </th>
                  <th className="text-center py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm font-semibold text-foreground">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {contributions.map((contribution, index) => (
                  <tr
                    key={contribution.id}
                    className={`border-t border-border/10 hover:bg-secondary/30 transition-colors ${
                      index % 2 === 0 ? "bg-card" : "bg-secondary/10"
                    }`}
                  >
                    <td className="py-3 sm:py-4 px-3 sm:px-6 text-sm sm:text-base text-muted-foreground">
                      {formatDateFromISO(contribution.date)}
                    </td>
                    <td className="py-3 sm:py-4 px-3 sm:px-6 text-right font-bold text-sm sm:text-base text-primary">
                      + R$ {formatNumberToPtBR(contribution.amount)}
                    </td>
                    <td className="py-3 sm:py-4 px-3 sm:px-6">
                      <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs sm:text-sm font-medium">
                        {contribution.source}
                      </span>
                    </td>
                    <td className="py-3 sm:py-4 px-3 sm:px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                          type="button"
                          onClick={() => handleEditContribution(contribution)}
                          aria-label="Editar contribuição"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-muted-foreground hover:text-destructive"
                          type="button"
                          onClick={() =>
                            handleDeleteContribution(contribution.id)
                          }
                          aria-label="Excluir contribuição"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {contributions.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-6 text-center text-sm text-muted-foreground"
                    >
                      Nenhuma contribuição registrada ainda. Comece adicionando
                      um valor.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal compartilhado de meta (edit) */}
      <GoalModal
        open={isGoalModalOpen}
        onOpenChange={setIsGoalModalOpen}
        mode="edit"
        goalId={goalId}
        initialValues={{
          name: goal.name,
          description: goal.description ?? "",
          target: goal.target,
          monthlyContribution: goal.monthlyContribution,
          deadline: goal.deadline,
        }}
        onSaved={fetchGoal}
      />

      {/* AlertDialog para excluir contribuição */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Excluir contribuição
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Tem certeza que deseja excluir esta contribuição? Esta ação não
              pode ser desfeita.
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

/* ============= SKELETON DETALHE META ============= */

function GoalDetailsSkeleton() {
  return (
    <div className="max-w-full px-4 sm:px-0 py-4 sm:py-6 space-y-6">
      {/* Botão voltar skeleton */}
      <div className="h-9 w-40 rounded-full bg-muted/40 animate-pulse" />

      {/* Card principal skeleton */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-6 sm:p-8 bg-card/60 border border-border/20 mb-2">
        <div className="absolute inset-0 bg-gradient-to-r from-muted/40 via-muted/20 to-muted/40 animate-pulse" />
        <div className="relative grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="space-y-3">
            <div className="h-10 w-10 rounded-xl bg-muted/70" />
            <div className="h-6 w-40 bg-muted/70 rounded-full" />
            <div className="h-4 w-60 bg-muted/60 rounded-full" />
          </div>
          <div className="space-y-3">
            <div className="h-4 w-28 bg-muted/60 rounded-full" />
            <div className="h-8 w-40 bg-muted/70 rounded-full" />
            <div className="h-4 w-48 bg-muted/50 rounded-full" />
          </div>
          <div className="space-y-3">
            <div className="h-4 w-24 bg-muted/50 rounded-full" />
            <div className="h-3 w-full bg-muted/60 rounded-full" />
            <div className="h-3 w-32 bg-muted/50 rounded-full" />
          </div>
        </div>
      </div>

      {/* Cards resumo skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="relative rounded-2xl p-4 sm:p-6 bg-card/60 border border-border/20 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-muted/40 via-muted/20 to-muted/40 animate-pulse" />
            <div className="relative space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-3 w-20 bg-muted/70 rounded-full" />
                <div className="h-8 w-8 rounded-xl bg-muted/70" />
              </div>
              <div className="h-6 w-32 bg-muted/80 rounded-full" />
              <div className="h-3 w-24 bg-muted/60 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Tabela contribuições skeleton */}
      <div className="bg-card/80 border border-border/20 rounded-2xl overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-border/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="h-6 w-52 bg-muted/70 rounded-full animate-pulse" />
          <div className="h-9 w-40 bg-muted/70 rounded-full animate-pulse" />
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[500px]">
            <div className="h-10 bg-secondary/40 animate-pulse" />
            <div className="divide-y divide-border/10">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4"
                >
                  <div className="h-4 w-24 bg-muted/60 rounded-full" />
                  <div className="h-4 w-32 bg-muted/70 rounded-full" />
                  <div className="h-6 w-20 bg-muted/60 rounded-full" />
                  <div className="h-6 w-16 bg-muted/50 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
