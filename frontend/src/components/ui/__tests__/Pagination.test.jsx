import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from '../Pagination.jsx';

describe('Pagination component', () => {
  it('shows page info text container', () => {
    render(<Pagination currentPage={2} totalPages={5} totalItems={50} onPageChange={() => {}} />);

    const infoElement = screen.getByText('Showing page', { exact: false });
    expect(infoElement).toBeInTheDocument();
  });

  it('disables Previous button on first page', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />);

    const prevButton = screen.getByRole('button', { name: /previous/i });
    expect(prevButton).toBeDisabled();
  });

  it('disables Next button on last page', () => {
    render(<Pagination currentPage={5} totalPages={5} onPageChange={() => {}} />);

    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).toBeDisabled();
  });

  it('calls onPageChange when a page number is clicked', () => {
    const handlePageChange = vi.fn();
    render(<Pagination currentPage={2} totalPages={5} onPageChange={handlePageChange} />);

    const page3Button = screen.getByRole('button', { name: '3' });
    fireEvent.click(page3Button);

    expect(handlePageChange).toHaveBeenCalledWith(3);
  });
});
