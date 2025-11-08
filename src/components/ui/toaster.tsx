"use client"

import { ToastProvider as RadixToastProvider } from "@radix-ui/react-toast"
import { Toast, ToastDescription, ToastTitle, ToastViewport } from "@/components/ui/toast"
import { ToastProviderInternal, useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"

function ToasterInner() {
  const { toasts, remove } = useToast()
  return (
    <>
      {toasts.map((t) => (
        <Toast key={t.id} onOpenChange={(o) => { if (!o) remove(t.id) }}>
          <div className="grid gap-1">
            {t.title && <ToastTitle>{t.title}</ToastTitle>}
            {t.description && <ToastDescription>{t.description}</ToastDescription>}
          </div>
          <Button size="sm" variant="secondary" onClick={() => remove(t.id)}>Fermer</Button>
        </Toast>
      ))}
      <ToastViewport />
    </>
  )
}

export function Toaster() {
  return (
    <RadixToastProvider swipeDirection="right">
      <ToastProviderInternal>
        <ToasterInner />
      </ToastProviderInternal>
    </RadixToastProvider>
  )
}
