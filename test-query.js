// Test script to verify the application functionality
const { execSync } = require('child_process');
const http = require('http');

// Test if the server is running
const testServer = () => {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:3001', (res) => {
      console.log('✅ Server is running on port 3001');
      console.log('Status:', res.statusCode);
      resolve(true);
    });
    
    req.on('error', (err) => {
      console.log('❌ Server test failed:', err.message);
      reject(err);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
};

// Run the test
testServer().then(() => {
  console.log('🎉 Application is ready for testing!');
  console.log('🔗 Open http://localhost:3001 in your browser');
  console.log('📝 Try these test queries:');
  console.log('   - "Show me all customers"');
  console.log('   - "What are the recent orders?"');
  console.log('   - "How many orders are there?"');
}).catch((err) => {
  console.log('❌ Test failed:', err.message);
  process.exit(1);
});
