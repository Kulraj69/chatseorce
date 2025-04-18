import axios from 'axios';
import config from './config';

const api = {
  /**
   * Sends a query to the RAG API
   * @param {string} question - The user's question
   * @returns {Promise<string>} - The answer from the RAG system
   */
  async queryRag(question) {
    try {
      const response = await axios.post(
        `${config.api.baseUrl}${config.api.endpoints.query}`, 
        { question },
        { timeout: config.api.timeout }
      );
      return response.data.answer;
    } catch (error) {
      console.error('Error querying RAG:', error);
      throw new Error(config.widget.errorMessage || 'Failed to get an answer. Please try again later.');
    }
  },

  /**
   * Check if the API is healthy
   * @returns {Promise<boolean>} - True if the API is healthy
   */
  async checkHealth() {
    try {
      const response = await axios.get(
        `${config.api.baseUrl}${config.api.endpoints.health}`,
        { timeout: config.api.timeout / 2 }
      );
      return response.data.status === 'ok';
    } catch (error) {
      console.error('Error checking API health:', error);
      return false;
    }
  }
};

export default api; 