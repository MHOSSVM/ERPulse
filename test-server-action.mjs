// Direct test of the server action functionality
import { message } from './src/app/actions.js';
import { HumanMessage } from '@langchain/core/messages';

async function testQuery() {
  console.log('🧪 Testing server action with sample query...');
  
  try {
    const testMessage = new HumanMessage("Show me all customers");
    const result = await message([{
      type: "human",
      content: "Show me all customers"
    }]);
    
    console.log('✅ Query executed successfully!');
    console.log('📊 Result preview:', result.substring(0, 200) + '...');
    return true;
  } catch (error) {
    console.error('❌ Query failed:', error.message);
    return false;
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testQuery();
}
