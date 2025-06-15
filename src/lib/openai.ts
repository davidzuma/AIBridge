import OpenAI from 'openai';

// Environment validation helper
export function validateEnvironment() {
  const required = {
    PPX_API_KEY: process.env.PPX_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    NODE_ENV: process.env.NODE_ENV
  };
  
  const missing = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([key]) => key);
  
  if (missing.length > 0) {
    console.error('Missing environment variables:', missing);
    return { valid: false, missing };
  }
  
  console.log('Environment validation passed');
  return { valid: true, missing: [] };
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Types for our enhanced workflow
interface ClassificationResult {
  domain: 'Fiscal' | 'Laboral' | 'Contable';
  structuredQuestion: string;
  confidence: number;
  originalQuestion: string;
}

interface StreamChunk {
  type: 'classification' | 'perplexity_start' | 'chunk' | 'complete' | 'error';
  content?: string;
  classification?: ClassificationResult;
  fullResponse?: string;
  sources?: string[];
}

export async function generateFiscalResponse(userMessage: string): Promise<string> {
  try {
    // Step 1: Classify and structure the question (same as streaming)
    const classification = await classifyAndStructureQuestion(userMessage);
    
    // Step 2: Use Perplexity to get the answer (non-streaming version)
    let fullResponse = '';
    
    try {
      // Get response from Perplexity (non-streaming)
      for await (const chunk of searchWithPerplexityStream(classification.structuredQuestion, classification.domain)) {
        fullResponse += chunk;
      }
      
      // Get sources - enhanced extraction from response content
      const urlRegex = /https?:\/\/[^\s\)\]\>,\"\'\`\n\r]+/g;
      const urlMatches = fullResponse.match(urlRegex) || [];
      
      // Clean URLs (no filtering needed since domain filtering is done by API)
      let realSources = [...new Set(urlMatches)]
        .filter((url): url is string => typeof url === 'string')
        .map(url => url.replace(/[,\.\)\]\>\"\'\`]+$/, ''))
        .filter(url => url && url.startsWith('http'));
      
      // Only make fallback call if no sources found AND the response has content
      if (realSources.length === 0 && fullResponse.length > 100) {
        try {
          realSources = await extractSourcesFromPerplexity(classification.structuredQuestion, classification.domain);
        } catch (sourcesError) {
          console.error('Error getting sources from API:', sourcesError);
          realSources = [];
        }
      }
      
      let finalSources = realSources;
      if (realSources.length === 0) {
        const fallbackSources = {
          'Fiscal': ['https://www.agenciatributaria.es', 'https://www.boe.es'],
          'Laboral': ['https://www.mitramiss.gob.es', 'https://www.seg-social.es'],
          'Contable': ['https://www.icac.gob.es', 'https://www.boe.es']
        };
        finalSources = fallbackSources[classification.domain as keyof typeof fallbackSources] || fallbackSources['Fiscal'];
      }
      
      return formatResponseWithReferences(fullResponse, finalSources);
      
    } catch (perplexityError) {
      console.error('Perplexity error in non-streaming:', perplexityError);
      
      return `Lo siento, ha ocurrido un error al procesar tu consulta sobre ${classification.domain}. 
      
Un profesional revisará tu pregunta: "${classification.structuredQuestion}" y te proporcionará una respuesta personalizada pronto.`;
    }
    
  } catch (error) {
    console.error('Error generating Perplexity response:', error);
    
    // Try to at least provide classification information
    try {
      const classification = await classifyAndStructureQuestion(userMessage);
      return `Gracias por tu consulta sobre **${classification.domain}**.

**Pregunta estructurada para revisión:** ${classification.structuredQuestion}

Actualmente experimentamos dificultades técnicas con nuestro sistema de respuesta automática. Tu consulta ha sido clasificada correctamente y será revisada por un profesional especializado en ${classification.domain.toLowerCase()}.

**Próximos pasos:**
1. Tu consulta queda registrada en el sistema
2. Un especialista la revisará en las próximas horas  
3. Recibirás una respuesta detallada y personalizada

Por favor, revisa tu historial de consultas más tarde para ver la respuesta del especialista.`;
    } catch (classificationError) {
      console.error('Error in classification fallback:', classificationError);
      return "Ha ocurrido un error al procesar tu consulta. Un profesional la revisará pronto y te proporcionará una respuesta personalizada.";
    }
  }
}

