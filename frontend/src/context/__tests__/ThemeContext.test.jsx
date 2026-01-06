import { render, screen, fireEvent } from '@testing-library/react';
import { useContext } from 'react';
import { ThemeContext, ThemeProvider } from '../ThemeContext';

// Test component to access context
function TestConsumer() {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  return (
    <div>
      <span data-testid="theme-status">{isDarkMode ? 'dark' : 'light'}</span>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  );
}

describe('ThemeContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset document class
    document.documentElement.classList.remove('dark');
  });

  describe('initial state', () => {
    it('defaults to light mode when no saved theme', () => {
      // Mock matchMedia to return false (light mode)
      window.matchMedia = vi.fn().mockImplementation(() => ({
        matches: false,
      }));

      render(
        <ThemeProvider>
          <TestConsumer />
        </ThemeProvider>,
      );

      expect(screen.getByTestId('theme-status')).toHaveTextContent('light');
    });

    it('uses saved dark theme from localStorage', () => {
      localStorage.setItem('theme', 'dark');

      render(
        <ThemeProvider>
          <TestConsumer />
        </ThemeProvider>,
      );

      expect(screen.getByTestId('theme-status')).toHaveTextContent('dark');
    });

    it('uses saved light theme from localStorage', () => {
      localStorage.setItem('theme', 'light');

      render(
        <ThemeProvider>
          <TestConsumer />
        </ThemeProvider>,
      );

      expect(screen.getByTestId('theme-status')).toHaveTextContent('light');
    });

    it('uses system preference when no saved theme', () => {
      // Mock matchMedia to return true (dark mode preference)
      window.matchMedia = vi.fn().mockImplementation(() => ({
        matches: true,
      }));

      render(
        <ThemeProvider>
          <TestConsumer />
        </ThemeProvider>,
      );

      expect(screen.getByTestId('theme-status')).toHaveTextContent('dark');
    });

    it('defaults to light mode when localStorage throws error', () => {
      // Mock matchMedia to return false (light mode)
      window.matchMedia = vi.fn().mockImplementation(() => ({
        matches: false,
      }));

      // Mock localStorage.getItem to throw error
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = vi.fn().mockImplementation(() => {
        throw new Error('Storage error');
      });

      render(
        <ThemeProvider>
          <TestConsumer />
        </ThemeProvider>,
      );

      expect(screen.getByTestId('theme-status')).toHaveTextContent('light');

      // Restore
      localStorage.getItem = originalGetItem;
    });
  });

  describe('toggleTheme', () => {
    it('toggles from light to dark mode', () => {
      localStorage.setItem('theme', 'light');

      render(
        <ThemeProvider>
          <TestConsumer />
        </ThemeProvider>,
      );

      expect(screen.getByTestId('theme-status')).toHaveTextContent('light');

      fireEvent.click(screen.getByRole('button', { name: /toggle/i }));

      expect(screen.getByTestId('theme-status')).toHaveTextContent('dark');
    });

    it('toggles from dark to light mode', () => {
      localStorage.setItem('theme', 'dark');

      render(
        <ThemeProvider>
          <TestConsumer />
        </ThemeProvider>,
      );

      expect(screen.getByTestId('theme-status')).toHaveTextContent('dark');

      fireEvent.click(screen.getByRole('button', { name: /toggle/i }));

      expect(screen.getByTestId('theme-status')).toHaveTextContent('light');
    });

    it('toggles multiple times correctly', () => {
      localStorage.setItem('theme', 'light');

      render(
        <ThemeProvider>
          <TestConsumer />
        </ThemeProvider>,
      );

      const button = screen.getByRole('button', { name: /toggle/i });

      fireEvent.click(button); // light -> dark
      expect(screen.getByTestId('theme-status')).toHaveTextContent('dark');

      fireEvent.click(button); // dark -> light
      expect(screen.getByTestId('theme-status')).toHaveTextContent('light');

      fireEvent.click(button); // light -> dark
      expect(screen.getByTestId('theme-status')).toHaveTextContent('dark');
    });
  });

  describe('localStorage persistence', () => {
    it('saves dark theme to localStorage', () => {
      localStorage.setItem('theme', 'light');

      render(
        <ThemeProvider>
          <TestConsumer />
        </ThemeProvider>,
      );

      fireEvent.click(screen.getByRole('button', { name: /toggle/i }));

      expect(localStorage.getItem('theme')).toBe('dark');
    });

    it('saves light theme to localStorage', () => {
      localStorage.setItem('theme', 'dark');

      render(
        <ThemeProvider>
          <TestConsumer />
        </ThemeProvider>,
      );

      fireEvent.click(screen.getByRole('button', { name: /toggle/i }));

      expect(localStorage.getItem('theme')).toBe('light');
    });
  });

  describe('document class manipulation', () => {
    it('adds dark class to document when dark mode', () => {
      localStorage.setItem('theme', 'dark');

      render(
        <ThemeProvider>
          <TestConsumer />
        </ThemeProvider>,
      );

      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('removes dark class from document when light mode', () => {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'light');

      render(
        <ThemeProvider>
          <TestConsumer />
        </ThemeProvider>,
      );

      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('adds dark class when toggling to dark mode', () => {
      localStorage.setItem('theme', 'light');

      render(
        <ThemeProvider>
          <TestConsumer />
        </ThemeProvider>,
      );

      expect(document.documentElement.classList.contains('dark')).toBe(false);

      fireEvent.click(screen.getByRole('button', { name: /toggle/i }));

      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('removes dark class when toggling to light mode', () => {
      localStorage.setItem('theme', 'dark');

      render(
        <ThemeProvider>
          <TestConsumer />
        </ThemeProvider>,
      );

      expect(document.documentElement.classList.contains('dark')).toBe(true);

      fireEvent.click(screen.getByRole('button', { name: /toggle/i }));

      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  describe('context value', () => {
    it('provides isDarkMode and toggleTheme to consumers', () => {
      render(
        <ThemeProvider>
          <TestConsumer />
        </ThemeProvider>,
      );

      expect(screen.getByTestId('theme-status')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /toggle/i })).toBeInTheDocument();
    });

    it('renders children correctly', () => {
      render(
        <ThemeProvider>
          <div data-testid="child">Child content</div>
        </ThemeProvider>,
      );

      expect(screen.getByTestId('child')).toHaveTextContent('Child content');
    });
  });
});
