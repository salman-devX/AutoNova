import { useTheme } from '../context/ThemeContext';

const PALETTES = {
  dark: {
    axisColor: '#64748b',
    gridColor: 'rgba(255,255,255,0.06)',
    cursorFill: 'rgba(255,255,255,0.03)',
    tooltipStyle: {
      background: 'rgba(10,14,20,0.95)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 12,
      fontSize: 12,
      color: '#e2e8f0',
    },
  },
  light: {
    axisColor: '#64748b',
    gridColor: 'rgba(15,23,42,0.08)',
    cursorFill: 'rgba(15,23,42,0.04)',
    tooltipStyle: {
      background: '#ffffff',
      border: '1px solid rgba(15,23,42,0.10)',
      borderRadius: 12,
      fontSize: 12,
      color: '#0f172a',
      boxShadow: '0 8px 24px rgba(15,23,42,0.10)',
    },
  },
};

/** Returns Recharts-ready colors that automatically match the active theme. */
export function useChartTheme() {
  const { theme } = useTheme();
  return PALETTES[theme] || PALETTES.dark;
}
