import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  email: string | null;
  role: string | null;
  area: string | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isDomainAllowed: boolean | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDomainAllowed, setIsDomainAllowed] = useState<boolean | null>(null);

  const checkDomain = (email: string | undefined) => {
    if (!email) return false;
    return email.endsWith("@novoser.org.br");
  };

  const fetchProfile = async (userId: string, attempts = 3, delay = 500) => {
    for (let i = 0; i < attempts; i++) {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (data) {
        setProfile(data);
        return;
      }

      if (i < attempts - 1) {
        await new Promise(r => setTimeout(r, delay * (i + 1)));
      }
    }
    console.error("Perfil não encontrado após", attempts, "tentativas para userId:", userId);
    setProfile(null);
  };

  useEffect(() => {
    let mounted = true;

    // Primeiro, verificar sessão existente
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error || !session) {
          // Sem sessão válida - limpar tudo e redirecionar para login
          setSession(null);
          setUser(null);
          setProfile(null);
          setIsDomainAllowed(null);
          setLoading(false);
          return;
        }

        setSession(session);
        setUser(session.user);

        const allowed = checkDomain(session.user.email);
        setIsDomainAllowed(allowed);

        if (allowed) {
          await fetchProfile(session.user.id);
        } else {
          await supabase.auth.signOut();
        }
      } catch (err) {
        console.error("Erro ao inicializar sessão:", err);
        if (mounted) {
          setSession(null);
          setUser(null);
          setProfile(null);
          setIsDomainAllowed(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initSession();

    // Depois, escutar mudanças de estado (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_OUT' || !session) {
          setSession(null);
          setUser(null);
          setProfile(null);
          setIsDomainAllowed(null);
          setLoading(false);
          return;
        }

        setSession(session);
        setUser(session.user);

        const allowed = checkDomain(session.user.email);
        setIsDomainAllowed(allowed);

        if (allowed) {
          await fetchProfile(session.user.id);
        } else {
          await supabase.auth.signOut();
        }

        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          prompt: "select_account",
        },
      },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setIsDomainAllowed(null);
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, isDomainAllowed, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
