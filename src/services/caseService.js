import apiService from './apiService';

class CaseService {
    /**
     * Upload a file for a case 
     * @param {File} file 
     */
    async uploadAttachment(file) {
        const formData = new FormData();
        formData.append('file', file);
        return await apiService.post('/cases/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }

    /**
     * Create a new case
     * @param {Object} caseData 
     */
    async createCase(caseData) {
        return await apiService.post('/cases', caseData);
    }

    /**
     * Get all cases (feed)
     * @param {Object} filters - e.g., { tag: 'Seizure', sort: 'popular' }
     */
    async getCases(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        return await apiService.get(`/cases?${queryParams}`);
    }

    /**
     * Get a single case by ID
     * @param {string} id 
     */
    async getCaseById(id) {
        return await apiService.get(`/cases/${id}`);
    }

    /**
     * Add a comment to a case
     * @param {string} caseId 
     * @param {string} content 
     */
    async addComment(caseId, content) {
        return await apiService.post(`/cases/${caseId}/comment`, { content });
    }
}

export default new CaseService();
