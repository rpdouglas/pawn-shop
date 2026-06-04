import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { db, storage } from '../../../lib/firebase'
import { useAuth } from '../../../context/AuthContext'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import type { SocialPlatform, SocialPostStatus } from '../../../lib/types'
import Button from '../../../components/ui/Button'
import ReactMarkdown from 'react-markdown'

export default function SocialComposerPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [content, setContent] = useState('')
  const [platforms, setPlatforms] = useState<SocialPlatform[]>(['facebook', 'instagram'])
  const [mediaUrls, setMediaUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')
  const [saving, setSaving] = useState(false)

  const togglePlatform = (p: SocialPlatform) => {
    setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    setUploading(true)
    try {
      const newUrls: string[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const storageRef = ref(storage, `socialMedia/${Date.now()}_${file.name}`)
        const uploadTask = await uploadBytesResumable(storageRef, file)
        const downloadUrl = await getDownloadURL(uploadTask.ref)
        newUrls.push(downloadUrl)
      }
      setMediaUrls(prev => [...prev, ...newUrls])
    } catch (err) {
      console.error(err)
      alert('Failed to upload media')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async (status: SocialPostStatus) => {
    if (!user) return
    if (!content && mediaUrls.length === 0) {
      alert('Post must have either text or media.')
      return
    }
    if (platforms.length === 0) {
      alert('Select at least one platform.')
      return
    }

    setSaving(true)
    try {
      await addDoc(collection(db, 'socialPosts'), {
        content,
        mediaUrls,
        platforms,
        status,
        authorUid: user.uid,
        scheduledFor: scheduleDate ? new Date(scheduleDate) : null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      navigate('/admin/social')
    } catch (err) {
      alert('Failed to save post')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 'var(--space-8)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <header>
          <h1 style={{ fontSize: 'var(--text-xl)', fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>Compose Post</h1>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <label style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)', display: 'block' }}>Target Platforms</label>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              {(['facebook', 'instagram', 'twitter', 'tiktok'] as SocialPlatform[]).map(p => (
                <Button key={p} type="button" variant={platforms.includes(p) ? 'primary' : 'secondary'} onClick={() => togglePlatform(p)}>
                  {p}
                </Button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            <label style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Post Copy</label>
            <textarea
              rows={6}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Write your caption here... (#hashtags)"
              style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            <label style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Media (Upload Canva Exports)</label>
            <input 
              type="file" 
              accept="image/*,video/*" 
              multiple 
              onChange={handleFileUpload} 
              disabled={uploading}
              style={{ padding: 'var(--space-2)' }}
            />
            {uploading && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Uploading...</p>}
            {mediaUrls.length > 0 && (
              <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)', flexWrap: 'wrap' }}>
                {mediaUrls.map((url, i) => (
                  <img key={i} src={url} alt="Uploaded" style={{ height: '80px', width: '80px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            <label style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Schedule Publish Time (Optional)</label>
            <input 
              type="datetime-local" 
              value={scheduleDate} 
              onChange={e => setScheduleDate(e.target.value)} 
              style={{ padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
            <Button type="button" variant="secondary" onClick={() => handleSave('draft')} disabled={saving}>
              Save as Draft
            </Button>
            <Button type="button" variant="primary" onClick={() => handleSave('pending_review')} disabled={saving}>
              {saving ? 'Saving...' : 'Submit for Review'}
            </Button>
          </div>
        </div>
      </div>

      <div style={{ position: 'sticky', top: 'var(--space-6)', alignSelf: 'start', padding: 'var(--space-6)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
        <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)', color: 'var(--color-text)' }}>Mobile Preview</h3>
        <div style={{ border: '1px solid var(--color-border)', borderRadius: '24px', padding: 'var(--space-4)', backgroundColor: 'var(--color-bg)', minHeight: '400px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-border)' }} />
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)' }}>Pawn Shop Name</span>
          </div>
          {mediaUrls[0] && (
            <img src={mediaUrls[0]} style={{ width: '100%', height: 'auto', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-2)' }} alt="Preview" />
          )}
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
            <ReactMarkdown>{content || '*Post text will appear here*'}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  )
}
