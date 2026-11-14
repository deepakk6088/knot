
import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    const [token, setToken] = useState(
        () => localStorage.getItem("knot_token")
    );

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function restoreSession() {
            const storedToken = localStorage.getItem("knot_token");

            if (!storedToken) {
                setLoading(false);
                return;
            }

            try {
                const response = await api.get("/auth/me");

                setUser(response.data.user);
                setToken(storedToken);
            } catch (error) {
                const status = error.response?.status;

                if ([401, 403, 404].includes(status)) {
                    localStorage.removeItem("knot_token");
                    setToken(null);
                    setUser(null);
                }
            } finally {
                setLoading(false);
            }
        }

        restoreSession();
    }, []);

    function setSession(userData, authToken) {
        localStorage.setItem("knot_token", authToken);

        setUser(userData);
        setToken(authToken);
    }

    function updateUser(updatedUser) {
        setUser((currentUser) => ({
            ...currentUser,
            ...updatedUser
        }));
    }

    function logout() {
        localStorage.removeItem("knot_token");

        setUser(null);
        setToken(null);
    }

    const value = {
        user,
        token,
        loading,
        isAuthenticated: Boolean(token && user),
        setSession,
        updateUser,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside an AuthProvider."
        );
    }

    return context;
}
