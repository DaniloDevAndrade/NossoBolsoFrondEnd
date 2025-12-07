"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface AddExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedCardId?: string;
  editData?: any;
  onSaved?: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

type CardOwner = "you" | "partner";

type CreditCardOption = {
  id: string;
  name: string;
  lastDigits: string;
  owner: CardOwner;
};

/**
 * Agora só nos importamos com o TOTAL de parcelas.
 * Ex: "3/10" -> 10
 */
const parseInstallmentString = (installment?: string | null): number => {
  if (!installment) return 1;
  const parts = installment.split("/");
  const totStr = parts.length === 2 ? parts[1] : parts[0];
  const tot = Number(totStr);
  if (!Number.isFinite(tot) || tot < 1) return 1;
  return tot;
};

export function AddExpenseModal({
  open,
  onOpenChange,
  preselectedCardId,
  editData,
  onSaved,
}: AddExpenseModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<"dinheiro" | "cartao">(
    "dinheiro"
  );
  const [selectedCard, setSelectedCard] = useState<string>(
    preselectedCardId || ""
  );

  const [isInstallment, setIsInstallment] = useState(false);
  const [installments, setInstallments] = useState("1");

  const [editScope, setEditScope] = useState<"single" | "all">("all");

  const [formData, setFormData] = useState({
    value: "",
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    paidBy: "voce",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [cards, setCards] = useState<CreditCardOption[]>([]);
  const [cardsLoading, setCardsLoading] = useState(false);

  useEffect(() => {
    const fetchCards = async () => {
      if (!API_URL || !open) return;

      try {
        setCardsLoading(true);
        const res = await fetch(`${API_URL}/credit-cards`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          const msg = data?.message ?? "Erro ao carregar cartões.";
          throw new Error(msg);
        }

        const apiCards: any[] = data.cards ?? [];

        const options: CreditCardOption[] = apiCards.map((card) => ({
          id: card.id,
          name: card.name,
          lastDigits: card.lastDigits,
          owner: card.owner === "Você" ? "you" : "partner",
        }));

        setCards(options);
      } catch (err: any) {
        console.error("[AddExpenseModal] Erro ao buscar cartões:", err);
        toast.error(err.message ?? "Erro ao carregar cartões.");
      } finally {
        setCardsLoading(false);
      }
    };

    fetchCards();
  }, [open]);

  useEffect(() => {
    if (!editData && preselectedCardId) {
      setSelectedCard(preselectedCardId);
      setPaymentMethod("cartao");
    }
  }, [preselectedCardId, editData]);

  useEffect(() => {
    if (editData) {
      const numericValue =
        typeof editData.value === "number"
          ? editData.value
          : Number(String(editData.value).replace(/\./g, "").replace(",", "."));

      setFormData({
        value: numericValue ? formatNumberToPtBR(numericValue) : "",
        category: editData.category || "",
        description: editData.description || "",
        date: editData.date || new Date().toISOString().split("T")[0],
        paidBy: editData.paidBy === "Você" ? "voce" : "parceiro",
      });

      if (editData.paymentMethod === "card") {
        setPaymentMethod("cartao");
        if (editData.cardId) {
          setSelectedCard(String(editData.cardId));
        } else {
          setSelectedCard("");
        }

        let totalInstallments = 1;

        if (
          typeof editData.installments === "number" &&
          editData.installments > 1
        ) {
          totalInstallments = editData.installments;
        } else if (typeof editData.installment === "string") {
          totalInstallments = parseInstallmentString(editData.installment);
        }

        if (totalInstallments > 1) {
          setIsInstallment(true);
          setInstallments(String(totalInstallments));
        } else {
          setIsInstallment(false);
          setInstallments("1");
        }
      } else {
        setPaymentMethod("dinheiro");
        setSelectedCard("");
        setIsInstallment(false);
        setInstallments("1");
      }

      setEditScope("all");
    } else if (open) {
      setFormData({
        value: "",
        category: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        paidBy: "voce",
      });

      setIsInstallment(false);
      setInstallments("1");
      setEditScope("all");

      if (preselectedCardId) {
        setPaymentMethod("cartao");
        setSelectedCard(preselectedCardId);
      } else {
        setPaymentMethod("dinheiro");
        setSelectedCard("");
      }
    }
  }, [editData, preselectedCardId, open]);

  const handleValueChange = (raw: string) => {
    const formatted = formatCurrencyInput(raw);
    setFormData((prev) => ({ ...prev, value: formatted }));
  };

  const handleInstallmentsChange = (value: string) => {
    if (value === "") {
      setInstallments("");
      return;
    }

    let total = Number(value);

    if (!Number.isFinite(total)) {
      return;
    }

    if (total < 1) total = 1;

    setInstallments(String(total));
  };

  const handleSave = async () => {
    if (!API_URL) {
      toast.error("Erro de configuração da API.");
      return;
    }

    const numericValue = parseCurrencyToNumber(formData.value);

    if (!numericValue || numericValue <= 0) {
      toast.error("Informe um valor válido maior que zero.");
      return;
    }

    if (!formData.category) {
      toast.error("Selecione uma categoria.");
      return;
    }

    if (!formData.date) {
      toast.error("Informe a data.");
      return;
    }

    if (paymentMethod === "cartao" && !selectedCard) {
      toast.error("Selecione um cartão para pagamento no crédito.");
      return;
    }

    let total = 1;

    if (paymentMethod === "cartao" && isInstallment) {
      total = Number(installments);
      if (!Number.isFinite(total) || total < 1) {
        toast.error("Número de parcelas deve ser pelo menos 1.");
        return;
      }
    } else {
      total = 1;
    }

    const isEdit = !!editData?.id;

    let apiValue = numericValue;

    const isCreditInstallment =
      !isEdit && paymentMethod === "cartao" && total > 1;

    // Se for uma nova compra parcelada, manda o valor total para o backend
    if (isCreditInstallment) {
      apiValue = numericValue * total;
    }

    const payload: any = {
      value: apiValue,
      category: formData.category.trim(),
      description: formData.description.trim(),
      date: formData.date,
      paidBy: formData.paidBy as "voce" | "parceiro",
      splitType: "customizada",
      customSplit: {
        you: 100,
        partner: 0,
      },
      paymentMethod,
    };

    if (paymentMethod === "cartao") {
      payload.creditCardId = selectedCard;
      payload.installments = total;
      // NÃO enviamos mais currentInstallment
    }

    const url = isEdit
      ? `${API_URL}/transactions/expenses/${editData.id}`
      : `${API_URL}/transactions/expenses`;
    const method = isEdit ? "PUT" : "POST";

    const isParcelledFromBackend =
      !!editData &&
      editData.paymentMethod === "card" &&
      (editData.installments ?? 1) > 1;

    if (isEdit && isParcelledFromBackend) {
      payload.scope = editScope;
    }

    const toastId = isEdit ? "update-expense" : "create-expense";

    try {
      setIsSubmitting(true);
      toast.loading(isEdit ? "Atualizando despesa..." : "Salvando despesa...", {
        id: toastId,
      });

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      toast.dismiss(toastId);

      if (!res.ok) {
        toast.error(data?.message ?? "Erro ao salvar despesa.");
        return;
      }

      toast.success(
        data?.message ??
          (isEdit
            ? "Despesa atualizada com sucesso."
            : "Despesa adicionada com sucesso.")
      );

      onSaved?.();
      onOpenChange(false);
    } catch (err) {
      console.error("[AddExpenseModal] Erro ao salvar despesa:", err);
      toast.dismiss(toastId);
      toast.error("Erro inesperado ao salvar despesa. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const installmentValue = parseCurrencyToNumber(formData.value);
  const totalInstallments =
    paymentMethod === "cartao"
      ? isInstallment
        ? Number(installments) || 1
        : 1
      : 1;
  const totalPurchaseValue =
    totalInstallments > 1 ? installmentValue * totalInstallments : installmentValue;
  const showInstallmentInfo =
    paymentMethod === "cartao" &&
    totalInstallments > 1 &&
    installmentValue > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border/20 max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            {editData ? "Editar despesa" : "Adicionar despesa"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="valor" className="text-foreground">
              Valor da parcela (R$)
            </Label>
            <Input
              id="valor"
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={formData.value}
              onChange={(e) => handleValueChange(e.target.value)}
              className="bg-input border-border/20 text-lg h-12"
            />
            {showInstallmentInfo && (
              <p className="text-xs text-muted-foreground">
                Valor total da compra: R{"$ "}
                {formatNumberToPtBR(totalPurchaseValue)} ({totalInstallments}x
                de {formatNumberToPtBR(installmentValue)})
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria" className="text-foreground">
              Categoria
            </Label>
            <Select
              value={formData.category}
              onValueChange={(v) => setFormData({ ...formData, category: v })}
            >
              <SelectTrigger className="bg-input border-border/20 h-12">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mercado">Mercado</SelectItem>
                <SelectItem value="Contas">Contas</SelectItem>
                <SelectItem value="Alimentação">Alimentação</SelectItem>
                <SelectItem value="Transporte">Transporte</SelectItem>
                <SelectItem value="Saúde">Saúde</SelectItem>
                <SelectItem value="Entretenimento">Entretenimento</SelectItem>
                <SelectItem value="Outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao" className="text-foreground">
              Descrição (opcional)
            </Label>
            <Input
              id="descricao"
              type="text"
              placeholder="Ex: Supermercado Extra"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="bg-input border-border/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="data" className="text-foreground">
              Data da compra
            </Label>
            <Input
              id="data"
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="bg-input border-border/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pagador" className="text-foreground">
              Quem pagou (no cartão / à vista)
            </Label>
            <Select
              value={formData.paidBy}
              onValueChange={(v) => setFormData({ ...formData, paidBy: v })}
            >
              <SelectTrigger className="bg-input border-border/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="voce">Você</SelectItem>
                <SelectItem value="parceiro">Parceiro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-method" className="text-foreground">
              Forma de pagamento
            </Label>
            <Select
              value={paymentMethod}
              onValueChange={(v) =>
                setPaymentMethod(v as "dinheiro" | "cartao")
              }
            >
              <SelectTrigger className="bg-input border-border/20 h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dinheiro">
                  Dinheiro / Débito / PIX
                </SelectItem>
                <SelectItem value="cartao">Cartão de Crédito</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {paymentMethod === "cartao" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="card" className="text-foreground">
                  Cartão de crédito
                </Label>
                <Select value={selectedCard} onValueChange={setSelectedCard}>
                  <SelectTrigger className="bg-input border-border/20 h-12">
                    <SelectValue
                      placeholder={
                        cardsLoading
                          ? "Carregando cartões..."
                          : "Selecione um cartão"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                      Seus cartões
                    </div>
                    {cards
                      .filter((card) => card.owner === "you")
                      .map((card) => (
                        <SelectItem key={card.id} value={card.id}>
                          {card.name} •••• {card.lastDigits}
                        </SelectItem>
                      ))}
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
                      Parceiro
                    </div>
                    {cards
                      .filter((card) => card.owner === "partner")
                      .map((card) => (
                        <SelectItem key={card.id} value={card.id}>
                          {card.name} •••• {card.lastDigits}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="installment-toggle"
                    className="text-foreground"
                  >
                    Parcelar compra
                  </Label>
                  <Switch
                    id="installment-toggle"
                    checked={isInstallment}
                    onCheckedChange={setIsInstallment}
                  />
                </div>

                {isInstallment && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="installments"
                        className="text-foreground text-sm"
                      >
                        Número total de parcelas
                      </Label>
                      <Input
                        id="installments"
                        type="number"
                        min={1}
                        step={1}
                        value={installments}
                        onChange={(e) =>
                          handleInstallmentsChange(e.target.value)
                        }
                        className="bg-input border-border/20"
                      />
                    </div>

                    {editData && Number(installments) > 1 && (
                      <div className="space-y-2">
                        <Label className="text-foreground text-sm">
                          Aplicar alterações em
                        </Label>
                        <Select
                          value={editScope}
                          onValueChange={(v) =>
                            setEditScope(v as "single" | "all")
                          }
                        >
                          <SelectTrigger className="bg-input border-border/20 h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">
                              Todas as parcelas desta compra
                            </SelectItem>
                            <SelectItem value="single">
                              Apenas esta parcela
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 border-border/50"
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? editData
                ? "Atualizando..."
                : "Salvando..."
              : editData
              ? "Atualizar"
              : "Salvar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
