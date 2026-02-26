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

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (error) {
      console.error("Erro ao buscar perfil:", error);
    }
    setProfile(data);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const allowed = checkDomain(session.user.email);
          setIsDomainAllowed(allowed);
          if (allowed) {
            await fetchProfile(session.user.id);
          } else {
            await supabase.auth.signOut();
          }
        } else {
          setIsDomainAllowed(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const allowed = checkDomain(session.user.email);
        setIsDomainAllowed(allowed);
        if (allowed) {
          fetchProfile(session.user.id);
        } else {
          supabase.auth.signOut();
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
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
