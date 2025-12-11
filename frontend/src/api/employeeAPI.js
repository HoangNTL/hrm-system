import apiClient from './axios';

export const employeeAPI = {
    // Get all employees with pagination and filters
    async getEmployees(params = {}) {
        const response = await apiClient.get('/employees', { params });
        return response.data;
    },

    // Get single employee by ID
    async getEmployeeById(id) {
        const response = await apiClient.get(`/employees/${id}`);
        return response.data;
    },

    // Create new employee
    async createEmployee(employeeData) {
        const response = await apiClient.post('/employees', employeeData);
        return response.data;
    },

    // Update employee
    async updateEmployee(id, employeeData) {
        const response = await apiClient.put(`/employees/${id}`, employeeData);
        return response.data;
    },

    // Delete employee
    async deleteEmployee(id) {
        const response = await apiClient.delete(`/employees/${id}`);
        return response.data;
    },

    // Bulk operations
    async bulkDelete(ids) {
        const response = await apiClient.post('/employees/bulk-delete', { ids });
        return response.data;
    },

    // Export employees
    async exportEmployees(params = {}) {
        const response = await apiClient.get('/employees/export', {
            params,
            responseType: 'blob',
        });
        return response.data;
    },

    // Import employees
    async importEmployees(file) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await apiClient.post('/employees/import', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
};
