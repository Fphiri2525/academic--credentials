// Test script to verify changeUserPasswordByEmail blockchain function
const Web3 = require('web3');
const { CONTRACTS } = require('./src/config.js');

async function testChangePasswordByEmail() {
  try {
    console.log('🔍 Testing changeUserPasswordByEmail blockchain function...');
    
    // Initialize Web3 (assuming Ganache is running on port 7545)
    const web3 = new Web3('http://127.0.0.1:7545');
    
    // Get contract instance
    const contract = new web3.eth.Contract(
      CONTRACTS.userManagement.abi,
      CONTRACTS.userManagement.address
    );
    
    console.log('📋 Contract loaded at:', CONTRACTS.userManagement.address);
    
    // Get accounts
    const accounts = await web3.eth.getAccounts();
    console.log('📧 Available accounts:', accounts.length);
    
    // Test parameters (replace with actual registered user email)
    const testEmail = 'test@example.com'; // Replace with actual email from your system
    const newPassword = 'newPassword123';
    
    console.log('🔗 Calling changeUserPasswordByEmail with:');
    console.log('  Email:', testEmail);
    console.log('  New Password:', newPassword);
    
    // Estimate gas first
    const gasEstimate = await contract.methods
      .changeUserPasswordByEmail(testEmail, newPassword)
      .estimateGas({ from: accounts[0] });
    
    console.log('⛽ Gas estimate:', gasEstimate);
    
    // Call the function
    const result = await contract.methods
      .changeUserPasswordByEmail(testEmail, newPassword)
      .send({ 
        from: accounts[0],
        gas: Math.floor(gasEstimate * 1.2) // 20% buffer
      });
    
    console.log('✅ Password changed successfully!');
    console.log('📊 Transaction hash:', result.transactionHash);
    console.log('📊 Gas used:', result.gasUsed);
    
    // Test login with new password
    console.log('🔐 Testing login with new password...');
    const loginResult = await contract.methods.signIn(testEmail, newPassword).call();
    console.log('✅ Login test result:', loginResult);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.data) {
      console.error('❌ Error data:', error.data);
    }
  }
}

// Run the test
testChangePasswordByEmail();