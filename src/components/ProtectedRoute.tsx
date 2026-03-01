import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading, isDomainAllowed } = useAuth();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => setTimedOut(true), 10000);
      return () => clearTimeout(timer);
    } else {
      setTimedOut(false);
    }
  }, [loading]);

  if (loading && !timedOut) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="animate-spin h-8 w-8 border-4 border-[#ad93bf] border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  if (timedOut || !session) return <Navigate to="/login" replace />;
  if (isDomainAllowed !== true) return <Navigate to="/acesso-negado" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
