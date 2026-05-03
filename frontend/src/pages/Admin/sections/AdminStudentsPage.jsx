function AdminStudentsPage({
  students,
  departments,
  filteredStudents,
  studentForm,
  editingStudentId,
  studentSearch,
  studentStatus,
  setStudentForm,
  setStudentSearch,
  setStudentStatus,
  saveStudent,
  resetStudentForm,
  startEditStudent,
  deleteStudent,
  blockStudent,
  unblockStudent,
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Student Management</h3>
          <p className="text-sm text-slate-500">Add, update, search, remove, block, and unblock students.</p>
        </div>
        <div className="text-sm text-slate-600">
          Total: <strong>{students.length}</strong> | Blocked: <strong>{students.filter(s => s.isBlocked).length}</strong>
        </div>
      </div>

      <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={saveStudent}>
        <input value={studentForm.fullName} onChange={(e) => setStudentForm((p) => ({ ...p, fullName: e.target.value }))} placeholder="Full name" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500" />
        <input value={studentForm.regNo} onChange={(e) => setStudentForm((p) => ({ ...p, regNo: e.target.value }))} placeholder="Reg No (e.g. FA22-BCS-101)" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500" />
        <input value={studentForm.email} onChange={(e) => setStudentForm((p) => ({ ...p, email: e.target.value }))} placeholder="Email" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500" />
        <input value={studentForm.password} onChange={(e) => setStudentForm((p) => ({ ...p, password: e.target.value }))} placeholder="Password" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500" />
        <select value={studentForm.department} onChange={(e) => setStudentForm((p) => ({ ...p, department: e.target.value }))} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500" required>
          <option value="" disabled>Select department</option>
          {departments.filter((d) => d !== 'All').map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <input value={studentForm.semester} onChange={(e) => setStudentForm((p) => ({ ...p, semester: e.target.value }))} placeholder="Semester" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500" />
        <input value={studentForm.phone} onChange={(e) => setStudentForm((p) => ({ ...p, phone: e.target.value }))} placeholder="Phone" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500" />
        <select value={studentForm.status} onChange={(e) => setStudentForm((p) => ({ ...p, status: e.target.value }))} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <div className="flex gap-2">
          <button type="submit" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">{editingStudentId ? 'Update Student' : 'Add Student'}</button>
          {editingStudentId ? <button type="button" onClick={resetStudentForm} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button> : null}
        </div>
      </form>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} placeholder="Search student (name, reg no, email, department)..." className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500" />
        <select value={studentStatus} onChange={(e) => setStudentStatus(e.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500">
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
              <th className="px-4 py-3 font-semibold">Semester</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((s) => (
              <tr key={s._id || s.id} className="border-t border-slate-100">
                <td className="px-4 py-3"><div className="font-semibold text-slate-900">{s.name || s.fullName}</div><div className="text-xs text-slate-500">{s.email}</div></td>
                <td className="px-4 py-3">{s.regNo}</td>
                <td className="px-4 py-3">{s.department}</td>
                <td className="px-4 py-3">{s.semester}</td>
                <td className="px-4 py-3">
                  {s.isBlocked ? (
                    <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">Blocked</span>
                  ) : (
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${s.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{s.status}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => startEditStudent(s)} className="rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">Update</button>
                    {s.isBlocked ? (
                      <button type="button" onClick={() => unblockStudent(s._id || s.id)} className="rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">Unblock</button>
                    ) : (
                      <button type="button" onClick={() => blockStudent(s._id || s.id)} className="rounded-lg bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800">Block</button>
                    )}
                    <button type="button" onClick={() => deleteStudent(s._id || s.id)} className="rounded-lg bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-800">Delete</button>
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

export default AdminStudentsPage
