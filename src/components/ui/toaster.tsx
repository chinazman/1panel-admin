"use client"

import dynamic from "next/dynamic"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

const DynamicToaster = dynamic(
  () => import("@/hooks/use-toast").then((mod) => {
    const { useToast } = mod
    return function Toaster() {
      const { toasts } = useToast()

      return (
        <ToastProvider>
          {toasts.map(function ({ id, title, description, action, ...props }) {
            return (
              <Toast key={id} {...props}>
                <div className="grid gap-1">
                  {title && <ToastTitle>{title}</ToastTitle>}
                  {description && (
                    <ToastDescription>{description}</ToastDescription>
                  )}
                </div>
                {action}
                <ToastClose />
              </Toast>
            )
          })}
          <ToastViewport />
        </ToastProvider>
      )
    }
  }),
  {
    ssr: false
  }
)

export { DynamicToaster as Toaster }
