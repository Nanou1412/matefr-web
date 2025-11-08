"use client"

import * as React from "react"

type ToastMessage = {
  id: number
  title?: string
  description?: string
}

type ToastContextValue = {
  toast: (t: Omit<ToastMessage, "id">) => void
  toasts: ToastMessage[]
  remove: (id: number) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

export const ToastProviderInternal: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([])

  const toast = React.useCallback((t: Omit<ToastMessage, "id">) => {
    setToasts(prev => [...prev, { id: Date.now(), ...t }])
  }, [])

  const remove = React.useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast, toasts, remove }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within ToastProviderInternal")
  return ctx
}
