import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { axiosInstance } from '../../../api/axios'

function AdminFinesPage({ stats, onRefresh }) {
  const [borrowRecords, setBorrowRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [receipt, setReceipt] = useState(null)
  const [showReceipt, setShowReceipt] = useState(false)

  const totalFine = Number(stats.totalFine || 0)
  const overdue = Number(stats.overdue || 0)
  const avgFine = overdue > 0 ? (totalFine / overdue).toFixed(2) : '0.00'

  const fetchBorrowRecords = async () => {
    try {
      setLoading(true)
      const res = await axiosInstance.get('/borrow')
      setBorrowRecords(res.data.filter(r => (r.fine || r.computedFine) > 0))
    } catch (err) {
      toast.error('Failed to fetch borrow records')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsPaid = async (recordId) => {
    if (!window.confirm('Mark this fine as paid?')) return

    try {
      const res = await axiosInstance.put(`/borrow/${recordId}/mark-paid`)
      toast.success('Fine marked as paid successfully')
      setReceipt(res.data.receipt)
      setShowReceipt(true)
      fetchBorrowRecords()
      if (onRefresh) onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to mark fine as paid')
    }
  }

  const printReceipt = () => {
    window.print()
  }

  useEffect(() => {
    fetchBorrowRecords()
  }, [])

  return (
    <div className="space-y-5">
      {showReceipt && receipt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">Fine Receipt</h3>
              <button 
                onClick={() => setShowReceipt(false)} 
                className="text-slate-500 hover:text-slate-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4 border-t border-slate-200 pt-4" id="receipt-content">
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Receipt ID:</span>
                <span className="text-sm font-semibold">{receipt.receiptId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Student Name:</span>
                <span className="text-sm font-semibold">{receipt.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Reg No:</span>
                <span className="text-sm font-semibold">{receipt.regNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Book Title:</span>
                <span className="text-sm font-semibold">{receipt.bookTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Fine Amount:</span>
                <span className="text-lg font-bold text-rose-600">Rs {receipt.fineAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Paid At:</span>
                <span className="text-sm font-semibold">
                  {new Date(receipt.paidAt).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Processed By:</span>
                <span className="text-sm font-semibold">{receipt.paidBy}</span>
              </div>
            </div>
            
            <div className="mt-6 flex gap-3">
              <button 
                onClick={printReceipt}
                className="flex-1 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Print Receipt
              </button>
              <button 
                onClick={() => setShowReceipt(false)}
                className="flex-1 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Fines</h2>
        <p className="text-sm text-slate-500">Fine status and overdue impact</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Total Fine</p>
          <p className="text-2xl font-bold text-slate-800">Rs {totalFine}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Overdue Records</p>
          <p className="text-2xl font-bold text-rose-600">{overdue}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Avg Fine / Overdue</p>
          <p className="text-2xl font-bold text-amber-600">Rs {avgFine}</p>
        </div>
      </div>

      <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Fine Records</h3>
          <button 
            onClick={fetchBorrowRecords} 
            className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
          >
            Refresh
          </button>
        </div>
        
        {loading ? (
          <p className="text-center py-8 text-slate-500">Loading...</p>
        ) : borrowRecords.length === 0 ? (
          <p className="text-center py-8 text-slate-500">No fine records found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Student</th>
                  <th className="px-4 py-3 font-semibold">Reg No</th>
                  <th className="px-4 py-3 font-semibold">Book</th>
                  <th className="px-4 py-3 font-semibold">Fine</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {borrowRecords.map((record) => (
                  <tr key={record._id || record.id} className="border-t border-slate-100">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">
                        {record.student?.name || record.studentName}
                      </div>
                    </td>
                    <td className="px-4 py-3">{record.student?.regNo || record.regNo}</td>
                    <td className="px-4 py-3">{record.book?.title}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-rose-600">
                        Rs {record.fine || record.computedFine}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {record.finePaid ? (
                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          Paid
                        </span>
                      ) : (
                        <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">
                          Unpaid
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {!record.finePaid && (
                        <button
                          onClick={() => handleMarkAsPaid(record._id)}
                          className="rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-200"
                        >
                          Mark as Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>
    </div>
  )
}

export default AdminFinesPage
