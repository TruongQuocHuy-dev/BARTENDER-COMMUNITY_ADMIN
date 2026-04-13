import React from 'react'
import { Laptop, ShieldCheck, Trash2 } from 'lucide-react'

export default function DeviceItem({ device, onLogout, isBusy }) {
  const lastActive = device?.lastActive
    ? new Date(device.lastActive).toLocaleString('vi-VN')
    : 'Unknown'

  return (
    <article className="device-item">
      <div className="device-item-main">
        <div className="device-item-icon">
          <Laptop size={18} />
        </div>

        <div>
          <h4>
            {device?.name || 'Unknown device'}
            {device?.current ? <span className="device-current-chip"><ShieldCheck size={12} /> Current</span> : null}
          </h4>

          <p>
            {(device?.os || 'Unknown OS') + ' • ' + (device?.browser || 'Unknown browser')}
          </p>

          <small>
            {device?.location || 'Unknown location'} • Last active: {lastActive}
          </small>
        </div>
      </div>

      {!device?.current ? (
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => onLogout(device._id)}
          disabled={isBusy}
        >
          <Trash2 size={14} />
          Logout
        </button>
      ) : null}
    </article>
  )
}
