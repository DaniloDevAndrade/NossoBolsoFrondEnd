"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Users,
  Phone,
  Mail,
  CheckCircle,
  UserPlus,
  UserMinus,
  AlertTriangle,
  User,
  Crown,
  LogOut,
  Save,
  Calendar,
  Trash2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type PartnerStatus = "connected" | "pending" | "none";

type PartnerCardProps = {
  status: PartnerStatus;
  onInvite: () => void;
  onRemove: () => void;
  setStatus: (status: PartnerStatus) => void;
  title?: string;
  partnerName?: string | null;
  partnerEmail?: string | null;
  partnerPhone?: string | null;
};

type MeResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  partner?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  } | null;
  partnerStatus?: PartnerStatus;
  trialEndsAt?: string | null;
};

function PartnerCard({
  status,
  onInvite,
  onRemove,
  setStatus,
  title,
  partnerName,
  partnerEmail,
  partnerPhone,
}: PartnerCardProps) {
  const displayName = partnerName ?? "Parceiro";
  const displayEmail = partnerEmail ?? "—";
  const displayPhone = partnerPhone ?? "—";

  return (
    <div className="w-full">
      {title && (
        <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">
          {title}
        </h2>
      )}

      {/* Connected Status */}
      {status === "connected" && (
        <div className="bg-card/80 backdrop-blur-sm border border-primary/20 rounded-2xl p-6 lg:p-8 shadow-[0_0_50px_rgba(0,255,127,0.05)]">
          {/* Status Badge */}
          <div className="flex items-center justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 border border-primary/30 rounded-full">
              <CheckCircle className="w-5 h-5 text-primary" />
              <span className="text-primary font-semibold">Conectado</span>
            </div>
          </div>

          {/* Partner Avatar */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-primary/20 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(0,255,127,0.2)]">
              <Users className="w-12 h-12 text-primary" />
            </div>
          </div>

          {/* Partner Info */}
          <div className="space-y-6">
            <div className="bg-secondary/30 rounded-xl p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground block mb-1">
                    Nome
                  </label>
                  <p className="text-lg font-semibold text-foreground">
                    {displayName}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <label className="text-sm text-muted-foreground block">
                      Telefone
                    </label>
                    <p className="text-foreground font-medium">
                      {displayPhone}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <label className="text-sm text-muted-foreground block">
                      Email
                    </label>
                    <p className="text-foreground font-medium">
                      {displayEmail}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats fake por enquanto
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-secondary/30 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-primary">R$ 1.170</p>
                <p className="text-sm text-muted-foreground">
                  Contribuição no mês
                </p>
              </div>
              <div className="bg-secondary/30 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-primary">48%</p>
                <p className="text-sm text-muted-foreground">Do total gasto</p>
              </div>
            </div> */}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full border-destructive/50 text-destructive hover:bg-destructive/10 bg-transparent"
                >
                  <UserMinus className="w-4 h-4 mr-2" />
                  Remover parceiro
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card border-border/20">
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    Remover parceiro?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação irá desconectar você do seu parceiro. Todas as
                    transações compartilhadas serão mantidas, mas você não
                    poderá mais gerenciar as finanças juntos. Esta ação não pode
                    ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-transparent border-border/50">
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onRemove}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Sim, remover
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}

      {/* Pending Status */}
      {status === "pending" && (
        <div className="bg-card/80 backdrop-blur-sm border border-border/20 rounded-2xl p-6 lg:p-8 text-center shadow-[0_0_30px_rgba(0,255,127,0.05)]">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted/30 border border-border/30 rounded-full mb-6">
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" />
            <span className="text-muted-foreground font-semibold">
              Aguardando aceitar convite
            </span>
          </div>
          <div className="w-24 h-24 bg-secondary/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Users className="w-12 h-12 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-6">
            O convite foi enviado para seu parceiro. Quando ele aceitar, vocês
            estarão conectados!
          </p>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full border-primary/50 text-primary bg-transparent"
              // TODO: integrar com endpoint de reenvio de convite se existir
            >
              Reenviar convite
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  Cancelar convite
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card border-border/20">
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancelar convite?</AlertDialogTitle>
                  <AlertDialogDescription>
                    O convite pendente será cancelado e seu parceiro não poderá
                    mais aceitar.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-transparent border-border/50">
                    Voltar
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => setStatus("none")}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Cancelar convite
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}

      {/* None Status */}
      {status === "none" && (
        <div className="bg-card/80 backdrop-blur-sm border border-border/20 rounded-2xl p-8 text-center shadow-[0_0_30px_rgba(0,255,127,0.05)]">
          <div className="w-24 h-24 bg-secondary/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Users className="w-12 h-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Nenhum parceiro conectado
          </h2>
          <p className="text-muted-foreground mb-6">
            Conecte-se com seu parceiro para começar a gerenciar as finanças
            juntos
          </p>
          <Button
            onClick={onInvite}
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(0,255,127,0.3)]"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Convidar parceiro
          </Button>
        </div>
      )}
    </div>
  );
}

