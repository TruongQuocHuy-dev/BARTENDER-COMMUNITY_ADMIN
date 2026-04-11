import { createTheme } from '@mui/material/styles'

export const appTheme = {
  colors: {
    bgBody: '#f8fafc',
    bgWhite: '#ffffff',
    bgLight: '#f1f5f9',
    bgLighter: '#f8fafc',
    bgDark: '#1e293b',
    textPrimary: '#1e293b',
    textSecondary: '#64748b',
    textTertiary: '#94a3b8',
    textDark: '#0f172a',
    textLight: '#cbd5e1',
    primary: '#6366f1',
    primaryLight: '#e0e7ff',
    primaryDark: '#4f46e5',
    primaryGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    secondary: '#3b82f6',
    secondaryDark: '#2563eb',
    secondaryLight: '#eff6ff',
    success: '#10b981',
    successLight: '#d1fae5',
    successDark: '#059669',
    danger: '#ef4444',
    dangerLight: '#fee2e2',
    dangerDark: '#dc2626',
    warning: '#f59e0b',
    warningLight: '#fef3c7',
    info: '#3b82f6',
    infoLight: '#dbeafe',
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    borderDark: '#cbd5e1',
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
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
})

export default appTheme
