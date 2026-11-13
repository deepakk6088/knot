
import { useState } from "react";
import {
    Eye,
    EyeOff,
    MessageCircle,
    ArrowRight,
    LockKeyhole,
    LoaderCircle
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";
import { loginUser } from "../../services/auth.service.js";

function Login() {
    const { setSession } = useAuth();
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");

    const [validationError, setValidationError] = useState("");
    const [serverError, setServerError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        setValidationError("");
        setServerError("");

        if (!identifier.trim() || !password) {
            setValidationError(
                "Please enter your email/username and password."
            );
            return;
        }

        try {
            setIsSubmitting(true);

            const data = await loginUser(
                identifier.trim(),
                password
            );

            if (!data.success || !data.user || !data.token) {
                throw new Error("Invalid login response from server.");
            }

            setSession(data.user, data.token);
        } catch (error) {
            const status = error.response?.status;
            const errorCode = error.response?.data?.code;

            if (
                status === 403 &&
                errorCode === "EMAIL_NOT_VERIFIED"
            ) {
                const enteredIdentifier = identifier.trim();

                navigate("/verify-email", {
                    state: {
                        email: enteredIdentifier.includes("@")
                            ? enteredIdentifier
                            : ""
                    }
                });

                return;
            }

            if (status === 401) {
                setServerError(
                    "Invalid email/username or password."
                );
            } else {
                setServerError(
                    error.response?.data?.message ||
                    "Unable to sign in. Please try again."
                );
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#f5f3ee] text-slate-900 flex items-center justify-center p-4 sm:p-6">
            <div className="w-full max-w-6xl grid lg:grid-cols-2 overflow-hidden rounded-3xl border border-[#ded8cb] bg-[#fbf9f5] shadow-[0_20px_50px_rgba(30,58,138,0.07)]">

                <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center">

                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-11 h-11 rounded-2xl bg-[#1e3a8a] text-[#fbf9f5] flex items-center justify-center shadow-md shadow-[#1e3a8a]/20">
                            <MessageCircle size={22} />
                        </div>

                        <span className="text-2xl font-extrabold tracking-tight text-slate-900">
                            KNOT
                        </span>
                    </div>

                    <div className="max-w-md w-full mx-auto">

                        <p className="text-xs text-[#34452e] font-bold uppercase tracking-wider mb-2">
                            Welcome Back
                        </p>

                        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
                            Sign in to KNOT
                        </h1>

                        <p className="text-slate-500 mb-8 text-sm">
                            Connect with people and continue your conversations.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-5">

                            <div>
                                <label
                                    htmlFor="identifier"
                                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2"
                                >
                                    Email or Username
                                </label>

                                <input
                                    id="identifier"
                                    type="text"
                                    value={identifier}
                                    onChange={(event) =>
                                        setIdentifier(event.target.value)
                                    }
                                    placeholder="Enter your email or username"
                                    autoComplete="username"
                                    disabled={isSubmitting}
                                    className="w-full rounded-2xl bg-[#ffffff] border border-[#ded8cb] px-4 py-3.5 text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#1e3a8a] focus:ring-4 focus:ring-[#bfd0f0] disabled:opacity-60 text-sm shadow-2xs"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2"
                                >
                                    Password
                                </label>

                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(event) =>
                                            setPassword(event.target.value)
                                        }
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        disabled={isSubmitting}
                                        className="w-full rounded-2xl bg-[#ffffff] border border-[#ded8cb] px-4 py-3.5 pr-12 text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#1e3a8a] focus:ring-4 focus:ring-[#bfd0f0] disabled:opacity-60 text-sm shadow-2xs"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        disabled={isSubmitting}
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 disabled:opacity-50 cursor-pointer"
                                    >
                                        {showPassword
                                            ? <EyeOff size={18} />
                                            : <Eye size={18} />
                                        }
                                    </button>
                                </div>
                            </div>

                            {validationError && (
                                <p
                                    role="alert"
                                    className="text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 px-3.5 py-2.5 rounded-xl"
                                >
                                    {validationError}
                                </p>
                            )}

                            {serverError && (
                                <p
                                    role="alert"
                                    className="text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 px-3.5 py-2.5 rounded-xl"
                                >
                                    {serverError}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#1e3a8a] hover:bg-[#1e40af] text-[#fbf9f5] py-3.5 font-semibold transition-all shadow-md shadow-[#1e3a8a]/20 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer text-sm"
                            >
                                {isSubmitting ? (
                                    <>
                                        <LoaderCircle
                                            size={18}
                                            className="animate-spin"
                                        />
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        Sign in
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>

                        </form>

                        <p className="text-center text-sm text-slate-500 mt-8">
                            Don't have an account?{" "}
                            <Link
                                to="/signup"
                                className="text-[#1e3a8a] font-bold hover:text-[#172554] transition"
                            >
                                Sign up
                            </Link>
                        </p>

                    </div>
                </div>

                <div className="hidden lg:block relative min-h-[650px]">
                    <img
                        src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200"
                        alt="Friends spending time together"
                        className="absolute inset-0 w-full h-full object-cover"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />

                    <div className="absolute bottom-12 left-12 right-12 text-white">
                        <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-5 border border-white/30">
                            <LockKeyhole
                                size={22}
                                className="text-white"
                            />
                        </div>

                        <h2 className="text-3xl font-extrabold mb-3 leading-tight tracking-tight">
                            Conversations that connect.
                        </h2>

                        <p className="text-slate-200 leading-relaxed text-sm">
                            A space to stay connected with the people who matter.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Login;
