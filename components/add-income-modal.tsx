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

interface AddIncomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function AddIncomeModal({
  open,
  onOpenChange,
  editData,
  onSaved,
}: AddIncomeModalProps) {
  const [formData, setFormData] = useState({
    value: "",
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    receivedBy: "voce",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

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
        receivedBy:
          editData.receivedBy === "Você"
            ? "voce"
            : editData.receivedBy === "Parceiro"
            ? "parceiro"
            : "compartilhado",
      });
    } else {
      setFormData({
        value: "",
        category: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        receivedBy: "voce",
      });
    }
  }, [editData, open]);

  const handleValueChange = (raw: string) => {
    const formatted = formatCurrencyInput(raw);
    setFormData((prev) => ({ ...prev, value: formatted }));
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

    const payload = {
      value: numericValue,
      category: formData.category.trim(),
      description: formData.description.trim(),
      date: formData.date,
      receivedBy: formData.receivedBy as
        | "voce"
        | "parceiro"
        | "compartilhado",
    };

    const isEdit = !!editData?.id;
    const url = isEdit
      ? `${API_URL}/transactions/incomes/${editData.id}`
      : `${API_URL}/transactions/incomes`;
    const method = isEdit ? "PUT" : "POST";

    const toastId = isEdit ? "update-income" : "create-income";

    try {
      setIsSubmitting(true);
      toast.loading(isEdit ? "Atualizando receita..." : "Salvando receita...", {
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
        toast.error(data?.message ?? "Erro ao salvar receita.");
        return;
      }

      toast.success(
        data?.message ??
          (isEdit
            ? "Receita atualizada com sucesso."
            : "Receita adicionada com sucesso.")
      );

      onSaved?.();
      onOpenChange(false);
    } catch (err) {
      console.error("[AddIncomeModal] Erro ao salvar receita:", err);
      toast.dismiss(toastId);
      toast.error("Erro inesperado ao salvar receita. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border/20 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            {editData ? "Editar receita" : "Adicionar receita"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="valor-receita" className="text-foreground">
              Valor (R$)
            </Label>
            <Input
              id="valor-receita"
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={formData.value}
              onChange={(e) => handleValueChange(e.target.value)}
              className="bg-input border-border/20 text-lg h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria-receita" className="text-foreground">
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
                <SelectItem value="Salário">Salário</SelectItem>
                <SelectItem value="Freelance">Freelance</SelectItem>
                <SelectItem value="Investimentos">Investimentos</SelectItem>
                <SelectItem value="Bônus">Bônus</SelectItem>
                <SelectItem value="Aluguel">Aluguel</SelectItem>
                <SelectItem value="Outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao-receita" className="text-foreground">
              Descrição (opcional)
            </Label>
            <Input
              id="descricao-receita"
              type="text"
              placeholder="Ex: Salário mensal"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="bg-input border-border/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="data-receita" className="text-foreground">
              Data
            </Label>
            <Input
              id="data-receita"
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="bg-input border-border/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recebedor" className="text-foreground">
              De quem é a receita
            </Label>
            <Select
              value={formData.receivedBy}
              onValueChange={(v) => setFormData({ ...formData, receivedBy: v })}
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