export async function classifyAndStructureQuestion(userMessage: string): Promise<ClassificationResult> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Eres un experto en clasificación de consultas legales y fiscales en España. Tu tarea es:

1. CLASIFICAR la consulta en uno de estos dominios:
   - "Fiscal": Impuestos, IRPF, IVA, declaraciones, tributación, AEAT, desgravaciones, retenciones
   - "Laboral": Contratos, nóminas, despidos, bajas, convenios, derecho laboral, seguridad social
   - "Contable": Contabilidad, balance, libros contables, amortizaciones, provisiones, estados financieros

2. ESTRUCTURAR la pregunta de forma más clara y específica, manteniendo el contexto español.

3. RESPONDER SOLO en formato JSON con esta estructura exacta:
{
  "domain": "Fiscal|Laboral|Contable",
  "structuredQuestion": "Pregunta reformulada de forma clara y específica",
  "confidence": 0.95,
  "originalQuestion": "Pregunta original del usuario"
}

Ejemplos:
- "¿Puedo desgravar mi ordenador?" → Fiscal
- "Me han despedido, ¿qué hago?" → Laboral  
- "¿Cómo hago el balance?" → Contable

Si no estás seguro, elige el dominio más probable y baja la confianza.`
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      max_tokens: 400,
      temperature: 0.1,
    });

    const responseText = completion.choices[0]?.message?.content || '';
    
    try {
      const parsed = JSON.parse(responseText);
      return {
        domain: parsed.domain || 'Fiscal',
        structuredQuestion: parsed.structuredQuestion || userMessage,
        confidence: parsed.confidence || 0.8,
        originalQuestion: userMessage
      };
    } catch (parseError) {
      console.error('Error parsing classification JSON:', parseError);
      // Fallback classification
      return {
        domain: 'Fiscal',
        structuredQuestion: userMessage,
        confidence: 0.5,
        originalQuestion: userMessage
      };
    }
  } catch (error) {
    console.error('Error in classification:', error);
    return {
      domain: 'Fiscal',
      structuredQuestion: userMessage,
      confidence: 0.3,
      originalQuestion: userMessage
    };
  }
}

export function getDomainForQuestion(domain: string): { domains: string[], context: string } {
  const domainConfig = {
    'Fiscal': {
      domains: [
        'agenciatributaria.es',
        'boe.es', 
        'sede.agenciatributaria.gob.es',
        'fiscal.es',
        'expansion.com',
        'eleconomista.es'
      ],
      context: 'fiscal and tax law in Spain'
    },
    'Laboral': {
      domains: [
        'mitramiss.gob.es',
        'seg-social.es',
        'boe.es',
        'laboral.net',
        'expansion.com',
        'eleconomista.es'
      ],
      context: 'labor and employment law in Spain'
    },
    'Contable': {
      domains: [
        'icac.gob.es',
        'boe.es',
        'registradores.org',
        'aeca.es',
        'expansion.com',
        'eleconomista.es'
      ],
      context: 'accounting and financial reporting in Spain'
    }
  };
  
  return domainConfig[domain as keyof typeof domainConfig] || domainConfig['Fiscal'];
}

export async function* searchWithPerplexityStream(question: string, domain: string): AsyncGenerator<string> {
  const PPX_API_KEY = process.env.PPX_API_KEY;
  
  console.log('PPX_API_KEY check:', PPX_API_KEY ? 'Found' : 'Not found');
  console.log('Environment NODE_ENV:', process.env.NODE_ENV);
  
  if (!PPX_API_KEY) {
    console.error('PPX_API_KEY is missing from environment variables');
    throw new Error('Perplexity API key not found');
  }

  const domainConfig = getDomainForQuestion(domain);
  const prompt = `Please provide a comprehensive answer about ${domainConfig.context} for the following question: ${question}

