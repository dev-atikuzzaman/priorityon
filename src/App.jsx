import React, { useState, useEffect } from "react";
import { ListChecks, Wallet, HandCoins, BarChart3, LogOut } from "lucide-react";
import AuthGate from "./components/AuthGate";
import PrioritiesTab from "./components/PrioritiesTab";
import ExpensesTab from "./components/ExpensesTab";
import DebtsTab from "./components/DebtsTab";
import InsightsTab from "./components/InsightsTab";
import { useCloudCollection } from "./hooks/useCloudCollection";
import { useTaskReminders } from "./hooks/useTaskReminders";
import { supabase } from "./lib/supabaseClient";
import { DEFAULT_PRIORITIES, bnDate, todayISO } from "./components/ui";

function AppShell({ user }) {
  const [tab, setTab] = useState("priorities");

  const priorities = useCloudCollection("priorities", user.id);
  const expenses = useCloudCollection("expenses", user.id);
  const debts = useCloudCollection("debts", user.id);

  useEffect(() => {
    if (!priorities.loading && priorities.rows.length === 0) {
      priorities.insertMany(DEFAULT_PRIORITIES);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priorities.loading]);

  useTaskReminders(priorities.rows);

  const loading = priorities.loading || expenses.loading || debts.loading;

  const TABS = [
    { id: "priorities", label: "প্রায়োরিটি", icon: ListChecks },
    { id: "expenses", label: "খরচ", icon: Wallet },
    { id: "debts", label: "ধার-দেনা", icon: HandCoins },
    { id: "insights", label: "অগ্রগতি", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-[#14181f]" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
      <header className="px-5 pt-6 pb-3 sticky top-0 z-10 bg-[#14181f]/90 backdrop-blur-sm border-b border-white/5 flex items-center justify-between">
        <div>
          <h1 className="text-[#EDEFF3] text-xl font-bold" style={{ fontFamily: "'Tiro Bangla', serif" }}>নিজের হিসাব</h1>
          <p className="text-[11px] text-[#8B93A7]">{bnDate(todayISO())}</p>
        </div>
        <div className="flex items-center gap-2">
          {user.user_metadata?.avatar_url && (
            <img src={user.user_metadata.avatar_url} alt="" className="w-8 h-8 rounded-full border border-white/10" />
          )}
          <button onClick={() => supabase.auth.signOut()} className="text-[#8B93A7] p-1.5" title="সাইন আউট">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center h-[60vh] text-[#8B93A7] text-sm">সিঙ্ক হচ্ছে…</div>
      ) : (
        <>
          {tab === "priorities" && (
            <PrioritiesTab
              priorities={priorities.rows}
              onAdd={priorities.insert}
              onUpdate={priorities.update}
              onDelete={priorities.remove}
            />
          )}
          {tab === "expenses" && (
            <ExpensesTab
              expenses={expenses.rows}
              userId={user.id}
              onAdd={expenses.insert}
              onUpdate={expenses.update}
              onDelete={expenses.remove}
            />
          )}
          {tab === "debts" && (
            <DebtsTab
              debts={debts.rows}
              onAdd={debts.insert}
              onUpdate={debts.update}
              onDelete={debts.remove}
            />
          )}
          {tab === "insights" && (
            <InsightsTab priorities={priorities.rows} expenses={expenses.rows} />
          )}
        </>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-[#1c2230] border-t border-white/5 flex z-20">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} className="flex-1 flex flex-col items-center gap-1 py-3">
              <Icon size={20} color={active ? "#E8A33D" : "#8B93A7"} strokeWidth={active ? 2.4 : 2} />
              <span className={`text-[10px] ${active ? "text-amber-400 font-medium" : "text-[#8B93A7]"}`}>{t.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tiro+Bangla&family=Hind+Siliguri:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap');
      `}</style>
      <AuthGate>{(user) => <AppShell user={user} />}</AuthGate>
    </>
  );
}
