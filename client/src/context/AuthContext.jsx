import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import api from "../services/api";
import socketService from "../services/socket";

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

                // Establish authenticated socket connection using the restored token
                socketService.connect(storedToken);
            } catch (error) {
                const status = error.response?.status;

                if ([401, 403, 404].includes(status)) {
                    localStorage.removeItem("knot_token");
                    setToken(null);
                    setUser(null);
                    socketService.disconnect();
                }
            } finally {
                setLoading(false);
            }
        }

        restoreSession();
    }, []);

    // Ensure socket lifecycle remains synchronized with authentication state changes
    useEffect(() => {
        if (!loading) {
            if (token && user) {
                socketService.connect(token);
            } else {
                socketService.disconnect();
            }
        }
    }, [token, user, loading]);

    // Clean up socket on unmount of AuthProvider
    useEffect(() => {
        return () => {
            socketService.disconnect();
        };
    }, []);

    function setSession(userData, authToken) {
        localStorage.setItem("knot_token", authToken);

        setUser(userData);
        setToken(authToken);

        // Connect socket immediately with new valid session token
        if (authToken) {
            socketService.connect(authToken);
        }
    }

    function updateUser(updatedUser) {
        setUser((currentUser) => ({
            ...currentUser,
            ...updatedUser
        }));
    }

    function logout() {
        // Disconnect socket and clean up listeners before clearing local session state
        socketService.disconnect();

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
        logout,
        socketService
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
