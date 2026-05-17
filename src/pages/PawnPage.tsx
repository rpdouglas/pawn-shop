import { useState } from 'react'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import Table from '../components/ui/Table'

const DEMO_ITEMS = [
  { id: '1', title: 'Vintage Rolex Submariner', price: 599900, condition: 'good' as const,  status: 'active'   as const, merchandisingTags: ['rare-find'] },
  { id: '2', title: 'Fender Stratocaster 1972', price: 299900, condition: 'fair' as const,  status: 'reserved' as const },
  { id: '3', title: 'Canon AE-1 Film Camera',  price:  8999,  condition: 'like-new' as const, status: 'active'   as const, merchandisingTags: ['just-arrived'] },
]

interface TableRow extends Record<string, unknown> {
  title: string
  price: number
  condition: string
  status: string
}

const TABLE_DATA: TableRow[] = DEMO_ITEMS.map((i) => ({
  title:     i.title,
  price:     i.price,
  condition: i.condition,
  status:    i.status,
}))

export default function PawnPage() {
  const [searchValue, setSearchValue] = useState('')
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div style={{ padding: '40px 32px', maxWidth: '1024px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', marginBottom: '8px', fontSize: '48px' }}>
        Pawn · Design System
      </h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '48px' }}>
        E02 component scaffold — Pawn view
      </p>

      {/* Buttons */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '16px', fontSize: '18px' }}>Buttons</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="primary" size="sm">Small</Button>
          <Button variant="primary" size="lg">Large</Button>
          <Button variant="primary" disabled>Disabled</Button>
          <Button variant="primary" onClick={() => setModalOpen(true)}>Open Modal</Button>
        </div>
      </section>

      {/* Badges */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '16px', fontSize: '18px' }}>Badges</h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Badge variant="active"               label="Available" />
          <Badge variant="reserved"             label="Reserved" />
          <Badge variant="sold"                 label="Sold" />
          <Badge variant="archived"             label="Archived" />
          <Badge variant="condition-new"        label="New" />
          <Badge variant="condition-like-new"   label="Like New" />
          <Badge variant="condition-good"       label="Good" />
          <Badge variant="condition-fair"       label="Fair" />
          <Badge variant="condition-poor"       label="Poor" />
          <Badge variant="tag"                  label="rare-find" />
          <Badge variant="tag"                  label="just-arrived" />
        </div>
      </section>

      {/* Cards */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '16px', fontSize: '18px' }}>Item Cards</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
          {DEMO_ITEMS.map((item) => (
            <Card
              key={item.id}
              title={item.title}
              price={item.price}
              condition={item.condition}
              status={item.status}
              merchandisingTags={item.merchandisingTags}
            />
          ))}
        </div>
      </section>

      {/* Input */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '16px', fontSize: '18px' }}>Input</h2>
        <div style={{ maxWidth: '400px' }}>
          <Input
            id="demo-search"
            label="Search inventory"
            value={searchValue}
            onChange={setSearchValue}
            placeholder="e.g. guitar, camera, watch…"
            type="search"
          />
        </div>
      </section>

      {/* Table */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '16px', fontSize: '18px' }}>Table</h2>
        <Table<TableRow>
          columns={[
            { key: 'title',     header: 'Item',      sortable: true },
            { key: 'price',     header: 'Price',     sortable: true },
            { key: 'condition', header: 'Condition', sortable: true },
            { key: 'status',    header: 'Status',    sortable: true },
          ]}
          data={TABLE_DATA}
        />
      </section>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Enquire about this item">
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '20px' }}>
          Fill in your details and we will be in touch.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input id="modal-name"  label="Your name"  value="" onChange={() => {}} placeholder="First name" />
          <Input id="modal-email" label="Email"      value="" onChange={() => {}} type="email" placeholder="you@example.com" />
          <Button variant="primary" onClick={() => setModalOpen(false)}>Submit enquiry</Button>
        </div>
      </Modal>
    </div>
  )
}
