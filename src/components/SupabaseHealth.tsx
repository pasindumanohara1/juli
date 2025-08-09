import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Status = "idle" | "checking" | "ok" | "error";

const SupabaseHealth: React.FC = () => {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const check = async () => {
      setStatus("checking");
      try {
        // Simple call to ensure client is configured and reachable
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          setStatus("error");
          setMessage(error.message);
          return;
        }
        setStatus("ok");
        setMessage(data?.session ? "Authenticated session detected." : "No session (not signed in).");
      } catch (e: any) {
        setStatus("error");
        setMessage(e?.message ?? "Unknown error");
      }
    };
    check();
  }, []);

  const badge = {
    idle: "bg-gray-100 text-gray-700 border-gray-200",
    checking: "bg-yellow-50 text-yellow-700 border-yellow-200",
    ok: "bg-green-50 text-green-700 border-green-200",
    error: "bg-red-50 text-red-700 border-red-200",
  }[status];

  return (
    <div className={`rounded-xl border p-4 ${badge}`}>
      <div className="font-semibold mb-1">Supabase Health</div>
      <div className="text-sm opacity-90">
        Status: <span className="font-medium">{status}</span>
      </div>
      {message && <div className="text-sm mt-1">{message}</div>}
    </div>
  );
};

export default SupabaseHealth;
