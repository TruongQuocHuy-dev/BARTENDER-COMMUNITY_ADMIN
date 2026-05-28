import React, { useEffect, useState } from 'react'
import PageHeader from '../../components/PageHeader'
import notificationsAdmin from '../../api/notificationsAdmin'
import auditApi from '../../api/audit'
import { useParams } from 'react-router-dom'

export default function CampaignDetail() {
  const { id } = useParams()
  const [campaign, setCampaign] = useState(null)
  const [loading, setLoading] = useState(false)
  const [audits, setAudits] = useState([])
  const [sending, setSending] = useState(false)

  const load = async () => {
    try {
      setLoading(true)
      const c = await notificationsAdmin.getCampaign(id)
      setCampaign(c)
      // fetch related audits
      const a = await auditApi.queryAudits({ resourceType: 'Campaign', resourceId: id, limit: 50 })
      setAudits(a.items || [])
    } catch (err) {
      console.error(err)
      alert('Failed to load campaign')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  const handleResend = async () => {
    if (!confirm('Gửi lại chiến dịch này?')) return
    try {
      setSending(true)
      await notificationsAdmin.sendCampaign(id)
      alert('Đã gửi lại')
      load()
    } catch (err) {
      console.error(err)
      alert('Send failed: ' + (err.message || ''))
    } finally {
      setSending(false)
    }
  }

  if (loading) return <div className="admin-page"><PageHeader title="Campaign" /><div>Loading...</div></div>

  if (!campaign) return <div className="admin-page"><PageHeader title="Campaign" /><div>Không tìm thấy chiến dịch</div></div>

  return (
    <div className="admin-page">
      <PageHeader title={campaign.title} subtitle={`Trạng thái: ${campaign.status}`} />

      <div className="card" style={{ padding: 16, maxWidth: 1000 }}>
        <h3>{campaign.title}</h3>
        {campaign.subtitle && <div className="muted">{campaign.subtitle}</div>}
        <p style={{ whiteSpace: 'pre-wrap' }}>{campaign.body}</p>

        <div style={{ marginTop: 12 }}>
          <strong>Phân khúc:</strong> {campaign.segmentType}
          <div style={{ fontSize: 13, color: '#666' }}>{JSON.stringify(campaign.segmentOptions || {})}</div>
        </div>

        <div style={{ marginTop: 12 }}>
          <strong>Kết quả:</strong>
          <div>Sent: {campaign.results?.sentCount || 0}</div>
          <div>Failed: {campaign.results?.failedCount || 0}</div>
        </div>

        <div style={{ marginTop: 12 }}>
          {campaign.status !== 'sending' && (
            <button className="btn btn-primary" onClick={handleResend} disabled={sending}>{sending ? 'Đang gửi...' : 'Gửi lại'}</button>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 12, padding: 12, maxWidth: 1000 }}>
        <h4>Audit logs</h4>
        {audits.length === 0 ? <div>Không có logs</div> : (
          <ul>
            {audits.map(a => (
              <li key={a._id}>{new Date(a.createdAt).toLocaleString()} — {a.action} — {a.admin?.fullName || a.admin?.email || 'system'}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="card" style={{ marginTop: 12, padding: 12, maxWidth: 1000 }}>
        <h4>Failures</h4>
        {(!campaign.results?.failures || !campaign.results.failures.length) ? (
          <div>Không có lỗi</div>
        ) : (
          <table className="table">
            <thead><tr><th>#</th><th>Error</th><th>Batch size</th></tr></thead>
            <tbody>
              {campaign.results.failures.map((f, idx) => (
                <tr key={idx}><td>{idx+1}</td><td>{f.error}</td><td>{f.batchSize}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
