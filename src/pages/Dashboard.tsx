import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  equipe: "Equipe",
  visualizacao: "Visualização",
};

const Dashboard = () => {
  const { user, profile, signOut } = useAuth();

  const displayName = user?.user_metadata?.full_name || user?.email || "Usuário";
  const avatarUrl = user?.user_metadata?.avatar_url;
  const initials = displayName.slice(0, 2).toUpperCase();
  const roleLabel = profile?.role ? roleLabels[profile.role] || profile.role : "Sem perfil definido";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
              NS
            </div>
            <span className="font-semibold text-foreground">Instituto Novo Ser</span>
          </div>
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <span className="hidden text-sm text-foreground sm:inline">{displayName}</span>
            <Button onClick={signOut} variant="ghost" size="icon" title="Sair">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-12">
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <h1 className="text-2xl font-bold text-foreground">
              Bem-vindo(a), {displayName}!
            </h1>
            <p className="text-muted-foreground">
              Seu perfil: <span className="font-medium text-foreground">{roleLabel}</span>
            </p>
            <p className="text-muted-foreground pt-4">🚧 Dashboard em construção</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
