const contentTypes = ['project', 'research_paper', 'image', 'video', 'post']

function HubSidebar({
  filters,
  setFilters,
  visibleDepartments,
  composer,
  setComposer,
  submitPost,
  isUploading,
  isAdmin,
  summary,
  adminCreateForm,
  setAdminCreateForm,
  createHubUserByAdmin,
  adminUsers,
  removeHubUserByAdmin,
}) {
  return (
    <aside className="space-y-4">
      <div className="rounded-xl border bg-white p-4">
        <h3 className="text-sm font-bold text-slate-800">Filters</h3>
        <input className="mt-3 w-full rounded-lg border px-3 py-2 text-sm" placeholder="Search posts" value={filters.search} onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))} />
        <select className="mt-2 w-full rounded-lg border px-3 py-2 text-sm" value={filters.department} onChange={(e) => setFilters((p) => ({ ...p, department: e.target.value }))}>
          <option value="">All departments</option>
          {visibleDepartments.map((dept) => <option key={dept} value={dept}>{dept}</option>)}
        </select>
        <select className="mt-2 w-full rounded-lg border px-3 py-2 text-sm" value={filters.type} onChange={(e) => setFilters((p) => ({ ...p, type: e.target.value }))}>
          <option value="">All content types</option>
          {contentTypes.map((type) => <option key={type} value={type}>{type.replace('_', ' ')}</option>)}
        </select>
      </div>

      <form onSubmit={submitPost} className="space-y-2 rounded-xl border bg-white p-4">
        <h3 className="text-sm font-bold text-slate-800">Share academic content</h3>
        <input className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Title" value={composer.title} onChange={(e) => setComposer((p) => ({ ...p, title: e.target.value }))} required />
        <textarea className="w-full rounded-lg border px-3 py-2 text-sm" rows={4} placeholder="Post details" value={composer.body} onChange={(e) => setComposer((p) => ({ ...p, body: e.target.value }))} required />
        <input className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Department" value={composer.department} onChange={(e) => setComposer((p) => ({ ...p, department: e.target.value }))} required />
        <select className="w-full rounded-lg border px-3 py-2 text-sm" value={composer.contentType} onChange={(e) => setComposer((p) => ({ ...p, contentType: e.target.value }))}>
          {contentTypes.map((type) => <option key={type} value={type}>{type.replace('_', ' ')}</option>)}
        </select>
        <input
          className="w-full rounded-lg border px-3 py-2 text-sm"
          type="file"
          multiple
          accept="image/*,video/*,.pdf,.doc,.docx"
          onChange={(e) => setComposer((p) => ({ ...p, files: Array.from(e.target.files || []) }))}
        />
        <p className="text-xs text-slate-500">Upload files directly (Cloudinary) or add a URL below.</p>
        <input className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Attachment URL (optional)" value={composer.attachmentUrl} onChange={(e) => setComposer((p) => ({ ...p, attachmentUrl: e.target.value }))} />
        <button className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white" type="submit" disabled={isUploading}>
          {isUploading ? 'Uploading...' : 'Publish'}
        </button>
      </form>

      {isAdmin && summary && (
        <div className="space-y-3 rounded-xl border bg-white p-4 text-sm text-slate-700">
          <h3 className="font-bold text-slate-900">Admin Hub Controls</h3>
          <p className="mt-2">Total posts: {summary.totalPosts}</p>
          <p>Active: {summary.activePosts}</p>
          <p>Removed: {summary.removedPosts}</p>
          <p className="mt-2 text-xs text-slate-500">Admin access mirrors your existing library admin account.</p>
          <form onSubmit={createHubUserByAdmin} className="space-y-2 border-t pt-3">
            <p className="text-xs font-semibold uppercase text-slate-500">Add institute user</p>
            <input className="w-full rounded border px-2 py-1.5 text-xs" placeholder="Name" value={adminCreateForm.name} onChange={(e) => setAdminCreateForm((p) => ({ ...p, name: e.target.value }))} required />
            <input className="w-full rounded border px-2 py-1.5 text-xs" type="email" placeholder="University email" value={adminCreateForm.email} onChange={(e) => setAdminCreateForm((p) => ({ ...p, email: e.target.value }))} required />
            <input className="w-full rounded border px-2 py-1.5 text-xs" type="password" placeholder="Temp password" value={adminCreateForm.password} onChange={(e) => setAdminCreateForm((p) => ({ ...p, password: e.target.value }))} required />
            <input className="w-full rounded border px-2 py-1.5 text-xs" placeholder="Department" value={adminCreateForm.department} onChange={(e) => setAdminCreateForm((p) => ({ ...p, department: e.target.value }))} />
            <select className="w-full rounded border px-2 py-1.5 text-xs" value={adminCreateForm.role} onChange={(e) => setAdminCreateForm((p) => ({ ...p, role: e.target.value }))}>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="librarian">Librarian</option>
            </select>
            <button type="submit" className="w-full rounded bg-slate-900 px-2 py-1.5 text-xs text-white">Add User</button>
          </form>
          <div className="max-h-52 space-y-1 overflow-auto border-t pt-3">
            {adminUsers.slice(0, 12).map((user) => (
              <div key={user._id} className="flex items-center justify-between rounded border px-2 py-1.5 text-xs">
                <span>{user.name} ({user.role})</span>
                <button type="button" className="text-rose-600" onClick={() => removeHubUserByAdmin(user._id)}>Remove</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  )
}

export default HubSidebar
