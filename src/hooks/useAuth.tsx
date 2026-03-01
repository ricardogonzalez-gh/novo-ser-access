import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
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
  const mounted = useRef(true);

  const checkDomain = (email: string | undefined) => {
    if (!email) return false;
    return email.endsWith("@novoser.org.br");
  };

  const clearState = () => {
    setSession(null);
    setUser(null);
    setProfile(null);
    setIsDomainAllowed(null);
  };

  const clearSupabaseStorage = () => {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-')) localStorage.removeItem(key);
      });
    } catch (e) {
      // Silently ignore storage errors
    }
  };

  const fetchProfile = async (userId: string, attempts = 3, delay = 500) => {
    for (let i = 0; i < attempts; i++) {
      if (!mounted.current) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (data) {
        if (mounted.current) setProfile(data);
        return;
      }

      if (i < attempts - 1) {
        await new Promise(r => setTimeout(r, delay * (i + 1)));
      }
    }
    console.error("Perfil não encontrado após", attempts, "tentativas");
    if (mounted.current) setProfile(null);
  };

  const handleSession = async (newSession: Session | null) => {
    if (!mounted.current) return;

    if (!newSession) {
      clearState();
      setLoading(false);
      return;
    }

    setSession(newSession);
    setUser(newSession.user);

    const allowed = checkDomain(newSession.user.email);
    setIsDomainAllowed(allowed);

    if (allowed) {
      await fetchProfile(newSession.user.id);
    } else {
      clearState();
      clearSupabaseStorage();
      await supabase.auth.signOut();
    }

    if (mounted.current) setLoading(false);
  };

  useEffect(() => {
    mounted.current = true;

    const initSession = async () => {
      try {
        const { data: { session: existingSession }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Erro ao obter sessão:", error.message);
          clearSupabaseStorage();
          if (mounted.current) {
            clearState();
            setLoading(false);
          }
          return;
        }

        await handleSession(existingSession);
      } catch (err) {
        console.error("Erro crítico ao inicializar sessão:", err);
        clearSupabaseStorage();
        if (mounted.current) {
          clearState();
          setLoading(false);
        }
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted.current) return;

        if (event === 'SIGNED_OUT') {
          clearState();
          setLoading(false);
          return;
        }

        if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          await handleSession(newSession);
        }
      }
    );

    // Safety timeout: if still loading after 8s, force reset
    const safetyTimer = setTimeout(() => {
      if (mounted.current && loading) {
        console.warn("Auth timeout — forçando reset");
        clearSupabaseStorage();
        clearState();
        setLoading(false);
      }
    }, 8000);

    return () => {
      mounted.current = false;
      subscription.unsubscribe();
      clearTimeout(safetyTimer);
    };
  }, []);

  const signInWithGoogle = async () => {
    clearSupabaseStorage();
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
    clearSupabaseStorage();
    await supabase.auth.signOut();
    clearState();
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
