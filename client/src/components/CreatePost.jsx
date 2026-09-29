import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import Avatar from './Avatar';

export default function CreatePost({ onPostCreated }) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || loading) return;

    setLoading(true);
    try {
      const res = await api.post('/posts', { content });
      onPostCreated(res.data.post);
      setContent('');
    } catch (err) {
      alert(err.response?.data?.error || 'حدث خطأ أثناء النشر');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <Avatar name={user?.name} />
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="بماذا تفكر؟"
              rows={2}
              className="w-full resize-none bg-slate-50 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 outline-none border border-transparent focus:border-brand-400 transition-colors"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-slate-400">{content.length}/500</span>
              <button
                type="submit"
                disabled={!content.trim() || loading}
                className="px-5 py-2 bg-brand-600 text-white rounded-full font-medium text-sm hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'جارٍ النشر...' : 'نشر'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
