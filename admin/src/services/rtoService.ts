import http from './http';
import type { IRtoScore, IRtoStats } from '../types/rto.types';

class RtoService {
  async calculateScore(orderId: string): Promise<IRtoScore> {
    const response = await http.post<IRtoScore>('/rto/score', { orderId });
    return response.data;
  }

  async getStats(): Promise<IRtoStats> {
    const response = await http.get<IRtoStats>('/rto/dashboard/stats');
    return response.data;
  }
}

export default new RtoService();
