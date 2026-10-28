// Test script to check Web3 connection and data retrieval
import Web3 from "web3";
import { CONTRACTS } from "./src/config.js";

async function testConnection() {
  console.log("🔍 Testing Web3 connection and data retrieval...");
  
  let web3;
  
  try {
    // Try MetaMask first
    if (typeof window !== 'undefined' && window.ethereum) {
      web3 = new Web3(window.ethereum);
      console.log("✅ MetaMask detected");
      
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        console.log("✅ MetaMask connected");
      } catch (error) {
        console.warn("⚠️ MetaMask access denied");
      }
    } else {
      // Try Ganache
      console.log("🔍 Trying Ganache...");
      web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
    }
    
    // Test basic connection
    const accounts = await web3.eth.getAccounts();
    console.log("📊 Available accounts:", accounts.length);
    
    if (accounts.length > 0) {
      console.log("🔑 Current account:", accounts[0]);
    }
    
    // Test network
    const networkId = await web3.eth.net.getId();
    console.log("🌐 Network ID:", networkId);
    
    // Test contract connection
    const userContract = new web3.eth.Contract(
      CONTRACTS.userManagement.abi,
      CONTRACTS.userManagement.address
    );
    
    console.log("📋 Testing user contract...");
    
    // Test getUserCount (should work even without accounts)
    try {
      const userCount = await userContract.methods.getUserCount().call();
      console.log("👥 Total users:", userCount);
      
      // Test getAllUserDetails if there are users
      if (userCount > 0) {
        const allUsers = await userContract.methods.getAllUserDetails().call();
        console.log("📝 User data structure:", {
          names: allUsers[0]?.length || 0,
          emails: allUsers[1]?.length || 0,
          contacts: allUsers[2]?.length || 0,
          roles: allUsers[3]?.length || 0,
          institutions: allUsers[4]?.length || 0
        });
      }
    } catch (error) {
      console.error("❌ Contract call failed:", error.message);
    }
    
  } catch (error) {
    console.error("❌ Connection test failed:", error);
  }
}

// Run the test
testConnection();