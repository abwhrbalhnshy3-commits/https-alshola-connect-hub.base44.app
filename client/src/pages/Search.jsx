import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, UserPlus, Check, X } from 'lucide-react';
import api from '../api';
import Avatar from '../components/Avatar';
import { PostSkeleton } from '../components/Skeleton';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.get(`/users/search/all?q=${encodeURIComponent(query)}`);
        setResults(res.data.users);
        setSearched(true);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-20">
      {/* Search Bar */}
      <div className="relative mb-4">
        <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث عن مستخدمين بالاسم أو اسم المستخدم..."
          className="w-full bg-white rounded-2xl shadow-sm border border-slate-200 pr-11 pl-10 py-3 text-slate-800 placeholder-slate-400 outline-none focus:border-brand-400 transition-colors"
          autoFocus
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Results */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-200 rounded-full" />
              <div className="flex-1">
                <div className="h-4 w-32 bg-slate-200 rounded mb-2" />
                <div className="h-3 w-24 bg-slate-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <SearchIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>لا توجد نتائج للبحث عن "{query}"</p>
        </div>
      )}

      {!loading && !searched && (
        <div className="text-center py-16 text-slate-400">
          <SearchIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>ابحث عن أصدقائك بالاسم أو اسم المستخدم</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-2">
          {results.map((u) => (
            <UserCard key={u.id} user={u} />
          ))}
        </div>
      )}
    </div>
  );
}

function UserCard({ user }) {
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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 flex items-center gap-3">
      <Link to={`/profile/${user.id}`}>
        <Avatar name={user.name} />
      </Link>
      <div className="flex-1 min-w-0">
        <Link to={`/profile/${user.id}`} className="font-semibold text-slate-800 hover:underline block truncate">
          {user.name}
        </Link>
        <p className="text-sm text-slate-400 truncate">@{user.username}</p>
        {user.bio && <p className="text-xs text-slate-500 truncate mt-0.5">{user.bio}</p>}
      </div>
      <button
        onClick={handleFollow}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors shrink-0 ${
          following ? 'bg-slate-100 text-slate-600' : 'bg-brand-600 text-white hover:bg-brand-700'
        }`}
      >
        {following ? <Check className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
        {following ? 'متابَع' : 'متابعة'}
      </button>
    </div>
  );
}
