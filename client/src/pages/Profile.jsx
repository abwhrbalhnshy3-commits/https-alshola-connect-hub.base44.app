import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { UserPlus, Check, Calendar } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import PostCard from '../components/PostCard';
import { timeAgo } from '../utils';

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/users/${id}`),
      api.get(`/users/${id}/posts`),
      api.get(`/users/${id}/isFollowing`).catch(() => ({ data: { following: false } })),
    ])
      .then(([userRes, postsRes, followRes]) => {
        setProfile(userRes.data.user);
        setPosts(postsRes.data.posts);
        setFollowing(followRes.data.following);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleFollow = async () => {
    try {
      const res = await api.post(`/users/${id}/follow`);
      setFollowing(res.data.following);
      setProfile((prev) => ({
        ...prev,
        _count: {
          ...prev._count,
          followers: prev._count.followers + (res.data.following ? 1 : -1),
        },
      }));
    } catch (err) {
      console.error(err);
    }
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

  if (!profile) {
    return <div className="text-center pt-20 text-slate-400">المستخدم غير موجود</div>;
  }

  const isOwnProfile = currentUser?.id === profile.id;

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="h-28 bg-gradient-to-br from-brand-500 to-purple-600" />
        <div className="px-4 pb-4">
          <div className="flex items-end justify-between -mt-12 mb-3">
            <div className="ring-4 ring-white rounded-full">
              <Avatar name={profile.name} size="xl" />
            </div>
            {!isOwnProfile && (
              <button
                onClick={handleFollow}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors mt-12 ${
                  following
                    ? 'bg-slate-100 text-slate-600'
                    : 'bg-brand-600 text-white hover:bg-brand-700'
                }`}
              >
                {following ? <Check className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                {following ? 'متابَع' : 'متابعة'}
              </button>
            )}
          </div>

          <h2 className="text-xl font-bold text-slate-800">{profile.name}</h2>
          <p className="text-slate-400 text-sm">@{profile.username}</p>
          {profile.bio && <p className="text-slate-600 text-sm mt-2">{profile.bio}</p>}

          <div className="flex items-center gap-1 text-xs text-slate-400 mt-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>انضم في {timeAgo(profile.createdAt)}</span>
          </div>

          <div className="flex gap-6 mt-4 pt-4 border-t border-slate-100">
            <div>
              <span className="font-bold text-slate-800">{profile._count.posts}</span>
              <span className="text-slate-400 text-sm mr-1">منشور</span>
            </div>
            <div>
              <span className="font-bold text-slate-800">{profile._count.followers}</span>
              <span className="text-slate-400 text-sm mr-1">متابع</span>
            </div>
            <div>
              <span className="font-bold text-slate-800">{profile._count.following}</span>
              <span className="text-slate-400 text-sm mr-1">يتابع</span>
            </div>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="mt-4 space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} onLike={handleLike} onComment={handleComment} />
        ))}
        {posts.length === 0 && (
          <div className="text-center py-12 text-slate-400 bg-white rounded-2xl border border-slate-200">
            لا توجد منشورات بعد
          </div>
        )}
      </div>
    </div>
  );
}
