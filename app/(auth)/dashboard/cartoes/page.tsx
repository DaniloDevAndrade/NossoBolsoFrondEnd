"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { CreditCard, Plus, Trash2 } from "lucide-react";
import { AddCardModal } from "@/components/add-card-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
  limit: number;
  lastDigits: string;
  dueDay: number | null;
  closingDay: number | null;
  used: number;

  // infos de dono vindas do backend
  owner: "Você" | "Parceiro";
  userId: string;
  isCurrentUserOwner: boolean;
};

const NOSSO_BOLSO_THEME = {
  primary: "#020617",
  secondary: "#22c55e",
  logo: "NB",
} as const;

const bankThemes: Record<
  CreditCardInstitution,
  { primary: string; secondary: string; logo: string }
> = {
  NUBANK: { primary: "#8A05BE", secondary: "#A855F7", logo: "NU" },
  INTER: { primary: "#FF8700", secondary: "#FFA940", logo: "IN" },
  ITAU: { primary: "#EC7000", secondary: "#F59E0B", logo: "IT" },
  BANCO_DO_BRASIL: {
    primary: "#1D4ED8",
    secondary: "#FACC15",
    logo: "BB",
  },
  BRADESCO: { primary: "#B91C1C", secondary: "#EF4444", logo: "BR" },
  SANTANDER: { primary: "#B91C1C", secondary: "#DC2626", logo: "SA" },
  CAIXA: { primary: "#005CA9", secondary: "#3B82F6", logo: "CX" },
  BTG_PACTUAL: { primary: "#020617", secondary: "#1F2937", logo: "BT" },
  C6_BANK: { primary: "#000000", secondary: "#111827", logo: "C6" },
  PAGBANK: { primary: "#16A34A", secondary: "#22C55E", logo: "PB" },
  OUTROS: NOSSO_BOLSO_THEME,
};

