'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { DropzoneUpload } from '@/components/dropzone'
import { uploadImage } from '@/lib/upload'

type Listing = {
  id: string
  user_id: string
  title: string
  city: string | null
  price_week: number | null
  contact: string | null
  description: string | null
  image_url: string | null
  created_at: string
}

export default function LogementPage() {
  const [items, setItems] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  // form
  const [title, setTitle] = useState('')
  const [city, setCity] = useState('')
  const [price, setPrice] = useState<number | ''>('')
  const [contact, setContact] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const { toast } = useToast()

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) toast({ title: 'Erreur', description: error.message })
    setItems(data || [])
    setLoading(false)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const { data: userData } = await supabase.auth.getUser()
    const user_id = userData.user?.id
    if (!user_id) {
      toast({ title: 'Erreur', description: 'Vous devez être connecté.' })
      return
    }

    let image_url: string | null = null
    if (file) {
      try {
        image_url = await uploadImage(file, user_id, "listings")
      } catch (err: any) {
        toast({ title: 'Erreur upload', description: err.message || 'Upload impossible' })
        return
      }
    }

    const { error } = await supabase.from('listings').insert([{
      user_id,
      title,
      city: city || null,
      price_week: price === '' ? null : Number(price),
      contact: contact || null,
      description: description || null,
      image_url,
    }])

    if (error) {
      toast({ title: 'Erreur', description: error.message })
      return
    }

    toast({ title: 'Succès', description: 'Annonce publiée.' })
    setTitle(''); setCity(''); setPrice(''); setContact(''); setDescription('')
    if (preview) URL.revokeObjectURL(preview); setPreview(null); setFile(null)
    await load()
  }

  const list = useMemo(() => items, [items])

  return (
    <div className="space-y-6">
      <h2>Annonces Logement</h2>

      <form onSubmit={onSubmit} className="grid gap-3">
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <Label>Titre</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <Label>Ville</Label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div>
            <Label>Prix/sem.</Label>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
            />
          </div>
        </div>

        <div>
          <Label>Contact</Label>
          <Input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="email / téléphone" />
        </div>

        <div>
          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Détails, quartier, coloc…" />
        </div>

        <div>
          <Label>Image (drag & drop)</Label>
          <DropzoneUpload
            value={file}
            onChange={setFile}
            preview={preview}
            onPreviewChange={setPreview}
          />
        </div>

        <Button type="submit">Publier</Button>
      </form>

      {loading ? (
        <p>Chargement…</p>
      ) : (
        <div className="grid gap-3">
          {list.map((it) => (
            <Card key={it.id} className="card-shadow">
              <CardContent className="p-4 flex gap-3">
                {it.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.image_url} alt={it.title} className="h-20 w-20 rounded-md border object-cover" />
                )}
                <div>
                  <h3>{it.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {(it.city ?? '—')} — {it.price_week != null ? `${it.price_week} $/sem.` : 'Prix non indiqué'}
                  </p>
                  {it.description && <p className="mt-2 text-sm">{it.description}</p>}
                  <p className="text-sm text-muted-foreground mt-1">
                    Contact : {it.contact || '—'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
