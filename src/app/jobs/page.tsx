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

type Job = {
  id: string
  user_id: string
  title: string
  company: string | null
  city: string | null
  visa: string | null
  pay: string | null
  image_url: string | null
  description: string | null
  created_at: string
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  // form
  const [title, setTitle] = useState('')
  const [company, setCompany] = useState('')
  const [city, setCity] = useState('')
  const [visa, setVisa] = useState('')
  const [pay, setPay] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const { toast } = useToast()

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) toast({ title: 'Erreur', description: error.message })
    setJobs(data || [])
    setLoading(false)
  }

  async function addJob(e: React.FormEvent) {
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
        image_url = await uploadImage(file, user_id, "jobs")
      } catch (err: any) {
        toast({ title: 'Erreur upload', description: err.message || 'Upload impossible' })
        return
      }
    }

    const { error } = await supabase.from('jobs').insert([{
      user_id,
      title,
      company: company || null,
      city: city || null,
      visa: visa || null,
      pay: pay || null,
      description: description || null,
      image_url,
    }])

    if (error) {
      toast({ title: 'Erreur', description: error.message })
      return
    }

    toast({ title: 'Succès', description: 'Offre ajoutée.' })
    setTitle(''); setCompany(''); setCity(''); setVisa(''); setPay(''); setDescription('')
    if (preview) URL.revokeObjectURL(preview); setPreview(null); setFile(null)
    await load()
  }

  const list = useMemo(() => jobs, [jobs])

  return (
    <div className="space-y-6">
      <h2>Offres d'emploi</h2>

      <form onSubmit={addJob} className="grid gap-3">
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <Label>Titre</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div>
            <Label>Entreprise</Label>
            <Input value={company} onChange={e => setCompany(e.target.value)} />
          </div>
          <div>
            <Label>Ville</Label>
            <Input value={city} onChange={e => setCity(e.target.value)} />
          </div>
          <div>
            <Label>Visa</Label>
            <Input value={visa} onChange={e => setVisa(e.target.value)} placeholder="WHV / Student…" />
          </div>
          <div>
            <Label>Rémunération</Label>
            <Input value={pay} onChange={e => setPay(e.target.value)} placeholder="30$/h" />
          </div>
        </div>

        <div>
          <Label>Description</Label>
          <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Détails du poste…" />
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
          {list.map((job) => (
            <Card key={job.id} className="card-shadow">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  {job.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={job.image_url} alt={job.title} className="h-20 w-20 rounded-md border object-cover" />
                  )}
                  <div>
                    <h3>{job.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {(job.company ?? '—')} — {(job.city ?? '—')}
                    </p>
                    {job.description && <p className="mt-2 text-sm">{job.description}</p>}
                    <p className="text-sm mt-1">
                      {job.visa && <span>Visa : {job.visa} · </span>}
                      {job.pay && <span>Paie : {job.pay}</span>}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
