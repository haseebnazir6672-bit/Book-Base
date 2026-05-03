import { useMemo } from 'react'

function AdminBooksPage({ books, searchTerm }) {
  const filteredBooks = useMemo(() => {
    console.log('AdminBooksPage: searchTerm:', searchTerm, 'books:', books)
    const q = searchTerm.trim().toLowerCase()
    if (!q) return books
    return books.filter((b) =>
      [b.title, b.category, b.department, b.author]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(q))
    )
  }, [books, searchTerm])

  const totalCopies = books.reduce((sum, b) => sum + (b.total || b.available || 0), 0)
  const availableCopies = books.reduce((sum, b) => sum + (b.available || 0), 0)

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Books</h2>
        <p className="text-sm text-slate-500">Book inventory and availability</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Titles</p>
          <p className="text-2xl font-bold text-slate-800">{books.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Total Copies</p>
          <p className="text-2xl font-bold text-slate-800">{totalCopies}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Available</p>
          <p className="text-2xl font-bold text-emerald-600">{availableCopies}</p>
        </div>
      </div>

      <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Department</th>
                <th className="px-4 py-3 font-semibold">Author</th>
                <th className="px-4 py-3 font-semibold">Available</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map((b) => (
                <tr key={b._id || b.id || b.title} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-900">{b.title}</td>
                  <td className="px-4 py-3">{b.category || '-'}</td>
                  <td className="px-4 py-3">{b.department || '-'}</td>
                  <td className="px-4 py-3">{b.author || '-'}</td>
                  <td className="px-4 py-3">{b.available ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  )
}

export default AdminBooksPage
