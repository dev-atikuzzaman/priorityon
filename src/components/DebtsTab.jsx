import React, { useState } from "react";
import { Pencil, Trash2, Check, TrendingDown, TrendingUp } from "lucide-react";
import { FAB, Modal, Field, inputCls, bnDate, money, todayISO } from "./ui";

export default function DebtsTab({ debts, onAdd, onUpdate, onDelete }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: "", amount: "", type: "owe", note: "", date: todayISO() });

  const active = debts.filter((d) => !d.settled);
  const settled = debts.filter((d) => d.settled);

  const iOwe = active.filter((d) => d.type === "owe").reduce((s, d) => s + Number(d.amount), 0);
  const owedToMe = active.filter((d) => d.type === "owed").reduce((s, d) => s + Number(d.amount), 0);

  const openAdd = () => { setForm({ name: "", amount: "", type: "owe", note: "", date: todayISO() }); setModal({ mode: "add" }); };
  const openEdit = (item) => { setForm(item); setModal({ mode: "edit", id: item.id }); };

  const save = () => {
    if (!form.name.trim() || !form.amount) return;
    const payload = {
      name: form.name,
      amount: Number(form.amount),
      type: form.type,
      note: form.note,
      date: form.date,
    };
    if (modal.mode === "add") onAdd({ ...payload, settled: false, settled_date: null });
    else onUpdate(modal.id, payload);
    setModal(null);
  };

  const toggleSettled = (item) => {
    onUpdate(item.id, {
      settled: !item.settled,
      settled_date: !item.settled ? todayISO() : null,
    });
  };

  return (
    <div className="px-4 pb-28 pt-5">
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-[#1c2230] rounded-2xl p-4 border border-white/5">
          <p className="text-[10px] text-[#8B93A7] flex items-center gap-1 mb-1"><TrendingDown size={12} className="text-[#E5626E]" /> আমি দেব</p>
          <p className="text-lg font-bold text-[#E5626E]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{money(iOwe)}</p>
        </div>
        <div className="bg-[#1c2230] rounded-2xl p-4 border border-white/5">
          <p className="text-[10px] text-[#8B93A7] flex items-center gap-1 mb-1"><TrendingUp size={12} className="text-[#3FA796]" /> আমি পাব</p>
          <p className="text-lg font-bold text-[#3FA796]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{money(owedToMe)}</p>
        </div>
      </div>

      <h2 className="text-[#8B93A7] text-xs uppercase tracking-wider mb-2">চলমান</h2>
      <div className="space-y-2 mb-6">
        {active.map((d) => (
          <div key={d.id} className="flex items-center gap-3 bg-[#1c2230] rounded-2xl p-3.5 border border-white/5">
            <button onClick={() => toggleSettled(d)} className="shrink-0 w-7 h-7 rounded-full border-2 border-[#3FA796] flex items-center justify-center" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#EDEFF3] font-medium">{d.name}</p>
              <p className="text-[10px] text-[#8B93A7]">{d.type === "owe" ? "আমি দেব" : "আমি পাব"} · {bnDate(d.date)}{d.note ? " · " + d.note : ""}</p>
            </div>
            <p className={`text-sm font-semibold ${d.type === "owe" ? "text-[#E5626E]" : "text-[#3FA796]"}`}>{money(d.amount)}</p>
            <button onClick={() => openEdit(d)} className="text-[#8B93A7] p-1"><Pencil size={14} /></button>
            <button onClick={() => onDelete(d.id)} className="text-[#8B93A7] p-1"><Trash2 size={14} /></button>
          </div>
        ))}
        {active.length === 0 && <p className="text-center text-[#8B93A7] text-sm py-6">কোনো চলমান হিসাব নেই।</p>}
      </div>

      {settled.length > 0 && (
        <>
          <h2 className="text-[#8B93A7] text-xs uppercase tracking-wider mb-2">শোধ হয়েছে</h2>
          <div className="space-y-2">
            {settled.map((d) => (
              <div key={d.id} className="flex items-center gap-3 bg-[#1c2230]/50 rounded-2xl p-3.5 border border-white/5 opacity-60">
                <div className="shrink-0 w-7 h-7 rounded-full bg-[#3FA796] flex items-center justify-center"><Check size={14} className="text-slate-900" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#EDEFF3] line-through">{d.name}</p>
                  <p className="text-[10px] text-[#8B93A7]">শোধ: {bnDate(d.settled_date || d.date)}</p>
                </div>
                <p className="text-sm text-[#8B93A7]">{money(d.amount)}</p>
                <button onClick={() => toggleSettled(d)} className="text-[10px] text-amber-400">ফিরিয়ে আনো</button>
                <button onClick={() => onDelete(d.id)} className="text-[#8B93A7] p-1"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </>
      )}

      <FAB onClick={openAdd} label="নতুন হিসাব" />

      {modal && (
        <Modal title={modal.mode === "add" ? "নতুন ধার-দেনা" : "হিসাব সম্পাদনা"} onClose={() => setModal(null)}>
          <Field label="নাম">
            <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ব্যক্তির নাম" />
          </Field>
          <Field label="ধরন">
            <div className="flex gap-2">
              <button onClick={() => setForm({ ...form, type: "owe" })} className={`flex-1 py-2 rounded-xl text-xs font-medium ${form.type === "owe" ? "bg-[#E5626E] text-white" : "bg-[#14181f] text-[#8B93A7]"}`}>আমি দেব</button>
              <button onClick={() => setForm({ ...form, type: "owed" })} className={`flex-1 py-2 rounded-xl text-xs font-medium ${form.type === "owed" ? "bg-[#3FA796] text-white" : "bg-[#14181f] text-[#8B93A7]"}`}>আমি পাব</button>
            </div>
          </Field>
          <Field label="পরিমাণ (৳)">
            <input type="number" className={inputCls} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          </Field>
          <Field label="তারিখ">
            <input type="date" className={inputCls} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </Field>
          <Field label="নোট (ঐচ্ছিক)">
            <input className={inputCls} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="কারণ / সম্পদের বিবরণ" />
          </Field>
          <button onClick={save} className="w-full bg-amber-400 text-slate-900 font-semibold rounded-xl py-2.5 mt-1">সংরক্ষণ করো</button>
        </Modal>
      )}
    </div>
  );
}
