import React from 'react';

export default function PageHeader({ title, subtitle, actions, icon }) {
  return (
    <div className="page-header-modern">
      <div className="page-header-content">
        <div className="page-header-text">
          {icon && (
            <div className="page-header-icon">
              {icon}
            </div>
          )}
          <div>
            <h1 className="page-header-title">{title}</h1>
            {subtitle && (
              <p className="page-header-subtitle">{subtitle}</p>
            )}
          </div>
        </div>

        {actions && (
          <div className="page-header-actions">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
