import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { X, Mail, Lock, User as UserIcon, Calendar, Globe } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void; // called after successful auth, parent can redirect to /dashboard
};

const AuthDialog: React.FC<Props> = ({ open, onOpenChange, onSuccess }) => {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // shared
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // sign up only
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("Sri Lanka");
  const [birthday, setBirthday] = useState<string>("");

  useEffect(() => {
    if (!open) {
      // reset on close
      setMode("signin");
      setLoading(false);
      setError(null);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setFullName("");
      setCountry("Sri Lanka");
      setBirthday("");
    }
  }, [open]);

  const validateEmail = (val: string) => /\S+@\S+\.\S+/.test(val);

  const handleSignIn = async () => {
    setError(null);
    if (!validateEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    onOpenChange(false);
    onSuccess?.();
  };

  const handleSignUp = async () => {
    setError(null);
    if (!fullName.trim()) {
      setError("Full name is required.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          country,
          birthday: birthday || null,
        },
      },
    });
    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }
    // optional: ensure profile row has fields (trigger inserts, this makes it immediate)
    const userId = data.user?.id;
    if (userId) {
      await supabase.from("profiles").upsert({
        id: userId,
        full_name: fullName,
        country,
        birthday: birthday || null,
      });
    }
    setLoading(false);
    onOpenChange(false);
    onSuccess?.();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100000]"
      style={{
        position: "fixed",
        inset: 0,
      }}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      {/* Absolute center using flex to guarantee centering across all browsers */}
      <div
        className="fixed inset-0 flex items-center justify-center px-4"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          inset: 0,
        }}
      >
        <div
          className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-ocean-100 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-ocean-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-ocean-500 to-teal-500 rounded-full flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-ocean-700">
                {mode === "signin" ? "Sign In" : "Create Account"}
              </span>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-full w-8 h-8 flex items-center justify-center text-ocean-600 hover:bg-ocean-50"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-6 py-5 max-h-[75vh] overflow-auto">
            {/* Mode Switch */}
            <div className="flex items-center gap-2 mb-4">
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

            {error && <div className="mb-3 text-sm text-red-600">{error}</div>}

            {mode === "signin" ? (
              <div className="space-y-3">
                <div className="relative">
                  <Mail className="w-4 h-4 text-ocean-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full pl-10 pr-3 py-2 border border-ocean-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-400"
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
                    className="w-full pl-10 pr-3 py-2 border border-ocean-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-400"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <button
                  onClick={handleSignIn}
                  disabled={loading}
                  className="w-full py-2 rounded-lg bg-ocean-600 text-white hover:bg-ocean-700 transition disabled:opacity-60"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-ocean-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Full name"
                    className="w-full pl-10 pr-3 py-2 border border-ocean-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-400"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="relative">
                  <Globe className="w-4 h-4 text-ocean-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    className="w-full pl-10 pr-3 py-2 border border-ocean-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-400"
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
                    className="w-full pl-10 pr-3 py-2 border border-ocean-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-400"
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
                    className="w-full pl-10 pr-3 py-2 border border-ocean-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-400"
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
                    className="w-full pl-10 pr-3 py-2 border border-ocean-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-400"
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
                    className="w-full pl-10 pr-3 py-2 border border-ocean-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-400"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <button
                  onClick={handleSignUp}
                  disabled={loading}
                  className="w-full py-2 rounded-lg bg-ocean-600 text-white hover:bg-ocean-700 transition disabled:opacity-60"
                >
                  {loading ? "Creating account..." : "Create Account"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthDialog;
