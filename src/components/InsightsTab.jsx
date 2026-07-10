import React, { useMemo } from "react";
import { TrendingUp, TrendingDown, Minus, Sparkles } from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Legend,
} from "recharts";

const bnNum = (n) => String(n).replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);
const money = (n) => "৳" + bnNum(Number(n || 0).toLocaleString("en-IN"));
const todayISO = () => new Date().toISOString().slice(0, 10);

const WEEKDAY_BN = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি"];

function isoDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

const QUOTES = {
  up: [
    "চমৎকার! গত সপ্তাহের চেয়ে তুমি এখন আরও ধারাবাহিক — এই গতিটা ধরে রাখো।",
    "পরিবর্তন চোখে পড়ার মতো — ছোট ছোট প্রচেষ্টা জমেই বড় ফল দেয়।",
    "মাশা'আল্লাহ, তোমার অগ্রগতি স্পষ্ট। নিজেকে কৃতিত্ব দাও।",
  ],
  same: [
    "তুমি স্থির গতিতে এগোচ্ছো — ধারাবাহিকতাই দীর্ঘমেয়াদে সবচেয়ে বড় শক্তি।",
    "সংখ্যা একই থাকলেও অভ্যাস গড়ে ওঠা একটা জয় — চালিয়ে যাও।",
  ],
  down: [
    "এই সপ্তাহটা একটু কঠিন গেছে, কিন্তু প্রতিদিন নতুন সুযোগ নিয়ে আসে — আবার শুরু করো।",
    "প্রতিটা যাত্রায় ওঠানামা থাকে। যা করেছো সেটাই গুরুত্বপূর্ণ, হাল ছেড়ো না।",
  ],
};

function pickQuote(direction) {
  const list = QUOTES[direction];
  return list[Math.floor(Math.random() * list.length)];
}

