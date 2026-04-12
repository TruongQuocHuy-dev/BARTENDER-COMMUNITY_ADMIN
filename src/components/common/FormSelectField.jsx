import React from 'react'

export default function FormSelectField({ value, onChange, options, icon: Icon }) {
  return (
    <div className="common-field-wrap">
      {Icon ? <Icon size={16} className="common-field-icon" /> : null}
      <select value={value} onChange={onChange} className="input-field common-input common-select">
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
