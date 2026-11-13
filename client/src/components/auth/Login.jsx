
import { useState } from "react";
import {
    Eye,
    EyeOff,
    MessageCircle,
    ArrowRight,
    LockKeyhole,
    LoaderCircle
} from "lucide-react";

import { useAuth } from "../../context/AuthContext.jsx";
import { loginUser } from "../../services/auth.service.js";

function Login() {
    const { setSession } = useAuth();

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
        <div className="min-h-screen bg-[#08090d] text-white flex items-center justify-center p-4">
            <div className="w-full max-w-6xl grid lg:grid-cols-2 overflow-hidden rounded-3xl border border-white/10 bg-[#101117] shadow-2xl">

                <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center">

                    <div className="flex items-center gap-3 mb-12">
                        <div className="w-11 h-11 rounded-xl bg-indigo-500 flex items-center justify-center">
                            <MessageCircle size={23} />
                        </div>

                        <span className="text-2xl font-bold tracking-wide">
                            KNOT
                        </span>
                    </div>

                    <div className="max-w-md w-full mx-auto">

                        <p className="text-sm text-indigo-400 font-semibold mb-3">
                            WELCOME BACK
                        </p>

                        <h1 className="text-4xl font-bold mb-3">
                            Sign in to KNOT
                        </h1>

                        <p className="text-gray-400 mb-9">
                            Connect with people and continue your conversations.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-6">

                            <div>
                                <label
                                    htmlFor="identifier"
                                    className="block text-sm font-medium text-gray-300 mb-2"
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
                                    className="w-full rounded-xl bg-[#1b1d26] border border-white/10 px-4 py-3.5 text-white outline-none transition focus:border-indigo-500 disabled:opacity-60"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-gray-300 mb-2"
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
                                        className="w-full rounded-xl bg-[#1b1d26] border border-white/10 px-4 py-3.5 pr-12 text-white outline-none transition focus:border-indigo-500 disabled:opacity-60"
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
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white disabled:opacity-50"
                                    >
                                        {showPassword
                                            ? <EyeOff size={19} />
                                            : <Eye size={19} />
                                        }
                                    </button>
                                </div>
                            </div>

                            {validationError && (
                                <p
                                    role="alert"
                                    className="text-sm text-red-400"
                                >
                                    {validationError}
                                </p>
                            )}

                            {serverError && (
                                <p
                                    role="alert"
                                    className="text-sm text-red-400"
                                >
                                    {serverError}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 py-3.5 font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <LoaderCircle
                                            size={19}
                                            className="animate-spin"
                                        />
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        Sign in
                                        <ArrowRight size={19} />
                                    </>
                                )}
                            </button>

                        </form>

                        <p className="text-center text-sm text-gray-400 mt-8">
                            Don't have an account?{" "}
                            <span className="text-indigo-400 font-semibold">
                                Sign up
                            </span>
                        </p>

                    </div>
                </div>

                <div className="hidden lg:block relative min-h-[650px]">
                    <img
                        src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200"
                        alt="Friends spending time together"
                        className="absolute inset-0 w-full h-full object-cover"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#08090d] via-black/20 to-transparent" />

                    <div className="absolute bottom-12 left-12 right-12">
                        <LockKeyhole
                            size={30}
                            className="text-indigo-300 mb-5"
                        />

                        <h2 className="text-3xl font-bold mb-3">
                            Conversations that connect.
                        </h2>

                        <p className="text-gray-200 leading-relaxed">
                            A space to stay connected with the people who matter.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Login;
