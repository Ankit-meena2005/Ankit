import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

type Toast = { id: string; msg: string; type: 'info' | 'success' | 'error' }
type Ctx = { toasts: Toast[]; push: (msg: string, type?: Toast['type']) => void }

const ToastContext = createContext<Ctx | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const push = useCallback((msg: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).slice(2, 8)
    setToasts((t) => [...t, { id, msg, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }, [])
  return (
    <ToastContext.Provider value={{ toasts, push }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`rounded-xl px-4 py-2.5 text-sm font-medium text-white shadow-glow animate-floaty ${
              t.type === 'success' ? 'bg-brand-600' : t.type === 'error' ? 'bg-red-600' : 'bg-night-700'
            }`}
          >
            {t.msg}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
