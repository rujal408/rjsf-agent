import { useState } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { MuiEmployeeForm } from './forms/mui/EmployeeForm';
import { ModernMinimalEmployeeForm } from './forms/chakra/EmployeeForm';
import { DaisyUiEmployeeForm } from './forms/daisyui/EmployeeForm';
import { CoreCssEmployeeForm } from './forms/core-css/EmployeeForm';

const muiTheme = createTheme({
  shape: { borderRadius: 8 },
  typography: { fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' },
});

type Tab = 'mui' | 'modern' | 'daisyui' | 'core-css';

const TABS: { key: Tab; label: string; color: string; description: string }[] = [
  { key: 'mui', label: 'MUI', color: '#1976d2', description: 'Material UI v5 + @rjsf/mui' },
  { key: 'modern', label: 'Modern Minimal', color: '#805ad5', description: 'Purple accent, color-banded headers + @rjsf/core' },
  { key: 'daisyui', label: 'DaisyUI', color: '#661ae6', description: 'DaisyUI + Tailwind + @rjsf/core' },
  { key: 'core-css', label: 'Plain CSS', color: '#4f46e5', description: 'CSS Modules, Indigo accent + @rjsf/core' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('mui');
  const current = TABS.find((t) => t.key === activeTab)!;

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6' }}>
      {/* Header */}
      <header
        style={{
          background: '#fff',
          borderBottom: '1px solid #e5e7eb',
          padding: '16px 0',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.3, letterSpacing: 'normal' }}>
                RJSF Form Design Examples
              </h1>
              <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '2px 0 0 0' }}>
                Same Employee Onboarding form &mdash; 4 different design styles
              </p>
            </div>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                color: current.color,
                background: `${current.color}15`,
                padding: '4px 12px',
                borderRadius: 20,
              }}
            >
              {current.description}
            </span>
          </div>

          {/* Tab Bar */}
          <nav style={{ display: 'flex', gap: 4 }}>
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '8px 20px',
                  fontSize: '0.85rem',
                  fontWeight: activeTab === tab.key ? 600 : 500,
                  color: activeTab === tab.key ? tab.color : '#6b7280',
                  background: activeTab === tab.key ? `${tab.color}10` : 'transparent',
                  border: 'none',
                  borderBottom: `2px solid ${activeTab === tab.key ? tab.color : 'transparent'}`,
                  borderRadius: '8px 8px 0 0',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Form Content */}
      <main style={{ padding: '8px 0 40px' }}>
        {activeTab === 'mui' && (
          <ThemeProvider theme={muiTheme}>
            <CssBaseline />
            <MuiEmployeeForm />
          </ThemeProvider>
        )}

        {activeTab === 'modern' && (
          <ModernMinimalEmployeeForm />
        )}

        {activeTab === 'daisyui' && (
          <DaisyUiEmployeeForm />
        )}

        {activeTab === 'core-css' && (
          <CoreCssEmployeeForm />
        )}
      </main>
    </div>
  );
}
