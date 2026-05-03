function AdminKnowledgeHubStudentsPage({
  hubStudents,
  departments,
  hubStudentForm,
  editingHubStudentId,
  hubStudentSearch,
  hubStudentStatus,
  setHubStudentForm,
  setHubStudentSearch,
  setHubStudentStatus,
  saveHubStudent,
  resetHubStudentForm,
  startEditHubStudent,
  deleteHubStudent,
  universityDomain,
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Knowledge Hub Student Management</h3>
          <p className="text-sm text-slate-500">
            Manage students who can access Knowledge Hub (only <strong>@{universityDomain}</strong> emails).
          </p>
        </div>
        <div className="text-sm text-slate-600">
          Hub Students: <strong>{hubStudents.length}</strong>
        </div>
      </div>

      <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={saveHubStudent}>
        <input value={hubStudentForm.fullName} onChange={(e) => setHubStudentForm((p) => ({ ...p, fullName: e.target.value }))} placeholder="Full name" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500" />
        <input value={hubStudentForm.regNo} onChange={(e) => setHubStudentForm((p) => ({ ...p, regNo: e.target.value }))} placeholder="Reg No" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500" />
        <input value={hubStudentForm.email} onChange={(e) => setHubStudentForm((p) => ({ ...p, email: e.target.value }))} placeholder={`University email (@${universityDomain})`} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500" />
        <input value={hubStudentForm.password} onChange={(e) => setHubStudentForm((p) => ({ ...p, password: e.target.value }))} placeholder={editingHubStudentId ? 'Password (leave empty to keep same)' : 'Password'} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500" />
        <select value={hubStudentForm.department} onChange={(e) => setHubStudentForm((p) => ({ ...p, department: e.target.value }))} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500" required>
          <option value="" disabled>Select department</option>
          {departments.filter((d) => d !== 'All').map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <input value={hubStudentForm.semester} onChange={(e) => setHubStudentForm((p) => ({ ...p, semester: e.target.value }))} placeholder="Semester" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500" />
        <input value={hubStudentForm.phone} onChange={(e) => setHubStudentForm((p) => ({ ...p, phone: e.target.value }))} placeholder="Phone" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500" />
        <select value={hubStudentForm.status} onChange={(e) => setHubStudentForm((p) => ({ ...p, status: e.target.value }))} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <div className="flex gap-2">
          <button type="submit" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">{editingHubStudentId ? 'Update Hub Student' : 'Add Hub Student'}</button>
          {editingHubStudentId ? <button type="button" onClick={resetHubStudentForm} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button> : null}
        </div>
      </form>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input value={hubStudentSearch} onChange={(e) => setHubStudentSearch(e.target.value)} placeholder="Search hub students..." className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500" />
        <select value={hubStudentStatus} onChange={(e) => setHubStudentStatus(e.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500">
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
              <th className="px-4 py-3 font-semibold">Reg No</th>
              <th className="px-4 py-3 font-semibold">Department</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {hubStudents.map((s) => (
              <tr key={s._id || s.id} className="border-t border-slate-100">
                <td className="px-4 py-3"><div className="font-semibold text-slate-900">{s.name || s.fullName}</div><div className="text-xs text-slate-500">{s.email}</div></td>
                <td className="px-4 py-3">{s.regNo}</td>
                <td className="px-4 py-3">{s.department}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${s.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{s.status}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => startEditHubStudent(s)} className="rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">Update</button>
                    <button type="button" onClick={() => deleteHubStudent(s._id || s.id)} className="rounded-lg bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-800">Delete</button>
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

export default AdminKnowledgeHubStudentsPage
