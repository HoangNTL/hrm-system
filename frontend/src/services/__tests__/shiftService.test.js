import { shiftService } from '../shiftService';
import { shiftAPI } from '@api/shiftAPI';

vi.mock('@api/shiftAPI', () => ({
    shiftAPI: {
        getShifts: vi.fn(),
        createShift: vi.fn(),
        updateShift: vi.fn(),
        deleteShift: vi.fn(),
    },
}));

describe('shiftService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getShifts', () => {
        it('fetches shifts with default params', async () => {
            const mockResponse = {
                data: {
                    items: [{ id: 1, name: 'Morning Shift' }],
                    pagination: { page: 1, limit: 10, total: 1, total_pages: 1 },
                },
            };
            shiftAPI.getShifts.mockResolvedValue(mockResponse);

            const result = await shiftService.getShifts();

            expect(shiftAPI.getShifts).toHaveBeenCalledWith({ page: 1, limit: 10, search: '' });
            expect(result.data).toEqual([{ id: 1, name: 'Morning Shift' }]);
            expect(result.pagination.total).toBe(1);
        });

        it('fetches shifts with search', async () => {
            const mockResponse = {
                data: {
                    items: [{ id: 2, name: 'Night Shift' }],
                    pagination: { page: 1, limit: 10, total: 1, total_pages: 1 },
                },
            };
            shiftAPI.getShifts.mockResolvedValue(mockResponse);

            const result = await shiftService.getShifts({ search: 'Night' });

            expect(shiftAPI.getShifts).toHaveBeenCalledWith({
                page: 1,
                limit: 10,
                search: 'Night',
            });
            expect(result.data).toEqual([{ id: 2, name: 'Night Shift' }]);
        });

        it('throws error from API on failure', async () => {
            const error = { message: 'Network error', status: 500 };
            shiftAPI.getShifts.mockRejectedValue(error);

            await expect(shiftService.getShifts()).rejects.toEqual(error);
        });

        it('handles empty response data', async () => {
            shiftAPI.getShifts.mockResolvedValue({ data: null });

            const result = await shiftService.getShifts();

            expect(result.data).toEqual([]);
            expect(result.pagination.total).toBe(0);
        });
    });

    describe('createShift', () => {
        it('creates a new shift', async () => {
            const shiftData = { name: 'Evening Shift', start_time: '18:00', end_time: '02:00' };
            const mockResponse = { data: { id: 1, ...shiftData } };
            shiftAPI.createShift.mockResolvedValue(mockResponse);

            const result = await shiftService.createShift(shiftData);

            expect(shiftAPI.createShift).toHaveBeenCalledWith(shiftData);
            expect(result).toEqual(mockResponse.data);
        });

        it('throws error from API on failure', async () => {
            const error = { message: 'Validation error', status: 422, errors: { name: ['Required'] } };
            shiftAPI.createShift.mockRejectedValue(error);

            await expect(shiftService.createShift({})).rejects.toEqual(error);
        });
    });

    describe('updateShift', () => {
        it('updates an existing shift', async () => {
            const shiftData = { name: 'Updated Morning Shift' };
            const mockResponse = { data: { id: 1, ...shiftData } };
            shiftAPI.updateShift.mockResolvedValue(mockResponse);

            const result = await shiftService.updateShift(1, shiftData);

            expect(shiftAPI.updateShift).toHaveBeenCalledWith(1, shiftData);
            expect(result).toEqual(mockResponse.data);
        });

        it('throws error from API on failure', async () => {
            const error = { message: 'Update failed', status: 500 };
            shiftAPI.updateShift.mockRejectedValue(error);

            await expect(shiftService.updateShift(1, {})).rejects.toEqual(error);
        });
    });

    describe('deleteShift', () => {
        it('deletes a shift', async () => {
            const mockResponse = { data: { success: true } };
            shiftAPI.deleteShift.mockResolvedValue(mockResponse);

            const result = await shiftService.deleteShift(1);

            expect(shiftAPI.deleteShift).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockResponse.data);
        });

        it('throws error from API on failure', async () => {
            const error = { message: 'Delete failed', status: 403 };
            shiftAPI.deleteShift.mockRejectedValue(error);

            await expect(shiftService.deleteShift(1)).rejects.toEqual(error);
        });
    });
});
