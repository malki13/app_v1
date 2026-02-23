import httpClient from '../client/httpClient';
import { API_ENDPOINTS } from '../../config/api.config';
import authService from './authService';
import type { OdooJsonRpcRequest, OdooJsonRpcResponse, GetAllGuidesParams, GuidesResponse } from '../../types/api.types';
import type { WorkGuide } from '../../types/models.types';

class GuidesService {
  async getAllGuides(): Promise<GuidesResponse> {
    try {
      const userId = await authService.getCurrentUserId();
      if (!userId) throw new Error('No hay sesión activa');
      const requestBody: OdooJsonRpcRequest<GetAllGuidesParams> = {
        jsonrpc: '2.0', method: 'call',
        params: { model: 'ek.contract.work.guide.service', method: 'get_all_guides', args: [], kwargs: {} },
        id: userId,
      };
      const response = await httpClient.post<OdooJsonRpcResponse<WorkGuide[]>>(API_ENDPOINTS.GUIDES.GET_ALL, requestBody);
      if (response.result) return { success: true, guides: response.result };
      return { success: false, error: 'No se pudieron obtener las guías' };
    } catch (error: any) {
      console.error('Error obteniendo guías:', error);
      return { success: false, error: error.message || 'Error al obtener las guías' };
    }
  }

  searchGuides(guides: WorkGuide[], searchQuery: string): WorkGuide[] {
    if (!searchQuery.trim()) return guides;
    const query = searchQuery.toLowerCase();
    return guides.filter(
      guide => guide.name?.toLowerCase().includes(query) || guide.team_id?.[1]?.toLowerCase().includes(query)
    );
  }

  filterByState(guides: WorkGuide[], state: WorkGuide['state']): WorkGuide[] {
    return guides.filter(guide => guide.state === state);
  }

  sortByDate(guides: WorkGuide[], ascending = false): WorkGuide[] {
    return [...guides].sort((a, b) => {
      const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
      return ascending ? diff : -diff;
    });
  }

  getStatistics(guides: WorkGuide[]) {
    const byState = guides.reduce((acc, g) => { acc[g.state] = (acc[g.state] || 0) + 1; return acc; }, {} as Record<string, number>);
    return { total: guides.length, open: byState.open || 0, closed: byState.closed || 0, draft: byState.draft || 0, done: byState.done || 0 };
  }
}

export default new GuidesService();
