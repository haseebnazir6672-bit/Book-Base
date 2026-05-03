import { useEffect, useRef, useState } from 'react'
import { HiChat, HiPaperAirplane, HiX } from 'react-icons/hi'
import { getBotReply } from './replyFromMessage'

const QUICK_PROMPTS = ['How do I borrow books?', 'What is Knowledge Hub?', 'What if I return a book late?', 'Login help', 'Departments & search']

function ChatbotWidget({ loggedInRole }) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState(() => [
    {
      id: 'welcome',
      role: 'bot',
      text: 'Welcome to **BookBase**. I can help with borrowing, signing in, and using the library. What do you need?',
    },
  ])
  const listRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, open])

  const send = (raw) => {
    const text = String(raw ?? input).trim()
    if (!text) return
    setInput('')
    const userId = `u-${Date.now()}`
    setMessages((prev) => [...prev, { id: userId, role: 'user', text }])

    window.setTimeout(() => {
      const reply = getBotReply(text, { role: loggedInRole })
      setMessages((prev) => [...prev, { id: `b-${Date.now()}`, role: 'bot', text: reply }])
    }, 400)
  }

  const renderText = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-slate-900 dark:text-slate-100">
            {part.slice(2, -2)}
          </strong>
        )
      }
      return <span key={i}>{part}</span>
    })
  }

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-100 flex flex-col items-end gap-3 sm:bottom-8 sm:right-8">
      {open ? (
        <div
          id="bookbase-chatbot-dialog"
          className="pointer-events-auto flex h-[min(28rem,calc(100dvh-8rem))] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
          role="dialog"
          aria-label="BookBase assistant"
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-200 bg-linear-to-r from-cyan-600 to-indigo-600 px-4 py-3 text-white dark:from-cyan-700 dark:to-indigo-700">
            <div className="min-w-0">
              <p className="text-sm font-semibold">BookBase Assistant</p>
              <p className="truncate text-xs text-cyan-100">Library tips &amp; navigation</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 text-white/90 hover:bg-white/15"
              aria-label="Close chat"
            >
              <HiX className="h-5 w-5" />
            </button>
          </div>

          <div
            ref={listRef}
            className="min-h-0 flex-1 space-y-3 overflow-y-auto overflow-x-hidden px-3 py-3"
            role="log"
            aria-live="polite"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                  }`}
                >
                  {renderText(m.text)}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 px-3 py-2 dark:border-slate-700">
            <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">Quick prompts</p>
            <div className="mb-2 flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => send(label)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:bg-slate-700"
                >
                  {label}
                </button>
              ))}
            </div>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                send()
              }}
            >
              <label htmlFor="chatbot-input" className="sr-only">
                Message to assistant
              </label>
              <input
                id="chatbot-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a question…"
                className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
              <button
                type="submit"
                className="flex shrink-0 items-center justify-center rounded-xl bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-700"
                aria-label="Send message"
              >
                <HiPaperAirplane className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-cyan-600 to-indigo-600 text-white shadow-lg ring-4 ring-white/80 transition hover:scale-105 hover:shadow-xl dark:ring-slate-900/80"
        aria-expanded={open}
        aria-controls={open ? 'bookbase-chatbot-dialog' : undefined}
        aria-label={open ? 'Close assistant' : 'Open assistant'}
      >
        {open ? <HiX className="h-7 w-7" /> : <HiChat className="h-7 w-7" />}
      </button>
    </div>
  )
}

export default ChatbotWidget
