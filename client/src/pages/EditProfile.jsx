import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Avatar from '../components/Avatar';

export default function EditProfile() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const res = await api.put('/users/profile', { name, bio, avatar: user?.avatar || '' });
      updateUser(res.data.user);
      toast('تم تحديث الملف الشخصي بنجاح');
      navigate(`/profile/${user.id}`);
    } catch (err) {
      toast(err.response?.data?.error || 'حدث خطأ', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-600"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-slate-800">تعديل الملف الشخصي</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
        {/* Avatar Preview */}
        <div className="flex flex-col items-center mb-2">
          <Avatar name={name || user?.name} size="xl" />
          <p className="text-xs text-slate-400 mt-2">صورة الملف الشخصي تستند إلى اسمك</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1.5">الاسم</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="اسمك الكامل"
            className="w-full bg-slate-50 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 outline-none border border-transparent focus:border-brand-400 transition-colors"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1.5">النبذة التعريفية</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="اكتب نبذة عنك..."
            rows={3}
            maxLength={200}
            className="w-full bg-slate-50 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 outline-none border border-transparent focus:border-brand-400 transition-colors resize-none"
          />
          <div className="text-left text-xs text-slate-400 mt-1">{bio.length}/200</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1.5">اسم المستخدم</label>
          <input
            type="text"
            value={user?.username || ''}
            disabled
            className="w-full bg-slate-100 rounded-xl px-4 py-3 text-slate-400 cursor-not-allowed"
          />
          <p className="text-xs text-slate-400 mt-1">لا يمكن تغيير اسم المستخدم</p>
        </div>

        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="w-full bg-brand-600 text-white rounded-xl py-3 font-semibold hover:bg-brand-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
        </button>
      </form>
    </div>
  );
}
