import { useState, useEffect, createContext, useContext } from 'react';

// --- UTILITY API (REUTILIZARE) ---
const API_URL = '/api.php'; 

async function customApi(action: string, data?: any): Promise<any> {
    const isGet = data === undefined || action === 'load_tournaments' || action === 'load_user_picks' || action === 'get_current_user';
    const method = isGet ? 'GET' : 'POST';
    
    let url = `${API_URL}?action=${action}`;
    let body = undefined;

    if (!isGet) {
        body = JSON.stringify({ action, ...data });
    } else if (data) {
        // Pentru GET, adăugăm datele ca query params dacă există
        url += `&${new URLSearchParams(data).toString()}`;
    }

    const response = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: body,
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        // Include un mecanism de a returna null/undefined pentru 404 (neautentificat)
        if (response.status === 401) {
            return null;
        }
        throw new Error(result.error || `API Error for action ${action}`);
    }
    return result.data || result;
}
// ------------------------------------

interface User {
    id: string;
    username: string;
    is_admin: boolean;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (username: string, password: string) => Promise<void>; 
    signOut: () => Promise<void>; 
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Încearcă să încarce utilizatorul curent la pornire
    useEffect(() => {
        const loadCurrentUser = async () => {
            try {
                // Presupunem că backend-ul folosește sesiuni/cookie-uri pentru a identifica utilizatorul
                const userData = await customApi('get_current_user'); 
                if (userData) {
                    setUser(userData as User);
                }
            } catch (error) {
                // Dacă nu ești autentificat (ex: 401), console.log
                console.log("No active user session found.", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        loadCurrentUser();
    }, []);

    const signIn = async (username: string, password: string) => {
        // Simularea login-ului
        const loginData = await customApi('sign_in', { username, password });
        setUser(loginData.user as User);
    };

    const signOut = async () => {
        await customApi('sign_out');
        setUser(null);
    };

    const value = { user, loading, signIn, signOut };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};