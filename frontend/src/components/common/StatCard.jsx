function StatCard({ title, value, helper, color = 'indigo' }) {
  const colorMap = {
    indigo: 'bg-indigo-100 text-indigo-800',
    emerald: 'bg-emerald-100 text-emerald-800',
    amber: 'bg-amber-100 text-amber-800',
    rose: 'bg-rose-100 text-rose-800',
  }

  return (
    <article className="rounded-2xl border border-violet-200 bg-white/80 p-4 shadow-sm backdrop-blur">
      <p className="text-sm text-violet-700">{title}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      <span className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${colorMap[color]}`}>
        {helper}
      </span>
    </article>
  )
}

export default StatCard
