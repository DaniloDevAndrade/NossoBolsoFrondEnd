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
import { toast } from "sonner";

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

interface AddCardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: {
    id: string;
    name: string;
    institution: CreditCardInstitution; // enum vindo do backend
    lastDigits: string;
    limit: number;
    dueDay: number;
    closingDay: number | null;
    owner: CardOwnerLabel;
  };
  onSaved?: () => void;
}

// opções alinhadas com o enum do Prisma / backend
const bankOptions = [
  { label: "Nubank", value: "NUBANK" },
  { label: "Inter", value: "INTER" },
  { label: "Itaú", value: "ITAU" },
  { label: "Banco do Brasil", value: "BANCO_DO_BRASIL" },
  { label: "Bradesco", value: "BRADESCO" },
  { label: "Santander", value: "SANTANDER" },
  { label: "Caixa", value: "CAIXA" },
  { label: "BTG Pactual", value: "BTG_PACTUAL" },
  { label: "C6 Bank", value: "C6_BANK" },
  { label: "PagBank", value: "PAGBANK" },
  { label: "Outros", value: "OUTROS" },
];

// máscara de moeda pt-BR para input (ex: "3000" -> "3.000,00")
function formatCurrencyInput(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  const number = Number(digits) / 100;
  return number.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function AddCardModal({
  open,
  onOpenChange,
  editData,
  onSaved,
}: AddCardModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    institution: "" as "" | CreditCardInstitution,
    lastDigits: "",
    limit: "",
    dueDay: "",
    closingDay: "",
    owner: "voce" as "voce" | "parceiro",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editData) {
      let owner: "voce" | "parceiro" = "voce";
      if (editData.owner === "Parceiro") owner = "parceiro";

      setFormData({
        name: editData.name ?? "",
        institution: editData.institution ?? "",
        lastDigits: editData.lastDigits ?? "",
        limit:
          editData.limit?.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }) ?? "",
        dueDay: editData.dueDay?.toString() ?? "",
        closingDay:
          editData.closingDay != null
            ? editData.closingDay.toString()
            : "",
        owner,
      });
    } else if (open) {
      setFormData({
        name: "",
        institution: "",
        lastDigits: "",
        limit: "",
        dueDay: "",
        closingDay: "",
        owner: "voce",
      });
    }
  }, [editData, open]);

  const handleSave = async () => {
    if (!API_URL) {
      toast.error("Erro de configuração da API.");
      return;
    }

    const name = formData.name.trim();
    if (!name) {
      toast.error("Informe o nome do cartão.");
      return;
    }

    const institution = formData.institution;
    if (!institution) {
      toast.error("Selecione a instituição financeira.");
      return;
    }

    const lastDigits = formData.lastDigits.trim();
    if (!/^\d{4}$/.test(lastDigits)) {
      toast.error("Informe os 4 últimos dígitos do cartão.");
      return;
    }

    const limitStr = formData.limit.trim();
    if (!limitStr) {
      toast.error("Informe o limite do cartão.");
      return;
    }

    const normalizedLimit = limitStr.replace(/\./g, "").replace(",", ".");
    const numericLimit = Number(normalizedLimit);
    if (!numericLimit || numericLimit <= 0) {
      toast.error("Informe um limite válido maior que zero.");
      return;
    }

    const dueDayStr = formData.dueDay.trim();
    const dueDay = Number(dueDayStr);
    if (!dueDayStr || !Number.isInteger(dueDay) || dueDay < 1 || dueDay > 31) {
      toast.error("Informe um dia de vencimento entre 1 e 31.");
      return;
    }

    const closingDayStr = formData.closingDay.trim();
    const closingDay = Number(closingDayStr);
    if (
      !closingDayStr ||
      !Number.isInteger(closingDay) ||
      closingDay < 1 ||
      closingDay > 31
    ) {
      toast.error("Informe um dia de fechamento entre 1 e 31.");
      return;
    }

    const payload = {
      name,
      institution, // ENUM: ex "BANCO_DO_BRASIL"
      lastDigits,
      limit: numericLimit,
      dueDay,
      closingDay,
      owner: formData.owner, // "voce" | "parceiro"
    };

    const isEdit = !!editData?.id;
    const url = isEdit
      ? `${API_URL}/credit-cards/${editData!.id}`
      : `${API_URL}/credit-cards`;
    const method = isEdit ? "PUT" : "POST";
    const toastId = isEdit ? "update-card" : "create-card";

    try {
      setIsSubmitting(true);
      toast.loading(isEdit ? "Atualizando cartão..." : "Salvando cartão...", {
        id: toastId,
      });

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      toast.dismiss(toastId);

      if (!res.ok) {
        toast.error(data?.message ?? "Erro ao salvar cartão.");
        return;
      }

      toast.success(
        data?.message ??
          (isEdit
            ? "Cartão atualizado com sucesso."
            : "Cartão adicionado com sucesso.")
      );

      onSaved?.();
      onOpenChange(false);
    } catch (err) {
      console.error("[AddCardModal] Erro ao salvar cartão:", err);
      toast.dismiss(toastId);
      toast.error("Erro inesperado ao salvar cartão. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border/20 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            {editData ? "Editar cartão" : "Adicionar cartão"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Nome do Cartão */}
          <div className="space-y-2">
            <Label htmlFor="card-name" className="text-foreground">
              Nome do cartão
            </Label>
            <Input
              id="card-name"
              type="text"
              placeholder="Ex: Cartão Principal"
              className="bg-input border-border/20 h-12"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>

          {/* Instituição */}
          <div className="space-y-2">
            <Label htmlFor="bank" className="text-foreground">
              Instituição financeira
            </Label>
            <Select
              value={formData.institution}
              onValueChange={(v) =>
                setFormData((prev) => ({
                  ...prev,
                  institution: v as CreditCardInstitution,
                }))
              }
            >
              <SelectTrigger className="bg-input border-border/20 h-12">
                <SelectValue placeholder="Selecione o banco" />
              </SelectTrigger>
              <SelectContent>
                {bankOptions.map((bank) => (
                  <SelectItem key={bank.value} value={bank.value}>
                    {bank.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Últimos dígitos */}
          <div className="space-y-2">
            <Label htmlFor="last-digits" className="text-foreground">
              Últimos 4 dígitos
            </Label>
            <Input
              id="last-digits"
              type="text"
              maxLength={4}
              placeholder="1234"
              className="bg-input border-border/20 h-12"
              value={formData.lastDigits}
              onChange={(e) => {
                const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 4);
                setFormData((prev) => ({ ...prev, lastDigits: onlyDigits }));
              }}
            />
          </div>

          {/* Limite com máscara */}
          <div className="space-y-2">
            <Label htmlFor="limit" className="text-foreground">
              Limite (R$)
            </Label>
            <Input
              id="limit"
              type="text"
              inputMode="decimal"
              placeholder="5.000,00"
              className="bg-input border-border/20 h-12"
              value={formData.limit}
              onChange={(e) => {
                const formatted = formatCurrencyInput(e.target.value);
                setFormData((prev) => ({ ...prev, limit: formatted }));
              }}
            />
          </div>

          {/* Dia de vencimento */}
          <div className="space-y-2">
            <Label htmlFor="due-date" className="text-foreground">
              Dia de vencimento
            </Label>
            <Input
              id="due-date"
              type="number"
              min={1}
              max={31}
              placeholder="15"
              className="bg-input border-border/20 h-12"
              value={formData.dueDay}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, dueDay: e.target.value }))
              }
            />
          </div>

          {/* Dia de fechamento */}
          <div className="space-y-2">
            <Label htmlFor="closing-date" className="text-foreground">
              Dia de fechamento
            </Label>
            <Input
              id="closing-date"
              type="number"
              min={1}
              max={31}
              placeholder="10"
              className="bg-input border-border/20 h-12"
              value={formData.closingDay}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  closingDay: e.target.value,
                }))
              }
            />
          </div>

          {/* Proprietário */}
          <div className="space-y-2">
            <Label htmlFor="owner" className="text-foreground">
              Proprietário
            </Label>
            <Select
              value={formData.owner}
              onValueChange={(v) =>
                setFormData((prev) => ({
                  ...prev,
                  owner: v as "voce" | "parceiro",
                }))
              }
            >
              <SelectTrigger className="bg-input border-border/20 h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="voce">Você</SelectItem>
                <SelectItem value="parceiro">Parceiro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Actions */}
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
