import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

const AccessDenied = () => {
  const { signOut } = useAuth();

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f5f0f8] to-[#fafbfc] px-4 overflow-hidden">
      {/* Adornos decorativos de fundo */}
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-[#d27f7b]/10 rounded-full blur-3xl z-0" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[30rem] h-[30rem] bg-[#ad93bf]/10 rounded-full blur-3xl z-0" />
      <div className="absolute top-[20%] right-[10%] w-64 h-64 bg-[#eec833]/10 rounded-full blur-3xl z-0" />

      <Card className="relative z-10 w-full max-w-md text-center shadow-lg rounded-2xl p-10 border-[#f0f0f0] bg-white">
        <CardHeader className="space-y-4 pb-6">
          <div className="mx-auto flex justify-center w-full">
            <AlertCircle className="h-16 w-16 text-[#d27f7b]" strokeWidth={1.5} />
          </div>
          <div>
            <CardTitle className="text-2xl font-heading font-bold text-[#2d2d2d]">Acesso Negado</CardTitle>
            <CardDescription className="text-base font-body text-[#9a999e] mt-2">
              Acesso restrito à equipe do Instituto Novo Ser.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Button
            onClick={signOut}
            variant="outline"
            className="w-full h-12 border border-[#f0f0f0] shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200"
          >
            Tentar com outra conta
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessDenied;