export default function PerfilParceiroPage() {
  const router = useRouter();

  const [status, setStatus] = useState<PartnerStatus>("none");
  const [partnerName, setPartnerName] = useState<string | null>(null);
  const [partnerEmail, setPartnerEmail] = useState<string | null>(null);
  const [partnerPhone, setPartnerPhone] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
  });

  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDestroying, setIsDestroying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchMe = async () => {
      if (!API_URL) {
        console.error("NEXT_PUBLIC_API_URL não definido");
        setError("Erro de configuração. API URL não encontrada.");
        toast.error("Erro de configuração. API URL não encontrada.");
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/account/me`, {
          credentials: "include",
        });

        if (res.status === 401) {
          router.push("/login");
          return;
        }

        const data: MeResponse | null = await res.json().catch(() => null);

        if (!res.ok || !data) {
          const msg = (data as any)?.message || "Erro ao carregar dados.";
          throw new Error(msg);
        }

        // Preenche dados do usuário
        setFormData({
          nome: data.user.name,
          email: data.user.email,
          telefone: data.user.phone,
        });

        // Parceiro
        if (data.partner) {
          setPartnerName(data.partner.name);
          setPartnerEmail(data.partner.email);
          setPartnerPhone(data.partner.phone);
        } else {
          setPartnerName(null);
          setPartnerEmail(null);
          setPartnerPhone(null);
        }

        // Status vindo do backend
        const backendStatus: PartnerStatus | undefined = data.partnerStatus;
        if (backendStatus) {
          setStatus(backendStatus);
        } else {
          setStatus(data.partner ? "connected" : "none");
        }

        // Trial
        if (data.trialEndsAt) {
          const now = new Date();
          const end = new Date(data.trialEndsAt);
          const diffMs = end.getTime() - now.getTime();
          const diffDays = Math.max(
            0,
            Math.ceil(diffMs / (1000 * 60 * 60 * 24))
          );
          setTrialDaysLeft(diffDays);
        } else {
          setTrialDaysLeft(null);
        }

        setIsLoading(false);
      } catch (err: any) {
        console.error("[PerfilParceiroPage] Erro ao buscar /account/me", err);
        const msg = err?.message || "Erro ao carregar informações.";
        setError(msg);
        toast.error(msg);
        setIsLoading(false);
      }
    };

    fetchMe();
  }, [router]);

  const handleInvitePartner = () => {
    router.push("/onboarding");
  };

  const handleRemovePartner = async () => {
    if (!API_URL) {
      toast.error("Erro de configuração. API URL não encontrada.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/parther/disconnect`, {
        method: "POST",
        credentials: "include",
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      const body = await res.json().catch(() => null);

      if (!res.ok) {
        const msg =
          body?.message || "Erro ao desconectar parceiro. Tente novamente.";
        throw new Error(msg);
      }

      setStatus("none");
      setPartnerName(null);
      setPartnerEmail(null);
      setPartnerPhone(null);

      toast.success(body?.message || "Parceiro desconectado com sucesso.");
    } catch (err: any) {
      console.error("[PerfilParceiroPage] Erro ao desconectar parceiro", err);
      toast.error(err?.message || "Erro ao desconectar parceiro.");
    }
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!API_URL) {
      toast.error("Erro de configuração. API URL não encontrada.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/account/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: formData.nome,
          email: formData.email,
        }),
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      const body = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = body?.message || "Erro ao salvar perfil";
        throw new Error(msg);
      }

      setIsEditing(false);
      toast.success(body?.message || "Perfil atualizado com sucesso.");
    } catch (err: any) {
      console.error("[PerfilParceiroPage] Erro ao salvar perfil", err);
      toast.error(err?.message || "Erro ao salvar perfil.");
    }
  };

  const handleLogout = async () => {
    if (!API_URL) {
      toast.error("Erro de configuração. API URL não encontrada.");
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/logout`, {
        method: "GET",
        credentials: "include",
      });

      const body = await res.json().catch(() => null);

      if (res.status === 401) {
        toast.error("Sua sessão já havia expirado. Faça login novamente.");
        router.push("/login");
        return;
      }

      if (!res.ok) {
        const msg =
          body?.message ||
          "Não foi possível encerrar a sessão corretamente, mas você será redirecionado.";
        toast.error(msg);
      } else {
        toast.success(body?.message || "Você saiu da sua conta.");
      }
    } catch (err) {
      console.error("[PerfilParceiroPage] Erro ao deslogar", err);
      toast.error(
        "Ocorreu um erro ao sair da conta. Você será redirecionado para o login."
      );
    } finally {
      router.push("/login");
    }
  };

  const handleDestroyAccount = async () => {
    if (!API_URL) {
      toast.error("Erro de configuração. API URL não encontrada.");
      return;
    }

    try {
      setIsDestroying(true);
      toast.loading("Destruindo sua conta e dados...", {
        id: "destroy-account",
      });

      const res = await fetch(`${API_URL}/account/destroy`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.status === 401) {
        toast.dismiss("destroy-account");
        toast.error("Sua sessão expirou. Faça login novamente.");
        router.push("/login");
        return;
      }

      const body = await res.json().catch(() => null);

      toast.dismiss("destroy-account");

      if (!res.ok) {
        const msg =
          body?.message ||
          "Não foi possível destruir sua conta. Tente novamente.";
        toast.error(msg);
        return;
      }

      toast.success(
        body?.message || "Sua conta e seus dados foram destruídos com sucesso."
      );

      router.push("/");
    } catch (err: any) {
      console.error("[PerfilParceiroPage] Erro ao destruir conta", err);
      toast.dismiss("destroy-account");
      toast.error(
        err?.message || "Erro inesperado ao destruir sua conta. Tente novamente."
      );
    } finally {
      setIsDestroying(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-full lg:max-w-2xl">
          <p className="text-muted-foreground">
            Carregando suas informações...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-full">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl mt-4 sm:mt0 sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Perfil e Parceiro
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">
            Gerencie suas informações pessoais e a conexão com seu parceiro
            financeiro
          </p>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>

        {/* Grid responsivo: 1 coluna no mobile, 2 no desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Coluna ESQUERDA – Perfil + Plano + Logout + Destruir conta */}
          <div className="w-full lg:max-w-2xl">
            {/* Profile Card */}
            <div className="bg-card/80 backdrop-blur-xl border border-border/20 rounded-2xl p-6 lg:p-8 mb-6 shadow-lg shadow-primary/5">
              {/* Avatar */}
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-primary/20 rounded-2xl flex items-center justify-center">
                  <User className="w-12 h-12 text-primary" />
                </div>
              </div>

              {/* Form */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="nome"
                    className="text-foreground flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    Nome completo
                  </Label>
                  <Input
                    id="nome"
                    type="text"
                    value={formData.nome}
                    onChange={(e) => handleChange("nome", e.target.value)}
                    disabled={!isEditing}
                    className="bg-input border-border/20 disabled:opacity-60"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-foreground flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    disabled={!isEditing}
                    className="bg-input border-border/20 disabled:opacity-60"
                  />
                </div>

                {/* Edit/Save Button */}
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Editar perfil
                  </Button>
                ) : (
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="outline"
                      className="flex-1 border-border/50"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSave}
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Salvar
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Plan Card */}
            <div className="bg-card/80 backdrop-blur-xl border border-border/20 rounded-2xl p-6 lg:p-8 mb-6 shadow-lg shadow-primary/5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Crown className="w-5 h-5 text-primary" />
                  Plano atual
                </h2>
                <span className="inline-flex items-center px-4 py-1.5 bg-primary/20 text-primary rounded-lg font-semibold border border-primary/30">
                  TRIAL 30 DIAS
                </span>
              </div>
              <div className="space-y-3">
                <p className="text-muted-foreground">
                  Você tem acesso completo a todos os recursos do NossoBolso.
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {trialDaysLeft !== null
                      ? `Seu período de teste expira em ${trialDaysLeft} dia${
                          trialDaysLeft === 1 ? "" : "s"
                        }`
                      : "Seu período de teste está ativo"}
                  </span>
                </div>
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mt-4">
                  <p className="text-sm text-foreground">
                    <strong>Importante:</strong> Após 30 dias, você precisará
                    assinar um plano para continuar usando o NossoBolso.
                  </p>
                </div>
              </div>
            </div>

            {/* Logout Button com confirmação */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full mb-3 border-destructive/50 text-destructive hover:bg-destructive/10 bg-transparent"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair da conta
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card border-border/20">
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    Sair da conta?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Você será desconectado do NossoBolso neste dispositivo. Será
                    necessário fazer login novamente para acessar sua conta.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-transparent border-border/50">
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleLogout}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Sair mesmo assim
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Botão DESTRUIR CONTA */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full mt-3 border-destructive text-destructive hover:bg-destructive/10 bg-transparent"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Destruir permanentemente minha conta
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card border-border/20">
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    Tem certeza que deseja destruir sua conta?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação é <strong>irreversível</strong>. Todas as suas
                    transações serão apagadas. Se sua conta tiver apenas você,
                    a conta compartilhada também será excluída. Se tiver outro
                    usuário, você será removido e seus dados serão apagados,
                    mas o outro usuário continuará usando o NossoBolso.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-transparent border-border/50">
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDestroyAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={isDestroying}
                  >
                    {isDestroying
                      ? "Destruindo..."
                      : "Sim, destruir minha conta"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Coluna DIREITA – Parceiro */}
          <PartnerCard
            title="Meu parceiro"
            status={status}
            setStatus={setStatus}
            onInvite={handleInvitePartner}
            onRemove={handleRemovePartner}
            partnerName={partnerName}
            partnerEmail={partnerEmail}
            partnerPhone={partnerPhone}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
