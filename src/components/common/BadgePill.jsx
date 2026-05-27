import React from 'react'

export default function BadgePill({ label, tone = 'neutral', icon }) {
  const renderIcon = () => {
    if (!icon) return null
    if (React.isValidElement(icon)) return icon
    if (typeof icon === 'function') {
      const Icon = icon
      return <Icon size={14} />
    }
    if (typeof icon === 'object') {
      return React.createElement(icon, { size: 14 })
    }

    return <span className="common-badge-icon">{String(icon)}</span>
  }

  return (
    <span className={`common-badge common-badge-${tone}`}>
      {renderIcon()}
      {label}
    </span>
  )
}
