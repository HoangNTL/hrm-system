import { renderHook } from '@testing-library/react';
import { useTheme } from '../useTheme';
import { ThemeContext } from '@context/ThemeContext.jsx';
import { ReactNode } from 'react';

describe('useTheme', () => {
    it('returns context value when used inside ThemeProvider', () => {
        const wrapper = ({ children }) => (
            <ThemeContext.Provider value={{ isDarkMode: true, toggleTheme: vi.fn() }}>
                {children}
            </ThemeContext.Provider>
        );

        const { result } = renderHook(() => useTheme(), { wrapper });

        expect(result.current.isDarkMode).toBe(true);
    });

    it('throws error when used outside ThemeProvider', () => {
        const { result } = renderHook(() => useTheme());
        expect(result.error).toEqual(
            new Error('useTheme must be used within a ThemeProvider'),
        );
    });
});
