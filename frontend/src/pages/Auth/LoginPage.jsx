import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser } from '../../redux/authSlice'
import { useNavigate } from 'react-router-dom'
import { departments } from '../../data/mockData'
import { HiOutlineHome, HiOutlineUser, HiOutlineLockClosed, HiBookOpen, HiLockClosed } from 'react-icons/hi'

const loginBg = "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=2000"

function LoginPage({ role }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedDepartment, setSelectedDepartment] = useState('BSCS')

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { token, error: authError } = useSelector((state) => state.auth)

  useEffect(() => {
    if (token) {
      navigateBasedOnRole()
    }
  }, [token])

  const navigateBasedOnRole = (userRole) => {
    switch (userRole) {
      case 'admin':
        navigate('/admin')
        break
      case 'librarian':
        navigate('/librarian')
        break
      case 'teacher':
        navigate('/teacher/dashboard')
        break
      case 'student':
        navigate('/student/library')
        break
      default:
        navigate('/')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await dispatch(loginUser({ email, password })).unwrap()
      toast.success('Access Granted. Welcome back!')
      navigateBasedOnRole(result.user.role)
    } catch (err) {
      const errMsg = err?.msg || err?.message || 'Login failed'
      setError(errMsg)
      toast.error(errMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-slate-100 px-4 py-6 sm:px-8 sm:py-10">
      <div className="mx-auto flex w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-300/60">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative hidden w-1/2 lg:block"
        >
          <img src={loginBg} alt="Library" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f2452]/40 via-[#0f2452]/65 to-[#091834]/90" />
          <div className="absolute inset-0 flex flex-col items-center justify-between px-8 py-10 text-center text-[#f2d6a2]">
            <div className="mt-6 flex flex-col items-center">
              <HiBookOpen className="h-12 w-12" />
              <h1 className="mt-4 text-6xl font-semibold leading-none tracking-wider">Book Base</h1>
              <p className="mt-1 text-xl tracking-wide text-white/90">  </p>
              <p className="mt-8 text-2xl tracking-wide">LIBRARY MANAGEMENT SYSTEM</p>
            </div>

            <div className="mb-8">
              <p className="text-lg italic text-white/90">Knowledge Now, Success Tomorrow</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full bg-white px-6 py-10 sm:px-10 lg:w-1/2 lg:px-14 lg:py-14"
        >
          <div className="mx-auto w-full max-w-md">
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <HiOutlineHome className="h-4 w-4" />
                Home
              </button>
              <span className="text-xs font-semibold text-slate-400">Secure login</span>
            </div>
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#eef3ff] text-[#112a5b]">
                <HiBookOpen className="h-8 w-8" />
              </div>
              <h2 className="mt-4 text-5xl font-semibold text-[#16284d]">Welcome Back</h2>
              <p className="mt-2 text-base text-slate-500">Login to access the Library System</p>
              <div className="mt-4 h-px w-40 bg-gradient-to-r from-transparent via-[#d7ba86] to-transparent" />
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {role === 'student' && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#1f2f52]">Department</label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#1f3c78] focus:ring-2 focus:ring-[#1f3c78]/20"
                  >
                    {departments
                      .filter((dep) => dep !== 'All')
                      .map((dep) => (
                        <option key={dep} value={dep}>{dep}</option>
                      ))}
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#1f2f52]">Student / Faculty / Staff ID</label>
                <div className="relative">
                  <HiOutlineUser className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your ID"
                    required
                    className="w-full rounded-lg border border-slate-300 py-3 pl-12 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#1f3c78] focus:ring-2 focus:ring-[#1f3c78]/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#1f2f52]">Password</label>
                <div className="relative">
                  <HiOutlineLockClosed className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full rounded-lg border border-slate-300 py-3 pl-12 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#1f3c78] focus:ring-2 focus:ring-[#1f3c78]/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-lg bg-[#102c62] py-3 text-lg font-semibold text-white transition hover:bg-[#0e2550] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500">
              <HiLockClosed className="h-4 w-4" />
              <p>For authorized users only</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
              >
                {error || 'Access denied. Check credentials.'}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default LoginPage