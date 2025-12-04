// UCP Router Service - Client SDK for calling backend
import { base44 } from '@/api/base44Client';

/**
 * UCP Router Service Client
 * Provides a clean API for other parts of the application to use the UCP router
 */
export const UcpRouterService = {
  /**
   * Get the current router packet configuration
   * @returns {Promise<{success: boolean, packet: object}>}
   */
  async getRouterPacket() {
    const response = await base44.functions.invoke('ucpRouter', { action: 'getPacket' });
    return response.data;
  },

  /**
   * Update the router packet configuration
   * @param {object} packet - The new router packet
   * @returns {Promise<{success: boolean, packet?: object, error?: string}>}
   */
  async updateRouterPacket(packet) {
    const response = await base44.functions.invoke('ucpRouter', { 
      action: 'updatePacket', 
      packet 
    });
    return response.data;
  },

  /**
   * Ask a question through the UCP router
   * @param {string} prompt - The user's question
   * @returns {Promise<AskResponse>}
   */
  async ask(prompt) {
    const response = await base44.functions.invoke('ucpRouter', { 
      action: 'ask', 
      prompt 
    });
    return response.data;
  },

  /**
   * Get service info and health check
   * @returns {Promise<object>}
   */
  async getInfo() {
    const response = await base44.functions.invoke('ucpRouter', { action: 'info' });
    return response.data;
  }
};

// Re-export types and constants for convenience
export { DEFAULT_ROUTER_PACKET, chooseModelForPrompt } from './UcpRouter';

// Export type definitions (JSDoc style for JavaScript)
/**
 * @typedef {Object} UcpModelDescriptor
 * @property {string} id - Model identifier (e.g., "fast_model")
 * @property {string} description - Human-readable description
 * @property {number} maxTokens - Maximum token limit
 * @property {number} costScore - Cost score (lower = cheaper)
 * @property {number} qualityScore - Quality score (higher = better)
 */

/**
 * @typedef {Object} UcpSelectionRule
 * @property {Object} condition - Condition to match
 * @property {number} [condition.prompt_length_lt] - Prompt length less than
 * @property {number} [condition.prompt_length_gte] - Prompt length greater than or equal
 * @property {string[]} [condition.contains_keywords] - Keywords to match
 * @property {string} choose_model - Model ID to select if condition matches
 */

/**
 * @typedef {Object} UcpRouterPacket
 * @property {string} ucp_version - UCP protocol version
 * @property {string} command_type - Command type (e.g., "ai_router")
 * @property {Object} schema - Input/output schema
 * @property {string[]} schema.inputs - Input field names
 * @property {string[]} schema.outputs - Output field names
 * @property {UcpModelDescriptor[]} models - Available models
 * @property {Object} selection_policy - Selection rules and fallback
 * @property {UcpSelectionRule[]} selection_policy.rules - Ordered selection rules
 * @property {string} selection_policy.fallback_model - Default model if no rules match
 * @property {string} signature - Packet signature
 */

/**
 * @typedef {Object} UcpQaRequest
 * @property {string} ucp_version - UCP version
 * @property {"qa"} command_type - Command type
 * @property {"general_qa"} task - Task type
 * @property {Object} inputs - Input data
 * @property {string} inputs.prompt - User prompt
 */

/**
 * @typedef {Object} UcpQaResponse
 * @property {string} ucp_version - UCP version
 * @property {"qa"} command_type - Command type
 * @property {Object} outputs - Output data
 * @property {string} outputs.answer - Model answer
 * @property {number} outputs.confidence - Confidence score (0-1)
 * @property {Object} meta - Metadata
 * @property {string} meta.model_id - Model that responded
 * @property {number} meta.latency_ms - Response time in ms
 */

/**
 * @typedef {Object} AskResponse
 * @property {string} prompt - Original prompt
 * @property {string} final_answer - Model's answer
 * @property {string} chosen_model - ID of selected model
 * @property {number} confidence - Confidence score (0-1)
 * @property {number} latency_ms - Total latency in ms
 * @property {UcpRouterPacket} router_packet_snapshot - Packet used for routing
 */

export default UcpRouterService;