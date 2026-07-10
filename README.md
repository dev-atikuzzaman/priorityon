# নিজের হিসাব

প্রায়োরিটি/হ্যাবিট ট্র্যাকার + খরচের হিসাব + ধার-দেনার খাতা + অগ্রগতি বিশ্লেষণ — মাল্টি-ইউজার PWA, Google একাউন্ট দিয়ে সাইন-ইন, Supabase দিয়ে রিয়েল-টাইম মাল্টি-ডিভাইস সিঙ্ক।

## ১. Supabase প্রজেক্ট বানানো

1. [supabase.com](https://supabase.com) → New Project।
2. প্রজেক্ট তৈরি হলে **Project Settings → API** থেকে দুটো জিনিস কপি করে রাখো:
   - `Project URL`
   - `anon public` key
3. **SQL Editor**-এ গিয়ে এই রিপোর `supabase-schema.sql` ফাইলের পুরো কনটেন্ট paste করে **Run** চাপো। এতে তিনটা টেবিল (`priorities`, `expenses`, `debts`), Row Level Security পলিসি, Realtime, আর `receipts` নামে একটা public storage bucket তৈরি হয়ে যাবে।
4. **Database → Replication**-এ গিয়ে নিশ্চিত করো যে তিনটা টেবিলের Realtime চালু আছে (SQL script-এ থাকা `alter publication` কমান্ড এটা করে দেয়, তবু একবার চেক করে নিও)।

## ২. Google OAuth সেটআপ (Supabase Auth)

1. Supabase Dashboard → **Authentication → Providers → Google** → Enable করো।
2. Google login কাজ করতে একটা Google Cloud OAuth Client লাগবে:
   - [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → OAuth Client ID তৈরি করো (Web application)।
   - **Authorized redirect URI** হিসেবে Supabase-এর দেওয়া callback URL বসাও (Supabase-এর Google provider সেটিংস পেজেই এই URL দেখানো থাকে, সাধারণত `https://<project-ref>.supabase.co/auth/v1/callback`)।
   - Client ID ও Client Secret Supabase-এর Google provider ফর্মে বসিয়ে Save করো।
3. Supabase Dashboard → **Authentication → URL Configuration**-এ তোমার Vercel ডোমেইন (এবং লোকাল `http://localhost:5173`) **Site URL** ও **Redirect URLs**-এ যোগ করে দাও, নাহলে লগইনের পর রিডাইরেক্ট ফেইল করবে।

## ৩. লোকালি চালানো

```bash
npm install
cp .env.example .env
# .env ফাইলে VITE_SUPABASE_URL ও VITE_SUPABASE_ANON_KEY বসাও
npm run dev
```

## ৪. GitHub-এ পুশ করা

```bash
git init
git add .
git commit -m "feat: supabase multi-user sync + insights tab"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

`.env` gitignore-এ আছে, তাই তোমার Supabase key ভুলেও GitHub-এ যাবে না।

## ৫. Vercel-এ ডিপ্লয়

1. [vercel.com](https://vercel.com) → New Project → GitHub repo সিলেক্ট করো।
2. Framework Preset: **Vite** (স্বয়ংক্রিয়ভাবে ধরবে)।
3. **Environment Variables** সেকশনে যোগ করো:
   - `VITE_SUPABASE_URL` → তোমার Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY` → তোমার Supabase anon key
4. Deploy চাপো।
5. ডিপ্লয় হয়ে গেলে সেই Vercel URL-টা Supabase-এর **Authentication → URL Configuration**-এ Site URL/Redirect URL হিসেবে যোগ করে দাও (ধাপ ২-এর শেষ পয়েন্ট)।

## নতুন যা যোগ হলো

- **Google সাইন-ইন + মাল্টি-ইউজার**: প্রতিটা ইউজারের ডেটা Row Level Security দিয়ে আলাদা রাখা, একজন আরেকজনের ডেটা দেখতে পারবে না।
- **রিয়েল-টাইম মাল্টি-ডিভাইস সিঙ্ক**: এক ডিভাইসে কিছু পরিবর্তন করলে অন্য ডিভাইসে সাথে সাথে প্রতিফলিত হবে (Supabase Realtime)।
- **অগ্রগতি ট্যাব (নতুন)**: গত ১৪ দিনের ধারা, এই সপ্তাহ বনাম গত সপ্তাহ তুলনা, খরচের মাসভিত্তিক তুলনা — সব গ্রাফিক্যালি, সাথে পরিস্থিতি অনুযায়ী অনুপ্রেরণামূলক বার্তা।
- **রসিদ আপলোড** এখন Supabase Storage-এ সেভ হয় (আগে শুধু ব্রাউজারে base64 হিসেবে থাকতো), তাই মাল্টি-ডিভাইসেও ছবি দেখা যাবে।
- **ব্রাউজার নোটিফিকেশন**: অ্যাপ/ট্যাব খোলা থাকা অবস্থায় নির্ধারিত সময়ে ও ৫ মিনিট আগে রিমাইন্ডার দেখাবে (প্রথমবার browser permission চাইবে, allow করে দিও)।

## এখনো যা বাদ আছে / ভবিষ্যতের সম্ভাবনা

- **Google Maps from-to** ফিচারটা তোমার অনুরোধ অনুযায়ী বাদ রাখা হয়েছে।
- **ট্যাব/অ্যাপ বন্ধ থাকা অবস্থায় পুশ নোটিফিকেশন** এখনো নেই — এর জন্য Supabase Edge Function + VAPID key + service worker লাগবে। ভবিষ্যতে দরকার হলে বলো, আলাদাভাবে সেটআপ করে দেওয়া যাবে।
