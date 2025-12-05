"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/* =============== TYPES =============== */

type GoalFormInitialValues = {
  name?: string;
  description?: string | null;
  target?: number;
  monthlyContribution?: number;
  deadline?: string; // yyyy-MM-dd
};

type GoalModalMode = "create" | "edit";

interface GoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: GoalModalMode;
  goalId?: string; // obrigatório em edit
  initialValues?: GoalFormInitialValues;
  onSaved?: () => void; // callback pra recarregar lista/detalhe
}

/* =============== HELPERS =============== */

// hoje no formato local yyyy-MM-dd
const getTodayLocalISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
};

// formata para "3.000,00" a partir de um número
const formatNumberToPtBR = (value: number) =>
  value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// recebe o texto digitado, mantém só dígitos e devolve string formatada "3.000,00"
const formatCurrencyInput = (raw: string) => {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  const int = parseInt(digits, 10);
  const float = int / 100;
  return formatNumberToPtBR(float);
};

// converte "3.000,00" -> 3000 (number)
const parseCurrencyToNumber = (value: string): number => {
  if (!value) return 0;
  const normalized = value.replace(/\./g, "").replace(",", ".");
  const num = Number(normalized);
  return Number.isNaN(num) ? 0 : num;
};

/* =============== COMPONENTE =============== */

export function GoalModal({
  open,
  onOpenChange,
  mode,
  goalId,
  initialValues,
  onSaved,
}: GoalModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    target: "", // "1.200,00"
    monthlyContribution: "",
    deadline: getTodayLocalISO(),
  });

  // sempre que abrir o modal, popula o formulário
  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && initialValues) {
      setForm({
        name: initialValues.name ?? "",
        description: initialValues.description ?? "",
        target:
          typeof initialValues.target === "number"
            ? formatNumberToPtBR(initialValues.target)
            : "",
        monthlyContribution:
          typeof initialValues.monthlyContribution === "number"
            ? formatNumberToPtBR(initialValues.monthlyContribution)
            : "",
        deadline: initialValues.deadline ?? getTodayLocalISO(),
      });
    } else {
      // create
      setForm({
        name: "",
        description: "",
        target: "",
        monthlyContribution: "",
        deadline: getTodayLocalISO(),
      });
    }
  }, [open, mode, initialValues]);

  const handleSave = async () => {
    if (!API_URL) {
      toast.error("Erro de configuração da API.");
      return;
    }

    const name = form.name.trim();
    if (!name) {
      toast.error("Informe o nome da meta.");
      return;
    }

    const targetNumber = parseCurrencyToNumber(form.target);
    if (!targetNumber || targetNumber <= 0) {
      toast.error("Informe um valor de meta válido maior que zero.");
      return;
    }

    const monthlyNumber = parseCurrencyToNumber(form.monthlyContribution);
    if (!Number.isFinite(monthlyNumber) || monthlyNumber < 0) {
      toast.error("Informe uma contribuição mensal válida (zero ou maior).");
      return;
    }

    if (!form.deadline) {
      toast.error("Informe o prazo final da meta.");
      return;
    }

    const payload = {
      name,
      description: form.description.trim() || undefined,
      target: targetNumber,
      monthlyContribution: monthlyNumber,
      deadline: form.deadline,
    };

    const isEdit = mode === "edit";
    if (isEdit && !goalId) {
      console.error("[GoalModal] goalId é obrigatório no modo edit");
      toast.error("Erro interno ao editar meta.");
      return;
    }

    const url = isEdit ? `${API_URL}/goals/${goalId}` : `${API_URL}/goals`;
    const method = isEdit ? "PUT" : "POST";
    const toastId = isEdit ? "update-goal" : "create-goal";

    try {
      setIsSubmitting(true);
      toast.loading(
        isEdit ? "Atualizando meta..." : "Criando meta...",
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
            (isEdit ? "Erro ao atualizar meta." : "Erro ao criar meta.")
        );
        return;
      }

      toast.success(
        data?.message ??
          (isEdit
            ? "Meta atualizada com sucesso."
            : "Meta criada com sucesso!")
      );

      onSaved?.();
      onOpenChange(false);
    } catch (err) {
      console.error("[GoalModal] Erro ao salvar meta:", err);
      toast.dismiss(toastId);
      toast.error("Erro inesperado ao salvar meta. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          // ao fechar, apenas dispara onOpenChange; o useEffect já reseta quando abrir
        }
        onOpenChange(value);
      }}
    >
      <DialogContent className="bg-card border-border/20 max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            {mode === "edit" ? "Editar meta" : "Nova meta"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-foreground">Nome da meta</Label>
            <Input
              type="text"
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
              className="bg-input border-border/20"
              placeholder="Ex: Viagem para Europa"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Descrição</Label>
            <Input
              type="text"
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              className="bg-input border-border/20"
              placeholder="Detalhes da meta"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Valor da meta (R$)</Label>
            <Input
              type="text"
              inputMode="decimal"
              value={form.target}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  target: formatCurrencyInput(e.target.value),
                }))
              }
              className="bg-input border-border/20"
              placeholder="10.000,00"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Contribuição mensal (R$)</Label>
            <Input
              type="text"
              inputMode="decimal"
              value={form.monthlyContribution}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  monthlyContribution: formatCurrencyInput(e.target.value),
                }))
              }
              className="bg-input border-border/20"
              placeholder="1.200,00"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Prazo final</Label>
            <Input
              type="date"
              value={form.deadline}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, deadline: e.target.value }))
              }
              className="bg-input border-border/20"
            />
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
              ? mode === "edit"
                ? "Atualizando..."
                : "Salvando..."
              : mode === "edit"
              ? "Salvar alterações"
              : "Criar meta"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
