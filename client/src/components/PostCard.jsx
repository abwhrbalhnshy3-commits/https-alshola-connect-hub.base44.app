import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Send } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import { timeAgo } from '../utils';

export default function PostCard({ post, onLike, onComment }) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commenting, setCommenting] = useState(false);

  const liked = post.likes.some((l) => l.userId === user?.id);

  const handleLike = async () => {
    try {
      const res = await api.post(`/posts/${post.id}/like`);
      onLike(post.id, res.data.liked, user.id);
    } catch (err) {
      console.error(err);
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
      console.error(err);
    } finally {
      setCommenting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <Link to={`/profile/${post.user.id}`}>
          <Avatar name={post.user.name} />
        </Link>
        <div className="flex-1">
          <Link to={`/profile/${post.user.id}`} className="font-semibold text-slate-800 hover:underline">
            {post.user.name}
          </Link>
          <div className="text-xs text-slate-400">{timeAgo(post.createdAt)}</div>
        </div>
      </div>

      {/* Content */}
      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap mb-3">{post.content}</p>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2 border-t border-slate-100">
        <button
          onClick={handleLike}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-rose-500 transition-colors"
        >
          <Heart className={`w-5 h-5 ${liked ? 'fill-rose-500 text-rose-500' : ''}`} />
          <span>{post.likes.length}</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-500 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span>{post.comments.length}</span>
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
          {post.comments.map((c) => (
            <div key={c.id} className="flex gap-2">
              <Link to={`/profile/${c.user.id}`}>
                <Avatar name={c.user.name} size="sm" />
              </Link>
              <div className="flex-1 bg-slate-50 rounded-xl px-3 py-2">
                <Link to={`/profile/${c.user.id}`} className="font-semibold text-sm text-slate-700 hover:underline">
                  {c.user.name}
                </Link>
                <p className="text-sm text-slate-600">{c.content}</p>
              </div>
            </div>
          ))}

          <form onSubmit={handleComment} className="flex gap-2 items-center">
            <Avatar name={user?.name} size="sm" />
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="اكتب تعليقاً..."
              className="flex-1 bg-slate-50 rounded-full px-4 py-2 text-sm text-slate-700 placeholder-slate-400 outline-none border border-transparent focus:border-brand-400 transition-colors"
            />
            <button
              type="submit"
              disabled={!commentText.trim() || commenting}
              className="p-2 text-brand-600 hover:bg-brand-50 rounded-full disabled:opacity-30 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
