import { Link, useLocation } from 'react-router-dom';
import { Home, Search, User, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();

  const items = [
    { to: '/', icon: Home, label: 'الرئيسية', active: location.pathname === '/' },
    { to: '/search', icon: Search, label: 'بحث', active: location.pathname === '/search' },
    { to: '/messages', icon: MessageCircle, label: 'رسائل', active: location.pathname.startsWith('/messages') },
    { to: `/profile/${user?.id}`, icon: User, label: 'حسابي', active: location.pathname.startsWith('/profile') },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-1px_8px_rgba(0,0,0,0.06)]">
      <div className="max-w-2xl mx-auto flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-0.5 px-6 py-1.5 rounded-xl transition-colors ${
                item.active ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon className={`w-6 h-6 ${item.active ? 'fill-brand-50' : ''}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
