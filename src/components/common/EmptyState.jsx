import React from 'react'

export default function EmptyState({ icon = '📭', message }) {
  return (
    <div className="common-empty-state">
      <div className="common-empty-icon">{icon}</div>
      <p>{message}</p>
    </div>
  )
}
