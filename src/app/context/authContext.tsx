import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signOut, getCurrentUser, AuthUser } from 'aws-amplify/auth';
import { Amplify } from '@aws-amplify/core';
import { ReactNode } from 'react';
import awsExports from '../aws-exports';

Amplify.configure(awsExports);

interface LoginParams {
    username: string;
    password: string;
}

interface AuthContextType {
    user: AuthUser | null;
    login: ({ username, password }: LoginParams) => Promise<void>;
    logout: () => Promise<void>;
    impersonate: (userId: string) => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    login: async () => Promise.reject("Login function not implemented"),
    logout: async () => Promise.reject("Logout function not implemented"),
    impersonate: () => {},
    loading: false,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            try {
                const loggedInUser = await getCurrentUser();
                setUser(loggedInUser);
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkUser();
    }, []);

    const login = async ({ username, password }: LoginParams): Promise<void> => {
        try {
            setLoading(true)
            const signedInUser = await signIn({username,password});
            if (signedInUser.isSignedIn) {
                router.push('/dashboard');
            } else {
               alert('Login failed');
            }
        } catch (error) {
            throw new Error('Login failed');
        } finally {
            setLoading(false)
        }
    };

    const logout = async () => {
        try {
            setLoading(true)
            await signOut();
            setUser(null);
            router.push('/login');
        } catch (error) {
            console.error('Logout failed', error);
        } finally {
            setLoading(false)
        }
    };

    const impersonate = async (userId: string) => {
        if (user?.attributes['custom:role'] === 'admin') {
            router.push(`/impersonate?user=${userId}`);
        } else {
            alert('Not authorized to impersonate.');
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, impersonate, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
