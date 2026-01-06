import { renderHook } from '@testing-library/react';
import { ThemeProvider } from '@context/ThemeContext.jsx';
import { useTheme } from '../useTheme';

describe('useTheme', () => {
  it('returns context value when used inside ThemeProvider', () => {
    const wrapper = ({ children }) => <ThemeProvider>{children}</ThemeProvider>;

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.isDarkMode).toBeDefined();
    expect(typeof result.current.toggleTheme).toBe('function');
  });

  it('throws error when used outside ThemeProvider', () => {
    // Suppress console.error for this test since React will log the error
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderHook(() => useTheme())).toThrow(
      'useTheme must be used within a ThemeProvider',
    );

    consoleSpy.mockRestore();
  });
});
