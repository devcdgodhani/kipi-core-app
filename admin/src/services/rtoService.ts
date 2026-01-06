import http from './http';

class RtoService {
  async calculateScore(data: { userId: string, pincode: string, orderAmount: number, paymentMethod: string }) {
    const response = await http.post('/rto/calculate', data);
    return response.data;
  }

  async getWithPagination(filters: any) {
    const response = await http.post('/rto/getWithPagination', filters);
    return response.data;
  }

  async getOne(id: string) {
    const response = await http.get(`/rto/getOne/${id}`);
    return response.data;
  }
  
  async deleteByFilter(filter: any) {
      const response = await http.delete('/rto/deleteByFilter', { data: filter });
      return response.data;
  }
}

export default new RtoService();
