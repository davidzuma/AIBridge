import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateFiscalResponse(userMessage: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Eres un asesor fiscal experto en España. Proporciona respuestas precisas, profesionales y útiles sobre temas fiscales. Incluye siempre:
          1. Una respuesta clara y directa
          2. Referencias a la normativa aplicable cuando sea relevante
          3. Recomendaciones prácticas
          4. Una nota indicando que esta es orientación general y se recomienda consultar con un profesional para casos específicos.
          
          Mantén un tono profesional pero accesible. Si la consulta no está relacionada con temas fiscales, redirige amablemente hacia temas fiscales.`
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || "Lo siento, no pude generar una respuesta en este momento. Por favor, inténtalo de nuevo.";
  } catch (error) {
    console.error('Error generating OpenAI response:', error);
    return "Ha ocurrido un error al procesar tu consulta. Un revisor humano la revisará pronto.";
  }
}

export default openai;
