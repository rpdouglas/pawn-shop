import { useState } from 'react'

export function useGridClipboard() {
  const [copiedValue, setCopiedValue] = useState<string | null>(null)

  const copyValue = async (value: string): Promise<void> => {
    setCopiedValue(value)
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      // Fallback for environments where Clipboard API is unavailable
      const area = document.createElement('textarea')
      area.value = value
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.focus()
      area.select()
      document.execCommand('copy')
      document.body.removeChild(area)
    }
  }

  const readClipboard = async (): Promise<string | null> => {
    try {
      const text = await navigator.clipboard.readText()
      return text ?? copiedValue
    } catch {
      return copiedValue
    }
  }

  return { copiedValue, copyValue, readClipboard }
}
