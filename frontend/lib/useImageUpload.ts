'use client'
import { useState, useRef } from 'react'
import { authFetch } from './authFetch'

export function useImageUpload(onUrl: (url: string) => void) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    const fd = new FormData()
    fd.append('image', file)
    try {
      const res = await authFetch('/api/upload', { method: 'POST', body: fd })
      const { url } = await res.json()
      onUrl(url)
    } catch {
      setError('アップロードに失敗しました')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return { fileRef, uploading, error, handleChange }
}
