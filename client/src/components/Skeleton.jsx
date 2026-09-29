export function PostSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-slate-200 rounded-full" />
        <div className="flex-1">
          <div className="h-4 w-32 bg-slate-200 rounded mb-1.5" />
          <div className="h-3 w-20 bg-slate-200 rounded" />
        </div>
      </div>
      <div className="space-y-2 mb-3">
        <div className="h-4 w-full bg-slate-200 rounded" />
        <div className="h-4 w-3/4 bg-slate-200 rounded" />
      </div>
      <div className="flex gap-4 pt-2 border-t border-slate-100">
        <div className="h-5 w-12 bg-slate-200 rounded" />
        <div className="h-5 w-12 bg-slate-200 rounded" />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-pulse">
      <div className="h-28 bg-slate-200" />
      <div className="px-4 pb-4">
        <div className="w-24 h-24 bg-slate-200 rounded-full -mt-12 ring-4 ring-white" />
        <div className="h-6 w-40 bg-slate-200 rounded mt-3" />
        <div className="h-4 w-24 bg-slate-200 rounded mt-2" />
        <div className="flex gap-6 mt-4 pt-4 border-t border-slate-100">
          <div className="h-5 w-16 bg-slate-200 rounded" />
          <div className="h-5 w-16 bg-slate-200 rounded" />
          <div className="h-5 w-16 bg-slate-200 rounded" />
        </div>
      </div>
    </div>
  );
}
