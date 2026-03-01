import { LayoutDashboard, Settings, Database, History, FileSpreadsheet } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Operacionais", url: "/operacionais", icon: Settings },
  { title: "Entrada de Dados", url: "/entrada-dados", icon: Database },
  { title: "Importar/Exportar", url: "/import-export", icon: FileSpreadsheet },
  { title: "Histórico", url: "/historico", icon: History },
];

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarContent className="bg-gradient-to-b from-[#3d2c5e] to-[#2d1f4e] text-white">
        <div className="flex justify-center py-6 border-b border-white/10">
          <img
            src="/logo-ins-white.png"
            alt="Logo"
            className="h-10 object-contain rounded-lg"
            onError={(e) => {
              e.currentTarget.src = "/logo-ins.png";
              e.currentTarget.className = "h-10 object-contain brightness-0 invert rounded-lg";
            }}
          />
        </div>
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/60 mt-2">Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-2 hover:bg-white/10 text-white/80 hover:text-white transition-colors duration-150"
                      activeClassName="bg-[#ad93bf]/15 border-l-3 border-white text-white font-medium pl-[0.7rem]"
                    >
                      <item.icon className="h-4 w-4 shrink-0 text-white" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
