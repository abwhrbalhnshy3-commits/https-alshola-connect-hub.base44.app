import { Link, useNavigate } from 'react-router-dom';
import { Home, User, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-2xl mx-auto flex items-center justify-between px-4 h-14">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-slate-800 hidden sm:block">محور التواصل</span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            to="/"
            className="p-2.5 rounded-full hover:bg-slate-100 transition-colors text-slate-600"
            title="الرئيسية"
          >
            <Home className="w-5 h-5" />
          </Link>
          <Link
            to={`/profile/${user?.id}`}
            className="p-2.5 rounded-full hover:bg-slate-100 transition-colors text-slate-600"
            title="ملفي الشخصي"
          >
            <User className="w-5 h-5" />
          </Link>
          <Link to={`/profile/${user?.id}`} className="mr-1">
            <Avatar name={user?.name} size="sm" />
          </Link>
          <button
            onClick={handleLogout}
            className="p-2.5 rounded-full hover:bg-rose-50 transition-colors text-slate-600 hover:text-rose-500"
            title="تسجيل الخروج"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
