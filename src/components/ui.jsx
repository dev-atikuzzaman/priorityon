import React from "react";
import { Plus, X } from "lucide-react";

export const bnNum = (n) => String(n).replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);
export const money = (n) => "৳" + bnNum(Number(n || 0).toLocaleString("en-IN"));
export const todayISO = () => new Date().toISOString().slice(0, 10);
export const monthKey = (d) => d.slice(0, 7);
export const yearKey = (d) => d.slice(0, 4);

export const bnDate = (iso) => {
  const months = ["জানুয়ারি","ফেব্রুয়ারি","মার্চ","এপ্রিল","মে","জুন","জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"];
  const d = new Date(iso + "T00:00:00");
  return `${bnNum(d.getDate())} ${months[d.getMonth()]}, ${bnNum(d.getFullYear())}`;
};

export const CATEGORY_COLORS = {
  "কাজ": "#E8A33D",
  "স্বাস্থ্য": "#3FA796",
  "ইবাদত": "#8B7FE8",
  "পড়াশোনা": "#5AA9E6",
  "সম্পর্ক": "#E5626E",
  "অন্যান্য": "#8B93A7",
};

export const EXPENSE_COLORS = ["#E8A33D", "#3FA796", "#8B7FE8", "#5AA9E6", "#E5626E", "#65C18C", "#D97757", "#8B93A7"];

export const DEFAULT_PRIORITIES = [
  { name: "ফজরের নামাজ", category: "ইবাদত", planned_minutes: 15, time: "05:00", completed_dates: {}, streak: 0 },
  { name: "পানি পান (৮ গ্লাস)", category: "স্বাস্থ্য", planned_minutes: 5, time: "", completed_dates: {}, streak: 0 },
  { name: "গভীর কাজ / ফোকাস টাইম", category: "কাজ", planned_minutes: 90, time: "09:00", completed_dates: {}, streak: 0 },
  { name: "বই পড়া", category: "পড়াশোনা", planned_minutes: 30, time: "21:00", completed_dates: {}, streak: 0 },
];

export const MOTIVATION = [
  { min: 0, text: "শুরুটা আজই হোক। ছোট এক পা-ই যথেষ্ট।" },
  { min: 25, text: "ভালো শুরু! এভাবেই এগিয়ে যাও।" },
  { min: 50, text: "অর্ধেক পথ পার — এই গতি ধরে রাখো।" },
  { min: 75, text: "চমৎকার! আজকের দিনটা প্রায় জয় করে ফেলেছো।" },
  { min: 100, text: "মাশা'আল্লাহ! আজকের সবকিছু সম্পন্ন। নিজেকে বাহবা দাও।" },
];

export function FAB({ onClick, label }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-5 z-20 flex items-center gap-2 rounded-full bg-amber-400 text-slate-900 px-5 py-3 shadow-lg shadow-amber-400/20 active:scale-95 transition"
    >
      <Plus size={20} strokeWidth={2.5} />
      <span className="font-semibold text-sm">{label}</span>
    </button>
  );
}

export function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-30 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full sm:max-w-md bg-[#1c2230] rounded-t-3xl sm:rounded-3xl border border-white/5 p-5 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[#EDEFF3] font-semibold text-lg" style={{ fontFamily: "'Tiro Bangla', serif" }}>{title}</h3>
          <button onClick={onClose} className="text-[#8B93A7] hover:text-white p-1"><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <div className="mb-3">
      <label className="block text-xs text-[#8B93A7] mb-1">{label}</label>
      {children}
    </div>
  );
}

export const inputCls = "w-full bg-[#14181f] border border-white/10 rounded-xl px-3 py-2.5 text-[#EDEFF3] text-sm outline-none focus:border-amber-400/60";
