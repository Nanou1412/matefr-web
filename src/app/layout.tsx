import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { Toaster } from "@/components/ui/toaster"
import { ToastProviderInternal } from "@/components/ui/use-toast"
import { MobileNav } from "@/components/mobile-nav"

export const metadata: Metadata = {
  title: "MateFR",
  description: "La plateforme des Français en Australie",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ToastProviderInternal>
            <Navbar />
            {/* pb-20 pour ne pas masquer le contenu par la barre mobile */}
            <main className="mx-auto max-w-6xl px-4 py-6 pb-24 md:pb-6">
              {children}
            </main>

            {/* Barre mobile (masquée en >= md) */}
            <MobileNav />

            <Toaster />
            <footer className="hidden md:block border-t py-4 text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} MateFR · Tous droits réservés
            </footer>
          </ToastProviderInternal>
        </ThemeProvider>
      </body>
    </html>
  )
}

