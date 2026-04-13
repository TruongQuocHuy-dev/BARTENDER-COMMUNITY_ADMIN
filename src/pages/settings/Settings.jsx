import React, { useEffect, useMemo, useState } from 'react'
import { Bell, KeyRound, Lock, RefreshCcw, Save, Settings as SettingsIcon, Shield, UserCircle } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import { useAuth } from '../../context/AuthContext'
import settingsApi from '../../api/settings'
import SettingSection from '../../components/settings/SettingSection'
import ToggleSwitch from '../../components/settings/ToggleSwitch'
import DeviceItem from '../../components/settings/DeviceItem'

const tabs = [
  { key: 'profile', label: 'Profile', icon: UserCircle },
  { key: 'security', label: 'Security', icon: Shield },
  { key: 'notifications', label: 'Notifications', icon: Bell },
]

const initialSecurityAlerts = {
  unusualActivity: true,
  newDeviceLogin: true,
  passwordChange: true,
  emailChange: true,
}

const initialNotifications = {
  pushEnabled: true,
  emailEnabled: false,
  newFollowers: true,
  newRecipes: true,
  likes: true,
  comments: true,
}

export default function Settings() {
  const { user, login } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')

  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    website: '',
  })

  const [securityForm, setSecurityForm] = useState({
    twoFactorAuth: { enabled: false, method: 'app', phone: '' },
    securityAlerts: initialSecurityAlerts,
    recoveryEmail: '',
    recoveryPhone: '',
    hasRecoveryCodes: false,
  })

  const [notificationForm, setNotificationForm] = useState(initialNotifications)
  const [devices, setDevices] = useState([])

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [twoFaCode, setTwoFaCode] = useState('')
  const [twoFaSecret, setTwoFaSecret] = useState('')
  const [twoFaQrCode, setTwoFaQrCode] = useState('')

  const currentDeviceCount = useMemo(
    () => devices.filter((item) => item.current).length,
    [devices],
  )

  const setNotice = (nextMessage, nextError = '') => {
    setMessage(nextMessage)
    setError(nextError)
  }

  const loadSettingsData = async () => {
    setBusy(true)
    setNotice('')

    try {
      const [profileRes, securityRes, notificationRes, devicesRes] = await Promise.all([
        settingsApi.getMyProfile(),
        settingsApi.getSecuritySettings(),
        settingsApi.getNotificationSettings(),
        settingsApi.getDevices(),
      ])

      const profile = profileRes?.user || {}
      setProfileForm({
        fullName: profile.fullName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || '',
      })

      setSecurityForm({
        twoFactorAuth: {
          enabled: !!securityRes?.twoFactorAuth?.enabled,
          method: securityRes?.twoFactorAuth?.method || 'app',
          phone: securityRes?.twoFactorAuth?.phone || '',
        },
        securityAlerts: {
          ...initialSecurityAlerts,
          ...(securityRes?.securityAlerts || {}),
        },
        recoveryEmail: securityRes?.recoveryEmail || '',
        recoveryPhone: securityRes?.recoveryPhone || '',
        hasRecoveryCodes: !!securityRes?.hasRecoveryCodes,
      })

      setNotificationForm({
        ...initialNotifications,
        ...(notificationRes || {}),
      })

      setDevices(Array.isArray(devicesRes) ? devicesRes : [])
    } catch (err) {
      setNotice('', err?.message || 'Unable to load settings.')
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    loadSettingsData()
  }, [])

  const handleProfileSave = async () => {
    setBusy(true)
    setNotice('')

    try {
      const res = await settingsApi.updateMyProfile(profileForm)
      const updatedUser = res?.user

      if (updatedUser && user) {
        const token = localStorage.getItem('admin_token')
        if (token) {
          login(token, { ...user, ...updatedUser })
        }
      }

      setNotice('Profile saved successfully.')
    } catch (err) {
      setNotice('', err?.message || 'Failed to save profile.')
    } finally {
      setBusy(false)
    }
  }

  const handleSecuritySave = async () => {
    setBusy(true)
    setNotice('')

    try {
      await settingsApi.updateSecuritySettings({
        twoFactorAuth: securityForm.twoFactorAuth,
        securityAlerts: securityForm.securityAlerts,
        recoveryEmail: securityForm.recoveryEmail,
        recoveryPhone: securityForm.recoveryPhone,
      })

      setNotice('Security settings saved successfully.')
    } catch (err) {
      setNotice('', err?.message || 'Failed to save security settings.')
    } finally {
      setBusy(false)
    }
  }

  const handleNotificationsSave = async () => {
    setBusy(true)
    setNotice('')

    try {
      await settingsApi.updateNotificationSettings(notificationForm)
      setNotice('Notification settings saved successfully.')
    } catch (err) {
      setNotice('', err?.message || 'Failed to save notification settings.')
    } finally {
      setBusy(false)
    }
  }

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setNotice('', 'Please enter current and new password.')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setNotice('', 'Confirm password does not match.')
      return
    }

    setBusy(true)
    setNotice('')

    try {
      await settingsApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setNotice('Password changed successfully.')
    } catch (err) {
      setNotice('', err?.message || 'Failed to change password.')
    } finally {
      setBusy(false)
    }
  }

  const handleGenerateSecret = async () => {
    setBusy(true)
    setNotice('')
    try {
      const res = await settingsApi.generateTwoFactorSecret()
      setTwoFaSecret(res?.secret || '')
      setTwoFaQrCode(res?.qrCodeDataUrl || '')
      setNotice('2FA app secret generated. Scan QR or use secret.')
    } catch (err) {
      setNotice('', err?.message || 'Failed to generate 2FA secret.')
    } finally {
      setBusy(false)
    }
  }

  const handleSendSmsCode = async () => {
    setBusy(true)
    setNotice('')
    try {
      await settingsApi.sendTwoFactorSmsCode()
      setNotice('Verification code was sent to your phone.')
    } catch (err) {
      setNotice('', err?.message || 'Failed to send SMS code.')
    } finally {
      setBusy(false)
    }
  }

  const handleEnableTwoFactor = async () => {
    if (!twoFaCode) {
      setNotice('', 'Please enter verification code first.')
      return
    }

    setBusy(true)
    setNotice('')
    try {
      await settingsApi.verifyAndEnableTwoFactor({
        method: securityForm.twoFactorAuth.method || 'app',
        code: twoFaCode,
      })

      setSecurityForm((prev) => ({
        ...prev,
        twoFactorAuth: { ...prev.twoFactorAuth, enabled: true },
      }))
      setTwoFaCode('')
      setNotice('2FA enabled successfully.')
    } catch (err) {
      setNotice('', err?.message || 'Failed to enable 2FA.')
    } finally {
      setBusy(false)
    }
  }

  const handleDisableTwoFactor = async () => {
    setBusy(true)
    setNotice('')
    try {
      await settingsApi.disableTwoFactor()
      setSecurityForm((prev) => ({
        ...prev,
        twoFactorAuth: { ...prev.twoFactorAuth, enabled: false },
      }))
      setTwoFaCode('')
      setTwoFaSecret('')
      setTwoFaQrCode('')
      setNotice('2FA disabled successfully.')
    } catch (err) {
      setNotice('', err?.message || 'Failed to disable 2FA.')
    } finally {
      setBusy(false)
    }
  }

  const handleLogoutDevice = async (deviceId) => {
    setBusy(true)
    setNotice('')
    try {
      await settingsApi.logoutDevice(deviceId)
      setDevices((prev) => prev.filter((item) => item._id !== deviceId))
      setNotice('Device logged out.')
    } catch (err) {
      setNotice('', err?.message || 'Failed to logout device.')
    } finally {
      setBusy(false)
    }
  }

  const handleLogoutAll = async () => {
    setBusy(true)
    setNotice('')
    try {
      await settingsApi.logoutAllDevices()
      setDevices((prev) => prev.filter((item) => item.current))
      setNotice('Logged out all other devices.')
    } catch (err) {
      setNotice('', err?.message || 'Failed to logout all devices.')
    } finally {
      setBusy(false)
    }
  }

  const renderProfileTab = () => (
    <SettingSection
      title="Profile information"
      description="Update basic account information used by admin profile."
      actions={
        <button type="button" className="btn btn-primary" onClick={handleProfileSave} disabled={busy}>
          <Save size={16} />
          Save profile
        </button>
      }
    >
      <div className="settings-grid settings-grid-two">
        <div>
          <label>Full name</label>
          <input
            type="text"
            value={profileForm.fullName}
            onChange={(event) => setProfileForm((prev) => ({ ...prev, fullName: event.target.value }))}
            placeholder="Enter full name"
          />
        </div>

        <div>
          <label>Email</label>
          <input
            type="email"
            value={profileForm.email}
            onChange={(event) => setProfileForm((prev) => ({ ...prev, email: event.target.value }))}
            placeholder="Enter email"
          />
        </div>

        <div>
          <label>Phone</label>
          <input
            type="text"
            value={profileForm.phone}
            onChange={(event) => setProfileForm((prev) => ({ ...prev, phone: event.target.value }))}
            placeholder="Enter phone"
          />
        </div>

        <div>
          <label>Location</label>
          <input
            type="text"
            value={profileForm.location}
            onChange={(event) => setProfileForm((prev) => ({ ...prev, location: event.target.value }))}
            placeholder="Enter location"
          />
        </div>
      </div>

      <div className="settings-grid">
        <div>
          <label>Website</label>
          <input
            type="text"
            value={profileForm.website}
            onChange={(event) => setProfileForm((prev) => ({ ...prev, website: event.target.value }))}
            placeholder="https://example.com"
          />
        </div>
        <div>
          <label>Bio</label>
          <textarea
            value={profileForm.bio}
            onChange={(event) => setProfileForm((prev) => ({ ...prev, bio: event.target.value }))}
            placeholder="Write short bio"
            rows={4}
          />
        </div>
      </div>
    </SettingSection>
  )

  const renderSecurityTab = () => (
    <>
      <SettingSection
        title="Two-factor authentication"
        description="Use app or SMS verification for account protection."
      >
        <div className="settings-grid settings-grid-two">
          <div>
            <label>Verification method</label>
            <select
              value={securityForm.twoFactorAuth.method || 'app'}
              onChange={(event) =>
                setSecurityForm((prev) => ({
                  ...prev,
                  twoFactorAuth: { ...prev.twoFactorAuth, method: event.target.value },
                }))
              }
            >
              <option value="app">Authenticator app</option>
              <option value="sms">SMS</option>
            </select>
          </div>

          <div>
            <label>Verification code</label>
            <input
              type="text"
              value={twoFaCode}
              onChange={(event) => setTwoFaCode(event.target.value)}
              placeholder="Enter 6-digit code"
            />
          </div>
        </div>

        {securityForm.twoFactorAuth.method === 'app' ? (
          <div className="settings-inline-actions">
            <button type="button" className="btn btn-secondary" onClick={handleGenerateSecret} disabled={busy}>
              <RefreshCcw size={14} />
              Generate app secret
            </button>

            {twoFaSecret ? <span className="settings-chip">Secret: {twoFaSecret}</span> : null}
          </div>
        ) : (
          <div className="settings-inline-actions">
            <button type="button" className="btn btn-secondary" onClick={handleSendSmsCode} disabled={busy}>
              <KeyRound size={14} />
              Send SMS code
            </button>
          </div>
        )}

        {twoFaQrCode ? (
          <div className="settings-qrcode-wrap">
            <img src={twoFaQrCode} alt="2FA QR code" />
          </div>
        ) : null}

        <div className="settings-inline-actions">
          {!securityForm.twoFactorAuth.enabled ? (
            <button type="button" className="btn btn-primary" onClick={handleEnableTwoFactor} disabled={busy}>
              <Shield size={14} />
              Verify and enable 2FA
            </button>
          ) : (
            <button type="button" className="btn btn-danger" onClick={handleDisableTwoFactor} disabled={busy}>
              <Shield size={14} />
              Disable 2FA
            </button>
          )}

          <span className={`settings-chip ${securityForm.twoFactorAuth.enabled ? 'success' : ''}`}>
            Status: {securityForm.twoFactorAuth.enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      </SettingSection>

      <SettingSection
        title="Security alerts"
        description="Select events that should trigger account security alerts."
        actions={
          <button type="button" className="btn btn-primary" onClick={handleSecuritySave} disabled={busy}>
            <Save size={16} />
            Save security
          </button>
        }
      >
        <div className="settings-toggle-list">
          <ToggleSwitch
            id="alert-unusual"
            checked={!!securityForm.securityAlerts.unusualActivity}
            onChange={(event) =>
              setSecurityForm((prev) => ({
                ...prev,
                securityAlerts: { ...prev.securityAlerts, unusualActivity: event.target.checked },
              }))
            }
            label="Unusual activity"
            hint="Alert when suspicious sign-in behavior is detected."
          />

          <ToggleSwitch
            id="alert-device"
            checked={!!securityForm.securityAlerts.newDeviceLogin}
            onChange={(event) =>
              setSecurityForm((prev) => ({
                ...prev,
                securityAlerts: { ...prev.securityAlerts, newDeviceLogin: event.target.checked },
              }))
            }
            label="New device login"
            hint="Alert when account is used from new device."
          />

          <ToggleSwitch
            id="alert-password"
            checked={!!securityForm.securityAlerts.passwordChange}
            onChange={(event) =>
              setSecurityForm((prev) => ({
                ...prev,
                securityAlerts: { ...prev.securityAlerts, passwordChange: event.target.checked },
              }))
            }
            label="Password changed"
            hint="Alert after password is changed."
          />

          <ToggleSwitch
            id="alert-email"
            checked={!!securityForm.securityAlerts.emailChange}
            onChange={(event) =>
              setSecurityForm((prev) => ({
                ...prev,
                securityAlerts: { ...prev.securityAlerts, emailChange: event.target.checked },
              }))
            }
            label="Email changed"
            hint="Alert after account email is changed."
          />
        </div>

        <div className="settings-grid settings-grid-two">
          <div>
            <label>Recovery email</label>
            <input
              type="email"
              value={securityForm.recoveryEmail || ''}
              onChange={(event) => setSecurityForm((prev) => ({ ...prev, recoveryEmail: event.target.value }))}
              placeholder="Recovery email"
            />
          </div>

          <div>
            <label>Recovery phone</label>
            <input
              type="text"
              value={securityForm.recoveryPhone || ''}
              onChange={(event) => setSecurityForm((prev) => ({ ...prev, recoveryPhone: event.target.value }))}
              placeholder="Recovery phone"
            />
          </div>
        </div>
      </SettingSection>

      <SettingSection title="Change password" description="Use strong password with at least 6 characters.">
        <div className="settings-grid settings-grid-two">
          <div>
            <label>Current password</label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(event) => setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))}
              placeholder="Current password"
            />
          </div>

          <div>
            <label>New password</label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))}
              placeholder="New password"
            />
          </div>
        </div>

        <div className="settings-grid">
          <div>
            <label>Confirm new password</label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
              placeholder="Confirm new password"
            />
          </div>

          <div className="settings-inline-actions">
            <button type="button" className="btn btn-secondary" onClick={handleChangePassword} disabled={busy}>
              <Lock size={14} />
              Update password
            </button>
          </div>
        </div>
      </SettingSection>

      <SettingSection
        title="Active devices"
        description={`Devices signed in with this account. Current devices: ${currentDeviceCount}`}
        actions={
          <button type="button" className="btn btn-secondary" onClick={handleLogoutAll} disabled={busy}>
            Logout other devices
          </button>
        }
      >
        <div className="device-list-wrap">
          {devices.length === 0 ? (
            <p className="settings-muted">No active devices found.</p>
          ) : (
            devices.map((device) => (
              <DeviceItem key={device._id} device={device} onLogout={handleLogoutDevice} isBusy={busy} />
            ))
          )}
        </div>
      </SettingSection>
    </>
  )

  const renderNotificationsTab = () => (
    <SettingSection
      title="Notification preferences"
      description="Configure what updates you want to receive."
      actions={
        <button type="button" className="btn btn-primary" onClick={handleNotificationsSave} disabled={busy}>
          <Save size={16} />
          Save notifications
        </button>
      }
    >
      <div className="settings-toggle-list">
        <ToggleSwitch
          id="notif-push"
          checked={!!notificationForm.pushEnabled}
          onChange={(event) => setNotificationForm((prev) => ({ ...prev, pushEnabled: event.target.checked }))}
          label="Push notifications"
          hint="Receive push notifications on app/device."
        />

        <ToggleSwitch
          id="notif-email"
          checked={!!notificationForm.emailEnabled}
          onChange={(event) => setNotificationForm((prev) => ({ ...prev, emailEnabled: event.target.checked }))}
          label="Email notifications"
          hint="Receive updates via email."
        />

        <ToggleSwitch
          id="notif-followers"
          checked={!!notificationForm.newFollowers}
          onChange={(event) => setNotificationForm((prev) => ({ ...prev, newFollowers: event.target.checked }))}
          label="New followers"
          hint="Notify when there is a new follower."
        />

        <ToggleSwitch
          id="notif-recipes"
          checked={!!notificationForm.newRecipes}
          onChange={(event) => setNotificationForm((prev) => ({ ...prev, newRecipes: event.target.checked }))}
          label="New recipes"
          hint="Notify when recipes are published."
        />

        <ToggleSwitch
          id="notif-likes"
          checked={!!notificationForm.likes}
          onChange={(event) => setNotificationForm((prev) => ({ ...prev, likes: event.target.checked }))}
          label="Likes"
          hint="Notify when users like content."
        />

        <ToggleSwitch
          id="notif-comments"
          checked={!!notificationForm.comments}
          onChange={(event) => setNotificationForm((prev) => ({ ...prev, comments: event.target.checked }))}
          label="Comments"
          hint="Notify when comments are posted."
        />
      </div>
    </SettingSection>
  )

  return (
    <div className="admin-page settings-page">
      <PageHeader
        title="SETTINGS"
        subtitle="Admin profile, security and notification preferences"
        icon={<SettingsIcon size={24} />}
      />

      <div className="settings-tabs-wrap">
        {tabs.map((tab) => {
          const TabIcon = tab.icon
          const active = activeTab === tab.key
          return (
            <button
              key={tab.key}
              type="button"
              className={`settings-tab-btn ${active ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <TabIcon size={16} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {message ? <div className="settings-alert success">{message}</div> : null}
      {error ? <div className="settings-alert danger">{error}</div> : null}

      {busy ? <div className="settings-loading">Loading...</div> : null}

      <div className="settings-content-wrap">
        {activeTab === 'profile' ? renderProfileTab() : null}
        {activeTab === 'security' ? renderSecurityTab() : null}
        {activeTab === 'notifications' ? renderNotificationsTab() : null}
      </div>
    </div>
  )
}
