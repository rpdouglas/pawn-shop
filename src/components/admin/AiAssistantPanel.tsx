import { useState, useEffect } from 'react'
import { httpsCallable } from 'firebase/functions'
import { doc, onSnapshot } from 'firebase/firestore'
import { db, functions } from '../../lib/firebase'
import Button from '../ui/Button'
import type { Item } from '../../lib/types'

interface AiAssistantPanelProps {
  item: Item
  onApplyTitle: (title: string) => void
  onApplyCategory: (category: string) => void
  onApplyDescription: (draft: string) => void
  onApplyTags: (tags: string[]) => void
  onApplyPrice: (low: number, high: number) => void
}

interface AiData {
  aiTitle?: string
  aiCategory?: string
  aiDescription?: string
  aiTagSuggestions?: string[]
  aiPriceSuggestion?: {
    low: number
    high: number
    source: string
    confidenceLevel: string
  }
}

export default function AiAssistantPanel({
  item,
  onApplyTitle,
  onApplyCategory,
  onApplyDescription,
  onApplyTags,
  onApplyPrice
}: AiAssistantPanelProps) {
  const [aiData, setAiData] = useState<AiData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Listen to the AI subcollection for real-time updates
    const unsubscribe = onSnapshot(
      doc(db, 'items', item.id, 'internal', 'ai'),
      (snap) => {
        if (snap.exists()) {
          setAiData(snap.data() as AiData)
        }
      }
    )
    return unsubscribe
  }, [item.id])

  const generateDescription = async () => {
    setLoading(true)
    setError(null)
    try {
      const fn = httpsCallable(functions, 'generateAIDescription')
      await fn({
        itemId: item.id,
        title: item.title,
        category: item.category,
        viewTag: item.viewTag,
        condition: item.condition,
        provenanceNotes: item.provenanceNotes,
        serialNumber: item.serialNumber,
        staffNotes: '',
        images: item.images?.length ? item.images : undefined
      })
    } catch {
      setError('Failed to generate description.')
    } finally {
      setLoading(false)
    }
  }

  const suggestPrice = async () => {
    setLoading(true)
    setError(null)
    try {
      const fn = httpsCallable(functions, 'suggestAiPrice')
      await fn({
        itemId: item.id,
        title: item.title,
        category: item.category,
        condition: item.condition,
        brandModel: '',
        staffNotes: '',
        aiDescription: aiData?.aiDescription
      })
    } catch {
      setError('Failed to suggest price.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      padding: 'var(--space-6)', 
      backgroundColor: 'var(--color-bg)', 
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-border)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-6)'
    }}>
      <header>
        <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary)', margin: 0 }}>
          Gemini AI Assistant
        </h3>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
          Analyse image · Generate title, category & description · Price comps
        </p>
      </header>

      {error && <p style={{ color: 'var(--color-error)', fontSize: 'var(--text-xs)' }}>{error}</p>}

      <section style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <Button
          variant="secondary"
          size="sm"
          onClick={generateDescription}
          disabled={loading}
          style={{ minHeight: '48px' }}
        >
          {loading ? 'Thinking...' : '✨ Generate Title, Description & Tags'}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={suggestPrice}
          disabled={loading}
          style={{ minHeight: '48px' }}
        >
          {loading ? 'Analysing...' : '$ Suggest Price'}
        </Button>
      </section>

      {aiData?.aiTitle && (
        <div style={{
          padding: 'var(--space-4)',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)'
        }}>
          <h4 style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: 'var(--space-2)' }}>
            AI Suggested Title
          </h4>
          <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-text)', fontStyle: 'italic' }}>
            {aiData.aiTitle}
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onApplyTitle(aiData.aiTitle!)}
            style={{ marginTop: 'var(--space-4)', minHeight: '48px' }}
          >
            Apply Title
          </Button>
        </div>
      )}

      {aiData?.aiCategory && (
        <div style={{
          padding: 'var(--space-4)',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)'
        }}>
          <h4 style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: 'var(--space-2)' }}>
            AI Suggested Category
          </h4>
          <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-text)', fontStyle: 'italic' }}>
            {aiData.aiCategory}
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onApplyCategory(aiData.aiCategory!)}
            style={{ marginTop: 'var(--space-4)', minHeight: '48px' }}
          >
            Apply Category
          </Button>
        </div>
      )}

      {aiData?.aiDescription && (
        <div style={{ 
          padding: 'var(--space-4)', 
          backgroundColor: 'var(--color-surface)', 
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)'
        }}>
          <h4 style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: 'var(--space-2)' }}>
            AI Draft Description
          </h4>
          <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-text)', lineHeight: 1.6, fontStyle: 'italic' }}>
            {aiData.aiDescription}
          </p>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={() => onApplyDescription(aiData.aiDescription!)}
            style={{ marginTop: 'var(--space-4)', minHeight: '48px' }}
          >
            Promote to Description
          </Button>
        </div>
      )}

      {aiData?.aiPriceSuggestion && (
        <div style={{ 
          padding: 'var(--space-4)', 
          backgroundColor: 'var(--color-surface)', 
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)'
        }}>
          <h4 style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: 'var(--space-2)' }}>
            AI Price Suggestion
          </h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 'var(--text-lead)', fontWeight: 700, color: 'var(--color-text)' }}>
              ${(aiData.aiPriceSuggestion.low / 100).toFixed(2)} – ${(aiData.aiPriceSuggestion.high / 100).toFixed(2)}
            </span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              Conf: {aiData.aiPriceSuggestion.confidenceLevel}
            </span>
          </div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
            Source: {aiData.aiPriceSuggestion.source}
          </p>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onApplyPrice(aiData.aiPriceSuggestion!.low, aiData.aiPriceSuggestion!.high)}
            style={{ marginTop: 'var(--space-4)', minHeight: '48px' }}
          >
            Apply Midpoint
          </Button>
        </div>
      )}

      {aiData?.aiTagSuggestions && aiData.aiTagSuggestions.length > 0 && (
        <div style={{ 
          padding: 'var(--space-4)', 
          backgroundColor: 'var(--color-surface)', 
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)'
        }}>
          <h4 style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: 'var(--space-2)' }}>
            Suggested Tags
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
            {aiData.aiTagSuggestions.map(tag => (
              <span key={tag} style={{ 
                padding: 'var(--space-1) var(--space-2)', 
                backgroundColor: 'var(--color-bg)', 
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
                border: '1px solid var(--color-border)'
              }}>
                {tag}
              </span>
            ))}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onApplyTags(aiData.aiTagSuggestions!)}
            style={{ minHeight: '48px' }}
          >
            Apply Tags
          </Button>
        </div>
      )}
    </div>
  )
}