function getBankTheme(institution: string | undefined | null) {
  if (!institution) return NOSSO_BOLSO_THEME;
  const key = institution as CreditCardInstitution;
  return bankThemes[key] ?? NOSSO_BOLSO_THEME;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

/**
 * Mesmo conceito da página de detalhes:
 * - Se hoje já passou o dia de fechamento -> fatura do PRÓXIMO mês
 * - Senão -> fatura do mês atual
 */
const getInitialBillingMonthYear = (
  closingDay?: number | null
): { monthStr: string; yearStr: string } => {
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

  return {
    monthStr: String(month).padStart(2, "0"),
    yearStr: String(year),
  };
};

const getMonthName = (monthStr: string | null) => {
  if (!monthStr) return "";
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

export default function CartoesPage() {
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cards, setCards] = useState<CreditCardDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"you" | "partner">("you");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cardToDeleteId, setCardToDeleteId] = useState<string | null>(null);

  // 🔥 mês/ano da fatura que estamos usando nesse grid
  const [billingMonth, setBillingMonth] = useState<string | null>(null); // "01".."12"
  const [billingYear, setBillingYear] = useState<string | null>(null); // "2025", etc

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fetchCards = async () => {
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

      // 1) Primeiro fetch sem filtros -> só pra descobrir um closingDay de referência
      const baseRes = await fetch(`${API_URL}/credit-cards`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const baseBody = await baseRes.json().catch(() => null);

      if (!baseRes.ok) {
        const message = baseBody?.message || "Erro ao carregar cartões.";
        throw new Error(message);
      }

      const baseData = baseBody as { cards: CreditCardDTO[] };
      const baseCards = baseData.cards || [];

      // Se não tiver nenhum cartão ainda, não precisa de segundo fetch
      if (baseCards.length === 0) {
        setCards([]);
        setBillingMonth(null);
        setBillingYear(null);
        return;
      }

      // 2) Usa o closingDay do primeiro cartão como referência
      const referenceClosingDay = baseCards[0].closingDay ?? null;
      const { monthStr, yearStr } = getInitialBillingMonthYear(
        referenceClosingDay
      );

      setBillingMonth(monthStr);
      setBillingYear(yearStr);

      const params = new URLSearchParams();
      params.set("month", String(Number(monthStr)));
      params.set("year", yearStr);

      // 3) Segundo fetch: agora sim, pedindo a FATURA correta (mês/ano) para todos os cartões
      const res = await fetch(
        `${API_URL}/credit-cards?${params.toString()}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const body = await res.json().catch(() => null);

      if (!res.ok) {
        const message = body?.message || "Erro ao carregar cartões.";
        throw new Error(message);
      }

      const data = body as { cards: CreditCardDTO[] };
      setCards(data.cards || []);
    } catch (err: any) {
      console.error("[Cartões] Erro ao buscar:", err);
      const msg = err.message ?? "Erro inesperado ao buscar cartões.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleViewDetails = (cardId: string) => {
    router.push(`/dashboard/cartoes/${cardId}`);
  };

  const handleDeleteClick = (id: string) => {
    setCardToDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!API_URL) {
      toast.error("Erro de configuração da API.");
      setDeleteDialogOpen(false);
      setCardToDeleteId(null);
      return;
    }

    if (!cardToDeleteId) {
      setDeleteDialogOpen(false);
      return;
    }

    const id = cardToDeleteId;
    const toastId = `delete-card-${id}`;

    try {
      toast.loading("Excluindo cartão...", { id: toastId });

      const res = await fetch(`${API_URL}/credit-cards/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      toast.dismiss(toastId);

      if (!res.ok && res.status !== 204) {
        const body = await res.json().catch(() => null);
        const message =
          body?.message ??
          "Erro ao excluir cartão. Verifique despesas vinculadas.";
        toast.error(message);
        return;
      }

      toast.success("Cartão excluído com sucesso.");
      setCards((prev) => prev.filter((card) => card.id !== id));
    } catch (err: any) {
      console.error("[Cartões] Erro ao excluir cartão:", err);
      toast.dismiss(toastId);
      toast.error(err.message ?? "Erro inesperado ao excluir cartão.");
    } finally {
      setDeleteDialogOpen(false);
      setCardToDeleteId(null);
    }
  };

  // Separação com base em isCurrentUserOwner
  const youCards = cards.filter((c) => c.isCurrentUserOwner);
  const partnerCards = cards.filter((c) => !c.isCurrentUserOwner);

  const monthLabel = getMonthName(billingMonth);

  const CardComponent = ({
    card,
    onDelete,
    billingMonthLabel,
    billingYear,
  }: {
    card: CreditCardDTO;
    onDelete: (id: string) => void;
    billingMonthLabel?: string | null;
    billingYear?: string | null;
  }) => {
    const theme = getBankTheme(card.institution);
    const used = card.used ?? 0;
    const usedPercentage =
      card.limit > 0 ? Math.min((used / card.limit) * 100, 100) : 0;

    const billingText =
      billingMonthLabel && billingYear
        ? `Usado — Fatura de ${billingMonthLabel}/${billingYear}`
        : "Utilizado (fatura atual)";

    return (
      <div
        onClick={() => handleViewDetails(card.id)}
        className="relative overflow-hidden rounded-2xl p-6 shadow-xl transition-all hover:scale-105 cursor-pointer"
        style={{
          background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
        }}
      >
        <div className="flex items-start justify-between mb-8">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center font-bold text-white text-lg">
            {theme.logo}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(card.id);
              }}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-red-300 transition-colors"
              aria-label="Excluir cartão"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <CreditCard className="w-8 h-8 text-white/80" />
          </div>
        </div>

        <h3 className="text-xl font-bold text-white mb-1">{card.name}</h3>
        <p className="text-white/80 text-sm mb-6">•••• {card.lastDigits}</p>

        <div className="mb-4">
          <div className="flex justify-between text-white/90 text-sm mb-2">
            <span>{billingText}</span>
            <span className="font-semibold text-white">
              {formatCurrency(used)} / {formatCurrency(card.limit)}
            </span>
          </div>
          <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all"
              style={{ width: `${usedPercentage}%` }}
            />
          </div>
        </div>

        <div className="text-white/80 text-sm space-y-1">
          <div>
            Vencimento:{" "}
            {typeof card.dueDay === "number" ? `dia ${card.dueDay}` : "—"}
          </div>
          <div>
            Fechamento:{" "}
            {typeof card.closingDay === "number"
              ? `dia ${card.closingDay}`
              : "—"}
          </div>
        </div>

        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -left-4 -top-4 w-24 h-24 bg-white/5 rounded-xl blur-xl" />
      </div>
    );
  };

  // Skeleton de carregamento inicial dos cartões
  if (isLoading && cards.length === 0 && !error) {
    return (
      <DashboardLayout>
        <div className="max-w-full animate-pulse">
          {/* Header skeleton */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 lg:mb-8">
            <div className="space-y-2 w/full sm:w-auto">
              <div className="h-7 sm:h-8 w-40 sm:w-64 bg-muted/60 rounded-lg" />
              <div className="h-4 w-56 sm:w-80 bg-muted/40 rounded-lg" />
            </div>
            <div className="h-10 sm:h-11 w-40 bg-muted/60 rounded-full" />
          </div>

          {/* Tabs skeleton */}
          <div className="grid w-full grid-cols-2 mb-6 sm:mb-8 h-auto gap-2">
            <div className="h-10 bg-muted/60 rounded-full" />
            <div className="h-10 bg-muted/40 rounded-full" />
          </div>

          {/* Cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="relative overflow-hidden rounded-2xl p-6 shadow-xl bg-gradient-to-br from-muted/80 via-muted/60 to-muted/40"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="w-12 h-12 bg-background/30 rounded-xl" />
                  <div className="w-8 h-8 bg-background/20 rounded-full" />
                </div>
                <div className="h-5 w-32 bg-background/40 rounded-lg mb-2" />
                <div className="h-4 w-24 bg-background/30 rounded-lg mb-6" />
                <div className="h-3 w-full bg-background/20 rounded-full mb-2" />
                <div className="h-2 w-3/4 bg-background/30 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-full">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2 lg:mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
              Cartões de Crédito
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
              Gerencie seus cartões e do parceiro
              {monthLabel && billingYear && (
                <span className="block text-xs sm:text-sm mt-1">
                  Fatura referente a {monthLabel} / {billingYear}
                </span>
              )}
            </p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar cartão
          </Button>
        </div>

        {isLoading && cards.length > 0 && (
          <p className="text-sm text-muted-foreground mb-4">
            Atualizando cartões...
          </p>
        )}
        {error && <p className="text-sm text-destructive mb-4">{error}</p>}

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "you" | "partner")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-6 sm:mb-8 h-auto">
            <TabsTrigger
              value="you"
              className="text-sm sm:text-base py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <span className="hidden sm:inline">Seus cartões</span>
              <span className="sm:hidden">Seus</span>
              <span className="ml-1">({youCards.length})</span>
            </TabsTrigger>
            <TabsTrigger
              value="partner"
              className="text-sm sm:text-base py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <span className="hidden sm:inline">Parceiro</span>
              <span className="sm:hidden">Parceiro</span>
              <span className="ml-1">({partnerCards.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="you">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {youCards.map((card) => (
                <CardComponent
                  key={card.id}
                  card={card}
                  onDelete={handleDeleteClick}
                  billingMonthLabel={monthLabel}
                  billingYear={billingYear ?? undefined}
                />
              ))}

              {!isLoading && youCards.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Você ainda não cadastrou nenhum cartão.
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="partner">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {partnerCards.map((card) => (
                <CardComponent
                  key={card.id}
                  card={card}
                  onDelete={handleDeleteClick}
                  billingMonthLabel={monthLabel}
                  billingYear={billingYear ?? undefined}
                />
              ))}

              {!isLoading && partnerCards.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhum cartão do parceiro cadastrado.
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <AddCardModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSaved={fetchCards}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Excluir cartão
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Tem certeza que deseja excluir este cartão? Se ele tiver despesas
              vinculadas, a exclusão não será permitida.
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
