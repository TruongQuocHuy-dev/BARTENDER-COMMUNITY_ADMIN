import React, { useEffect, useState } from 'react'
import PageHeader from '../../components/PageHeader'
import notificationsAdmin from '../../api/notificationsAdmin'

export default function Campaigns() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    try {
      setLoading(true)
      const res = await notificationsAdmin.listCampaigns({ page: 1, limit: 50 })
      setItems(res.items || [])
    } catch (err) {
      console.error(err)
      alert('Failed to load campaigns')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleSend = async (id) => {
    if (!confirm('Send this campaign now?')) return
    try {
      await notificationsAdmin.sendCampaign(id)
      alert('Sent')
      load()
    } catch (err) {
      console.error(err)
      alert('Send failed: ' + (err.message || ''))
    }
  }

  return (
    <div className="admin-page notification-campaigns">
      <PageHeader title="Campaigns" subtitle="Saved broadcast campaigns" />

      <div>
        <button className="btn btn-primary" onClick={() => window.location.href='/notifications/compose'}>New Campaign</button>
      </div>

      <div style={{ marginTop: 12 }}>
        {loading ? <div>Loading...</div> : (
          <table className="table">
            <thead>
              <tr><th>Title</th><th>Segment</th><th>Status</th><th>Sent At</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {items.map(it => (
                <tr key={it._id}>
                  <td>{it.title}</td>
                  <td>{it.segmentType}</td>
                  <td>{it.status}</td>
                  <td>{it.sentAt ? new Date(it.sentAt).toLocaleString() : ''}</td>
                  <td>
                    <button className="btn btn-outline" onClick={() => window.location.href=`/notifications/campaigns/${it._id}`}>View</button>
                    <button className="btn btn-primary" onClick={() => handleSend(it._id)} style={{ marginLeft: 8 }}>Send</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
