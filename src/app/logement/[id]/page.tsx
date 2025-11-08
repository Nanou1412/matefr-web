'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';

type Listing = {
  id: string;
  user_id: string;
  title: string;
  city: string | null;
  price_week: number | null;
  contact: string | null;
  image_url: string | null;
  created_at: string;
  // facultatif si tu ajoutes la colonne
  description?: string | null;
};

function getContactHref(contact: string) {
  const isEmail = /\S+@\S+\.\S+/.test(contact);
  const digits = contact.replace(/[^\d+]/g, '');
  const isPhone = digits.length >= 8;
  if (isEmail) return `mailto:${contact}`;
  if (isPhone) return `tel:${digits}`;
  return null;
}

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [it, setIt] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('id,user_id,title,city,price_week,contact,image_url,created_at,description')
        .eq('id', id)
        .single();
      if (!error) setIt(data as Listing);
      setLoading(false);
    })();
  }, [id]);

  const contactHref = useMemo(() => (it?.contact ? getContactHref(it.contact) : null), [it?.contact]);

  if (loading) return <p>Chargement…</p>;
  if (!it) return <p>Annonce introuvable.</p>;

  const msg =
`Bonjour,

Je suis intéressé(e) par votre annonce "${it.title}" à ${it.city ?? '…'}.
Pouvez-vous me dire si le logement est toujours disponible ?
Budget : ${it.price_week != null ? `${it.price_week} $/sem.` : 'à préciser'}.

Merci, bonne journée,
—`;

  async function copyMsg() {
    await navigator.clipboard.writeText(msg);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => router.push('/logement')}>← Retour</Button>
      </div>

      <Card>
        <CardContent className="space-y-4 p-4">
          {it.image_url && (
            <img
              src={it.image_url}
              alt={it.title}
              className="w-full max-w-2xl rounded-md border object-cover"
            />
          )}

          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">{it.title}</h1>
            <p className="text-sm text-neutral-700">{it.city || '—'}</p>
            <p className="text-sm text-neutral-600">
              {it.price_week != null ? `${it.price_week} $/sem.` : 'Prix non indiqué'} • {it.contact || '—'}
            </p>
            <p className="text-xs text-neutral-500">
              Publié le {new Date(it.created_at).toLocaleString()}
            </p>
          </div>

          {it.description && (
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap">{it.description}</p>
            </div>
          )}

          {/* Action: Contacter / Modèle */}
          {contactHref ? (
            <a href={contactHref}>
              <Button>Contacter</Button>
            </a>
          ) : (
            <Dialog>
              <DialogTrigger asChild>
                <Button>Contacter (modèle)</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Message à envoyer</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                  <pre className="whitespace-pre-wrap rounded-md border bg-neutral-50 p-3 text-sm">
{msg}
                  </pre>
                  <div className="flex gap-2">
                    <Button onClick={copyMsg}>{copied ? 'Copié ✅' : 'Copier'}</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
