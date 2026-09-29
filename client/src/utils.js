export function timeAgo(dateStr) {
  const date = new Date(dateStr);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return 'الآن';
  if (seconds < 3600) return `منذ ${Math.floor(seconds / 60)} دقيقة`;
  if (seconds < 86400) return `منذ ${Math.floor(seconds / 3600)} ساعة`;
  if (seconds < 604800) return `منذ ${Math.floor(seconds / 86400)} يوم`;
  return date.toLocaleDateString('ar');
}

export function getInitials(name) {
  return name ? name.charAt(0) : '؟';
}

export function avatarColor(name) {
  const colors = [
    'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-blue-500',
    'bg-teal-500', 'bg-orange-500', 'bg-rose-500', 'bg-emerald-500',
  ];
  const idx = name ? name.charCodeAt(0) % colors.length : 0;
  return colors[idx];
}
