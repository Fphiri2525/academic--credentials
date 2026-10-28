// Test script to verify MANEB contract fix
import { web3Service } from './src/web3service.js';
import { CONTRACTS } from './src/config.js';

async function testManebContractFix() {
  console.log('🧪 Testing MANEB Contract Fix...');
  
  try {
    // Test 1: Check if MANEB contract is configured
    console.log('\n📋 Test 1: Configuration Check');
    console.log('MANEB in config:', !!CONTRACTS.maneb);
    if (CONTRACTS.maneb) {
      console.log('MANEB address:', CONTRACTS.maneb.address);
      console.log('MANEB ABI length:', CONTRACTS.maneb.abi?.length);
    }
    
    // Test 2: Check if contractExists method works
    console.log('\n📋 Test 2: Contract Exists Method');
    const contractExists = await web3Service.contractExists('maneb');
    console.log('MANEB contract exists:', contractExists);
    
    // Test 3: Try to get contract instance
    console.log('\n📋 Test 3: Contract Instance');
    try {
      const contract = web3Service.getContract('maneb');
      console.log('Contract instance created successfully');
      console.log('Contract address:', contract.options.address);
    } catch (error) {
      console.error('Failed to create contract instance:', error.message);
    }
    
    // Test 4: Try calling a simple method
    console.log('\n📋 Test 4: Contract Method Call');
    try {
      const totalSchools = await web3Service.callContract('maneb', 'getTotalSecondarySchools', []);
      console.log('Total secondary schools:', totalSchools);
    } catch (error) {
      console.error('Failed to call contract method:', error.message);
    }
    
    console.log('\n✅ MANEB Contract Fix Test Complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testManebContractFix();
