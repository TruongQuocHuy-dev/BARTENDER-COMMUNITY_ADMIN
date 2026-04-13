import React from 'react'

export default function SettingSection({ title, description, actions, children }) {
  return (
    <section className="setting-section-card">
      <div className="setting-section-head">
        <div>
          <h3>{title}</h3>
          {description ? <p>{description}</p> : null}
        </div>

        {actions ? <div className="setting-section-actions">{actions}</div> : null}
      </div>

      <div className="setting-section-body">{children}</div>
    </section>
  )
}
