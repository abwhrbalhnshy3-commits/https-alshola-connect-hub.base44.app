import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Send, Trash2, SmilePlus } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Avatar from './Avatar';
import { timeAgo } from '../utils';

const REACTIONS = [
  { type: 'like', emoji: '👍', label: 'إعجاب' },
  { type: 'love', emoji: '❤️', label: 'أحببته' },
  { type: 'laugh', emoji: '😂', label: 'مضحك' },
  { type: 'wow', emoji: '😮', label: 'مذهل' },
  { type: 'sad', emoji: '😢', label: 'محزن' },
  { type: 'angry', emoji: '😡', label: 'غاضب' },
];

export default function PostCard({ post, onReaction, onComment, onCommentDelete, onDelete }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showComments, setShowComments] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commenting, setCommenting] = useState(false);
  const [reacting, setReacting] = useState(false);

  const currentReaction = post.likes.find((reaction) => reaction.userId === user?.id)?.type;
  const reactionCounts = post.likes.reduce((counts, reaction) => {
    counts[reaction.type || 'like'] = (counts[reaction.type || 'like'] || 0) + 1;
    return counts;
  }, {});
  const topReactions = REACTIONS.filter((reaction) => reactionCounts[reaction.type]).slice(0, 3);
  const selectedReaction = REACTIONS.find((reaction) => reaction.type === currentReaction);

  const handleReaction = async (type) => {
    if (reacting) return;
    setReacting(true);
    try {
      const res = await api.post(`/posts/${post.id}/reaction`, { type });
      onReaction(post.id, res.data.reaction, user.id);
      setShowReactions(false);
    } catch (err) {
      toast(err.response?.data?.error || 'تعذر حفظ التفاعل', 'error');
    } finally {
      setReacting(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || commenting) return;
    setCommenting(true);
    try {
      const res = await api.post(`/posts/${post.id}/comments`, { content: commentText });
      onComment(post.id, res.data.comment);
      setCommentText('');
    } catch (err) {
      toast(err.response?.data?.error || 'تعذر إضافة التعليق', 'error');
    } finally {
      setCommenting(false);
    }
  };

  const handleCommentDelete = async (commentId) => {
    try {
      await api.delete(`/posts/${post.id}/comments/${commentId}`);
      onCommentDelete(post.id, commentId);
      toast('تم حذف التعليق', 'info');
    } catch (err) {
      toast(err.response?.data?.error || 'تعذر حذف التعليق', 'error');
    }
  };

  const handleDelete = async () => {
    if (!confirm('هل أنت متأكد من حذف هذا المنشور؟')) return;
    try {
      await api.delete(`/posts/${post.id}`);
      onDelete(post.id);
      toast('تم حذف المنشور', 'info');
    } catch (err) {
      toast(err.response?.data?.error || 'حدث خطأ', 'error');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
      <div className="flex items-center gap-3 mb-3">
        <Link to={`/profile/${post.user.id}`}><Avatar name={post.user.name} /></Link>
        <div className="flex-1">
          <Link to={`/profile/${post.user.id}`} className="font-semibold text-slate-800 hover:underline">{post.user.name}</Link>
          <div className="text-xs text-slate-400">{timeAgo(post.createdAt)}</div>
        </div>
        {post.user.id === user?.id && (
          <button onClick={handleDelete} className="p-2 rounded-full hover:bg-rose-50 transition-colors text-slate-400 hover:text-rose-500" title="حذف المنشور">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap mb-3">{post.content}</p>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div className="relative">
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleReaction(currentReaction || 'like')}
              className={`flex items-center gap-1.5 text-sm transition-colors ${selectedReaction ? 'text-brand-600' : 'text-slate-500 hover:text-brand-500'}`}
              title={selectedReaction?.label || 'تفاعل'}
            >
              <span className="text-lg leading-none">{selectedReaction?.emoji || '👍'}</span>
              <span>{post.likes.length}</span>
            </button>
            <button onClick={() => setShowReactions(!showReactions)} className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100" title="تفاعلات أخرى">
              <SmilePlus className="w-4 h-4" />
            </button>
          </div>
          {showReactions && (
            <div className="absolute bottom-10 right-0 z-10 flex gap-1 rounded-full bg-white border border-slate-200 shadow-lg p-2" role="menu">
              {REACTIONS.map((reaction) => (
                <button key={reaction.type} onClick={() => handleReaction(reaction.type)} className={`p-1.5 rounded-full text-xl hover:bg-slate-100 hover:scale-110 transition-transform ${currentReaction === reaction.type ? 'bg-brand-50' : ''}`} title={reaction.label}>
                  {reaction.emoji}
                </button>
              ))}
            </div>
          )}
        </div>
        <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-500 transition-colors">
          <MessageCircle className="w-5 h-5" />
          <span>{post.comments.length}</span>
        </button>
      </div>

      {post.likes.length > 0 && (
        <div className="flex items-center gap-1 mt-2 text-xs text-slate-400" aria-label="ملخص التفاعلات">
          <span className="flex -space-x-1 rtl:space-x-reverse">{topReactions.map((reaction) => <span key={reaction.type} className="bg-slate-100 rounded-full px-1">{reaction.emoji}</span>)}</span>
          <span>{post.likes.length} تفاعل</span>
        </div>
      )}

      {showComments && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
          {post.comments.map((c) => (
            <div key={c.id} className="flex gap-2">
              <Link to={`/profile/${c.user.id}`}><Avatar name={c.user.name} size="sm" /></Link>
              <div className="flex-1 bg-slate-50 rounded-xl px-3 py-2">
                <div className="flex items-center gap-2">
                  <Link to={`/profile/${c.user.id}`} className="font-semibold text-sm text-slate-700 hover:underline">{c.user.name}</Link>
                  <span className="text-[10px] text-slate-400">{timeAgo(c.createdAt)}</span>
                  {c.user.id === user?.id && <button onClick={() => handleCommentDelete(c.id)} className="mr-auto text-slate-400 hover:text-rose-500" title="حذف التعليق"><Trash2 className="w-3.5 h-3.5" /></button>}
                </div>
                <p className="text-sm text-slate-600 mt-0.5">{c.content}</p>
              </div>
            </div>
          ))}

          <form onSubmit={handleComment} className="flex gap-2 items-center">
            <Avatar name={user?.name} size="sm" />
            <input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="اكتب تعليقاً..." className="flex-1 bg-slate-50 rounded-full px-4 py-2 text-sm text-slate-700 placeholder-slate-400 outline-none border border-transparent focus:border-brand-400 transition-colors" />
            <button type="submit" disabled={!commentText.trim() || commenting} className="p-2 text-brand-600 hover:bg-brand-50 rounded-full disabled:opacity-30 transition-colors"><Send className="w-5 h-5" /></button>
          </form>
        </div>
      )}
    </div>
  );
}
