import apiService from './apiService';

/**
 * Chat Service for loading message history
 */
class ChatService {
    /**
     * Get private messages between current user and another user
     * @param {string} userId - Current user's ID
     * @param {string} otherUserId - Other user's ID
     * @param {number} limit - Max messages to fetch (default 50)
     */
    async getPrivateMessages(userId, otherUserId, limit = 50) {
        try {
            const response = await apiService.get(
                `/chat/messages?type=private&userId=${userId}&otherUserId=${otherUserId}&limit=${limit}`
            );
            console.log(`📥 Loaded ${response.length} private messages`);
            return response;
        } catch (error) {
            console.error('Failed to load private messages:', error);
            return [];
        }
    }

    /**
     * Get public chat messages
     * @param {number} limit - Max messages to fetch (default 50)
     */
    async getPublicMessages(limit = 50) {
        try {
            const response = await apiService.get(`/chat/messages?type=public&limit=${limit}`);
            console.log(`📥 Loaded ${response.length} public messages`);
            return response;
        } catch (error) {
            console.error('Failed to load public messages:', error);
            return [];
        }
    }

    /**
     * Get AI chat messages for a user
     * @param {string} userId - User's ID
     * @param {number} limit - Max messages to fetch (default 50)
     */
    async getAiMessages(userId, limit = 50) {
        try {
            const response = await apiService.get(`/chat/messages?type=ai&userId=${userId}&limit=${limit}`);
            console.log(`📥 Loaded ${response.length} AI messages`);
            return response;
        } catch (error) {
            console.error('Failed to load AI messages:', error);
            return [];
        }
    }
}

export default new ChatService();
