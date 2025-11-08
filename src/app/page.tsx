"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold mb-4">🇫🇷 MateFR</h1>
        <p className="text-lg text-muted-foreground mb-10 max-w-lg mx-auto">
          La communauté des Français en Australie 🌏 — trouve un job, un logement ou un contact, 
          tout au même endroit.
        </p>
      </motion.div>

      <motion.div
        className="flex flex-col md:flex-row gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Link href="/jobs">
          <Button size="lg" className="w-56">
            🔨 Chercher un Job
          </Button>
        </Link>
        <Link href="/logement">
          <Button size="lg" variant="secondary" className="w-56">
            🏠 Trouver un Logement
          </Button>
        </Link>
        <Link href="/chat">
          <Button size="lg" variant="outline" className="w-56">
            💬 Discuter avec d'autres
          </Button>
        </Link>
      </motion.div>

      <motion.p
        className="text-sm text-muted-foreground mt-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        Connecte-toi pour publier tes annonces et échanger avec la communauté.
      </motion.p>
    </main>
  )
}
