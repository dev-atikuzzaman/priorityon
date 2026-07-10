import React, { useState } from "react";
import { Pencil, Trash2, Check, Flame, Bell } from "lucide-react";
import {
  FAB, Modal, Field, inputCls, bnNum, bnDate, todayISO,
  CATEGORY_COLORS, MOTIVATION,
} from "./ui";

function ProgressRing({ pct, size = 108 }) {
  const r = (size - 12) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="#252c3d" strokeWidth="10" fill="none" />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        stroke="url(#grad)" strokeWidth="10" fill="none"
        strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E8A33D" />
          <stop offset="100%" stopColor="#3FA796" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function PrioritiesTab({ priorities, onAdd, onUpdate, onDelete }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: "", category: "কাজ", planned_minutes: 15, time: "" });
  const today = todayISO();

  const doneToday = priorities.filter((p) => (p.completed_dates || {})[today]).length;
  const pct = priorities.length ? Math.round((doneToday / priorities.length) * 100) : 0;
  const motivation = [...MOTIVATION].reverse().find((m) => pct >= m.min)?.text;

  const openAdd = () => { setForm({ name: "", category: "কাজ", planned_minutes: 15, time: "" }); setModal({ mode: "add" }); };
  const openEdit = (item) => { setForm(item); setModal({ mode: "edit", id: item.id }); };

  const save = () => {
    if (!form.name.trim()) return;
    if (modal.mode === "add") {
      onAdd({
        name: form.name,
        category: form.category,
        planned_minutes: Number(form.planned_minutes) || 0,
        time: form.time,
        completed_dates: {},
        streak: 0,
      });
    } else {
      onUpdate(modal.id, {
        name: form.name,
        category: form.category,
        planned_minutes: Number(form.planned_minutes) || 0,
        time: form.time,
      });
    }
    setModal(null);
  };

  const toggleToday = (item) => {
    const done = { ...(item.completed_dates || {}) };
    let streak = item.streak || 0;
    if (done[today]) {
      delete done[today];
      streak = Math.max(0, streak - 1);
    } else {
      done[today] = true;
      streak = streak + 1;
    }
    onUpdate(item.id, { completed_dates: done, streak });
  };

  return (
    <div className="px-4 pb-28 pt-5">
      <div className="flex flex-col items-center mb-6">
        <div className="relative">
          <ProgressRing pct={pct} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-[#EDEFF3]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{bnNum(pct)}%</span>
            <span className="text-[10px] text-[#8B93A7]">{bnNum(doneToday)}/{bnNum(priorities.length)}</span>
          </div>
        </div>
        <p className="mt-4 text-center text-sm text-[#c9cee0] max-w-xs">{motivation}</p>
      </div>

      <h2 className="text-[#8B93A7] text-xs uppercase tracking-wider mb-2">আজকের প্রায়োরিটি — {bnDate(today)}</h2>

      <div className="space-y-2.5">
        {priorities.map((p) => {
          const done = !!(p.completed_dates || {})[today];
          const color = CATEGORY_COLORS[p.category] || "#8B93A7";
          return (
            <div key={p.id} className="flex items-center gap-3 bg-[#1c2230] rounded-2xl p-3.5 border border-white/5">
              <button
                onClick={() => toggleToday(p)}
                className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 transition"
                style={{ borderColor: color, background: done ? color : "transparent" }}
              >
                {done && <Check size={16} className="text-slate-900" strokeWidth={3} />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${done ? "text-[#8B93A7] line-through" : "text-[#EDEFF3]"}`}>{p.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md" style={{ background: color + "22", color }}>{p.category}</span>
                  {p.time && <span className="text-[10px] text-[#8B93A7]">{p.time}</span>}
                  {p.streak > 0 && (
                    <span className="flex items-center gap-0.5 text-[10px] text-amber-400"><Flame size={11} />{bnNum(p.streak)}</span>
                  )}
                </div>
              </div>
              <button onClick={() => openEdit(p)} className="text-[#8B93A7] p-1.5"><Pencil size={15} /></button>
              <button onClick={() => onDelete(p.id)} className="text-[#E5626E] p-1.5"><Trash2 size={15} /></button>
            </div>
          );
        })}
        {priorities.length === 0 && (
          <p className="text-center text-[#8B93A7] text-sm py-10">এখনও কোনো প্রায়োরিটি যোগ করা হয়নি।</p>
        )}
      </div>

      <FAB onClick={openAdd} label="নতুন প্রায়োরিটি" />

      {modal && (
        <Modal title={modal.mode === "add" ? "নতুন প্রায়োরিটি" : "প্রায়োরিটি সম্পাদনা"} onClose={() => setModal(null)}>
          <Field label="নাম">
            <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="যেমন: সকালে হাঁটা" />
          </Field>
          <Field label="ক্যাটাগরি">
            <select className={inputCls} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {Object.keys(CATEGORY_COLORS).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="সময়কাল (মিনিট)">
              <input type="number" className={inputCls} value={form.planned_minutes} onChange={(e) => setForm({ ...form, planned_minutes: e.target.value })} />
            </Field>
            <Field label="সময় (ঐচ্ছিক)">
              <input type="time" className={inputCls} value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
            </Field>
          </div>
          <p className="text-[11px] text-[#8B93A7] flex items-center gap-1.5 mb-3"><Bell size={12} /> অ্যাপ খোলা থাকলে নির্ধারিত সময়ে ও ৫ মিনিট আগে ব্রাউজার নোটিফিকেশন পাবে।</p>
          <button onClick={save} className="w-full bg-amber-400 text-slate-900 font-semibold rounded-xl py-2.5 mt-1">সংরক্ষণ করো</button>
        </Modal>
      )}
    </div>
  );
}
