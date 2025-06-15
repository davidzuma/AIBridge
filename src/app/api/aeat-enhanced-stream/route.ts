import { NextRequest } from 'next/server';
import { streamEnhancedResponse } from '@/lib/openai';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized. Please sign in to use this service.' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse request body
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Message is required and must be a text string.' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (message.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Message cannot be empty.' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (message.length > 2000) {
      return new Response(
        JSON.stringify({ error: 'Message is too long. Maximum 2000 characters.' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Create a ReadableStream for streaming the enhanced response
    const encoder = new TextEncoder();
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullResponse = '';
          let classification = null;
          let sources: string[] = [];
          
          // Stream the enhanced response
          for await (const chunk of streamEnhancedResponse(message)) {
            if (chunk.type === 'classification') {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                type: 'classification', 
                content: chunk.content,
                classification: chunk.classification
              })}\n\n`));
              
              if (chunk.classification) {
                classification = chunk.classification;
              }
            } else if (chunk.type === 'perplexity_start') {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                type: 'perplexity_start', 
                content: chunk.content 
              })}\n\n`));
            } else if (chunk.type === 'chunk') {
              fullResponse += chunk.content || '';
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                type: 'chunk', 
                content: chunk.content 
              })}\n\n`));
            } else if (chunk.type === 'complete') {
              fullResponse = chunk.fullResponse || fullResponse;
              sources = chunk.sources || [];
              
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                type: 'complete', 
                fullResponse,
                sources,
                classification: chunk.classification || classification,
                timestamp: new Date().toISOString()
              })}\n\n`));
            } else if (chunk.type === 'error') {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                type: 'error', 
                error: chunk.content 
              })}\n\n`));
            }
          }

          controller.close();
        } catch (error) {
          console.error('Enhanced streaming error:', error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'error',                error: 'Error processing query with advanced AI'
          })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('Error in enhanced AEAT stream API:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
