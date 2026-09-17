import { useState, useEffect } from 'react';
import api from '../../api/client';
import { PageHeader, Badge } from '../../components/UI';
import { Settings as SettingsIcon, Globe, User } from 'lucide-react';
import { toast } from '../../components/toast';
import { useAuth } from '../../contexts/AuthContext';

export default function Settings() {
  const { user, setUser } = useAuth();
  const [tab, setTab] = useState('profile');
  const [profile, setProfile] = useState({});
  const [languages, setLanguages] = useState([]);
  const [selectedLang, setSelectedLang] = useState('en');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) setProfile({ firstName: user.firstName || '', lastName: user.lastName || '', email: user.email || '' });
    api.get('/localization/languages').then(r => setLanguages(r.data || [])).catch(() => {});
    api.get('/settings/profile').then(r => {
      if (r.data?.language) setSelectedLang(r.data.language);
    }).catch(() => {});
  }, [user]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await api.put(`/settings/profile`, profile);
      toast.success('Profile updated');
      if (res.data) setUser({ ...user, ...profile });
    } catch (e) { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  const saveLanguage = async () => {
    try {
      await api.put('/settings/profile', { language: selectedLang });
      toast.success('Language preference saved');
    } catch (e) { toast.error('Failed to save language'); }
  };

  return (
    <div>
      <PageHeader title="Settings" />

      <div className="tabs">
        <button className={`tab ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>
          <User size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Profile
        </button>
        <button className={`tab ${tab === 'language' ? 'active' : ''}`} onClick={() => setTab('language')}>
          <Globe size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Language
        </button>
      </div>

      {tab === 'profile' && (
        <div className="card">
          <div className="card-header"><h3>Profile Settings</h3></div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 480 }}>
              <div className="form-group">
                <label>First Name</label>
                <input value={profile.firstName || ''} onChange={(e) => setProfile(p => ({ ...p, firstName: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input value={profile.lastName || ''} onChange={(e) => setProfile(p => ({ ...p, lastName: e.target.value }))} />
              </div>
            </div>
            <div className="form-group" style={{ maxWidth: 480 }}>
              <label>Email</label>
              <input value={profile.email || ''} disabled style={{ opacity: 0.6 }} />
            </div>
            <div style={{ marginTop: 8 }}>
              <button className="btn btn-primary" style={{ width: 'auto' }} onClick={saveProfile} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'language' && (
        <div className="card">
          <div className="card-header"><h3>Language & Localization</h3></div>
          <div className="card-body">
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
              PulseForge supports 8 languages. Select your preferred language below.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
              {[
                { code: 'en', name: 'English' }, { code: 'es', name: 'Español' },
                { code: 'fr', name: 'Français' }, { code: 'pt', name: 'Português' },
                { code: 'ar', name: 'العربية' }, { code: 'hi', name: 'हिन्दी' },
                { code: 'he', name: 'עברית' }, { code: 'zh', name: '中文' },
              ].map(l => (
                <div key={l.code}
                  onClick={() => setSelectedLang(l.code)}
                  style={{
                    padding: '12px 16px', borderRadius: 8, cursor: 'pointer',
                    border: `2px solid ${selectedLang === l.code ? 'var(--accent)' : 'var(--border-color)'}`,
                    background: selectedLang === l.code ? 'var(--accent-light)' : 'var(--bg-card)',
                    transition: 'all 0.2s',
                  }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{l.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{l.code.toUpperCase()}</div>
                </div>
              ))}
            </div>
            <button className="btn btn-primary" style={{ width: 'auto' }} onClick={saveLanguage}>Save Language</button>
          </div>
        </div>
      )}
    </div>
  );
}