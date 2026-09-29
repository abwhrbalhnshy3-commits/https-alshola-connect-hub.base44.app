import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { UserPlus, Check, Calendar, Pencil, X, Users } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Avatar from '../components/Avatar';
import PostCard from '../components/PostCard';
import { ProfileSkeleton, PostSkeleton } from '../components/Skeleton';
import { timeAgo } from '../utils';

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState(null);

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
      toast(res.data.following ? `تتابع الآن ${profile.name}` : `ألغيت متابعة ${profile.name}`);
    } catch (err) {
      console.error(err);
    }
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
    setProfile((prev) => ({
      ...prev,
      _count: { ...prev._count, posts: prev._count.posts - 1 },
    }));
  };

  const openConnections = async (type) => {
    try {
      const res = await api.get(`/users/${id}/${type}`);
      setConnections({ type, users: res.data.users });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        <ProfileSkeleton />
        {[1, 2].map((i) => (
          <PostSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center pt-20 text-slate-400">المستخدم غير موجود</div>;
  }

  const isOwnProfile = currentUser?.id === profile.id;

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-20">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="h-28 bg-gradient-to-br from-brand-500 to-purple-600" />
        <div className="px-4 pb-4">
          <div className="flex items-end justify-between -mt-12 mb-3">
            <div className="ring-4 ring-white rounded-full">
              <Avatar name={profile.name} size="xl" />
            </div>
            {isOwnProfile ? (
              <button
                onClick={() => navigate('/edit-profile')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors mt-12"
              >
                <Pencil className="w-4 h-4" />
                تعديل الملف
              </button>
            ) : (
              <button
                onClick={handleFollow}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors mt-12 ${
                  following ? 'bg-slate-100 text-slate-600' : 'bg-brand-600 text-white hover:bg-brand-700'
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
            <button onClick={() => openConnections('followers')} className="text-right hover:opacity-70 transition-opacity">
              <span className="font-bold text-slate-800">{profile._count.followers}</span>
              <span className="text-slate-400 text-sm mr-1">متابع</span>
            </button>
            <button onClick={() => openConnections('following')} className="text-right hover:opacity-70 transition-opacity">
              <span className="font-bold text-slate-800">{profile._count.following}</span>
              <span className="text-slate-400 text-sm mr-1">يتابع</span>
            </button>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="mt-4 space-y-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onReaction={handleReaction}
            onComment={handleComment}
            onCommentDelete={handleCommentDelete}
            onDelete={handleDelete}
          />
        ))}
        {posts.length === 0 && (
          <div className="text-center py-12 text-slate-400 bg-white rounded-2xl border border-slate-200">
            لا توجد منشورات بعد
          </div>
        )}
      </div>

      {/* Connections Modal */}
      {connections && (
        <ConnectionsModal
          connections={connections}
          onClose={() => setConnections(null)}
          onSwitch={openConnections}
        />
      )}
    </div>
  );
}

function ConnectionsModal({ connections, onClose, onSwitch }) {
  return (
    <div
      className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[70vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">
            {connections.type === 'followers' ? 'المتابعون' : 'يتابع'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-1 px-4 pt-2">
          <button
            onClick={() => onSwitch('followers')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
              connections.type === 'followers' ? 'bg-brand-50 text-brand-600' : 'text-slate-400 hover:bg-slate-50'
            }`}
          >
            المتابعون
          </button>
          <button
            onClick={() => onSwitch('following')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
              connections.type === 'following' ? 'bg-brand-50 text-brand-600' : 'text-slate-400 hover:bg-slate-50'
            }`}
          >
            يتابع
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {connections.users.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">لا يوجد مستخدمون</p>
            </div>
          ) : (
            connections.users.map((u) => (
              <Link
                key={u.id}
                to={`/profile/${u.id}`}
                onClick={onClose}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <Avatar name={u.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-700 truncate">{u.name}</p>
                  <p className="text-xs text-slate-400 truncate">@{u.username}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
