"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Target, Plus, Trash2 } from "lucide-react";
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

/* ===================== TYPES ===================== */

type GoalDTO = {
  id: string;
  name: string;
  description?: string | null;
  target: number;
  current: number;
  deadline: string;
  monthlyContribution: number;
  progress: number;
  isCompleted: boolean;
};

/* ===================== DATE HELPERS ===================== */

const createDateFromISO = (iso: string | null | undefined) => {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

/* ===================== PAGE ===================== */

export default function MetasPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goals, setGoals] = useState<GoalDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [goalToDeleteId, setGoalToDeleteId] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    if (!API_URL) return;

    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch(`${API_URL}/goals`, {
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Erro ao carregar metas.");
      }

      setGoals(data.goals ?? []);
    } catch (err: any) {
      const msg = err.message ?? "Erro inesperado ao carregar metas.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!goalToDeleteId || !API_URL) return;

    try {
      toast.loading("Excluindo meta...", { id: "delete-goal" });

      const res = await fetch(`${API_URL}/goals/${goalToDeleteId}`, {
        method: "DELETE",
        credentials: "include",
      });

      toast.dismiss("delete-goal");

      if (!res.ok) throw new Error("Erro ao excluir.");

      toast.success("Meta excluída.");
      setGoals((prev) => prev.filter((g) => g.id !== goalToDeleteId));
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao excluir meta.");
    } finally {
      setDeleteDialogOpen(false);
      setGoalToDeleteId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-full">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">
              Metas Financeiras
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Acompanhe objetivos do casal
            </p>
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova meta
          </Button>
        </div>

        {/* Modal de criar meta */}
        <GoalModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          mode="create"
          onSaved={fetchGoals}
        />

        {/* ERROR */}
        {error && <p className="text-destructive mb-4">{error}</p>}

        {/* GRID */}
        {isLoading ? (
          <GoalsSkeleton />
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {goals.map((goal) => {
              const progress =
                goal.target > 0 ? (goal.current / goal.target) * 100 : 0;

              return (
                <Link key={goal.id} href={`/dashboard/metas/${goal.id}`}>
                  <div className="bg-card/80 border border-border/20 rounded-2xl p-6 hover:scale-[1.02] hover:border-primary/40 transition-all cursor-pointer">
                    <div className="flex justify-between items-start mb-4">
                      <Target className="text-primary w-5 h-5" />
                      <button
                        className="p-1 rounded-md hover:bg-destructive/10"
                        onClick={(e) => {
                          e.preventDefault();
                          setGoalToDeleteId(goal.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-500" />
                      </button>
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold mb-1">
                      {goal.name}
                    </h3>

                    <p className="text-primary font-bold text-2xl">
                      R$ {goal.current.toLocaleString("pt-BR")}
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      / R$ {goal.target.toLocaleString("pt-BR")}
                    </p>

                    <div className="mt-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-medium">
                          {progress.toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-2 bg-primary rounded-full transition-all"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-sm mt-4 text-muted-foreground">
                      Prazo:{" "}
                      {createDateFromISO(goal.deadline)?.toLocaleDateString(
                        "pt-BR"
                      )}
                    </p>

                    {progress >= 100 && (
                      <div className="mt-3 text-center text-primary font-semibold">
                        🎉 Meta alcançada!
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}

            {!isLoading && goals.length === 0 && !error && (
              <div className="col-span-full text-sm text-muted-foreground">
                Nenhuma meta cadastrada ainda. Clique em{" "}
                <span className="font-semibold">“Nova meta”</span> para criar a
                primeira.
              </div>
            )}
          </div>
        )}
      </div>

      {/* DELETE ALERT */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir meta</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}

/* ===================== SKELETON ===================== */

function GoalsSkeleton() {
  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="relative p-6 rounded-2xl bg-card/60 backdrop-blur-xl border border-border/20 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-muted/40 via-muted/20 to-muted/40 animate-pulse" />
          <div className="relative space-y-4">
            <div className="h-5 w-24 bg-muted/60 rounded-full" />
            <div className="h-8 w-32 bg-muted/70 rounded-full" />
            <div className="h-2 w-full bg-muted/50 rounded-full" />
            <div className="h-3 w-20 bg-muted/50 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
