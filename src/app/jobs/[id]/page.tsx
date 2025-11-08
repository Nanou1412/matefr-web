'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';

type Job = {
  id: string;
  user_id: string;
  title: string;
  company: string | null;
  city: string | null;
  visa: string | null;
  pay: string | null;
  image_url: string | null;
  created_at: string;
  // facultatif si tu ajoutes la colonne
  description?: string | null;
};

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('id,user_id,title,company,city,visa,pay,image_url,created_at,description')
        .eq('id', id)
        .single();
      if (!error) setJob(data as Job);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <p>Chargement…</p>;
  if (!job) return <p>Offre introuvable.</p>;

  const applyTemplate =
`Bonjour,

Je souhaiterais postuler au poste "${job.title}"${job.company ? ` chez ${job.company}` : ''}.
Je suis disponible immédiatement à ${job.city ?? '…'} (${job.visa ?? 'visa : …'}).

Merci et bonne journée,
—`;

  async function copyApply() {
    await navigator.clipboard.writeText(applyTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => router.push('/jobs')}>← Retour</Button>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          {job.image_url && (
            <img
              src={job.image_url}
              alt={job.title}
              className="w-full max-w-2xl rounded-md border object-cover"
            />
          )}

          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">{job.title}</h1>
            <p className="text-sm text-neutral-700">
              {(job.company ? `${job.company} • ` : '') + (job.city || '—')}
            </p>
            <p className="text-sm text-neutral-600">
              {[job.visa, job.pay].filter(Boolean).join(' • ')}
            </p>
            <p className="text-xs text-neutral-500">
              Publié le {new Date(job.created_at).toLocaleString()}
            </p>
          </div>

          {job.description && (
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap">{job.description}</p>
            </div>
          )}

          {/* Action: Postuler (modèle à copier) */}
          <Dialog>
            <DialogTrigger asChild>
              <Button>Postuler (modèle)</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Modèle de candidature</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                <pre className="whitespace-pre-wrap rounded-md border bg-neutral-50 p-3 text-sm">
{applyTemplate}
                </pre>
                <div className="flex gap-2">
                  <Button onClick={copyApply}>{copied ? 'Copié ✅' : 'Copier'}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}

