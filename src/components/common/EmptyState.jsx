import React from 'react'

export default function EmptyState({ icon = '📭', title, description, message }) {
  const renderIcon = () => {
    if (React.isValidElement(icon)) return icon
    if (typeof icon === 'function') {
      const Icon = icon
      return <Icon size={24} />
    }
    return <span>{icon}</span>
  }

  return (
    <div className="common-empty-state">
      <div className="common-empty-icon">{renderIcon()}</div>
      {title ? <h3>{title}</h3> : null}
      <p>{message || description || ''}</p>
    </div>
  )
}
