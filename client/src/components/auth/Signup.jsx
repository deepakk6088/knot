
import { useState } from "react";
import {
    Eye,
    EyeOff,
    MessageCircle,
    ArrowRight,
    UserRound,
    LoaderCircle
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { registerUser } from "../../services/auth.service.js";

function Signup() {
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [displayName, setDisplayName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [validationError, setValidationError] = useState("");
    const [serverError, setServerError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    function validateForm() {
        if (
            !username.trim() ||
            !email.trim() ||
            !password ||
            !confirmPassword
        ) {
            return "Please fill in all required fields.";
        }

        if (username.trim().length < 3 || username.trim().length > 30) {
            return "Username must be between 3 and 30 characters.";
        }

        if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
            return "Username can only contain letters, numbers and underscores.";
        }

        if (
            email.trim().length > 255 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
        ) {
            return "Please enter a valid email address.";
        }

        if (displayName.trim().length > 60) {
            return "Display name cannot exceed 60 characters.";
        }

        if (password.length < 8) {
            return "Password must contain at least 8 characters.";
        }

        if (new TextEncoder().encode(password).length > 72) {
            return "Password cannot exceed 72 bytes.";
        }

        if (password !== confirmPassword) {
            return "Passwords do not match.";
        }

        return "";
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setValidationError("");
        setServerError("");

        const error = validateForm();

        if (error) {
            setValidationError(error);
            return;
        }

        try {
            setIsSubmitting(true);

            const data = await registerUser({
                displayName: displayName.trim(),
                username: username.trim(),
                email: email.trim(),
                password
            });

            if (!data.success || !data.email) {
                throw new Error("Invalid registration response from server.");
            }

            navigate("/verify-email", {
                state: { email: data.email }
            });
        } catch (error) {
            const status = error.response?.status;

            if (status === 409) {
                setServerError(
                    error.response?.data?.message ||
                    "Username or email is already registered."
                );
            } else if (status === 400) {
                const errors = error.response?.data?.errors;
                const firstError = errors
                    ? Object.values(errors)[0]
                    : null;

                setServerError(
                    firstError ||
                    error.response?.data?.message ||
                    "Please check your registration details."
                );
            } else {
                setServerError(
                    error.response?.data?.message ||
                    error.message ||
                    "Unable to create your account. Please try again."
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

                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-11 h-11 rounded-2xl bg-[#1e3a8a] text-[#fbf9f5] flex items-center justify-center shadow-md shadow-[#1e3a8a]/20">
                            <MessageCircle size={22} />
                        </div>

                        <span className="text-2xl font-extrabold tracking-tight text-slate-900">
                            KNOT
                        </span>
                    </div>

                    <div className="max-w-md w-full mx-auto">

                        <p className="text-xs text-[#34452e] font-bold uppercase tracking-wider mb-2">
                            Get Started
                        </p>

                        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
                            Create your account
                        </h1>

                        <p className="text-slate-500 mb-6 text-sm">
                            Join KNOT and start connecting with people.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">

                            <div>
                                <label
                                    htmlFor="displayName"
                                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                                >
                                    Display Name
                                    <span className="text-slate-400 font-normal"> (Optional)</span>
                                </label>

                                <input
                                    id="displayName"
                                    type="text"
                                    value={displayName}
                                    onChange={(event) =>
                                        setDisplayName(event.target.value)
                                    }
                                    placeholder="Enter your display name"
                                    autoComplete="name"
                                    disabled={isSubmitting}
                                    className="w-full rounded-2xl bg-[#ffffff] border border-[#ded8cb] px-4 py-3 text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#1e3a8a] focus:ring-4 focus:ring-[#bfd0f0] disabled:opacity-60 text-sm shadow-2xs"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="username"
                                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                                >
                                    Username
                                </label>

                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(event) =>
                                        setUsername(event.target.value)
                                    }
                                    placeholder="Choose a username"
                                    autoComplete="username"
                                    disabled={isSubmitting}
                                    className="w-full rounded-2xl bg-[#ffffff] border border-[#ded8cb] px-4 py-3 text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#1e3a8a] focus:ring-4 focus:ring-[#bfd0f0] disabled:opacity-60 text-sm shadow-2xs"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                                >
                                    Email
                                </label>

                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(event.target.value)
                                    }
                                    placeholder="Enter your email"
                                    autoComplete="email"
                                    disabled={isSubmitting}
                                    className="w-full rounded-2xl bg-[#ffffff] border border-[#ded8cb] px-4 py-3 text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#1e3a8a] focus:ring-4 focus:ring-[#bfd0f0] disabled:opacity-60 text-sm shadow-2xs"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
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
                                        placeholder="Create a password"
                                        autoComplete="new-password"
                                        disabled={isSubmitting}
                                        className="w-full rounded-2xl bg-[#ffffff] border border-[#ded8cb] px-4 py-3 pr-12 text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#1e3a8a] focus:ring-4 focus:ring-[#bfd0f0] disabled:opacity-60 text-sm shadow-2xs"
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
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                                    >
                                        {showPassword
                                            ? <EyeOff size={18} />
                                            : <Eye size={18} />
                                        }
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
                                >
                                    Confirm Password
                                </label>

                                <div className="relative">
                                    <input
                                        id="confirmPassword"
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        value={confirmPassword}
                                        onChange={(event) =>
                                            setConfirmPassword(event.target.value)
                                        }
                                        placeholder="Confirm your password"
                                        autoComplete="new-password"
                                        disabled={isSubmitting}
                                        className="w-full rounded-2xl bg-[#ffffff] border border-[#ded8cb] px-4 py-3 pr-12 text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#1e3a8a] focus:ring-4 focus:ring-[#bfd0f0] disabled:opacity-60 text-sm shadow-2xs"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword
                                            )
                                        }
                                        disabled={isSubmitting}
                                        aria-label={
                                            showConfirmPassword
                                                ? "Hide confirm password"
                                                : "Show confirm password"
                                        }
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                                    >
                                        {showConfirmPassword
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
                                        Creating account...
                                    </>
                                ) : (
                                    <>
                                        Create account
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>

                        </form>

                        <p className="text-center text-sm text-slate-500 mt-6">
                            Already have an account?{" "}
                            <Link
                                to="/login"
                                className="text-[#1e3a8a] font-bold hover:text-[#172554] transition"
                            >
                                Sign in
                            </Link>
                        </p>

                    </div>
                </div>

                <div className="hidden lg:block relative min-h-[750px]">
                    <img
                        src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200"
                        alt="Friends spending time together"
                        className="absolute inset-0 w-full h-full object-cover"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />

                    <div className="absolute bottom-12 left-12 right-12 text-white">
                        <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-5 border border-white/30">
                            <UserRound
                                size={22}
                                className="text-white"
                            />
                        </div>

                        <h2 className="text-3xl font-extrabold mb-3 leading-tight tracking-tight">
                            Every connection starts somewhere.
                        </h2>

                        <p className="text-slate-200 leading-relaxed text-sm">
                            Create your account and make room for meaningful conversations.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Signup;
