import React from 'react'

export default function ToggleSwitch({ id, checked, onChange, label, hint }) {
  return (
    <label className="setting-toggle" htmlFor={id}>
      <div className="setting-toggle-content">
        <span className="setting-toggle-label">{label}</span>
        {hint ? <span className="setting-toggle-hint">{hint}</span> : null}
      </div>

      <span className={`setting-switch ${checked ? 'checked' : ''}`}>
        <input id={id} type="checkbox" checked={checked} onChange={onChange} />
        <span className="setting-switch-slider" />
      </span>
    </label>
  )
}
