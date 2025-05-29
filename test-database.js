// Quick test to verify database state
const { execute } = require('./src/app/database.ts');

async function testDatabase() {
  console.log("🧪 Testing database state...");
  
  try {
    // Test if tables exist
    const tables = await execute("SELECT name FROM sqlite_master WHERE type='table'");
    console.log("📋 Available tables:", tables);
    
    // Test customer count
    const customerCount = await execute("SELECT COUNT(*) as count FROM 'customer'");
    console.log("👥 Customer count:", customerCount);
    
    // Test order count  
    const orderCount = await execute("SELECT COUNT(*) as count FROM 'order'");
    console.log("📦 Order count:", orderCount);
    
    // Test actual customer data
    const customers = await execute("SELECT * FROM 'customer' LIMIT 5");
    console.log("👤 Sample customers:", customers);
    
    console.log("✅ Database test completed successfully!");
    
  } catch (error) {
    console.error("❌ Database test failed:", error);
  }
}

// Run the test
testDatabase();
