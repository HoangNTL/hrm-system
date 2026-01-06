import apiClient from './axios';

export const employeeAPI = {

  getEmployees: async (params = {}) => {
    const response = await apiClient.get('/employees', { params });
    return response.data;
  },

  getEmployeesForSelect: async () => {
    const response = await apiClient.get('/employees/select/list');
    return response.data;
  },

  getEmployeesForSelectWithoutUser: async () => {
    const response = await apiClient.get('/employees/select/without-user');
    return response.data;
  },

  getEmployeeById: async (id) => {
    const response = await apiClient.get(`/employees/${id}`);
    return response.data;
  },

  createEmployee: async (employeeData) => {
    const response = await apiClient.post('/employees', employeeData);
    return response.data;
  },

  updateEmployee: async (id, employeeData) => {
    const response = await apiClient.put(`/employees/${id}`, employeeData);
    return response.data;
  },

  deleteEmployee: async (id) => {
    const response = await apiClient.delete(`/employees/${id}`);
    return response.data;
  },
};
