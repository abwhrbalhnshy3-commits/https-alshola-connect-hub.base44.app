import { timeAgo } from '../utils';

export default function MessageBubble({ message, isOwn }) {
  return (
    <div className={`flex ${isOwn ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
          isOwn
            ? 'bg-brand-600 text-white rounded-tl-sm'
            : 'bg-white text-slate-700 border border-slate-200 rounded-tr-sm'
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
        <p className={`text-[10px] mt-1 ${isOwn ? 'text-brand-200' : 'text-slate-400'}`}>
          {timeAgo(message.createdAt)}
        </p>
      </div>
    </div>
  );
}
