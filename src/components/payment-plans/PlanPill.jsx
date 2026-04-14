import React from 'react'

export default function PlanPill({ children, tone = 'neutral' }) {
  return <span className={`plan-pill tone-${tone}`}>{children}</span>
}
