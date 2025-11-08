"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"

type Props = {
  value?: File | null
  onChange: (file: File | null) => void
  preview?: string | null
  onPreviewChange?: (url: string | null) => void
  label?: string
}

export function DropzoneUpload({
  value = null,
  onChange,
  preview = null,
  onPreviewChange,
  label = "Glissez-déposez une image (ou cliquez)"
}: Props) {
  const [internalPreview, setInternalPreview] = useState<string | null>(preview ?? null)

  useEffect(() => {
    setInternalPreview(preview ?? null)
  }, [preview])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const f = acceptedFiles[0]
    if (!f) return
    onChange(f)
    const url = URL.createObjectURL(f)
    setInternalPreview(url)
    onPreviewChange?.(url)
  }, [onChange, onPreviewChange])

  const {getRootProps, getInputProps, isDragActive, open} = useDropzone({
    onDrop,
    multiple: false,
    accept: { "image/*": [] },
    noClick: true,
    noKeyboard: true,
  })

  function clear() {
    if (internalPreview) URL.revokeObjectURL(internalPreview)
    setInternalPreview(null)
    onPreviewChange?.(null)
    onChange(null)
  }

  const border = useMemo(
    () => isDragActive ? "border-primary" : "border-dashed border-border",
    [isDragActive]
  )

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-md border ${border} p-4 text-sm`}
        onClick={open}
      >
        <input {...getInputProps()} />
        <p className="text-center text-muted-foreground">
          {label}
        </p>
        <p className="text-xs text-muted-foreground">PNG, JPG, WEBP…</p>
      </div>

      {internalPreview && (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={internalPreview} alt="preview" className="h-20 w-20 rounded-md border object-cover" />
          <Button variant="secondary" type="button" onClick={clear}>Retirer</Button>
        </div>
      )}
    </div>
  )
}
