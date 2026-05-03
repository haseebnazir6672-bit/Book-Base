function AdminLibrariansPage({
  librarians,
  filteredLibrarians,
  librarianForm,
  editingLibrarianId,
  librarianSearch,
  librarianStatus,
  setLibrarianForm,
  setLibrarianSearch,
  setLibrarianStatus,
  saveLibrarian,
  resetLibrarianForm,
  startEditLibrarian,
  deleteLibrarian,
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Librarian Management</h3>
          <p className="text-sm text-slate-500">Add, update, search, and remove librarians.</p>
        </div>
        <div className="text-sm text-slate-600">
          Total: <strong>{librarians.length}</strong>
        </div>
      </div>

      <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={saveLibrarian}>
        <input value={librarianForm.fullName} onChange={(e) => setLibrarianForm((p) => ({ ...p, fullName: e.target.value }))} placeholder="Full name" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500" />
        <input value={librarianForm.employeeId} onChange={(e) => setLibrarianForm((p) => ({ ...p, employeeId: e.target.value }))} placeholder="Employee ID (e.g. EMP-1021)" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500" />
        <input value={librarianForm.email} onChange={(e) => setLibrarianForm((p) => ({ ...p, email: e.target.value }))} placeholder="Email" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500" />
        <input value={librarianForm.password} onChange={(e) => setLibrarianForm((p) => ({ ...p, password: e.target.value }))} placeholder={editingLibrarianId ? 'New Password (leave blank to keep current)' : 'Password'} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500" />
        <input value={librarianForm.designation} onChange={(e) => setLibrarianForm((p) => ({ ...p, designation: e.target.value }))} placeholder="Designation (e.g. Lecturer)" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500" />
        <input value={librarianForm.phone} onChange={(e) => setLibrarianForm((p) => ({ ...p, phone: e.target.value }))} placeholder="Phone" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500" />
        <select value={librarianForm.status} onChange={(e) => setLibrarianForm((p) => ({ ...p, status: e.target.value }))} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <div className="flex gap-2">
          <button type="submit" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">{editingLibrarianId ? 'Update Librarian' : 'Add Librarian'}</button>
          {editingLibrarianId ? <button type="button" onClick={resetLibrarianForm} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button> : null}
        </div>
      </form>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input value={librarianSearch} onChange={(e) => setLibrarianSearch(e.target.value)} placeholder="Search librarian (name, emp id, email, designation)..." className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500" />
        <select value={librarianStatus} onChange={(e) => setLibrarianStatus(e.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500">
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Employee ID</th>
              <th className="px-4 py-3 font-semibold">Designation</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLibrarians.map((t) => (
              <tr key={t._id || t.id} className="border-t border-slate-100">
                <td className="px-4 py-3"><div className="font-semibold text-slate-900">{t.name || t.fullName}</div><div className="text-xs text-slate-500">{t.email}</div></td>
                <td className="px-4 py-3">{t.employeeId}</td>
                <td className="px-4 py-3">{t.designation}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${t.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{t.status}</span></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => startEditLibrarian(t)} className="rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">Update</button>
                    <button type="button" onClick={() => deleteLibrarian(t._id || t.id)} className="rounded-lg bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-800">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  )
}

export default AdminLibrariansPage