Please answer in Spanish and focus specifically on Spanish regulations and practices.`;

  try {
    console.log('Making Perplexity API request for domain:', domain);
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PPX_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar', // Better model for comprehensive responses with good citations
        messages: [
          {
            role: 'system',
            content: `You are an expert advisor in Spanish ${domainConfig.context}. Provide accurate, professional, and helpful responses about Spanish regulations and practices.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        search_domain_filter: domainConfig.domains,
        max_tokens: 1500,
        temperature: 0.2,
        stream: true
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API error details:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        headers: Object.fromEntries(response.headers.entries())
      });
      throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response stream available');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;
            if (!data) continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                yield content;
              }
            } catch {
              // Skip invalid JSON chunks
              continue;
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    console.error('Error in Perplexity streaming:', error);
    throw error;
  }
}

// Get sources from Perplexity (highly optimized for speed)
async function extractSourcesFromPerplexity(question: string, domain: string): Promise<string[]> {
  const PPX_API_KEY = process.env.PPX_API_KEY;
  
  if (!PPX_API_KEY) {
    console.error('Perplexity API key not found for sources');
    return [];
  }

  const domainConfig = getDomainForQuestion(domain);
  
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PPX_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro', // Use sonar-pro as shown in your example
        messages: [
          {
            role: 'user',
            content: `Find official Spanish government sources for: ${question.substring(0, 100)}` // Shorter prompt
          }
        ],
        search_domain_filter: domainConfig.domains,
        max_tokens: 150, // Slightly larger to get better sources
        temperature: 0.0,
        stream: false
      }),
    });

    if (!response.ok) {
      console.error('Perplexity sources API error:', response.status);
      return [];
    }

    const data = await response.json();
    
    // Extract citations from the response object (this is the correct way)
    let sources: string[] = [];
    
    if (data.citations && Array.isArray(data.citations)) {
      sources = data.citations
        .filter((citation: unknown): citation is string => typeof citation === 'string')
        .map((url: string) => url.replace(/[,\.\)\]\>\"\'\`]+$/, '').trim())
        .filter((url: string) => url && url.startsWith('http'));
      
      console.log('Citations from Perplexity API:', sources);
    }
    
    // Also check search_results if citations are empty
    if (sources.length === 0 && data.search_results && Array.isArray(data.search_results)) {
      sources = data.search_results
        .map((result: { url?: string }) => result.url)
        .filter((url: string | undefined): url is string => typeof url === 'string' && url.startsWith('http'));
      
      console.log('Sources from search_results:', sources);
    }
    
    return sources;
    
  } catch (error) {
    console.error('Error in fast source extraction:', error);
    return [];
  }
}

