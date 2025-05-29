// Simple test script to verify OpenAI integration
import { generateFiscalResponse, generateReviewerSuggestion } from './src/lib/openai.ts';

async function testAI() {
  console.log('🤖 Testing AI Integration...\n');
  
  try {
    console.log('1. Testing fiscal response generation...');
    const testQuery = "¿Cuáles son las deducciones fiscales disponibles para autónomos en España?";
    const fiscalResponse = await generateFiscalResponse(testQuery);
    
    console.log('✅ Fiscal Response Generated:');
    console.log(fiscalResponse);
    console.log('\n---\n');
    
    console.log('2. Testing reviewer suggestion generation...');
    const reviewerSuggestion = await generateReviewerSuggestion(testQuery, "Usuario: Test User (test@example.com)");
    
    console.log('✅ Reviewer Suggestion Generated:');
    console.log(reviewerSuggestion);
    console.log('\n---\n');
    
    console.log('🎉 AI Integration test completed successfully!');
  } catch (error) {
    console.error('❌ AI Integration test failed:', error);
  }
}

testAI();
