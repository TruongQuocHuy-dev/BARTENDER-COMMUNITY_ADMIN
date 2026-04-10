import { createTheme } from '@mui/material/styles'

export const appTheme = {
  colors: {
    bgBody: '#f3f4f6',
    bgWhite: '#ffffff',
    bgLight: '#f8fafc',
    bgLighter: '#f9fafb',
    bgDark: '#1f2937',
    textPrimary: '#1f2937',
    textSecondary: '#6b7280',
    textTertiary: '#9ca3af',
    textDark: '#111827',
    textLight: '#94a3b8',
    primary: '#4f46e5',
    primaryLight: '#e0e7ff',
    primaryDark: '#4338ca',
    primaryGradient: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    secondary: '#1a73e8',
    secondaryDark: '#1557b0',
    secondaryLight: '#f0f7ff',
    success: '#10b981',
    successLight: '#e6f4ea',
    successDark: '#059669',
    danger: '#ef4444',
    dangerLight: '#fce8e6',
    dangerDark: '#dc2626',
    warning: '#f59e0b',
    warningLight: '#fef3c7',
    info: '#3b82f6',
    infoLight: '#dbeafe',
    border: '#e5e7eb',
    borderLight: '#f3f4f6',
    borderDark: '#d1d5db',
  },
}

export const applyThemeVariables = (theme = appTheme) => {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  const { colors } = theme

  root.style.setProperty('--theme-bg-body', colors.bgBody)
  root.style.setProperty('--theme-bg-white', colors.bgWhite)
  root.style.setProperty('--theme-bg-light', colors.bgLight)
  root.style.setProperty('--theme-bg-lighter', colors.bgLighter)
  root.style.setProperty('--theme-bg-dark', colors.bgDark)
  root.style.setProperty('--theme-text-primary', colors.textPrimary)
  root.style.setProperty('--theme-text-secondary', colors.textSecondary)
  root.style.setProperty('--theme-text-tertiary', colors.textTertiary)
  root.style.setProperty('--theme-text-dark', colors.textDark)
  root.style.setProperty('--theme-text-light', colors.textLight)
  root.style.setProperty('--theme-primary', colors.primary)
  root.style.setProperty('--theme-primary-light', colors.primaryLight)
  root.style.setProperty('--theme-primary-dark', colors.primaryDark)
  root.style.setProperty('--theme-primary-gradient', colors.primaryGradient)
  root.style.setProperty('--theme-secondary', colors.secondary)
  root.style.setProperty('--theme-secondary-dark', colors.secondaryDark)
  root.style.setProperty('--theme-secondary-light', colors.secondaryLight)
  root.style.setProperty('--theme-success', colors.success)
  root.style.setProperty('--theme-success-light', colors.successLight)
  root.style.setProperty('--theme-success-dark', colors.successDark)
  root.style.setProperty('--theme-danger', colors.danger)
  root.style.setProperty('--theme-danger-light', colors.dangerLight)
  root.style.setProperty('--theme-danger-dark', colors.dangerDark)
  root.style.setProperty('--theme-warning', colors.warning)
  root.style.setProperty('--theme-warning-light', colors.warningLight)
  root.style.setProperty('--theme-info', colors.info)
  root.style.setProperty('--theme-info-light', colors.infoLight)
  root.style.setProperty('--theme-border', colors.border)
  root.style.setProperty('--theme-border-light', colors.borderLight)
  root.style.setProperty('--theme-border-dark', colors.borderDark)
}

export const muiTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: appTheme.colors.primary },
    secondary: { main: appTheme.colors.secondary },
    background: {
      default: appTheme.colors.bgBody,
      paper: appTheme.colors.bgWhite,
    },
  },
})

export default appTheme