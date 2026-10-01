# دليل النشر — Vercel + Railway

## نظرة عامة
- **الواجهة (client/)**: تُنشر على Vercel
- **الخادم + قاعدة البيانات (server/)**: تُنشر على Railway

---

## الخطوة 1: نشر الخادم على Railway

1. اذهب إلى [railway.app](https://railway.app) وأنشئ حسابًا
2. **New Project → Deploy from GitHub repo** واختر هذا المستودع
3. **Settings → Root Directory**: اضبطه على `server`
4. أضف خدمة PostgreSQL: **New → Database → PostgreSQL**
5. في إعدادات الخادم (Variables)، أضف:
   - `DATABASE_URL` — انسخه من خدمة PostgreSQL (`Connect` → `Postgres Connection URL`)
   - `JWT_SECRET` — ضع قيمة عشوائية قوية (مثل: `openssl rand -base64 32`)
   - `PORT` — `4000`
6. في **Settings → Networking**، فعّل **Generate Domain** للحصول على رابط عام مثل:
   `https://alshola-server.railway.app`
7. انتظر حتى يكتمل البناء والنشر، ثم اختبر:
   ```
   curl https://alshola-server.railway.app/api/health
   # يجب أن يعيد: {"status":"ok"}
   ```
8. (اختياري) لزرع بيانات تجريبية، شغّل:
   ```
   railway run node prisma/seed.js
   ```

---

## الخطوة 2: نشر الواجهة على Vercel

1. اذهب إلى [vercel.com](https://vercel.com) وأنشئ حسابًا
2. **New Project → Import** هذا المستودع من GitHub
3. **Settings**:
   - **Root Directory**: `client`
   - **Framework Preset**: Vite
   - **Build Command**: `npm install && npm run build`
   - **Output Directory**: `dist`
4. **Environment Variables**:
   - `VITE_API_URL` = رابط الخادم من Railway + `/api`
     مثال: `https://alshola-server.railway.app/api`
5. اضغط **Deploy** وانتظر حتى يكتمل
6. ستحصل على رابط عام مثل: `https://alshola.vercel.app`

---

## الخطوة 3: التحقق

1. افتح رابط Vercel — يجب أن تظهر صفحة تسجيل الدخول
2. أنشئ حسابًا جديدًا أو استخدم الحساب التجريبي (إذا زرعت البيانات):
   - البريد: `demo@alshola.app`
   - كلمة المرور: `password123`
3. جرّب: نشر منشور، البحث عن مستخدمين، إرسال رسالة

---

## ملاحظات
- قاعدة البيانات تُنشأ تلقائيًا عند أول تشغيل عبر `prisma db push`
- `JWT_SECRET` يجب أن يكون قوية وسرية — لا تشاركها
- الخادم يدعم CORS من جميع المصادر (مناسب للنشر على منصات منفصلة)
- التحديثات تُنشر تلقائيًا عند دفع الكود إلى GitHub
