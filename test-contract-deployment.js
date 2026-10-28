// Test script to verify MANEB contract deployment and accessibility
import Web3 from 'web3';

// Contract configuration
const MANEB_ADDRESS = "0x09215037898609DAAe8BB8A96b45d9E59a31F4E3";

async function testContractDeployment() {
  console.log('🧪 Testing MANEB Contract Deployment...');
  
  try {
    // Initialize Web3
    let web3;
    if (window.ethereum) {
      web3 = new Web3(window.ethereum);
      console.log('✅ Using MetaMask provider');
    } else {
      web3 = new Web3('http://127.0.0.1:7545');
      console.log('✅ Using Ganache provider');
    }
    
    // Get network info
    const chainId = await web3.eth.getChainId();
    const isListening = await web3.eth.net.isListening();
    const accounts = await web3.eth.getAccounts();
    
    console.log('📊 Network Information:');
    console.log('  Chain ID:', chainId);
    console.log('  Network listening:', isListening);
    console.log('  Available accounts:', accounts.length);
    console.log('  Current account:', accounts[0] || 'None');
    
    // Check if contract exists at address
    console.log('\n📋 Contract Deployment Check:');
    console.log('  Contract address:', MANEB_ADDRESS);
    
    const code = await web3.eth.getCode(MANEB_ADDRESS);
    console.log('  Contract code length:', code.length);
    console.log('  Contract deployed:', code !== '0x' ? 'YES ✅' : 'NO ❌');
    
    if (code === '0x') {
      console.log('\n❌ PROBLEM IDENTIFIED:');
      console.log('  The MANEB contract is not deployed at the specified address on this network.');
      console.log('  This explains the JSON-RPC errors when trying to interact with it.');
      console.log('\n🔧 SOLUTIONS:');
      console.log('  1. Deploy the MANEB contract to the current network');
      console.log('  2. Switch to the correct network where the contract is deployed');
      console.log('  3. Update the contract address in config.js');
    } else {
      console.log('\n✅ Contract is properly deployed!');
      
      // Try to get contract balance
      const balance = await web3.eth.getBalance(MANEB_ADDRESS);
      console.log('  Contract balance:', web3.utils.fromWei(balance, 'ether'), 'ETH');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Export for use in browser console
window.testContractDeployment = testContractDeployment;

console.log('🔧 Contract deployment test loaded. Run testContractDeployment() in console to test.');
