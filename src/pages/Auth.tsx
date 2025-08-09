import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GlassCard from "@/components/GlassCard";
import LiquidBackground from "@/components/LiquidBackground";
import { supabase } from "@/lib/supabaseClient";
import { Mail, Lock, User as UserIcon, Calendar, Globe } from "lucide-react";

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Shared fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Sign up only fields
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("Sri Lanka");
  const [birthday, setBirthday] = useState<string>("");

  useEffect(() => {
    // If already signed in, go to dashboard
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/dashboard", { replace: true });
    });
  }, [navigate]);

  const validateEmail = (val: string) => /\S+@\S+\.\S+/.test(val);

  const handleSignIn = async () => {
    setError(null);
    if (!validateEmail(email)) return setError("Enter a valid email address.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setError(error.message);

    // On success: session will update Navbar via listener; navigate to dashboard
    navigate("/dashboard", { replace: true });
  };

  const handleSignUp = async () => {
    setError(null);
    if (!fullName.trim()) return setError("Full name is required.");
    if (!validateEmail(email)) return setError("Enter a valid email address.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirmPassword) return setError("Passwords do not match.");

    setLoading(true);
    // DEV MODE: force immediate session by turning off confirmation behavior.
    // Note: Supabase's autoConfirm must be disabled in project settings to enforce email confirmation.
    // For dev convenience, we proceed assuming confirmation is not required.
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined,
        // Important: Do not send a redirect and rely on project setting "Disable email confirmations" during development.
        data: {
          full_name: fullName,
          country,
          birthday: birthday || null,
        },
      },
    });

    if (error) {
      setLoading(false);
      return setError(error.message);
    }

    // Expecting a session immediately in dev (email confirmations disabled)
    const userId = data.session?.user?.id ?? data.user?.id ?? null;

    if (userId) {
      await supabase.from("profiles").upsert({
        id: userId,
        full_name: fullName,
        country,
        birthday: birthday || null,
      });
    }

    setLoading(false);

    // If, for any reason, there is still no session, fall back to sign-in tab with a hint.
    if (!data.session) {
      setError("Sign-up created an account but no session was returned. In dev, disable email confirmations in Supabase Auth settings, then try again.");
      setMode("signin");
      return;
    }

    // On success: navigate to dashboard (Navbar will reflect session change)
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen pt-24">
      <LiquidBackground />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-xl mx-auto">
          <GlassCard className="p-6 sm:p-8">
            <h1 className="text-3xl font-bold text-ocean-700 mb-2 text-center">Welcome</h1>
            <p className="text-ocean-500 mb-6 text-center">Sign in to continue or create a new account</p>

            <div className="flex items-center justify-center gap-2 mb-6">
              <button
                className={`px-4 py-2 rounded-full text-sm border ${
                  mode === "signin"
                    ? "bg-ocean-600 text-white border-ocean-600"
                    : "bg-white text-ocean-700 border-ocean-200"
                }`}
                onClick={() => setMode("signin")}
                disabled={loading}
              >
                Sign In
              </button>
              <button
                className={`px-4 py-2 rounded-full text-sm border ${
                  mode === "signup"
                    ? "bg-ocean-600 text-white border-ocean-600"
                    : "bg-white text-ocean-700 border-ocean-200"
                }`}
                onClick={() => setMode("signup")}
                disabled={loading}
              >
                Sign Up
              </button>
            </div>

            {error && <div className="mb-4 text-sm text-red-600 text-center">{error}</div>}

            {mode === "signin" ? (
              <div className="space-y-4">
                <div className="relative">
                  <Mail className="w-4 h-4 text-ocean-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full pl-10 pr-3 py-3 border border-ocean-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-400"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-ocean-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full pl-10 pr-3 py-3 border border-ocean-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-400"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <button
                  onClick={handleSignIn}
                  disabled={loading}
                  className="w-full py-3 rounded-lg bg-ocean-600 text-white hover:bg-ocean-700 transition disabled:opacity-60"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-ocean-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Full name"
                    className="w-full pl-10 pr-3 py-3 border border-ocean-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-400"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="relative">
                  <Globe className="w-4 h-4 text-ocean-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    className="w-full pl-10 pr-3 py-3 border border-ocean-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-400"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    disabled={loading}
                  >
                    <option value="Sri Lanka">Sri Lanka</option>
                    <option value="India">India</option>
                  </select>
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-ocean-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full pl-10 pr-3 py-3 border border-ocean-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-400"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-ocean-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full pl-10 pr-3 py-3 border border-ocean-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-400"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-ocean-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="Confirm password"
                    className="w-full pl-10 pr-3 py-3 border border-ocean-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-400"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-ocean-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    placeholder="Birthday (optional)"
                    className="w-full pl-10 pr-3 py-3 border border-ocean-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-400"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <button
                  onClick={handleSignUp}
                  disabled={loading}
                  className="w-full py-3 rounded-lg bg-ocean-600 text-white hover:bg-ocean-700 transition disabled:opacity-60"
                >
                  {loading ? "Creating account..." : "Create Account"}
                </button>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Auth;
