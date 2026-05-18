import { useState, useEffect, useCallback } from 'react'
import { Navigate } from 'react-router-dom'
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getCountFromServer,
  Timestamp,
} from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useAuth } from '../../context/AuthContext'
import { formatPrice } from '../../lib/format'
import PoliceHoldManager from '../../components/admin/PoliceHoldManager'
import type { Item } from '../../lib/types'

interface DashboardStats {
  activeCount: number
  soldCount: number
  reservedCount: number
  draftCount: number
  policeHoldCount: number
  pawnVolumeCount: number
  pawnActive: number
  cannabisActive: number
  fireworksActive: number
  topItems: Pick<Item, 'id' | 'title' | 'price' | 'viewTag' | 'status' | 'trendingScore'>[]
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div style={{
      padding: 'var(--space-6)',
      backgroundColor: 'var(--color-surface)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--color-border)',
      textAlign: 'center',
    }}>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'var(--text-display)',
        color: 'var(--color-primary)',
        lineHeight: 1,
        marginBottom: 'var(--space-2)',
      }}>
        {value}
      </div>
      <div style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-small)',
        color: 'var(--color-text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
      }}>
        {label}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState<string | null>(null)

  const loadStats = useCallback(async () => {
    setStatsLoading(true)
    setStatsError(null)
    try {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const [
        activeResult,
        soldResult,
        reservedResult,
        draftResult,
        policeHoldResult,
        pawnVolumeResult,
        activeItemsSnap,
        topItemsSnap,
      ] = await Promise.all([
        getCountFromServer(query(collection(db, 'items'), where('status', '==', 'active'))),
        getCountFromServer(query(collection(db, 'items'), where('status', '==', 'sold'))),
        getCountFromServer(query(collection(db, 'items'), where('status', '==', 'reserved'))),
        getCountFromServer(query(collection(db, 'items'), where('status', '==', 'draft'))),
        getCountFromServer(query(collection(db, 'items'), where('policeHold', '==', true))),
        getCountFromServer(query(
          collection(db, 'pawnRequests'),
          where('createdAt', '>=', Timestamp.fromDate(sevenDaysAgo)),
        )),
        getDocs(query(collection(db, 'items'), where('status', '==', 'active'))),
        getDocs(query(
          collection(db, 'items'),
          orderBy('trendingScore', 'desc'),
          limit(5),
        )),
      ])

      const pawnActive     = activeItemsSnap.docs.filter(d => d.data()['viewTag'] === 'pawn').length
      const cannabisActive = activeItemsSnap.docs.filter(d => d.data()['viewTag'] === 'cannabis').length
      const fireworksActive = activeItemsSnap.docs.filter(d => d.data()['viewTag'] === 'fireworks').length

      const topItems = topItemsSnap.docs.map(d => {
        const data = d.data() as Record<string, unknown>
        return {
          id:            d.id,
          title:         String(data['title'] ?? ''),
          price:         typeof data['price'] === 'number' ? data['price'] : 0,
          viewTag:       (data['viewTag'] as Item['viewTag']) ?? 'pawn',
          status:        (data['status'] as Item['status']) ?? 'draft',
          trendingScore: typeof data['trendingScore'] === 'number' ? data['trendingScore'] : 0,
        }
      })

      setStats({
        activeCount:    activeResult.data().count,
        soldCount:      soldResult.data().count,
        reservedCount:  reservedResult.data().count,
        draftCount:     draftResult.data().count,
        policeHoldCount: policeHoldResult.data().count,
        pawnVolumeCount: pawnVolumeResult.data().count,
        pawnActive,
        cannabisActive,
        fireworksActive,
        topItems,
      })
    } catch {
      setStatsError('Could not load dashboard data. Check your connection and try again.')
    } finally {
      setStatsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading && user && (user.isAdmin || user.role === 'manager')) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadStats()
    }
  }, [authLoading, user, loadStats])

  if (authLoading) {
    return (
      <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', padding: 'var(--space-8)' }}>
        Loading…
      </p>
    )
  }

  if (!user || (!user.isAdmin && user.role !== 'manager')) {
    return <Navigate to="/login" replace />
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'var(--space-8) var(--space-6)' }}>
      <header style={{ marginBottom: 'var(--space-12)' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-display)',
          color: 'var(--color-text)',
          marginBottom: 'var(--space-2)',
        }}>
          Dashboard
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-small)',
          color: 'var(--color-text-muted)',
        }}>
          Live inventory snapshot · The Pawn Shop
        </p>
      </header>

      {statsError && (
        <p role="alert" style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-body)',
          color: 'var(--color-text-muted)',
          marginBottom: 'var(--space-8)',
        }}>
          {statsError}
        </p>
      )}

      {statsLoading ? (
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', fontSize: 'var(--text-small)' }}>
          Loading stats…
        </p>
      ) : stats && (
        <>
          {/* Status counts */}
          <section aria-labelledby="status-heading" style={{ marginBottom: 'var(--space-12)' }}>
            <h2
              id="status-heading"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-heading)',
                color: 'var(--color-text)',
                marginBottom: 'var(--space-6)',
              }}
            >
              Inventory status
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: 'var(--space-4)',
            }}>
              <StatCard label="Active"       value={stats.activeCount} />
              <StatCard label="Sold"         value={stats.soldCount} />
              <StatCard label="Reserved"     value={stats.reservedCount} />
              <StatCard label="Draft"        value={stats.draftCount} />
              <StatCard label="Police Hold"  value={stats.policeHoldCount} />
            </div>
          </section>

          {/* Active by view */}
          <section aria-labelledby="view-heading" style={{ marginBottom: 'var(--space-12)' }}>
            <h2
              id="view-heading"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-heading)',
                color: 'var(--color-text)',
                marginBottom: 'var(--space-6)',
              }}
            >
              Active by view
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: 'var(--space-4)',
            }}>
              <StatCard label="Pawn"      value={stats.pawnActive} />
              <StatCard label="Cannabis"  value={stats.cannabisActive} />
              <StatCard label="Fireworks" value={stats.fireworksActive} />
            </div>
          </section>

          {/* Pawn request volume */}
          <section aria-labelledby="pawn-vol-heading" style={{ marginBottom: 'var(--space-12)' }}>
            <h2
              id="pawn-vol-heading"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-heading)',
                color: 'var(--color-text)',
                marginBottom: 'var(--space-6)',
              }}
            >
              Pawn enquiries
            </h2>
            <StatCard label="Last 7 days" value={stats.pawnVolumeCount} />
          </section>

          {/* Top trending items */}
          <section aria-labelledby="trending-heading" style={{ marginBottom: 'var(--space-12)' }}>
            <h2
              id="trending-heading"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-heading)',
                color: 'var(--color-text)',
                marginBottom: 'var(--space-6)',
              }}
            >
              Top trending
            </h2>
            {stats.topItems.length === 0 ? (
              <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', fontSize: 'var(--text-small)', fontStyle: 'italic' }}>
                No trending items yet.
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }} aria-label="Top trending items">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                      {['Title', 'Price', 'View', 'Status', 'Score'].map(col => (
                        <th
                          key={col}
                          scope="col"
                          style={{
                            textAlign: 'left',
                            padding: 'var(--space-3) var(--space-4)',
                            fontFamily: 'var(--font-body)',
                            fontSize: 'var(--text-xs)',
                            color: 'var(--color-text-muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            fontWeight: 500,
                          }}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topItems.map(item => (
                      <tr
                        key={item.id}
                        style={{ borderBottom: '1px solid var(--color-border)' }}
                      >
                        <td style={{ padding: 'var(--space-3) var(--space-4)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text)' }}>
                          {item.title}
                        </td>
                        <td style={{ padding: 'var(--space-3) var(--space-4)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--color-text)' }}>
                          {formatPrice(item.price)}
                        </td>
                        <td style={{ padding: 'var(--space-3) var(--space-4)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                          {item.viewTag}
                        </td>
                        <td style={{ padding: 'var(--space-3) var(--space-4)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                          {item.status}
                        </td>
                        <td style={{ padding: 'var(--space-3) var(--space-4)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)' }}>
                          {item.trendingScore ?? 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Refresh */}
          <div style={{ marginBottom: 'var(--space-12)' }}>
            <button
              type="button"
              className="btn btn-ghost btn-md"
              onClick={loadStats}
              disabled={statsLoading}
            >
              Refresh stats
            </button>
          </div>
        </>
      )}

      {/* Police Hold Manager — admin only */}
      {user.isAdmin && (
        <div style={{
          paddingTop: 'var(--space-12)',
          borderTop: '1px solid var(--color-border)',
        }}>
          <PoliceHoldManager />
        </div>
      )}
    </div>
  )
}
