import { getInitials, avatarColor } from '../utils';

export default function Avatar({ name, size = 'md' }) {
  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-16 h-16 text-2xl',
    xl: 'w-24 h-24 text-4xl',
  };

  return (
    <div
      className={`${sizes[size]} ${avatarColor(name)} rounded-full flex items-center justify-center text-white font-bold shrink-0`}
    >
      {getInitials(name)}
    </div>
  );
}
