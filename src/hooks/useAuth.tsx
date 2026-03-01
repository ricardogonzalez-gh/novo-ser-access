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

// Detect if the current URL contains an OAuth callback (hash with access_token or code)
function urlHasAuthCallback(): boolean {
  const hash = window.location.hash;
  const search = window.location.search;
  return hash.includes("access_token") || hash.includes("refresh_token") || search.includes("code=");
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDomainAllowed, setIsDomainAllowed] = useState<boolean | null>(null);
  const mounted = useRef(true);
  const sessionHandled = useRef(false);

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

  const fetchProfile = async (userId: string, attempts = 3, delay = 500) => {
    for (let i = 0; i < attempts; i++) {
      if (!mounted.current) return;

      const { data } = await supabase
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

    // Prevent double handling
    sessionHandled.current = true;

    setSession(newSession);
    setUser(newSession.user);

    const email = newSession.user.email;
    console.log("[Auth] Sessão recebida para:", email);

    const allowed = checkDomain(email);
    setIsDomainAllowed(allowed);

    if (allowed) {
      await fetchProfile(newSession.user.id);
    } else {
      console.warn("[Auth] Domínio não permitido:", email);
      clearState();
      await supabase.auth.signOut();
    }

    if (mounted.current) setLoading(false);
  };

  useEffect(() => {
    mounted.current = true;
    const hasCallback = urlHasAuthCallback();

    // Only use onAuthStateChange as the single source of truth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted.current) return;
        console.log("[Auth] Event:", event, "Session:", !!newSession);

        if (event === 'SIGNED_OUT') {
          clearState();
          setLoading(false);
          return;
        }

        // INITIAL_SESSION is fired after getSession resolves internally
        // SIGNED_IN is fired after OAuth callback is processed
        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await handleSession(newSession);
        }
      }
    );

    // Safety timeout — only if NOT processing an OAuth callback
    // Give extra time (15s) when callback is in URL to let Supabase process it
    const timeoutMs = hasCallback ? 15000 : 8000;
    const safetyTimer = setTimeout(() => {
      if (mounted.current && loading && !sessionHandled.current) {
        console.warn("[Auth] Timeout após", timeoutMs, "ms — redirecionando para login");
        clearState();
        setLoading(false);
      }
    }, timeoutMs);

    return () => {
      mounted.current = false;
      subscription.unsubscribe();
      clearTimeout(safetyTimer);
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
