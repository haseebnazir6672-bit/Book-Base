function AdminIssueReturnPage({ stats }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Issue / Return</h2>
        <p className="text-sm text-slate-500">Current circulation performance</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Issued (Active)</p>
          <p className="text-2xl font-bold text-indigo-600">{stats.active || 0}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Returned</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.returned || 0}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Overdue</p>
          <p className="text-2xl font-bold text-rose-600">{stats.overdue || 0}</p>
        </div>
      </div>

      <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Operational Note</h3>
        <p className="mt-2 text-sm text-slate-600">
          Use this page to monitor issue/return trends. Detailed record-level actions remain available in librarian workflows.
        </p>
      </article>
    </div>
  )
}

export default AdminIssueReturnPage
