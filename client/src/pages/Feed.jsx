import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Check } from 'lucide-react';
import api from '../api';
import Avatar from '../components/Avatar';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import { PostSkeleton } from '../components/Skeleton';
import { useToast } from '../context/ToastContext';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(tab === 'following' ? '/posts/following' : '/posts'),
      api.get('/users/suggestions/all'),
    ])
      .then(([postsRes, sugRes]) => {
        setPosts(postsRes.data.posts);
        setSuggestions(sugRes.data.users);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [tab]);

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
    toast('تم نشر المنشور بنجاح');
  };

  const handleReaction = (postId, reaction, userId) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const likes = p.likes.filter((item) => item.userId !== userId);
        if (reaction) likes.push({ userId, type: reaction });
        return { ...p, likes };
      })
    );
  };

  const handleComment = (postId, comment) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, comments: [comment, ...p.comments] } : p))
    );
  };

  const handleCommentDelete = (postId, commentId) => {
    setPosts((prev) => prev.map((p) => (
      p.id === postId ? { ...p, comments: p.comments.filter((comment) => comment.id !== commentId) } : p
    )));
  };

  const handleDelete = (postId) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
      <CreatePost onPostCreated={handlePostCreated} />

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-1">
        <button
          onClick={() => setTab('all')}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
            tab === 'all' ? 'bg-brand-600 text-white' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          الكل
        </button>
        <button
          onClick={() => setTab('following')}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
            tab === 'following' ? 'bg-brand-600 text-white' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          المتابعون
        </button>
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <PostSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Suggestions */}
      {!loading && suggestions.length > 0 && tab === 'all' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
          <h3 className="font-semibold text-slate-800 mb-3">أشخاص قد تعرفهم</h3>
          <div className="space-y-2">
            {suggestions.map((u) => (
              <SuggestionItem key={u.id} user={u} />
            ))}
          </div>
        </div>
      )}

      {/* Posts */}
      {!loading &&
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onReaction={handleReaction}
            onComment={handleComment}
            onCommentDelete={handleCommentDelete}
            onDelete={handleDelete}
          />
        ))}

      {!loading && posts.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          {tab === 'following'
            ? 'لا توجد منشورات من الأشخاص الذين تتابعهم. تابع المزيد من الأشخاص!'
            : 'لا توجد منشورات بعد. كن أول من ينشر!'}
        </div>
      )}
    </div>
  );
}

function SuggestionItem({ user }) {
  const [following, setFollowing] = useState(false);
  const { toast } = useToast();

  const handleFollow = async () => {
    try {
      const res = await api.post(`/users/${user.id}/follow`);
      setFollowing(res.data.following);
      toast(res.data.following ? `تتابع الآن ${user.name}` : `ألغيت متابعة ${user.name}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Link to={`/profile/${user.id}`}>
        <Avatar name={user.name} size="sm" />
      </Link>
      <div className="flex-1 min-w-0">
        <Link to={`/profile/${user.id}`} className="font-semibold text-sm text-slate-700 hover:underline truncate block">
          {user.name}
        </Link>
        <p className="text-xs text-slate-400 truncate">{user.bio || `@${user.username}`}</p>
      </div>
      <button
        onClick={handleFollow}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
          following ? 'bg-slate-100 text-slate-600' : 'bg-brand-600 text-white hover:bg-brand-700'
        }`}
      >
        {following ? <Check className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
        {following ? 'متابَع' : 'متابعة'}
      </button>
    </div>
  );
}
