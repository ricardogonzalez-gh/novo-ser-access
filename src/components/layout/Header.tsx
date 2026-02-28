import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LogOut } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  equipe: "Equipe",
  visualizacao: "Visualização",
};

const Header = () => {
  const { user, profile, signOut } = useAuth();

  const displayName = user?.user_metadata?.full_name || user?.email || "Usuário";
  const avatarUrl = user?.user_metadata?.avatar_url;
  const initials = displayName.slice(0, 2).toUpperCase();
  const roleLabel = profile?.role ? roleLabels[profile.role] || profile.role : "—";

  return (
    <header className="border-b bg-card sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="mr-1" />
          <img src="/logo-ins.png" alt="Instituto Novo Ser" className="h-10 w-auto object-contain hidden sm:block" />
          <div className="flex flex-col">
            <span className="font-heading font-semibold text-[#2d2d2d] hidden sm:block">Instituto Novo Ser</span>
            <span className="font-body font-normal text-sm text-[#9a999e] hidden sm:block">Painel de KPIs</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="hidden sm:inline-flex">{roleLabel}</Badge>
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden text-sm text-foreground md:inline">{displayName}</span>
          <Button onClick={signOut} variant="ghost" size="icon" title="Sair">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