export async function* streamEnhancedAEATResponse(userMessage: string): AsyncGenerator<StreamChunk> {
  try {
    // Validate environment first
    const envCheck = validateEnvironment();
    if (!envCheck.valid) {
      yield {
        type: 'error',
        content: `Configuration error: Missing environment variables: ${envCheck.missing.join(', ')}`
      };
      return;
    }

    // Step 1: Classify and structure the question
    const classification = await classifyAndStructureQuestion(userMessage);
    
    yield {
      type: 'classification',
      content: `Consulta clasificada como: **${classification.domain}**\n\nPregunta estructurada: ${classification.structuredQuestion}`,
      classification
    };

    // Step 2: Use Perplexity to get the enhanced answer
    yield {
      type: 'perplexity_start',
      content: 'Buscando respuesta especializada...'
    };

    let fullResponse = '';

    try {
      // Stream the Perplexity response
      for await (const chunk of searchWithPerplexityStream(classification.structuredQuestion, classification.domain)) {
        fullResponse += chunk;
        yield {
          type: 'chunk',
          content: chunk
        };
      }

      // Get sources after the response is complete - optimized approach
      console.log('Getting sources for question:', classification.structuredQuestion, 'domain:', classification.domain);
      
      // Enhanced URL extraction from response content
      const urlRegex = /https?:\/\/[^\s\)\]\>,\"\'\`\n\r]+/g;
      const urlMatches = fullResponse.match(urlRegex) || [];
      
      // Clean URLs (no filtering needed since domain filtering is done by API)
      let realSources = [...new Set(urlMatches)]
        .map(url => url.replace(/[,\.\)\]\>\"\'\`]+$/, '')) // Remove trailing punctuation
        .filter(url => url && url.startsWith('http'));
      
      console.log('Found sources in response content:', realSources);
      
      // Only make fallback call if no sources found AND the response seems to have content
      if (realSources.length === 0 && fullResponse.length > 100) {
        console.log('No relevant sources in response content, making fast fallback call');
        try {
          const sourcesFromAPI = await extractSourcesFromPerplexity(classification.structuredQuestion, classification.domain);
          realSources = sourcesFromAPI;
        } catch (sourcesError) {
          console.error('Error getting sources from API:', sourcesError);
          realSources = [];
        }
      }
      
      let finalSources = realSources;
      
      // Only use fallback sources if no real sources were found
      if (realSources.length === 0) {
        console.log('No real sources found, using fallback sources');
        const fallbackSources = {
          'Fiscal': [
            'https://www.agenciatributaria.es',
            'https://www.boe.es',  
            'https://sede.agenciatributaria.gob.es'
          ],
          'Laboral': [
            'https://www.mitramiss.gob.es',
            'https://www.seg-social.es',
            'https://www.boe.es'
          ],
          'Contable': [
            'https://www.icac.gob.es',
            'https://www.boe.es',
            'https://www.registradores.org'
          ]
        };
        finalSources = fallbackSources[classification.domain as keyof typeof fallbackSources] || fallbackSources['Fiscal'];
      } else {
        console.log('Using real sources from Perplexity:', realSources);
      }

      yield {
        type: 'complete',
        fullResponse: formatResponseWithReferences(fullResponse, finalSources),
        sources: finalSources,
        classification
      };

    } catch (perplexityError) {
      console.error('Perplexity error:', perplexityError);
      
      // Provide a professional error response with classification info
      const errorResponse = `Gracias por tu consulta sobre **${classification.domain}**.

**Pregunta estructurada para revisión:** ${classification.structuredQuestion}

Actualmente experimentamos dificultades técnicas con nuestro sistema de respuesta automática. Tu consulta ha sido clasificada correctamente y será revisada por un profesional especializado en ${classification.domain.toLowerCase()}.

**Próximos pasos:**
1. Tu consulta queda registrada en el sistema
2. Un especialista la revisará en las próximas horas
3. Recibirás una respuesta detallada y personalizada

Por favor, revisa tu historial de consultas más tarde para ver la respuesta del especialista.`;
      
      const fallbackSources = {
        'Fiscal': ['https://www.agenciatributaria.es', 'https://www.boe.es'],
        'Laboral': ['https://www.mitramiss.gob.es', 'https://www.seg-social.es'],
        'Contable': ['https://www.icac.gob.es', 'https://www.boe.es']
      };
      
      const sourcesForFallback = fallbackSources[classification.domain as keyof typeof fallbackSources] || fallbackSources['Fiscal'];
      
      // Still yield a complete response so it gets saved to the database
      yield {
        type: 'complete',
        fullResponse: errorResponse,
        sources: sourcesForFallback,
        classification
      };
    }

  } catch (error) {
    console.error('Error in enhanced response generation:', error);
    yield {
      type: 'error',
      content: 'Error al procesar la consulta con IA avanzada'
    };
  }
}

// Format response with inline reference numbers
function formatResponseWithReferences(response: string, sources: string[]): string {
  if (sources.length === 0) return response;
  
  // Clean up the response by removing duplicate source information
  let cleanedResponse = response;
  
  // Remove "## Fuentes Oficiales y Recursos" section and everything after it
  const fuentesIndex = cleanedResponse.indexOf('## Fuentes Oficiales y Recursos');
  if (fuentesIndex !== -1) {
    cleanedResponse = cleanedResponse.substring(0, fuentesIndex).trim();
  }
  
  // Remove any URLs that appear in the text (since we'll show them in the sources section)
  cleanedResponse = cleanedResponse.replace(/https?:\/\/[^\s\)]+/g, '');
  
  // Remove any standalone reference links like "[1]." or "[1]:"
  cleanedResponse = cleanedResponse.replace(/\[(\d+)\][\.\:]/g, '');
  
  // Clean up any double spaces or line breaks
  cleanedResponse = cleanedResponse.replace(/\n\n\n+/g, '\n\n');
  cleanedResponse = cleanedResponse.replace(/  +/g, ' ');
  
  return cleanedResponse.trim();
}

export default openai;
