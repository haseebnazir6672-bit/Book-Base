function AuthScreen({
  mode,
  setMode,
  authForm,
  setAuthForm,
  runAuth,
  statusMsg,
  onBackToLibrary,
}) {
  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6 sm:px-8 sm:py-10">
      <div className="mx-auto overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-300/70">
        <div className="grid min-h-[82vh] lg:grid-cols-[1.05fr_1fr]">
          <aside className="relative hidden bg-gradient-to-br from-[#04103a] via-[#07205f] to-[#0b328a] p-10 text-white lg:flex lg:flex-col">
            <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-blue-500/25 blur-3xl" />
            <div className="absolute -bottom-20 right-0 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />
            <div className="relative z-10 space-y-8">
              <div>
                <p className="text-3xl font-black tracking-tight">Knowledge Hub</p>
                <p className="mt-1 text-sm text-blue-100">by Book Base</p>
              </div>

              <div>
                <h2 className="text-4xl font-black leading-tight">
                  Learn. Share. Grow.
                  <span className="block text-blue-300">Together.</span>
                </h2>
                <p className="mt-4 max-w-md text-sm text-blue-100/90">
                  A platform for students and teachers to share knowledge, exchange ideas,
                  and build a stronger academic community.
                </p>
              </div>

              <ul className="space-y-3 text-sm text-blue-50">
                <li className="rounded-xl border border-white/15 bg-white/10 px-4 py-3">Collaborate and connect with peers and educators.</li>
                <li className="rounded-xl border border-white/15 bg-white/10 px-4 py-3">Share projects, resources, and academic content.</li>
                <li className="rounded-xl border border-white/15 bg-white/10 px-4 py-3">Secure access for admin-approved institute members.</li>
              </ul>
            </div>
          </aside>

          <div className="flex items-center justify-center bg-slate-50 px-5 py-8 sm:px-8">
            <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
              <div className="mb-5 flex items-center justify-between">
                <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  Access is limited to approved users
                </div>
                <button
                  type="button"
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  onClick={onBackToLibrary}
                >
                  Back to Library
                </button>
              </div>

              <h1 className="text-3xl font-black text-slate-900">{mode === 'login' ? 'Welcome Back!' : 'Create Hub Account'}</h1>
              <p className="mt-1 text-sm text-slate-500">
                {mode === 'login' ? 'Login to your Knowledge Hub account' : 'Submit your details for admin approval'}
              </p>

              <form onSubmit={runAuth} className="mt-6 space-y-3">
                <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                  <button type="button" onClick={() => setMode('login')} className={`rounded-lg px-3 py-2 text-sm font-semibold ${mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}>Login</button>
                  <button type="button" onClick={() => setMode('signup')} className={`rounded-lg px-3 py-2 text-sm font-semibold ${mode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}>Signup</button>
                </div>

                {mode === 'signup' && (
                  <>
                    <input className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Full name" value={authForm.name} onChange={(e) => setAuthForm((p) => ({ ...p, name: e.target.value }))} required />
                    <select className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" value={authForm.role} onChange={(e) => setAuthForm((p) => ({ ...p, role: e.target.value }))}>
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                    </select>
                    <input className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Department" value={authForm.department} onChange={(e) => setAuthForm((p) => ({ ...p, department: e.target.value }))} />
                    {authForm.role === 'student' && (
                      <>
                        <input className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Roll Number" value={authForm.regNo} onChange={(e) => setAuthForm((p) => ({ ...p, regNo: e.target.value }))} required />
                        <input className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Semester" value={authForm.semester} onChange={(e) => setAuthForm((p) => ({ ...p, semester: e.target.value }))} />
                      </>
                    )}
                    {authForm.role === 'teacher' && (
                      <>
                        <input className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Employee ID" value={authForm.employeeId} onChange={(e) => setAuthForm((p) => ({ ...p, employeeId: e.target.value }))} required />
                        <input className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Designation" value={authForm.designation} onChange={(e) => setAuthForm((p) => ({ ...p, designation: e.target.value }))} />
                      </>
                    )}
                    <input className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Phone (Optional)" value={authForm.phone} onChange={(e) => setAuthForm((p) => ({ ...p, phone: e.target.value }))} />
                  </>
                )}

                <input className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" type="email" placeholder="Email Address" value={authForm.email} onChange={(e) => setAuthForm((p) => ({ ...p, email: e.target.value }))} required />
                <input className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" type="password" placeholder="Password" value={authForm.password} onChange={(e) => setAuthForm((p) => ({ ...p, password: e.target.value }))} required />

                <button className="mt-1 w-full rounded-xl bg-gradient-to-r from-[#1d4ed8] to-[#1e40af] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:opacity-95" type="submit">
                  {mode === 'signup' ? 'Submit for Approval' : 'Login to Knowledge Hub'}
                </button>

                {statusMsg && (
                  <p className={`rounded-lg border px-3 py-2 text-xs ${statusMsg.toLowerCase().includes('success') || statusMsg.toLowerCase().includes('welcome') ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
                    {statusMsg}
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthScreen
