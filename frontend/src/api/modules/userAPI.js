import axios from '../config/axios';

export const userAPI = {
  createAccountForEmployee: async (employeeId) => {
    const response = await axios.post(`/users/create-for-employee/${employeeId}`);
    return response.data;
  },

  resetPassword: async (userId) => {
    const response = await axios.post(`/users/reset-password/${userId}`);
    return response.data;
  },
};
