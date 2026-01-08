import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api', 
});

export const getCustomers = () => api.get('/customers');
export const createCustomer = (data: any) => api.post('/customers', data);

export default api;