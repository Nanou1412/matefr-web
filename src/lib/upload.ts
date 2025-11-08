import { supabase } from "@/lib/supabaseClient"

/**
 * Upload une image dans le bucket "public" et retourne l’URL publique.
 * Le bucket "public" doit être en accès public côté Supabase Storage.
 */
export async function uploadImage(
  file: File,
  userId: string,
  folder: "jobs" | "listings"
): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg"
  const path = `${folder}/${userId}/${Date.now()}.${ext}`

  const { error } = await supabase.storage.from("public").upload(path, file, {
    contentType: file.type,
    upsert: false,
  })
  if (error) throw error

  const { data } = supabase.storage.from("public").getPublicUrl(path)
  return data.publicUrl
}