export default function InsightsTab({ priorities, expenses }) {
  const today = todayISO();

  const last14 = useMemo(() => {
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const date = isoDaysAgo(i);
      const total = priorities.length;
      const done = priorities.filter((p) => (p.completed_dates || {})[date]).length;
      const pct = total ? Math.round((done / total) * 100) : 0;
      const d = new Date(date + "T00:00:00");
      days.push({ date, label: WEEKDAY_BN[d.getDay()], pct });
    }
    return days;
  }, [priorities, today]);

  const { thisWeekAvg, lastWeekAvg, weekBars } = useMemo(() => {
    const thisWeek = last14.slice(7, 14);
    const lastWeek = last14.slice(0, 7);
    const avg = (arr) => (arr.length ? Math.round(arr.reduce((s, d) => s + d.pct, 0) / arr.length) : 0);
    const bars = WEEKDAY_BN.map((label, i) => {
      const t = thisWeek[i]?.pct ?? 0;
      const l = lastWeek[i]?.pct ?? 0;
      return { label, "এই সপ্তাহ": t, "গত সপ্তাহ": l };
    });
    return { thisWeekAvg: avg(thisWeek), lastWeekAvg: avg(lastWeek), weekBars: bars };
  }, [last14]);

  const expenseComparison = useMemo(() => {
    const now = new Date();
    const thisMonthKey = now.toISOString().slice(0, 7);
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthKey = prevDate.toISOString().slice(0, 7);
    const sum = (key) => expenses.filter((e) => e.date.slice(0, 7) === key).reduce((s, e) => s + Number(e.amount), 0);
    return { thisMonth: sum(thisMonthKey), lastMonth: sum(prevMonthKey) };
  }, [expenses]);

  const direction = thisWeekAvg > lastWeekAvg ? "up" : thisWeekAvg === lastWeekAvg ? "same" : "down";
  const diff = thisWeekAvg - lastWeekAvg;
  const quote = useMemo(() => pickQuote(direction), [direction, thisWeekAvg, lastWeekAvg]);

  const DirectionIcon = direction === "up" ? TrendingUp : direction === "down" ? TrendingDown : Minus;
  const directionColor = direction === "up" ? "#3FA796" : direction === "down" ? "#E5626E" : "#8B93A7";

  const expenseDiff = expenseComparison.thisMonth - expenseComparison.lastMonth;
  const expenseUp = expenseDiff > 0;

  return (
    <div className="px-4 pb-28 pt-5">
      {/* Motivational summary card */}
      <div className="bg-[#1c2230] rounded-2xl p-4 mb-5 border border-white/5">
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: directionColor + "22" }}
          >
            <DirectionIcon size={18} color={directionColor} />
          </div>
          <div>
            <p className="text-sm text-[#EDEFF3] font-semibold">
              এই সপ্তাহ {bnNum(thisWeekAvg)}% · গত সপ্তাহ {bnNum(lastWeekAvg)}%
            </p>
            <p className="text-[11px]" style={{ color: directionColor }}>
              {direction === "up" && `+${bnNum(diff)} পয়েন্ট উন্নতি`}
              {direction === "down" && `${bnNum(Math.abs(diff))} পয়েন্ট কম`}
              {direction === "same" && "অপরিবর্তিত"}
            </p>
          </div>
        </div>
        <p className="text-xs text-[#c9cee0] flex items-start gap-1.5 mt-2">
          <Sparkles size={13} className="text-amber-400 shrink-0 mt-0.5" />
          {quote}
        </p>
      </div>

      {/* 14-day trend line */}
      <div className="bg-[#1c2230] rounded-2xl p-4 mb-5 border border-white/5">
        <p className="text-xs text-[#8B93A7] mb-2">গত ১৪ দিনের সম্পন্ন হারের ধারা</p>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={last14}>
            <CartesianGrid strokeDasharray="3 3" stroke="#252c3d" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#8B93A7", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#8B93A7", fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
            <Tooltip
              contentStyle={{ background: "#14181f", border: "1px solid #333", borderRadius: 8, fontSize: 12 }}
              formatter={(v) => `${bnNum(v)}%`}
            />
            <Line type="monotone" dataKey="pct" stroke="#E8A33D" strokeWidth={2.5} dot={{ r: 2.5, fill: "#E8A33D" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Week-over-week bar comparison */}
      <div className="bg-[#1c2230] rounded-2xl p-4 mb-5 border border-white/5">
        <p className="text-xs text-[#8B93A7] mb-2">এই সপ্তাহ বনাম গত সপ্তাহ (দিনভিত্তিক)</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={weekBars}>
            <CartesianGrid strokeDasharray="3 3" stroke="#252c3d" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#8B93A7", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#8B93A7", fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
            <Tooltip
              contentStyle={{ background: "#14181f", border: "1px solid #333", borderRadius: 8, fontSize: 12 }}
              formatter={(v) => `${bnNum(v)}%`}
            />
            <Legend wrapperStyle={{ fontSize: 11, color: "#8B93A7" }} />
            <Bar dataKey="গত সপ্তাহ" fill="#3a4256" radius={[4, 4, 0, 0]} />
            <Bar dataKey="এই সপ্তাহ" fill="#E8A33D" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Expense month comparison */}
      <div className="bg-[#1c2230] rounded-2xl p-4 border border-white/5">
        <p className="text-xs text-[#8B93A7] mb-3">খরচ: এই মাস বনাম গত মাস</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] text-[#8B93A7] mb-1">গত মাস</p>
            <p className="text-base font-semibold text-[#8B93A7]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {money(expenseComparison.lastMonth)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-[#8B93A7] mb-1">এই মাস</p>
            <p
              className="text-base font-semibold"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: expenseUp ? "#E5626E" : "#3FA796" }}
            >
              {money(expenseComparison.thisMonth)}
            </p>
          </div>
        </div>
        {expenseComparison.lastMonth > 0 && (
          <p className="text-[11px] mt-2" style={{ color: expenseUp ? "#E5626E" : "#3FA796" }}>
            {expenseUp
              ? `গত মাসের চেয়ে ${money(Math.abs(expenseDiff))} বেশি খরচ হয়েছে`
              : `গত মাসের চেয়ে ${money(Math.abs(expenseDiff))} কম খরচ হয়েছে`}
          </p>
        )}
      </div>
    </div>
  );
}
