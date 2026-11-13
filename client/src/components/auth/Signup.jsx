
import { useState } from "react";
import {
    Eye,
    EyeOff,
    MessageCircle,
    ArrowRight,
    UserRound,
    LoaderCircle
} from "lucide-react";
import { Link } from "react-router-dom";

import { registerUser } from "../../services/auth.service.js";

function Signup() {
    const [displayName, setDisplayName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [validationError, setValidationError] = useState("");
    const [serverError, setServerError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
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
        setSuccessMessage("");

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

            if (!data.success || !data.user) {
                throw new Error("Invalid registration response from server.");
            }

            setSuccessMessage(
                "Your account has been created successfully. You can now sign in."
            );

            setDisplayName("");
            setUsername("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
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
                    "Unable to create your account. Please try again."
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

                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-11 h-11 rounded-xl bg-indigo-500 flex items-center justify-center">
                            <MessageCircle size={23} />
                        </div>

                        <span className="text-2xl font-bold tracking-wide">
                            KNOT
                        </span>
                    </div>

                    <div className="max-w-md w-full mx-auto">

                        <p className="text-sm text-indigo-400 font-semibold mb-3">
                            GET STARTED
                        </p>

                        <h1 className="text-4xl font-bold mb-3">
                            Create your account
                        </h1>

                        <p className="text-gray-400 mb-8">
                            Join KNOT and start connecting with people.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-5">

                            <div>
                                <label
                                    htmlFor="displayName"
                                    className="block text-sm font-medium text-gray-300 mb-2"
                                >
                                    Display Name
                                    <span className="text-gray-500"> (Optional)</span>
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
                                    className="w-full rounded-xl bg-[#1b1d26] border border-white/10 px-4 py-3 text-white outline-none transition focus:border-indigo-500 disabled:opacity-60"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="username"
                                    className="block text-sm font-medium text-gray-300 mb-2"
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
                                    className="w-full rounded-xl bg-[#1b1d26] border border-white/10 px-4 py-3 text-white outline-none transition focus:border-indigo-500 disabled:opacity-60"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-gray-300 mb-2"
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
                                    className="w-full rounded-xl bg-[#1b1d26] border border-white/10 px-4 py-3 text-white outline-none transition focus:border-indigo-500 disabled:opacity-60"
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
                                        placeholder="Create a password"
                                        autoComplete="new-password"
                                        disabled={isSubmitting}
                                        className="w-full rounded-xl bg-[#1b1d26] border border-white/10 px-4 py-3 pr-12 text-white outline-none transition focus:border-indigo-500 disabled:opacity-60"
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
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                    >
                                        {showPassword
                                            ? <EyeOff size={19} />
                                            : <Eye size={19} />
                                        }
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="block text-sm font-medium text-gray-300 mb-2"
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
                                        className="w-full rounded-xl bg-[#1b1d26] border border-white/10 px-4 py-3 pr-12 text-white outline-none transition focus:border-indigo-500 disabled:opacity-60"
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
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                    >
                                        {showConfirmPassword
                                            ? <EyeOff size={19} />
                                            : <Eye size={19} />
                                        }
                                    </button>
                                </div>
                            </div>

                            {validationError && (
                                <p role="alert" className="text-sm text-red-400">
                                    {validationError}
                                </p>
                            )}

                            {serverError && (
                                <p role="alert" className="text-sm text-red-400">
                                    {serverError}
                                </p>
                            )}

                            {successMessage && (
                                <p role="status" className="text-sm text-green-400">
                                    {successMessage}
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
                                        Creating account...
                                    </>
                                ) : (
                                    <>
                                        Create account
                                        <ArrowRight size={19} />
                                    </>
                                )}
                            </button>

                        </form>

                        <p className="text-center text-sm text-gray-400 mt-8">
                            Already have an account?{" "}
                            <Link
                                to="/login"
                                className="text-indigo-400 font-semibold hover:text-indigo-300 transition"
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

                    <div className="absolute inset-0 bg-gradient-to-t from-[#08090d] via-black/20 to-transparent" />

                    <div className="absolute bottom-12 left-12 right-12">
                        <UserRound
                            size={30}
                            className="text-indigo-300 mb-5"
                        />

                        <h2 className="text-3xl font-bold mb-3">
                            Every connection starts somewhere.
                        </h2>

                        <p className="text-gray-200 leading-relaxed">
                            Create your account and make room for meaningful conversations.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Signup;
