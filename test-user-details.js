// Test script to verify getUserDetails blockchain function
const Web3 = require('web3');
const { CONTRACTS } = require('./src/config.js');

async function testGetUserDetails() {
  try {
    console.log('🔍 Testing getUserDetails blockchain function...');
    
    // Initialize Web3 (assuming Ganache is running on port 7545)
    const web3 = new Web3('http://127.0.0.1:7545');
    
    // Get contract instance
    const contract = new web3.eth.Contract(
      CONTRACTS.userManagement.abi,
      CONTRACTS.userManagement.address
    );
    
    console.log('📋 Contract loaded at:', CONTRACTS.userManagement.address);
    
    // Test with a sample email (you should replace this with an actual registered email)
    const testEmail = 'test@example.com'; // Replace with actual email from your system
    
    console.log('🔗 Calling getUserDetails with email:', testEmail);
    
    const result = await contract.methods.getUserDetails(testEmail).call();
    
    console.log('✅ Blockchain response:', result);
    console.log('📊 Parsed details:', {
      name: result[0],
      contactInfo: result[1], 
      role: result[2],
      institution: result[3]
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testGetUserDetails();