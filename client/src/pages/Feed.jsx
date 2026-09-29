import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Check } from 'lucide-react';
import api from '../api';
import Avatar from '../components/Avatar';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/posts'), api.get('/users/suggestions/all')])
      .then(([postsRes, sugRes]) => {
        setPosts(postsRes.data.posts);
        setSuggestions(sugRes.data.users);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleLike = (postId, liked, userId) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const likes = liked
          ? [...p.likes, { userId }]
          : p.likes.filter((l) => l.userId !== userId);
        return { ...p, likes };
      })
    );
  };

  const handleComment = (postId, comment) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, comments: [comment, ...p.comments] } : p))
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center pt-20">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
      {/* Create Post */}
      <CreatePost onPostCreated={handlePostCreated} />

      {/* Suggestions */}
      {suggestions.length > 0 && (
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
      {posts.map((post) => (
        <PostCard key={post.id} post={post} onLike={handleLike} onComment={handleComment} />
      ))}

      {posts.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          لا توجد منشورات بعد. كن أول من ينشر!
        </div>
      )}
    </div>
  );
}

function SuggestionItem({ user }) {
  const [following, setFollowing] = useState(false);

  const handleFollow = async () => {
    try {
      const res = await api.post(`/users/${user.id}/follow`);
      setFollowing(res.data.following);
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
          following
            ? 'bg-slate-100 text-slate-600'
            : 'bg-brand-600 text-white hover:bg-brand-700'
        }`}
      >
        {following ? <Check className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
        {following ? 'متابَع' : 'متابعة'}
      </button>
    </div>
  );
}
