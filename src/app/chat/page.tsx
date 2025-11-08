"use client"

import { useEffect, useRef, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

type Message = {
  id: string
  user_id: string
  username: string | null
  content: string
  room: string
  created_at: string
}

const ROOMS = [
  { key: "general", label: "Général" },
  { key: "sydney", label: "Sydney" },
  { key: "melbourne", label: "Melbourne" },
  { key: "perth", label: "Perth" },
  { key: "brisbane", label: "Brisbane" },
  { key: "adelaide", label: "Adelaide" },
  { key: "goldcoast", label: "Gold Coast" },
  { key: "canberra", label: "Canberra" },
  { key: "hobart", label: "Hobart" },
  { key: "darwin", label: "Darwin" },
]

export default function ChatPage() {
  const [room, setRoom] = useState<string>("general")
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [me, setMe] = useState<{ id: string; username: string } | null>(null)
  const { toast } = useToast()
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages])

  // User session (une fois)
  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser()
      const uid = u.user?.id ?? null
      const uname =
        (u.user?.user_metadata?.name as string | undefined) ||
        (u.user?.email as string | undefined) ||
        "Anonyme"
      if (uid) setMe({ id: uid, username: uname })
    })()
  }, [])

  // Chargement + Realtime quand room change
  useEffect(() => {
    let mounted = true
    let channel: ReturnType<typeof supabase.channel> | null = null

    ;(async () => {
      // Charger derniers messages pour cette room
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("room", room)
        .order("created_at", { ascending: false })
        .limit(100)

      if (!mounted) return

      if (error) {
        toast({ title: "Erreur", description: error.message })
      } else {
        const ordered = (data || []).sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        ) as Message[]
        setMessages(ordered)
      }

      // Abonnement Realtime filtré par room
      channel = supabase
        .channel(`chat:${room}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages", filter: `room=eq.${room}` },
          (payload) => {
            const m = payload.new as Message
            setMessages((prev) => [...prev, m])
          }
        )
        .subscribe()
    })()

    return () => {
      mounted = false
      if (channel) supabase.removeChannel(channel)
    }
  }, [room, toast])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text) return

    const { data: u } = await supabase.auth.getUser()
    const user_id = u.user?.id
    if (!user_id) {
      toast({ title: "Connexion requise", description: "Connecte-toi pour envoyer un message." })
      return
    }
    const username =
      (u.user?.user_metadata?.name as string | undefined) ||
      (u.user?.email as string | undefined) ||
      "Anonyme"

    setSending(true)
    setInput("")

    const { error } = await supabase.from("messages").insert({
      user_id,
      username,
      content: text,
      room, // 👈 salon courant
    })

    setSending(false)

    if (error) {
      setInput(text)
      toast({ title: "Erreur", description: error.message })
      return
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-3xl mx-auto">
      <h2 className="text-center mb-2 font-semibold text-xl">💬 Chat communautaire</h2>

      {/* Onglets rooms */}
      <div className="mb-3 flex w-full snap-x overflow-x-auto rounded-md border bg-muted/40">
        {ROOMS.map((r) => {
          const active = r.key === room
          return (
            <button
              key={r.key}
              onClick={() => setRoom(r.key)}
              className={`px-3 py-2 text-sm whitespace-nowrap ${active ? "bg-background text-primary border-r" : "text-muted-foreground border-r hover:text-foreground"}`}
              type="button"
            >
              {r.label}
            </button>
          )
        })}
      </div>

      <Card className="flex-1 overflow-hidden border card-shadow">
        <CardContent className="flex h-full flex-col p-3">
          <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto pr-2">
            {messages.length === 0 ? (
              <p className="mt-10 text-center text-muted-foreground">
                Aucun message dans « {ROOMS.find(r => r.key === room)?.label} ». Sois le premier 👋
              </p>
            ) : (
              messages.map((m) => {
                const mine = m.user_id === me?.id
                return (
                  <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                        mine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                      }`}
                      title={new Date(m.created_at).toLocaleString()}
                    >
                      {!mine && (
                        <p className="mb-1 text-[11px] font-medium opacity-80">{m.username ?? "—"}</p>
                      )}
                      <p className="whitespace-pre-wrap">{m.content}</p>
                      <p className="mt-1 text-right text-[10px] opacity-70">
                        {new Date(m.created_at).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          <form onSubmit={sendMessage} className="mt-2 flex gap-2">
            <Input
              placeholder={me ? `Écris dans #${room}…` : "Connecte-toi pour écrire..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={!me || sending}
            />
            <Button type="submit" disabled={!me || sending}>
              Envoyer
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
