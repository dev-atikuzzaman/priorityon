import React, { useState, useMemo } from "react";
import {
  Pencil, Trash2, ImagePlus, TrendingUp, ChevronLeft, ChevronRight, Loader2,
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { supabase } from "../lib/supabaseClient";
import {
  FAB, Modal, Field, inputCls, bnDate, bnNum, money, todayISO, monthKey, yearKey, EXPENSE_COLORS,
} from "./ui";

const CATEGORIES = ["খাবার", "যাতায়াত", "বাসাভাড়া", "কেনাকাটা", "স্বাস্থ্য", "বিনোদন", "অন্যান্য"];

export default function ExpensesTab({ expenses, userId, onAdd, onUpdate, onDelete }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ amount: "", category: "খাবার", note: "", date: todayISO(), receipt: null });
  const [uploading, setUploading] = useState(false);
  const [range, setRange] = useState("month");
  const [cursor, setCursor] = useState(todayISO());

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      if (range === "day") return e.date === cursor;
      if (range === "month") return monthKey(e.date) === monthKey(cursor);
      return yearKey(e.date) === yearKey(cursor);
    });
  }, [expenses, range, cursor]);

  const total = filtered.reduce((s, e) => s + Number(e.amount), 0);

  const pieData = useMemo(() => {
    const map = {};
    filtered.forEach((e) => { map[e.category] = (map[e.category] || 0) + Number(e.amount); });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const barData = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      const k = range === "day" ? e.date : monthKey(e.date);
      map[k] = (map[k] || 0) + Number(e.amount);
    });
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0])).slice(-6).map(([k, v]) => ({ label: k.slice(5) || k, value: v }));
  }, [expenses, range]);

  const openAdd = () => { setForm({ amount: "", category: "খাবার", note: "", date: todayISO(), receipt: null }); setModal({ mode: "add" }); };
  const openEdit = (item) => { setForm(item); setModal({ mode: "edit", id: item.id }); };

  const save = () => {
    if (!form.amount || Number(form.amount) <= 0) return;
    const payload = {
      amount: Number(form.amount),
      category: form.category,
      note: form.note,
      date: form.date,
      receipt: form.receipt || null,
    };
    if (modal.mode === "add") onAdd(payload);
    else onUpdate(modal.id, payload);
    setModal(null);
  };

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const path = `${userId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("receipts").upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("receipts").getPublicUrl(path);
      setForm((f) => ({ ...f, receipt: data.publicUrl }));
    } catch (e) {
      console.error("receipt upload failed", e);
      alert("রসিদ আপলোড করা যায়নি। Supabase Storage-এ 'receipts' বাকেট তৈরি ও public করা আছে কিনা দেখো।");
    } finally {
      setUploading(false);
    }
  };

  const shiftCursor = (dir) => {
    const d = new Date(cursor + "T00:00:00");
    if (range === "day") d.setDate(d.getDate() + dir);
    else if (range === "month") d.setMonth(d.getMonth() + dir);
    else d.setFullYear(d.getFullYear() + dir);
    setCursor(d.toISOString().slice(0, 10));
  };

  return (
    <div className="px-4 pb-28 pt-5">
      <div className="flex gap-2 mb-4">
        {[["day", "দিন"], ["month", "মাস"], ["year", "বছর"]].map(([v, l]) => (
          <button key={v} onClick={() => setRange(v)} className={`flex-1 py-2 rounded-xl text-xs font-medium ${range === v ? "bg-amber-400 text-slate-900" : "bg-[#1c2230] text-[#8B93A7]"}`}>{l}</button>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4 bg-[#1c2230] rounded-2xl p-3">
        <button onClick={() => shiftCursor(-1)} className="text-[#8B93A7] p-1"><ChevronLeft size={18} /></button>
        <span className="text-sm text-[#EDEFF3] font-medium">{range === "day" ? bnDate(cursor) : range === "month" ? bnNum(monthKey(cursor)) : bnNum(yearKey(cursor))}</span>
        <button onClick={() => shiftCursor(1)} className="text-[#8B93A7] p-1"><ChevronRight size={18} /></button>
      </div>

      <div className="bg-[#1c2230] rounded-2xl p-4 mb-4 border border-white/5">
        <p className="text-xs text-[#8B93A7] mb-1">মোট খরচ</p>
        <p className="text-2xl font-bold text-[#EDEFF3]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{money(total)}</p>
      </div>

      {pieData.length > 0 && (
        <div className="bg-[#1c2230] rounded-2xl p-4 mb-4 border border-white/5">
          <p className="text-xs text-[#8B93A7] mb-2">ক্যাটাগরি অনুযায়ী</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={3}>
                {pieData.map((_, i) => <Cell key={i} fill={EXPENSE_COLORS[i % EXPENSE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#14181f", border: "1px solid #333", borderRadius: 8, fontSize: 12 }} formatter={(v) => money(v)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {pieData.map((d, i) => (
              <span key={d.name} className="text-[10px] flex items-center gap-1 text-[#c9cee0]">
                <span className="w-2 h-2 rounded-full inline-block" style={{ background: EXPENSE_COLORS[i % EXPENSE_COLORS.length] }} />{d.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {barData.length > 0 && (
        <div className="bg-[#1c2230] rounded-2xl p-4 mb-4 border border-white/5">
          <p className="text-xs text-[#8B93A7] mb-2 flex items-center gap-1"><TrendingUp size={12} /> সাম্প্রতিক প্রবণতা</p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#252c3d" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "#8B93A7", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#8B93A7", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#14181f", border: "1px solid #333", borderRadius: 8, fontSize: 12 }} formatter={(v) => money(v)} />
              <Bar dataKey="value" fill="#3FA796" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <h2 className="text-[#8B93A7] text-xs uppercase tracking-wider mb-2">তালিকা</h2>
      <div className="space-y-2">
        {filtered.map((e) => (
          <div key={e.id} className="flex items-center gap-3 bg-[#1c2230] rounded-2xl p-3.5 border border-white/5">
            {e.receipt && <img src={e.receipt} alt="" className="w-10 h-10 rounded-lg object-cover" />}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#EDEFF3] font-medium">{e.note || e.category}</p>
              <p className="text-[10px] text-[#8B93A7]">{e.category} · {bnDate(e.date)}</p>
            </div>
            <p className="text-sm font-semibold text-[#E5626E]">-{money(e.amount)}</p>
            <button onClick={() => openEdit(e)} className="text-[#8B93A7] p-1"><Pencil size={14} /></button>
            <button onClick={() => onDelete(e.id)} className="text-[#E5626E] p-1"><Trash2 size={14} /></button>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-[#8B93A7] text-sm py-8">এই সময়সীমায় কোনো খরচ নেই।</p>}
      </div>

      <FAB onClick={openAdd} label="খরচ যোগ করো" />

      {modal && (
        <Modal title={modal.mode === "add" ? "নতুন খরচ" : "খরচ সম্পাদনা"} onClose={() => setModal(null)}>
          <Field label="পরিমাণ (৳)">
            <input type="number" className={inputCls} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="০" />
          </Field>
          <Field label="ক্যাটাগরি">
            <select className={inputCls} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="নোট (ঐচ্ছিক)">
            <input className={inputCls} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="কী বাবদ খরচ" />
          </Field>
          <Field label="তারিখ">
            <input type="date" className={inputCls} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </Field>
          <Field label="রসিদ আপলোড (ঐচ্ছিক)">
            <label className="flex items-center gap-2 justify-center border border-dashed border-white/15 rounded-xl py-3 text-[#8B93A7] text-xs cursor-pointer">
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
              {uploading ? "আপলোড হচ্ছে…" : form.receipt ? "ছবি নির্বাচিত হয়েছে — বদলাতে ট্যাপ করো" : "ছবি বেছে নাও"}
              <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => handleUpload(e.target.files?.[0])} />
            </label>
          </Field>
          <button onClick={save} disabled={uploading} className="w-full bg-amber-400 text-slate-900 font-semibold rounded-xl py-2.5 mt-1 disabled:opacity-60">সংরক্ষণ করো</button>
        </Modal>
      )}
    </div>
  );
}
