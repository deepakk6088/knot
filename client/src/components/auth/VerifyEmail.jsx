
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
    resendVerificationEmail,
    verifyEmail
} from "../../services/auth.service";

export default function VerifyEmail() {
    const location = useLocation();
    const navigate = useNavigate();
    const { setSession } = useAuth();

    const [email, setEmail] = useState(location.state?.email || "");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        if (countdown <= 0) return;

        const timer = setTimeout(() => {
            setCountdown((current) => current - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [countdown]);

    const handleOtpChange = (value) => {
        setOtp(value.replace(/\D/g, "").slice(0, 6));
    };

    const handleVerify = async (event) => {
        event.preventDefault();
        setError("");
        setMessage("");

        if (!email.trim()) {
            setError("Please enter your email address.");
            return;
        }

        if (!/^\d{6}$/.test(otp)) {
            setError("Please enter a valid 6-digit verification code.");
            return;
        }

        try {
            setLoading(true);

            const data = await verifyEmail(email.trim(), otp);

            if (!data.success || !data.user || !data.token) {
                setError(data.message || "Email verification failed.");
                return;
            }

            setSession(data.user, data.token);
            navigate("/");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to verify your email. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setError("");
        setMessage("");

        if (!email.trim()) {
            setError("Please enter your email address.");
            return;
        }

        try {
            setResending(true);

            const data = await resendVerificationEmail(email.trim());

            setMessage(
                data.message ||
                "If your account requires verification, a new code will be sent to your email."
            );
            setCountdown(60);
            setOtp("");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to request a new code. Please try again."
            );
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0b0b0f] px-4 py-10">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#14141b] p-8 shadow-2xl">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        Verify your email
                    </h1>
                    <p className="mt-3 text-sm leading-6 text-gray-400">
                        Enter the 6-digit verification code sent to your email
                        address.
                    </p>
                </div>

                <form onSubmit={handleVerify} className="space-y-5">
                    <div>
                        <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-medium text-gray-300"
                        >
                            Email address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="Enter your email"
                            required
                            className="w-full rounded-lg border border-white/10 bg-[#1d1d26] px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="otp"
                            className="mb-2 block text-sm font-medium text-gray-300"
                        >
                            Verification code
                        </label>
                        <input
                            id="otp"
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            value={otp}
                            onChange={(event) =>
                                handleOtpChange(event.target.value)
                            }
                            placeholder="Enter 6-digit code"
                            maxLength={6}
                            required
                            className="w-full rounded-lg border border-white/10 bg-[#1d1d26] px-4 py-3 text-center text-xl tracking-[0.5em] text-white outline-none transition placeholder:text-sm placeholder:tracking-normal placeholder:text-gray-500 focus:border-indigo-500"
                        />
                    </div>

                    {error && (
                        <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                            {error}
                        </p>
                    )}

                    {message && (
                        <p className="rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
                            {message}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Verifying..." : "Verify email"}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="mb-3 text-sm text-gray-400">
                        Didn't receive the code?
                    </p>

                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={resending || countdown > 0}
                        className="text-sm font-semibold text-indigo-400 transition hover:text-indigo-300 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {resending
                            ? "Sending..."
                            : countdown > 0
                                ? `Resend code in ${countdown}s`
                                : "Resend verification code"}
                    </button>
                </div>

                <div className="mt-8 border-t border-white/10 pt-5 text-center">
                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="text-sm text-gray-400 transition hover:text-white"
                    >
                        Back to login
                    </button>
                </div>
            </div>
        </div>
    );
}

