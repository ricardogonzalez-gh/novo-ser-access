import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const Login = () => {
  const { session, loading, signInWithGoogle } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (session) return <Navigate to="/" replace />;

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f5f0f8] to-[#fafbfc] px-4 overflow-hidden">
      {/* Adornos decorativos de fundo */}
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-[#d27f7b]/10 rounded-full blur-3xl z-0" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[30rem] h-[30rem] bg-[#ad93bf]/10 rounded-full blur-3xl z-0" />
      <div className="absolute top-[20%] right-[10%] w-64 h-64 bg-[#eec833]/10 rounded-full blur-3xl z-0" />

      <Card className="relative z-10 w-full max-w-md shadow-lg rounded-2xl p-10 border-[#f0f0f0] bg-white">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto flex justify-center w-full">
            <img
              src="/logo-ins.png"
              alt="Instituto Novo Ser"
              className="h-[100px] w-auto object-contain rounded-xl shadow-sm"
            />
          </div>
          <div>
            <CardTitle className="font-heading text-[28px] font-bold text-[#2d2d2d] leading-tight mb-2">
              Instituto Novo Ser
            </CardTitle>
            <CardDescription className="font-body text-[#9a999e] text-base">
              Painel Estratégico de KPIs
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button
            onClick={signInWithGoogle}
            className="w-full gap-3 bg-white border border-[#f0f0f0] text-foreground shadow-sm hover:shadow-md hover:scale-[1.02] hover:bg-white transition-all duration-200 h-12 relative overflow-hidden"
            size="lg"
            variant="outline"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Entrar com Google
          </Button>

          <p className="text-center text-xs text-[#9a999e] font-body mt-8">
            Acesso restrito à equipe @novoser.org.br
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
