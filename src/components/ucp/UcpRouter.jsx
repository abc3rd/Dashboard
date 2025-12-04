// UCP Router Logic - Pure function for model selection
export function chooseModelForPrompt(packet, prompt) {
  const length = prompt.length;
  const lowerPrompt = prompt.toLowerCase();

  for (const rule of packet.selection_policy.rules) {
    const c = rule.condition;
    let match = true;

    if (c.prompt_length_lt !== undefined && !(length < c.prompt_length_lt)) {
      match = false;
    }
    if (c.prompt_length_gte !== undefined && !(length >= c.prompt_length_gte)) {
      match = false;
    }
    if (c.contains_keywords && c.contains_keywords.length > 0) {
      const hasAny = c.contains_keywords.some(kw =>
        lowerPrompt.includes(kw.toLowerCase())
      );
      if (!hasAny) match = false;
    }

    if (match) return rule.choose_model;
  }

  return packet.selection_policy.fallback_model;
}

// Model Adapters - Simulated AI responses
export async function fastModelAdapter(prompt) {
  const latency = 150 + Math.random() * 150;
  await new Promise(resolve => setTimeout(resolve, latency));
  
  const confidence = 0.6 + Math.random() * 0.2;
  const answer = generateFastResponse(prompt);
  
  return {
    ucp_version: "1.0",
    command_type: "qa",
    outputs: {
      answer,
      confidence: Math.round(confidence * 100) / 100
    },
    meta: {
      model_id: "fast_model",
      latency_ms: Math.round(latency)
    }
  };
}

export async function smartModelAdapter(prompt) {
  const latency = 400 + Math.random() * 400;
  await new Promise(resolve => setTimeout(resolve, latency));
  
  const confidence = 0.8 + Math.random() * 0.15;
  const answer = generateSmartResponse(prompt);
  
  return {
    ucp_version: "1.0",
    command_type: "qa",
    outputs: {
      answer,
      confidence: Math.round(confidence * 100) / 100
    },
    meta: {
      model_id: "smart_model",
      latency_ms: Math.round(latency)
    }
  };
}

function generateFastResponse(prompt) {
  const responses = [
    `Quick answer: Based on "${prompt.slice(0, 30)}...", here's a concise response. The key point is to focus on the essentials and provide a direct answer.`,
    `In brief: Your question touches on an interesting topic. The short answer is that this depends on context and specific requirements.`,
    `Fast take: This is a straightforward query. The main consideration here is efficiency and practical application.`,
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

function generateSmartResponse(prompt) {
  const responses = [
    `Comprehensive analysis: Your question "${prompt.slice(0, 40)}..." requires a nuanced response. Let me break this down into several key components:\n\n1. **Context**: Understanding the broader implications is essential.\n2. **Analysis**: When we examine the underlying factors, we find multiple perspectives worth considering.\n3. **Conclusion**: The optimal approach depends on your specific goals and constraints.\n\nI recommend considering both short-term efficiency and long-term sustainability in your decision-making process.`,
    `Detailed response: This is a complex topic that deserves thorough exploration. Here's my comprehensive take:\n\n**Background**: The question you've raised connects to several important concepts.\n\n**Key Insights**:\n- First, we should consider the foundational principles at play.\n- Second, practical implementation requires careful planning.\n- Third, measuring outcomes will be crucial for success.\n\n**Recommendation**: A balanced approach that considers multiple stakeholders will yield the best results.`,
    `In-depth answer: Let me provide a thorough analysis of your query.\n\n**Overview**: This topic involves multiple interconnected factors that influence the outcome.\n\n**Detailed Analysis**:\nThe primary consideration is understanding the core requirements. From there, we can map out potential solutions and evaluate their trade-offs.\n\n**Strategic Guidance**: I suggest starting with a clear definition of success criteria, then iteratively refining your approach based on feedback and results.`,
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

// Default Router Packet
export const DEFAULT_ROUTER_PACKET = {
  ucp_version: "1.0",
  command_type: "ai_router",
  schema: {
    inputs: ["prompt"],
    outputs: ["final_answer", "chosen_model"]
  },
  models: [
    {
      id: "fast_model",
      description: "Lightweight model optimized for speed and simple queries",
      maxTokens: 512,
      costScore: 1,
      qualityScore: 7
    },
    {
      id: "smart_model",
      description: "Advanced model for complex reasoning and detailed responses",
      maxTokens: 4096,
      costScore: 5,
      qualityScore: 9
    }
  ],
  selection_policy: {
    rules: [
      {
        condition: {
          prompt_length_lt: 100
        },
        choose_model: "fast_model"
      },
      {
        condition: {
          prompt_length_gte: 100
        },
        choose_model: "smart_model"
      }
    ],
    fallback_model: "smart_model"
  },
  signature: "dev-signature"
};