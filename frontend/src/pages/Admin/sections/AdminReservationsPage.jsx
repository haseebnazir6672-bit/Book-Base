import { useMemo } from 'react'

function AdminReservationsPage({ books }) {
  const mostRequestedCandidates = useMemo(
    () => books.filter((b) => (b.available || 0) <= 0).slice(0, 10),
    [books]
  )

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Reservations</h2>
        <p className="text-sm text-slate-500">Demand-focused view for fully borrowed titles</p>
      </div>

      <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">High Demand Books</h3>
        <p className="mt-1 text-sm text-slate-500">These titles currently have no available copies.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Department</th>
                <th className="px-4 py-3 font-semibold">Available</th>
              </tr>
            </thead>
            <tbody>
              {mostRequestedCandidates.map((b) => (
                <tr key={b._id || b.id || b.title} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-900">{b.title}</td>
                  <td className="px-4 py-3">{b.category || '-'}</td>
                  <td className="px-4 py-3">{b.department || '-'}</td>
                  <td className="px-4 py-3 text-rose-600">{b.available ?? 0}</td>
                </tr>
              ))}
              {mostRequestedCandidates.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-4 text-center text-slate-500">No fully borrowed books right now.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  )
}

export default AdminReservationsPage
