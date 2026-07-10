import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#14181f] flex items-center justify-center">
      <p className="text-[#8B93A7] text-sm">লোড হচ্ছে…</p>
    </div>
  );
}

function LoginScreen() {
  const [busy, setBusy] = useState(false);

  const signInWithGoogle = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      console.error("sign in failed", error);
      setBusy(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#14181f] flex flex-col items-center justify-center px-6"
      style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
    >
      <h1
        className="text-[#EDEFF3] text-2xl font-bold mb-2"
        style={{ fontFamily: "'Tiro Bangla', serif" }}
      >
        নিজের হিসাব
      </h1>
      <p className="text-[#8B93A7] text-sm text-center mb-8 max-w-xs">
        তোমার প্রায়োরিটি, খরচ ও ধার-দেনা — সব ডিভাইসে নিরাপদে সিঙ্ক থাকবে তোমার জিমেইল একাউন্টের অধীনে।
      </p>
      <button
        onClick={signInWithGoogle}
        disabled={busy}
        className="flex items-center gap-3 bg-[#1c2230] border border-white/10 rounded-2xl px-6 py-3.5 text-[#EDEFF3] font-medium text-sm disabled:opacity-60"
      >
        <svg width="18" height="18" viewBox="0 0 48 48">
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z" />
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.4 18.9 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
          <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.4C29.6 35.4 26.9 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.6 5.1C9.5 39.6 16.2 44 24 44z" />
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.5l6.6 5.4C41.5 35.9 44 30.4 44 24c0-1.2-.1-2.4-.4-3.5z" />
        </svg>
        {busy ? "সংযুক্ত হচ্ছে…" : "Google দিয়ে সাইন ইন করো"}
      </button>
    </div>
  );
}

export default function AuthGate({ children }) {
  const [session, setSession] = useState(undefined); // undefined = loading

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => listener.subscription.unsubscribe();
  }, []);

  if (session === undefined) return <LoadingScreen />;
  if (!session) return <LoginScreen />;
  return children(session.user);
}
