import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Send } from 'lucide-react';
import api from '../api';
import Avatar from '../components/Avatar';
import { timeAgo } from '../utils';

export default function Messages() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/messages/conversations')
      .then((res) => setConversations(res.data.conversations))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-20">
      <h1 className="text-xl font-bold text-slate-800 mb-4">الرسائل</h1>

      {loading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-3 animate-pulse flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-200 rounded-full" />
              <div className="flex-1">
                <div className="h-4 w-32 bg-slate-200 rounded mb-2" />
                <div className="h-3 w-48 bg-slate-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && conversations.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>لا توجد محادثات بعد</p>
          <p className="text-sm mt-1">ابدأ محادثة من ملف شخصي أي مستخدم</p>
        </div>
      )}

      {!loading && conversations.length > 0 && (
        <div className="space-y-2">
          {conversations.map((conv) => (
            <Link
              key={conv.partner.id}
              to={`/messages/${conv.partner.id}`}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 flex items-center gap-3 hover:bg-slate-50 transition-colors"
            >
              <Avatar name={conv.partner.name} size="lg" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-800 truncate">{conv.partner.name}</p>
                  {conv.lastMessage && (
                    <span className="text-xs text-slate-400 shrink-0 mr-2">
                      {timeAgo(conv.lastMessage.createdAt)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 truncate mt-0.5">
                  {conv.lastMessage
                    ? (conv.lastMessage.senderId === conv.partner.id ? '' : 'أنت: ') + conv.lastMessage.content
                    : 'ابدأ المحادثة'}
                </p>
              </div>
              {conv.unreadCount > 0 && (
                <span className="bg-brand-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shrink-0">
                  {conv.unreadCount}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
