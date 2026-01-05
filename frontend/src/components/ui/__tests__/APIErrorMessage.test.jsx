import { render, screen } from '@testing-library/react';
import APIErrorMessage from '../APIErrorMessage.jsx';

describe('APIErrorMessage component', () => {
  it('returns null when no message', () => {
    const { container } = render(<APIErrorMessage />);
    expect(container.firstChild).toBeNull();
  });

  it('renders error message when provided', () => {
    render(<APIErrorMessage message="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});
