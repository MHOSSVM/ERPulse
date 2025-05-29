// Test database connection and functionality
import { seed, execute, verifyDatabaseState } from './src/app/database.js';

console.log('🧪 Testing database functionality...');

async function testDatabase() {
  try {
    // Seed the database
    console.log('1. Seeding database...');
    await seed();
    
    // Wait a bit for seeding to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verify database state
    console.log('2. Verifying database state...');
    const state = await verifyDatabaseState();
    console.log('Database state:', state);
    
    // Test a simple query
    console.log('3. Testing customer count query...');
    const customerCount = await execute("SELECT COUNT(*) as count FROM 'customer'");
    console.log('Customer count result:', customerCount);
    
    // Test getting all customers
    console.log('4. Testing get all customers...');
    const customers = await execute("SELECT * FROM 'customer' LIMIT 5");
    console.log('Customers result:', customers);
    
    console.log('✅ Database tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}

testDatabase();
