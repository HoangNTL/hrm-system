import { positionService } from '../positionService';
import { positionAPI } from '@api/positionAPI';

vi.mock('@api/positionAPI', () => ({
    positionAPI: {
        getPositions: vi.fn(),
        deletePosition: vi.fn(),
    },
}));

describe('positionService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getPositions', () => {
        it('fetches positions with default params', async () => {
            const mockResponse = {
                data: {
                    items: [{ id: 1, name: 'Developer' }],
                    pagination: { page: 1, limit: 100, total: 1, total_pages: 1 },
                },
            };
            positionAPI.getPositions.mockResolvedValue(mockResponse);

            const result = await positionService.getPositions();

            expect(positionAPI.getPositions).toHaveBeenCalledWith({ page: 1, limit: 100, search: '' });
            expect(result.data).toEqual([{ id: 1, name: 'Developer' }]);
            expect(result.pagination.total).toBe(1);
        });

        it('fetches positions with search', async () => {
            const mockResponse = {
                data: {
                    items: [{ id: 2, name: 'Manager' }],
                    pagination: { page: 1, limit: 100, total: 1, total_pages: 1 },
                },
            };
            positionAPI.getPositions.mockResolvedValue(mockResponse);

            const result = await positionService.getPositions({ search: 'Manager' });

            expect(positionAPI.getPositions).toHaveBeenCalledWith({
                page: 1,
                limit: 100,
                search: 'Manager',
            });
            expect(result.data).toEqual([{ id: 2, name: 'Manager' }]);
        });

        it('throws error from API on failure', async () => {
            const error = { message: 'Network error', status: 500 };
            positionAPI.getPositions.mockRejectedValue(error);

            await expect(positionService.getPositions()).rejects.toEqual(error);
        });

        it('handles empty response data', async () => {
            positionAPI.getPositions.mockResolvedValue({ data: null });

            const result = await positionService.getPositions();

            expect(result.data).toEqual([]);
            expect(result.pagination.total).toBe(0);
        });
    });

    describe('deletePosition', () => {
        it('deletes a position', async () => {
            const mockResponse = { data: { success: true } };
            positionAPI.deletePosition.mockResolvedValue(mockResponse);

            const result = await positionService.deletePosition(1);

            expect(positionAPI.deletePosition).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockResponse.data);
        });

        it('throws error from API on failure', async () => {
            const error = { message: 'Delete failed', status: 403 };
            positionAPI.deletePosition.mockRejectedValue(error);

            await expect(positionService.deletePosition(1)).rejects.toEqual(error);
        });
    });
});
