import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-extrabold text-brand-600 mb-2">٤٠٤</h1>
        <p className="text-slate-600 text-lg mb-6">الصفحة غير موجودة</p>
        <Link
          to="/"
          className="bg-brand-600 text-white rounded-xl px-6 py-3 font-semibold hover:bg-brand-700 transition-colors"
        >
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
