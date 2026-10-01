import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Send } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import MessageBubble from '../components/MessageBubble';

export default function Chat() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [partner, setPartner] = useState(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/messages/${id}`)
      .then((res) => {
        setMessages(res.data.messages);
        setPartner(res.data.partner);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    // Poll for new messages every 3 seconds
    pollRef.current = setInterval(async () => {
      try {
        const res = await api.get(`/messages/${id}`);
        setMessages(res.data.messages);
        setPartner(res.data.partner);
      } catch (err) {
        // silent
      }
    }, 3000);

    return () => clearInterval(pollRef.current);
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const res = await api.post(`/messages/${id}`, { content: text });
      setMessages((prev) => [...prev, res.data.message]);
      setText('');
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-4 pb-20">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse">
          <div className="h-6 w-32 bg-slate-200 rounded mb-4" />
          <div className="space-y-3">
            <div className="h-12 w-2/3 bg-slate-200 rounded-2xl" />
            <div className="h-12 w-1/2 bg-slate-200 rounded-2xl mr-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (!partner) {
    return <div className="text-center pt-20 text-slate-400">المستخدم غير موجود</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 flex flex-col" style={{ height: 'calc(100vh - 0px)' }}>
      {/* Chat Header */}
      <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-200">
        <button
          onClick={() => navigate('/messages')}
          className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-600"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <Link to={`/profile/${partner.id}`} className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar name={partner.name} />
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 truncate">{partner.name}</p>
            <p className="text-xs text-slate-400 truncate">@{partner.username}</p>
          </div>
        </Link>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-2 pb-2">
        {messages.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <p className="text-sm">لا توجد رسائل بعد</p>
            <p className="text-sm mt-1">أرسل أول رسالة لبدء المحادثة</p>
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} isOwn={msg.senderId === user?.id} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-2 items-center pt-2 pb-20 border-t border-slate-200">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="اكتب رسالة..."
          className="flex-1 bg-slate-50 rounded-full px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 outline-none border border-transparent focus:border-brand-400 transition-colors"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="p-2.5 bg-brand-600 text-white rounded-full hover:bg-brand-700 disabled:opacity-30 transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
