import React from 'react'

export default function FormSearchField({ value, onChange, placeholder, icon: Icon }) {
  return (
    <div className="common-field-wrap">
      {Icon ? <Icon size={18} className="common-field-icon" /> : null}
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="input-field common-input"
      />
    </div>
  )
}
