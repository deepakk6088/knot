
import { useState } from "react";
import {
    Eye,
    EyeOff,
    MessageCircle,
    ArrowRight,
    LockKeyhole
} from "lucide-react";

function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [validationError, setValidationError] = useState("");

    function handleSubmit(event) {
        event.preventDefault();
        setValidationError("");

        if (!identifier.trim() || !password) {
            setValidationError("Please enter your email/username and password.");
            return;
        }
    }

    return (
        <main className="min-h-screen flex bg-[#0b1120] text-white">
            <section className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md">
                    <div className="flex items-center gap-3 mb-12">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
                            <MessageCircle size={24} />
                        </div>

                        <h1 className="text-2xl font-bold tracking-[0.2em]">
                            KNOT
                        </h1>
                    </div>

                    <div className="mb-9">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-3">
                            Welcome back
                        </h2>

                        <p className="text-slate-400">
                            Sign in to reconnect with your people.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label
                                htmlFor="identifier"
                                className="block text-sm font-medium text-slate-300 mb-2"
                            >
                                Email or username
                            </label>

                            <input
                                id="identifier"
                                type="text"
                                value={identifier}
                                onChange={(event) => {
                                    setIdentifier(event.target.value);
                                    setValidationError("");
                                }}
                                placeholder="Enter your email or username"
                                autoComplete="username"
                                required
                                className="w-full h-12 px-4 rounded-lg bg-[#151f32] border border-slate-700 text-white placeholder:text-slate-500 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-slate-300 mb-2"
                            >
                                Password
                            </label>

                            <div className="relative">
                                <LockKeyhole
                                    size={18}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                                />

                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(event) => {
                                        setPassword(event.target.value);
                                        setValidationError("");
                                    }}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    required
                                    className="w-full h-12 pl-11 pr-12 rounded-lg bg-[#151f32] border border-slate-700 text-white placeholder:text-slate-500 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                >
                                    {showPassword
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

                        <button
                            type="submit"
                            className="w-full h-12 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 font-semibold transition shadow-lg shadow-violet-900/20"
                        >
                            Sign in
                            <ArrowRight size={18} />
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-400 mt-8">
                        Don't have an account?{" "}
                        <span className="text-violet-400 font-semibold cursor-pointer">
                            Sign up
                        </span>
                    </p>

                    <p className="text-center text-xs text-slate-600 mt-12">
                        © 2026 KNOT. Stay connected.
                    </p>
                </div>
            </section>

            <section className="hidden lg:block lg:w-1/2 relative overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1400&auto=format&fit=crop&q=85"
                    alt="Friends spending time together"
                    className="absolute inset-0 w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#0b1120] via-[#0b1120]/30 to-violet-950/20" />

                <div className="absolute bottom-16 left-12 right-12">
                    <div className="max-w-lg">
                        <p className="text-violet-300 text-sm font-semibold tracking-widest uppercase mb-4">
                            Stay connected
                        </p>

                        <h2 className="text-4xl xl:text-5xl font-bold leading-tight mb-5">
                            Every connection has a story.
                        </h2>

                        <p className="text-slate-200 text-lg leading-relaxed">
                            Bring your conversations together and stay
                            close to the people who matter.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default Login;
