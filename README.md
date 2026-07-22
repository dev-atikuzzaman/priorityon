# নিজের হিসাব

প্রায়োরিটি/হ্যাবিট ট্র্যাকার + খরচের হিসাব + ধার-দেনার খাতা + অগ্রগতি বিশ্লেষণ — মাল্টি-ইউজার PWA, Google একাউন্ট দিয়ে সাইন-ইন, Supabase দিয়ে রিয়েল-টাইম মাল্টি-ডিভাইস সিঙ্ক।

## নতুন: যেকোনো তারিখের হিসাব

- **প্রায়োরিটি ট্যাব**-এ এখন তারিখ পাল্টানোর নেভিগেটর আছে (◀ ▶) — শুধু আজ না, অতীতের যেকোনো দিনে গিয়ে টাস্ক সম্পন্ন/অসম্পন্ন মার্ক করা যাবে বা মিস হওয়া দিন পূরণ করা যাবে। ভবিষ্যৎ তারিখে যাওয়া বন্ধ রাখা হয়েছে (যৌক্তিক কারণে)।
- **খরচ ও ধার-দেনা**-তে আগে থেকেই তারিখ নির্বাচনের সুযোগ ছিল — এন্ট্রি অ্যাড/এডিট করার সময় তারিখ ফিল্ড থেকে যেকোনো পুরনো তারিখ বসানো যায়।
- স্ট্রিক (Flame আইকন) শুধু আজকের এন্ট্রির উপর নির্ভর করে হিসাব হয়, যাতে পুরনো তারিখ এডিট করলে স্ট্রিক ভুলভাবে না বাড়ে/কমে।

## ১. Supabase প্রজেক্ট বানানো

1. [supabase.com](https://supabase.com) → New Project।
2. **Project Settings → API** থেকে কপি করো:
   - `Project URL`
   - `anon public` key
3. **SQL Editor**-এ `supabase-schema.sql`-এর পুরো কনটেন্ট paste করে **Run** করো।
4. **Database → Replication**-এ priorities/expenses/debts টেবিলের Realtime চালু আছে কিনা চেক করো।

## ২. Google OAuth সেটআপ

1. Supabase Dashboard → **Authentication → Providers → Google** → Enable।
2. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → OAuth Client ID (Web application) তৈরি করো, redirect URI-তে Supabase-এর দেওয়া callback URL বসাও।
3. Client ID/Secret Supabase-এ বসাও।
4. Supabase → **Authentication → URL Configuration**-এ তোমার Vercel ডোমেইন ও `http://localhost:5173` Site URL/Redirect URLs-এ যোগ করো।

## ৩. লোকালি চালানো

```bash
npm install
cp .env.example .env
# .env-এ VITE_SUPABASE_URL ও VITE_SUPABASE_ANON_KEY বসাও
npm run dev
```

## ৪. GitHub-এ পুশ

```bash
git init
git add .
git commit -m "feat: any-date tracking + supabase sync"
git branch -M main
git remote add origin https://github.com/<username>/<repo>.git
git push -u origin main
```

## ৫. Vercel-এ ডিপ্লয়

1. Vercel → New Project → repo সিলেক্ট।
2. Framework: **Vite** (auto-detect)।
3. Environment Variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`।
4. Deploy → এরপর Vercel URL-টা Supabase Redirect URLs-এ যোগ করো।

## সীমাবদ্ধতা

- ট্যাব/অ্যাপ বন্ধ থাকা অবস্থায় পুশ নোটিফিকেশন এখনো নেই (লাগবে Edge Function + VAPID + service worker)।
- Google Maps ফিচার অন্তর্ভুক্ত নেই (অনুরোধ অনুযায়ী বাদ)।
