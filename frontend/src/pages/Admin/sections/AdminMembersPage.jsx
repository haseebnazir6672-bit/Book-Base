import { useMemo } from 'react'

function AdminMembersPage({ students, librarians, searchTerm }) {
  const members = useMemo(() => {
    const combined = [
      ...students.map((s) => ({ ...s, type: 'Student', code: s.regNo || '-' })),
      ...librarians.map((l) => ({ ...l, type: 'Librarian', code: l.employeeId || '-' })),
    ]
    const q = searchTerm.trim().toLowerCase()
    if (!q) return combined
    return combined.filter((m) =>
      [m.name, m.fullName, m.email, m.type, m.code].filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
    )
  }, [students, librarians, searchTerm])

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Members</h2>
        <p className="text-sm text-slate-500">All student and librarian accounts</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Students</p>
          <p className="text-2xl font-bold text-slate-800">{students.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Librarians</p>
          <p className="text-2xl font-bold text-slate-800">{librarians.length}</p>
        </div>
      </div>

      <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m._id || m.id || `${m.type}-${m.email}`} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-900">{m.name || m.fullName}</td>
                  <td className="px-4 py-3">{m.type}</td>
                  <td className="px-4 py-3">{m.code}</td>
                  <td className="px-4 py-3">{m.email}</td>
                  <td className="px-4 py-3">{m.status || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  )
}

export default AdminMembersPage
