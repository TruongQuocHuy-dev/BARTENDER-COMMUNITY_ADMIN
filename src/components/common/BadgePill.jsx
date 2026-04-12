import React from 'react'

export default function BadgePill({ label, tone = 'neutral', icon: Icon }) {
  return (
    <span className={`common-badge common-badge-${tone}`}>
      {Icon ? <Icon size={14} /> : null}
      {label}
    </span>
  )
}
