import apiService from './apiService';

class CaseService {
    /**
     * Upload a file for a case 
     * @param {File} file 
     */
    async uploadAttachment(file) {
        const formData = new FormData();
        formData.append('file', file);
        return await apiService.post('/cases/upload', formData);
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
     * Update an existing case
     * @param {string} id 
     * @param {Object} caseData 
     */
    async updateCase(id, caseData) {
        return await apiService.put(`/cases/${id}`, caseData);
    }

    /**
     * Add a comment to a case
     * @param {string} caseId 
     * @param {string} content 
     * @param {string} replyTo - Optional comment ID being replied to
     */
    async addComment(caseId, content, replyTo = null) {
        return await apiService.post(`/cases/${caseId}/comment`, { content, replyTo });
    }

    /**
     * Request AI to reconcile conflicting opinions
     * @param {string} caseId 
     * @param {Array<string>} commentIds - IDs of comments to reconcile
     * @param {string} question - Optional custom question
     */
    async requestReconciliation(caseId, commentIds, question = null) {
        return await apiService.post(`/cases/${caseId}/reconcile`, { commentIds, question });
    }

    /**
     * Request AI to structure the discussion
     * @param {string} caseId 
     */
    async requestStructure(caseId) {
        return await apiService.post(`/cases/${caseId}/structure`, {});
    }

    /**
     * Delete a comment from a case
     * @param {string} caseId 
     * @param {string} commentId 
     */
    async deleteComment(caseId, commentId) {
        return await apiService.delete(`/cases/${caseId}/comment/${commentId}`);
    }

    /**
     * AI-powered case analysis with pre-filled prompts
     * @param {string} caseId 
     * @param {string} promptType - 'findings', 'differentials', 'artifacts', 'history'
     */
    async analyzeCaseWithAI(caseId, promptType) {
        return await apiService.post(`/cases/${caseId}/ai-analyze`, { promptType });
    }

    /**
     * Generate study notes from case
     * @param {string} caseId 
     */
    async generateStudyNotes(caseId) {
        return await apiService.post(`/cases/${caseId}/study-notes`, {});
    }
}

export default new CaseService();

