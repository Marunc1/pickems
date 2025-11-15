import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js'; // Import Session type

// --- Definirea Tipului Contextului ---
interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Funcție Ajutătoare: Creează Profilul la Logare ---
/**
 * Verifică dacă există un rând user_data pentru ID-ul dat. 
 * Dacă nu există, inserează rândul cu datele inițiale.
 */
async function ensureUserProfile(userId: string, username: string) {
    // 1. Verifică existența
    const { data: existingProfile } = await supabase
        .from('user_data')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

    // 2. Dacă profilul nu există, creează-l
    if (!existingProfile) {
        const { error: profileError } = await supabase
            .from('user_data')
            .insert({
                user_id: userId,
                username: username,
                is_admin: false,
                picks: {},
                score: 0
            });

        if (profileError) {
            console.error("Eroare la crearea profilului:", profileError);
            throw profileError;
        }
    }
}

// --- Providerul de Autentificare ---
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Stocăm username-ul local în timpul sign-up-ului pentru a-l folosi la prima logare
  const [tempUsername, setTempUsername] = useState<string | null>(null); 

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    
    // Dacă logarea are succes și avem un utilizator, ne asigurăm că are un profil
    if (data.user) {
        const usernameToUse = data.user.email?.split('@')[0] || 'Utilizator'; // Folosim o valoare implicită
        await ensureUserProfile(data.user.id, usernameToUse);
    }
  }

  async function signUp(email: string, password: string, username: string) {
    // Stocăm username-ul local înainte de înregistrare
    setTempUsername(username);
    
    // 1. Înregistrarea utilizatorului (trimite email de confirmare)
    const { error } = await supabase.auth.signUp({ email, password });
    
    if (error) {
        setTempUsername(null); // Ștergeți-l dacă înregistrarea eșuează
        throw error;
    }
    
    // 2. Notifică utilizatorul să verifice email-ul.
    // NU se inserează profilul user_data aici din cauza restricțiilor RLS.
    // Profilul va fi creat automat la prima logare reușită (vezi funcția ensureUserProfile apelată în useEffect sau signIn).
    
    // Aruncăm o eroare custom care poate fi prinsă în UI pentru a afișa mesajul.
    throw new Error('SUCCESS_EMAIL_CONFIRMATION_REQUIRED'); 
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  // Funcție pentru a verifica și seta starea de admin
  async function checkAdminStatus(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('is_admin')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      setIsAdmin(data?.is_admin ?? false);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false); // Asigură-te că loading este setat la false
    }
  }

  // Funcție unificată pentru a gestiona sesiunea utilizatorului și logica profilului
  const handleSession = async (session: Session | null) => {
    setUser(session?.user ?? null);
    if (session?.user) {
      const usernameToUse = tempUsername || session.user.email?.split('@')[0] || 'NouUtilizator';
      try {
        await ensureUserProfile(session.user.id, usernameToUse);
        await checkAdminStatus(session.user.id); // checkAdminStatus sets loading to false
      } catch (error) {
        console.error("Error during session handling:", error);
        setIsAdmin(false);
        setLoading(false); // Asigură-te că loading este false chiar și la eroare
      }
    } else {
      setIsAdmin(false);
      setLoading(false); // Nu există utilizator, deci încărcarea este finalizată
    }
  };

  useEffect(() => {
    let isMounted = true; // Flag pentru a preveni actualizările de stare pe componente demontate

    // Verificarea inițială a sesiunii
    supabase.auth.getSession().then(async ({ data }) => {
      if (isMounted) {
        await handleSession(data.session);
      }
    }).catch(error => {
      if (isMounted) {
        console.error("Error fetching initial session:", error);
        setLoading(false); // Asigură-te că loading este false la eroare inițială
      }
    });

    // Abonarea la schimbările de stare
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        handleSession(session); // Folosește același handler pentru schimbările de stare
      }
    });

    return () => {
      isMounted = false; // Curățare
      subscription.unsubscribe();
    };
  }, [tempUsername]); // tempUsername este o dependență

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// --- Hook-ul Custom ---
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}