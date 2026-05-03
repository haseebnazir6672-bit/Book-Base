import { HiCamera, HiDocumentText } from 'react-icons/hi'
import { toast } from 'react-toastify'
import { axiosInstance } from '../../api/axios'

function BookCard({ book, onBorrow, borrowDisabled = false, loggedInRole, onRefresh }) {
  const showBorrow = typeof onBorrow === 'function'
  const isLibrarian = loggedInRole === 'librarian'

  // Check if book was added in the last 48 hours
  const isNew = book.createdAt && (new Date() - new Date(book.createdAt)) < (48 * 60 * 60 * 1000)

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('bookImage', file)

    const loadingToast = toast.loading('Uploading book image...')
    try {
      await axiosInstance.put(`/books/${book._id || book.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.update(loadingToast, {
        render: 'Book image updated successfully!',
        type: 'success',
        isLoading: false,
        autoClose: 3000
      })
      if (onRefresh) onRefresh()
    } catch (err) {
      toast.update(loadingToast, {
        render: err.response?.data?.msg || 'Error uploading image',
        type: 'error',
        isLoading: false,
        autoClose: 3000
      })
    }
  }

  return (
    <article className="flex flex-col h-full rounded-2xl border border-slate-200 p-3 hover:shadow-xl dark:border-slate-700 bg-white dark:bg-slate-800 transition-all group relative overflow-hidden">
      {isNew && (
        <div className="absolute top-2 right-2 z-10">
          <span className="bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-lg shadow-lg flex items-center gap-1 animate-pulse">
            <span className="w-1 h-1 bg-white rounded-full"></span>
            NEW
          </span>
        </div>
      )}
      
      {/* Image Area - Clickable for Librarians */}
      <div className="relative aspect-[3/4] mb-4 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900 shadow-inner">
        {book.bookImage ? (
          <img 
            src={book.bookImage} 
            alt={book.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 text-slate-400 select-none">
            <span className="font-black text-5xl mb-2">{book.title.charAt(0)}</span>
            {isLibrarian && (
              <div className="flex flex-col items-center gap-1 opacity-60">
                <HiCamera size={20} />
                <span className="text-[8px] font-black uppercase tracking-tighter">Missing Image</span>
              </div>
            )}
          </div>
        )}

        {/* Librarian Click-to-Upload Overlay */}
        {isLibrarian && (
          <label className={`absolute inset-0 z-20 cursor-pointer flex flex-col items-center justify-center transition-all duration-300 ${
            !book.bookImage 
              ? 'bg-indigo-600/10 hover:bg-indigo-600/40 opacity-100' 
              : 'bg-indigo-600/0 hover:bg-indigo-600/40 opacity-0 hover:opacity-100'
          }`}>
            <div className={`bg-white/90 p-3 rounded-full shadow-2xl transition-transform ${
              !book.bookImage ? 'scale-100' : 'translate-y-4 group-hover:translate-y-0 scale-90 group-hover:scale-100'
            }`}>
              <HiCamera className="text-indigo-600 text-2xl" />
            </div>
            <span className="mt-3 text-white text-[10px] font-black uppercase tracking-widest drop-shadow-md">
              {book.bookImage ? 'Change Cover' : 'Upload Cover'}
            </span>
            <input 
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={handleImageUpload}
            />
          </label>
        )}
      </div>
      
      {/* Content Area */}
      <div className="flex flex-col flex-1">
        <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 line-clamp-2 leading-tight h-10 mb-1" title={book.title}>
          {book.title}
        </h4>
        
        <div className="flex justify-between items-center mb-3">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold truncate pr-2">by {book.author}</p>
          {book.bookId && book.bookId !== 'undefined' && (
            <span className="text-[9px] font-black bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-400 uppercase tracking-tighter shrink-0">
              #{book.bookId}
            </span>
          )}
        </div>
        
        <div className="flex flex-wrap gap-1.5 mb-4 overflow-hidden items-start">
          <span className="rounded-lg bg-indigo-50 px-2 py-1 text-[9px] font-black text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 uppercase tracking-wider border border-indigo-100 dark:border-indigo-900/30">
            {book.department}
          </span>
          <span className="rounded-lg bg-slate-100 px-2 py-1 text-[9px] font-black text-slate-600 dark:bg-slate-700 dark:text-slate-300 uppercase tracking-wider">
            {book.category}
          </span>
          {book.shelf && (
            <span className="rounded-lg bg-cyan-50 px-2 py-1 text-[9px] font-black text-cyan-600 dark:bg-cyan-950/50 dark:text-cyan-400 uppercase tracking-wider border border-cyan-100 dark:border-cyan-900/30">
              Shelf: {book.shelf}
            </span>
          )}
          {book.cell && (
            <span className="rounded-lg bg-purple-50 px-2 py-1 text-[9px] font-black text-purple-600 dark:bg-purple-950/50 dark:text-purple-400 uppercase tracking-wider border border-purple-100 dark:border-purple-900/30">
              Cell: {book.cell}
            </span>
          )}
        </div>

        <div className="mt-auto pt-3 border-t border-slate-50 dark:border-slate-700/50 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Availability</span>
              <span className={`text-[11px] font-black ${book.available > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {book.available > 0 ? `${book.available} In Stock` : 'Out of Stock'}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            {book.bookPdf && (
              <a
                href={book.bookPdf}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <HiDocumentText size={12} />
                Read Online
              </a>
            )}
            {showBorrow && (
              <button
                type="button"
                onClick={() => onBorrow(book)}
                disabled={borrowDisabled || book.available <= 0}
                className={`${book.bookPdf ? 'flex-1' : 'w-full'} bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed transition-all`}
              >
                {borrowDisabled ? 'Issued' : book.available <= 0 ? 'Empty' : 'Borrow'}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

export default BookCard
