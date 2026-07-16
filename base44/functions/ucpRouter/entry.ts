import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// ============================================
// UCP ROUTER SERVICE - Backend Function
// ============================================

// Default Router Packet Configuration
const DEFAULT_ROUTER_PACKET = {
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

// ============================================
// ROUTER SELECTION LOGIC
// ============================================

function chooseModelForPrompt(packet, prompt) {
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

// ============================================
// MODEL ADAPTERS (Simulated)
// ============================================

async function fastModelAdapter(prompt) {
  const latencyMs = 150 + Math.floor(Math.random() * 150);
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, latencyMs));
  
  const responses = [
    `FAST MODEL: Quick answer for "${prompt.slice(0, 30)}${prompt.length > 30 ? '...' : ''}". The key point is to focus on the essentials.`,
    `FAST MODEL: Brief response - This is a straightforward query. Main consideration: efficiency and practical application.`,
    `FAST MODEL: In short - Your question touches on an interesting topic. The direct answer depends on context.`
  ];
  
  const answer = responses[Math.floor(Math.random() * responses.length)];
  const confidence = 0.6 + Math.random() * 0.2;

  return {
    ucp_version: "1.0",
    command_type: "qa",
    outputs: {
      answer,
      confidence: Math.round(confidence * 100) / 100
    },
    meta: {
      model_id: "fast_model",
      latency_ms: latencyMs
    }
  };
}

async function smartModelAdapter(prompt) {
  const latencyMs = 400 + Math.floor(Math.random() * 400);
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, latencyMs));
  
  const responses = [
    `SMART MODEL: Comprehensive analysis of "${prompt.slice(0, 40)}${prompt.length > 40 ? '...' : ''}"

**Key Components:**
1. **Context**: Understanding the broader implications is essential.
2. **Analysis**: Multiple perspectives worth considering here.
3. **Conclusion**: The optimal approach depends on your specific goals.

I recommend considering both short-term efficiency and long-term sustainability.`,
    
    `SMART MODEL: Detailed response to your query.

**Background**: Your question connects to several important concepts.

**Key Insights**:
- First, consider the foundational principles at play.
- Second, practical implementation requires careful planning.
- Third, measuring outcomes will be crucial for success.

**Recommendation**: A balanced approach considering multiple stakeholders yields the best results.`,
    
    `SMART MODEL: In-depth analysis provided.

**Overview**: This topic involves multiple interconnected factors.

**Detailed Analysis**:
The primary consideration is understanding core requirements. From there, we can map potential solutions and evaluate trade-offs.

**Strategic Guidance**: Start with clear success criteria, then iteratively refine based on feedback.`
  ];
  
  const answer = responses[Math.floor(Math.random() * responses.length)];
  const confidence = 0.8 + Math.random() * 0.15;

  return {
    ucp_version: "1.0",
    command_type: "qa",
    outputs: {
      answer,
      confidence: Math.round(confidence * 100) / 100
    },
    meta: {
      model_id: "smart_model",
      latency_ms: latencyMs
    }
  };
}

async function callModelAdapter(modelId, prompt) {
  if (modelId === "fast_model") return fastModelAdapter(prompt);
  if (modelId === "smart_model") return smartModelAdapter(prompt);
  throw new Error(`Unknown modelId: ${modelId}`);
}

// ============================================
// MAIN HANDLER
// ============================================

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  // Parse the request body
  let body = {};
  try {
    body = await req.json();
  } catch (e) {
    // No body or invalid JSON
  }
  
  const { action, prompt, packet: newPacket } = body;
  
  // Handle different actions
  switch (action) {
    // GET router packet
    case 'getPacket': {
      try {
        const packets = await base44.entities.RouterPacket.list('-created_date', 1);
        const currentPacket = packets?.[0] || DEFAULT_ROUTER_PACKET;
        return Response.json({ 
          success: true, 
          packet: currentPacket 
        });
      } catch (error) {
        return Response.json({ 
          success: true, 
          packet: DEFAULT_ROUTER_PACKET 
        });
      }
    }
    
    // PUT/UPDATE router packet
    case 'updatePacket': {
      if (!newPacket) {
        return Response.json({ 
          success: false, 
          error: 'No packet provided' 
        }, { status: 400 });
      }
      
      try {
        // Validate basic structure
        if (!newPacket.ucp_version || !newPacket.models || !newPacket.selection_policy) {
          return Response.json({ 
            success: false, 
            error: 'Invalid packet structure: missing required fields' 
          }, { status: 400 });
        }
        
        // Check for existing packet
        const existing = await base44.entities.RouterPacket.list('-created_date', 1);
        
        const { id, created_date, updated_date, created_by, ...packetData } = newPacket;
        
        let savedPacket;
        if (existing?.[0]?.id) {
          savedPacket = await base44.entities.RouterPacket.update(existing[0].id, packetData);
        } else {
          savedPacket = await base44.entities.RouterPacket.create(packetData);
        }
        
        return Response.json({ 
          success: true, 
          packet: savedPacket 
        });
      } catch (error) {
        return Response.json({ 
          success: false, 
          error: error.message 
        }, { status: 500 });
      }
    }
    
    // POST ask - main routing logic
    case 'ask': {
      if (!prompt || typeof prompt !== 'string') {
        return Response.json({ 
          success: false, 
          error: 'Prompt is required and must be a string' 
        }, { status: 400 });
      }
      
      try {
        const startTime = Date.now();
        
        // Load current router packet
        let currentPacket;
        try {
          const packets = await base44.entities.RouterPacket.list('-created_date', 1);
          currentPacket = packets?.[0] || DEFAULT_ROUTER_PACKET;
        } catch (e) {
          currentPacket = DEFAULT_ROUTER_PACKET;
        }
        
        // Choose model based on UCP packet
        const chosenModel = chooseModelForPrompt(currentPacket, prompt);
        
        // Build UCP QA Request (for logging/debugging)
        const ucpRequest = {
          ucp_version: "1.0",
          command_type: "qa",
          task: "general_qa",
          inputs: { prompt }
        };
        
        // Call the appropriate adapter
        const qaResponse = await callModelAdapter(chosenModel, prompt);
        
        const totalLatency = Date.now() - startTime;
        
        // Build response
        const response = {
          prompt,
          final_answer: qaResponse.outputs.answer,
          chosen_model: qaResponse.meta.model_id,
          confidence: qaResponse.outputs.confidence,
          latency_ms: totalLatency,
          router_packet_snapshot: currentPacket,
          ucp_request: ucpRequest,
          ucp_response: qaResponse
        };
        
        // Save to query log
        try {
          await base44.entities.QueryLog.create({
            prompt,
            answer: qaResponse.outputs.answer,
            chosen_model: qaResponse.meta.model_id,
            confidence: qaResponse.outputs.confidence,
            latency_ms: totalLatency
          });
        } catch (e) {
          // Log error but don't fail the request
          console.error('Failed to save query log:', e);
        }
        
        return Response.json({ 
          success: true, 
          ...response 
        });
      } catch (error) {
        return Response.json({ 
          success: false, 
          error: error.message 
        }, { status: 500 });
      }
    }
    
    // Health check / info
    case 'info':
    default: {
      return Response.json({
        success: true,
        service: 'UCP AI Router',
        version: '1.0',
        endpoints: {
          getPacket: 'Get current router packet',
          updatePacket: 'Update router packet',
          ask: 'Route a prompt to the appropriate model',
          info: 'Get service info'
        },
        models: ['fast_model', 'smart_model']
      });
    }
  }
});