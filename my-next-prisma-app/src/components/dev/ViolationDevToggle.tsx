import React from 'react';
import { useViolationRulesStore } from './violationRulesStore';
import { useTheme } from '@/context/ThemeContext';

// ⚠️ Dev-only! Remove this file before production.
export default function ViolationDevToggle() {
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') return null;
  const rules = useViolationRulesStore();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <div style={{
      position: 'fixed', bottom: 32, right: 32, zIndex: 9999,
      background: isDark ? 'rgba(24,28,43,0.98)' : 'rgba(255,255,255,0.98)',
      border: `2px solid ${isDark ? '#00eaff' : '#f59e42'}`,
      borderRadius: 16, padding: 20, boxShadow: isDark ? '0 4px 24px #00eaff33' : '0 4px 24px #0003',
      minWidth: 260, maxWidth: 320,
      color: isDark ? '#e0f7fa' : undefined
    }}>
      <div style={{ fontWeight: 700, color: isDark ? '#00eaff' : '#d97706', fontSize: 18, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>🛠️ Dev Violation Tools</span>
      </div>
      <div style={{ fontSize: 13, color: isDark ? '#ffb4b4' : '#b91c1c', marginBottom: 10, fontWeight: 500 }}>
        <span style={{ background: isDark ? '#232946' : '#fef3c7', padding: '2px 8px', borderRadius: 6 }}>Dev-only! Remove before production.</span>
      </div>
      <div style={{ marginBottom: 12, fontWeight: 600, color: isDark ? '#7dd3fc' : '#6366f1', fontSize: 15 }}>Proctoring Rules</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {Object.keys(rules).filter(k => typeof rules[k] === 'boolean' && k !== 'allowMultipleAttempts').map((rule) => (
          <label key={rule} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
            <input
              type="checkbox"
              checked={rules[rule]}
              onChange={e => rules.setRule(rule, e.target.checked)}
              style={{ accentColor: isDark ? '#00eaff' : '#6366f1' }}
            />
            <span style={{ textTransform: 'capitalize' }}>{rule.replace(/([A-Z])/g, ' $1')}</span>
          </label>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
        <button onClick={rules.enableAll} style={{ fontSize: 13, background: isDark ? '#232946' : '#e0e7ff', color: isDark ? '#7dd3fc' : undefined, border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}>Enable All</button>
        <button onClick={rules.disableAll} style={{ fontSize: 13, background: isDark ? '#2d1a1a' : '#fee2e2', color: isDark ? '#ffb4b4' : undefined, border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}>Disable All</button>
      </div>
      <div style={{ margin: '18px 0 8px', fontWeight: 600, color: isDark ? '#7dd3fc' : '#6366f1', fontSize: 15 }}>Session Rules</div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, marginBottom: 2 }}>
        <input
          type="checkbox"
          checked={rules.allowMultipleAttempts}
          onChange={e => rules.setAllowMultipleAttempts(e.target.checked)}
          style={{ accentColor: isDark ? '#f59e42' : '#f59e42' }}
        />
        <span>Allow Multiple Attempts</span>
        <span title="If enabled, clears in-progress attempts for this quiz/user before starting. Useful for dev testing." style={{ cursor: 'help', color: isDark ? '#f59e42' : '#f59e42', fontSize: 16 }}>ℹ️</span>
      </label>
    </div>
  );
} 