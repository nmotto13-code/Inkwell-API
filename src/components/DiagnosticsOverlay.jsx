import { useEffect, useRef, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { App as CapApp } from '@capacitor/app';

const enabled = import.meta.env.VITE_SHOW_MOBILE_DIAGNOSTICS === 'true';

function ts() {
  return new Date().toISOString().slice(11, 23);
}

function Row({ label, value, ok }) {
  const color =
    ok === true ? '#4ade80' :
    ok === false ? '#f87171' :
    '#facc15';
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, borderBottom: '1px solid #334155', paddingBottom: 4, marginBottom: 4 }}>
      <span style={{ color: '#94a3b8', fontSize: 11 }}>{label}</span>
      <span style={{ color, fontSize: 11, fontWeight: 600, textAlign: 'right', maxWidth: '55%', wordBreak: 'break-all' }}>{value}</span>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ color: '#64748b', fontSize: 10, fontWeight: 700, letterSpacing: 1, marginBottom: 6, textTransform: 'uppercase' }}>{title}</div>
      {children}
    </div>
  );
}

export function DiagnosticsOverlay({ callbackLog }) {
  const { isLoading, isAuthenticated, error } = useAuth0();
  const [visible, setVisible] = useState(true);
  const [stages, setStages] = useState([{ t: ts(), msg: 'Component mounted' }]);
  const prevLoading = useRef(null);
  const prevAuth = useRef(null);

  useEffect(() => {
    if (prevLoading.current !== isLoading) {
      prevLoading.current = isLoading;
      setStages(s => [...s, { t: ts(), msg: `isLoading → ${isLoading}` }]);
    }
  }, [isLoading]);

  useEffect(() => {
    if (prevAuth.current !== isAuthenticated) {
      prevAuth.current = isAuthenticated;
      setStages(s => [...s, { t: ts(), msg: `isAuthenticated → ${isAuthenticated}` }]);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (error) {
      setStages(s => [...s, { t: ts(), msg: `Auth0 error: ${error.message}`, err: true }]);
    }
  }, [error]);

  useEffect(() => {
    if (callbackLog?.length) {
      setStages(s => [...s, { t: ts(), msg: callbackLog[callbackLog.length - 1] }]);
    }
  }, [callbackLog]);

  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const scheme = import.meta.env.VITE_AUTH0_CALLBACK_SCHEME;
  const apiUrl = import.meta.env.VITE_API_URL;
  const isNative = !!window.Capacitor?.isNativePlatform?.();
  const capacitorVer = window.Capacitor?.version ?? 'n/a';

  if (!visible) {
    return (
      <button
        onClick={() => setVisible(true)}
        style={{ position: 'fixed', bottom: 40, right: 12, zIndex: 9999, background: '#0f172a', color: '#94a3b8', border: '1px solid #334155', borderRadius: 8, padding: '4px 10px', fontSize: 11 }}
      >
        diag
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(2,6,23,0.96)',
      overflowY: 'auto',
      padding: '48px 16px 40px',
      fontFamily: 'monospace',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: 14 }}>InkWell Diagnostics</span>
        <button
          onClick={() => setVisible(false)}
          style={{ background: '#1e293b', color: '#94a3b8', border: '1px solid #334155', borderRadius: 6, padding: '2px 10px', fontSize: 12 }}
        >
          hide
        </button>
      </div>

      <Section title="Environment">
        <Row label="AUTH0_DOMAIN" value={domain ?? '❌ missing'} ok={!!domain} />
        <Row label="AUTH0_CLIENT_ID" value={clientId ? clientId.slice(0, 8) + '…' : '❌ missing'} ok={!!clientId} />
        <Row label="CALLBACK_SCHEME" value={scheme ?? '❌ missing'} ok={!!scheme} />
        <Row label="API_URL" value={apiUrl ?? '❌ missing'} ok={!!apiUrl} />
      </Section>

      <Section title="Capacitor">
        <Row label="isNative" value={String(isNative)} ok={isNative} />
        <Row label="version" value={String(capacitorVer)} ok={null} />
        <Row label="window.Capacitor" value={window.Capacitor ? 'present' : '❌ missing'} ok={!!window.Capacitor} />
      </Section>

      <Section title="Auth0 State">
        <Row label="isLoading" value={String(isLoading)} ok={!isLoading} />
        <Row label="isAuthenticated" value={String(isAuthenticated)} ok={isAuthenticated} />
        <Row label="error" value={error ? error.message : 'none'} ok={!error} />
      </Section>

      <Section title="Startup Log">
        {stages.map((s, i) => (
          <div key={i} style={{ fontSize: 10, color: s.err ? '#f87171' : '#94a3b8', marginBottom: 3 }}>
            <span style={{ color: '#475569' }}>{s.t} </span>{s.msg}
          </div>
        ))}
      </Section>
    </div>
  );
}

export function useDiagnosticCallbackLog() {
  const [callbackLog, setCallbackLog] = useState([]);
  const addLog = (msg) => setCallbackLog(l => [...l, msg]);
  return { callbackLog, addLog };
}

export { enabled as diagnosticsEnabled };
