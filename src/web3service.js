import Web3 from "web3";
import { CONTRACTS } from "./config";
import { env } from "./config/env.js";

// Enhanced Web3 Service with better error handling and connection management
class Web3Service {
  constructor() {
    this.web3 = null;
    this.wsProvider = null;
    this.web3ws = null;
    this.contractInstances = new Map();
    this.connectionStatus = 'disconnected';
    this.retryAttempts = 0;
    this.maxRetries = 3;
    this.eventListeners = new Map();
    this.initializationPromise = null;
    
    // Start initialization immediately
    this.initializationPromise = this.initializeWeb3();
  }

  // Initialize Web3 with multiple provider fallbacks
  async initializeWeb3() {
    try {
      console.log("🚀 Initializing Web3 service...");
      
      // Try MetaMask first
      if (window.ethereum) {
        this.web3 = new Web3(window.ethereum);
        console.log("✅ Connected to MetaMask");
        
        // Request account access
        try {
          await window.ethereum.request({ method: "eth_requestAccounts" });
          this.connectionStatus = 'connected';
          console.log("✅ MetaMask account access granted");
        } catch (error) {
          console.warn("⚠️ MetaMask account access denied, using read-only mode");
          this.connectionStatus = 'readonly';
        }
      } 
      // Fallback to Ganache
      else {
        console.log("🔍 MetaMask not detected, trying Ganache...");
        const localProvider = new Web3.providers.HttpProvider("http://127.0.0.1:7545");
        this.web3 = new Web3(localProvider);
        console.log("✅ Connected to Ganache at http://127.0.0.1:7545");
        this.connectionStatus = 'connected';
      }

      // Test connection
      const connectionTest = await this.testConnection();
      if (!connectionTest) {
        throw new Error("Connection test failed");
      }
      
      // Initialize WebSocket provider for events
      this.initializeWebSocket();
      
      console.log("✅ Web3 service initialization completed");
      return true;
      
    } catch (error) {
      console.error("❌ Failed to initialize Web3:", error);
      this.connectionStatus = 'error';
      throw error;
    }
  }

  // Test Web3 connection
  async testConnection() {
    try {
      const isListening = await this.web3.eth.net.isListening();
      const chainId = await this.web3.eth.getChainId();
      const accounts = await this.web3.eth.getAccounts();
      
      console.log(`✅ Web3 Connection Test:
        - Network listening: ${isListening}
        - Chain ID: ${chainId}
        - Available accounts: ${accounts.length}
        - Connection status: ${this.connectionStatus}`);
        
      return true;
    } catch (error) {
      console.error("❌ Web3 connection test failed:", error);
      return false;
    }
  }

  // Initialize WebSocket provider for real-time events
  initializeWebSocket() {
    try {
      const infuraApiKey = env.INFURA_API_KEY;
      
      if (infuraApiKey && infuraApiKey !== 'your_infura_api_key_here') {
        this.wsProvider = new Web3.providers.WebsocketProvider(
          `wss://sepolia.infura.io/ws/v3/${infuraApiKey}`
        );
        this.web3ws = new Web3(this.wsProvider);

        this.wsProvider.on("error", (error) => {
          console.warn("WebSocket error:", error);
          this.wsProvider = null;
          this.web3ws = null;
        });

        this.wsProvider.on("end", () => {
          console.warn("WebSocket connection ended");
          this.wsProvider = null;
          this.web3ws = null;
        });

        console.log("✅ WebSocket provider initialized");
      } else {
        console.warn("⚠️ No Infura API key. WebSocket features disabled.");
      }
    } catch (error) {
      console.warn("⚠️ WebSocket provider setup failed:", error);
    }
  }

  // Get contract instance with caching
  getContract(contractName) {
    try {
      // Check cache first
      if (this.contractInstances.has(contractName)) {
        return this.contractInstances.get(contractName);
      }

      // Validate contract configuration
      if (!CONTRACTS[contractName]) {
        throw new Error(`❌ Contract '${contractName}' not found in configuration`);
      }

      const { abi, address } = CONTRACTS[contractName];

      if (!abi || !Array.isArray(abi)) {
        throw new Error(`❌ Invalid ABI for contract '${contractName}'`);
      }

      if (!address || !this.web3.utils.isAddress(address)) {
        throw new Error(`❌ Invalid address for contract '${contractName}': ${address}`);
      }

      // Create contract instance
      const contract = new this.web3.eth.Contract(abi, address);
      
      // Cache the instance
      this.contractInstances.set(contractName, contract);
      
      console.log(`✅ Contract '${contractName}' loaded at ${address}`);
      return contract;
      
    } catch (error) {
      console.error(`❌ Error loading contract '${contractName}':`, error);
      throw error;
    }
  }

  // Get WebSocket contract instance for events
  getWsContract(contractName) {
    if (!CONTRACTS[contractName]) {
      throw new Error(`Contract '${contractName}' not configured`);
    }

    const { abi, address } = CONTRACTS[contractName];

    if (this.web3ws) {
      return new this.web3ws.eth.Contract(abi, address);
    } else {
      console.warn("⚠️ WebSocket not available, using fallback");
      return this.getContract(contractName);
    }
  }

  // Connect to wallet (MetaMask)
  async connectWallet() {
    try {
      if (!window.ethereum) {
        throw new Error("❌ MetaMask not detected");
      }

      const accounts = await window.ethereum.request({ 
        method: "eth_requestAccounts" 
      });
      
      console.log("✅ Wallet connected:", accounts[0]);
      this.connectionStatus = 'connected';
      return accounts;
      
    } catch (error) {
      console.error("❌ Wallet connection error:", error);
      this.connectionStatus = 'error';
      throw error;
    }
  }

  // Get current account
  async getCurrentAccount() {
    try {
      const accounts = await this.web3.eth.getAccounts();
      return accounts[0];
    } catch (error) {
      console.error("❌ Error getting current account:", error);
      throw error;
    }
  }

  // Enhanced transaction sending with better error handling
  async sendTransaction(contractName, methodName, params = [], options = {}) {
    try {
      const contract = this.getContract(contractName);
      const account = await this.getCurrentAccount();

      if (!account) {
        throw new Error("❌ No account available. Please connect your wallet.");
      }

      // Validate parameters for addUniversityGraduates specifically
      if (methodName === 'addUniversityGraduates') {
        this.validateGraduateParams(params);
      }

      // Prepare transaction parameters with better defaults for EIP-1559
      const txParams = {
        from: account,
        gas: options.gas || 3000000,
        ...options
      };

      // Use EIP-1559 gas pricing if available, fallback to legacy
      if (!options.gasPrice && !options.maxFeePerGas) {
        try {
          const baseFee = await this.web3.eth.getBlock('latest').then(block => block.baseFeePerGas);
          if (baseFee) {
            txParams.maxFeePerGas = options.maxFeePerGas || this.web3.utils.toWei('30', 'gwei');
            txParams.maxPriorityFeePerGas = options.maxPriorityFeePerGas || this.web3.utils.toWei('2', 'gwei');
          } else {
            txParams.gasPrice = await this.web3.eth.getGasPrice();
          }
        } catch (gasError) {
          console.warn("⚠️ Gas price estimation failed, using fallback");
          txParams.gasPrice = this.web3.utils.toWei('20', 'gwei');
        }
      }

      console.log(`🚀 Sending transaction:
        Contract: ${contractName}
        Method: ${methodName}
        Params: ${JSON.stringify(params, null, 2)}
        From: ${account}
        Gas: ${txParams.gas}
        Gas Price: ${txParams.gasPrice || 'EIP-1559'}`);

      // Estimate gas if not provided
      if (!options.gas) {
        try {
          const gasEstimate = await contract.methods[methodName](...params).estimateGas({
            from: account,
            gasPrice: txParams.gasPrice
          });
          txParams.gas = Math.floor(Number(gasEstimate) * 1.3); // 30% buffer for complex transactions
          console.log(`📊 Gas estimate: ${gasEstimate}, Using: ${txParams.gas}`);
        } catch (gasError) {
          console.warn("⚠️ Gas estimation failed:", gasError.message);
          if (gasError.message.includes('revert')) {
            console.error('❌ Contract will likely revert! Check parameters:', params);
          }
          // For addUniversityGraduates, use higher default gas
          if (methodName === 'addUniversityGraduates') {
            txParams.gas = 5000000; // Higher gas limit for batch operations
          } else if (methodName === 'addVerificationRequest' || methodName === 'addVerificationRequestByQRCode') {
            txParams.gas = 600000;
          }
        }
      }

      // Send transaction - single attempt since it's working
      console.log(`📊 Gas settings:`, {
        gas: txParams.gas,
        gasPrice: txParams.gasPrice,
        maxFeePerGas: txParams.maxFeePerGas,
        maxPriorityFeePerGas: txParams.maxPriorityFeePerGas
      });

      // Log the exact method call being made
      console.log(`🎯 Calling: contract.methods.${methodName}(${params.map(p => Array.isArray(p) ? `[${p.length} items]` : `"${p}"`).join(', ')}).send(txParams)`);

      const result = await contract.methods[methodName](...params).send(txParams);
      console.log("✅ Transaction successful:", result.transactionHash);
      return result;

    } catch (error) {
      console.error(`❌ Transaction failed (${contractName}.${methodName}):`, error);
      throw this.formatTransactionError(error);
    }
  }

  // Validate parameters for addUniversityGraduates - UPDATED PARAMETER ORDER
  
validateGraduateParams(params) {
  if (!Array.isArray(params) || params.length !== 6) {
    throw new Error(
      '❌ Invalid parameters: Expected 6 parameters for addUniversityGraduates'
    );
  }

  // Correct order matching the Solidity function
  const [
    universityName,
    programOfStudy,
    award,
    yearOfGraduation,
    registrationNumbers,
    studentNames
  ] = params;

  // Validate university
  if (
    typeof universityName !== 'string' ||
    universityName.trim() === ''
  ) {
    throw new Error('❌ Invalid university name');
  }

  // Validate program
  if (
    typeof programOfStudy !== 'string' ||
    programOfStudy.trim() === ''
  ) {
    throw new Error('❌ Program of study is required');
  }

  console.log('✅ Program of study accepted:', programOfStudy);

  // Validate award
  if (
    typeof award !== 'string' ||
    award.trim() === ''
  ) {
    throw new Error('❌ Invalid award');
  }

  // Validate graduation year
  const year = String(yearOfGraduation).trim();

  if (!/^\d{4}$/.test(year)) {
    throw new Error('❌ Invalid year of graduation');
  }

  const numericYear = Number(year);

  if (numericYear < 1900 || numericYear > new Date().getFullYear()) {
    throw new Error('❌ Graduation year is outside the accepted range');
  }

  // Validate arrays
  if (
    !Array.isArray(registrationNumbers) ||
    registrationNumbers.length === 0
  ) {
    throw new Error('❌ Invalid registration numbers array');
  }

  if (
    !Array.isArray(studentNames) ||
    studentNames.length === 0
  ) {
    throw new Error('❌ Invalid student names array');
  }

  if (registrationNumbers.length !== studentNames.length) {
    throw new Error(
      '❌ Registration numbers and student names must have the same length'
    );
  }

  // Validate individual records
  for (let i = 0; i < studentNames.length; i++) {
    if (!String(studentNames[i] ?? '').trim()) {
      throw new Error(`❌ Missing student name at position ${i + 1}`);
    }

    if (!String(registrationNumbers[i] ?? '').trim()) {
      throw new Error(`❌ Missing registration number at position ${i + 1}`);
    }
  }

  console.log('✅ Graduate parameters validation passed');

  console.log('✅ Validation details:', {
    universityName,
    programOfStudy,
    award,
    yearOfGraduation: year,
    studentNamesCount: studentNames.length,
    registrationNumbersCount: registrationNumbers.length
  });
}


  // Enhanced contract call with retry logic
  async callContract(contractName, methodName, params = [], options = {}) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const contract = this.getContract(contractName);
        
        console.log(`📞 Calling contract (attempt ${attempt}):
          Contract: ${contractName}
          Method: ${methodName}
          Params: ${JSON.stringify(params)}`);

        const result = await contract.methods[methodName](...params).call(options);
        
        console.log("✅ Contract call successful:", result);
        return result;
        
      } catch (error) {
        lastError = error;
        console.warn(`⚠️ Contract call attempt ${attempt} failed:`, error.message);
        
        if (attempt < this.maxRetries) {
          await this.delay(1000 * attempt); // Exponential backoff
        }
      }
    }
    
    console.error(`❌ Contract call failed after ${this.maxRetries} attempts:`, lastError);
    throw this.formatContractError(lastError, contractName, methodName);
  }

  // Listen to contract events
  listenToEvent(contractName, eventName, callback, options = {}) {
    try {
      const contract = this.getContract(contractName);
      const eventKey = `${contractName}:${eventName}`;
      
      // Remove existing listener if any
      if (this.eventListeners.has(eventKey)) {
        this.eventListeners.get(eventKey).remove();
      }
      
      const subscription = contract.events[eventName]({
        fromBlock: options.fromBlock || 'latest',
        ...options
      }, (error, event) => {
        if (error) {
          console.error(`❌ Event error (${eventKey}):`, error);
        } else {
          console.log(`📡 Event received (${eventKey}):`, event);
          callback(event);
        }
      });
      
      this.eventListeners.set(eventKey, subscription);
      console.log(`✅ Listening to event: ${eventKey}`);
      
      return subscription;
      
    } catch (error) {
      console.error(`❌ Error setting up event listener (${contractName}.${eventName}):`, error);
      throw error;
    }
  }

  // Stop listening to events
  stopListening(contractName, eventName) {
    const eventKey = `${contractName}:${eventName}`;
    const subscription = this.eventListeners.get(eventKey);
    
    if (subscription) {
      subscription.remove();
      this.eventListeners.delete(eventKey);
      console.log(`✅ Stopped listening to event: ${eventKey}`);
    }
  }

  // Get past events
  async getPastEvents(contractName, eventName, options = {}) {
    try {
      const contract = this.getContract(contractName);
      
      const events = await contract.getPastEvents(eventName, {
        fromBlock: options.fromBlock || 0,
        toBlock: options.toBlock || 'latest',
        ...options
      });
      
      console.log(`📜 Retrieved ${events.length} past events for ${contractName}.${eventName}`);
      return events;
      
    } catch (error) {
      console.error(`❌ Error getting past events (${contractName}.${eventName}):`, error);
      throw error;
    }
  }

  // Check if contract exists at address
  async contractExists(contractName) {
    try {
      const contract = this.getContract(contractName);
      const code = await this.web3.eth.getCode(contract.options.address);
      return code !== '0x';
    } catch (error) {
      console.error(`❌ Error checking contract existence (${contractName}):`, error);
      return false;
    }
  }

  // Get contract balance
  async getContractBalance(contractName) {
    try {
      const contract = this.getContract(contractName);
      const balance = await this.web3.eth.getBalance(contract.options.address);
      return this.web3.utils.fromWei(balance, 'ether');
    } catch (error) {
      console.error(`❌ Error getting contract balance (${contractName}):`, error);
      throw error;
    }
  }

  // Utility function to delay execution
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Format transaction errors for better user experience
  formatTransactionError(error) {
    if (error.message.includes('insufficient funds')) {
      return new Error('❌ Insufficient funds for transaction. Please ensure your wallet has enough ETH for gas fees.');
    } else if (error.message.includes('user rejected')) {
      return new Error('❌ Transaction was rejected by user.');
    } else if (error.message.includes('gas required exceeds allowance')) {
      return new Error('❌ Gas limit too low. Please try again with higher gas limit.');
    } else if (error.message.includes('execution reverted')) {
      return new Error('❌ Transaction reverted. This usually means the contract rejected the operation.');
    } else if (error.message.includes('Internal JSON-RPC error')) {
      return new Error('❌ Network error occurred. This could be due to: 1) Network congestion, 2) Invalid transaction data, 3) RPC node issues. Please check your data and try again.');
    } else if (error.message.includes('nonce too low')) {
      return new Error('❌ Transaction nonce error. Please reset your MetaMask account or wait for pending transactions to complete.');
    } else if (error.message.includes('replacement transaction underpriced')) {
      return new Error('❌ Transaction replacement failed. Please increase gas price or wait for the original transaction to complete.');
    } else if (error.message.includes('Invalid parameters')) {
      return new Error('❌ Invalid transaction parameters. Please check your input data.');
    } else if (error.message.includes('timeout') || error.message.includes('TIMEOUT')) {
      return new Error('❌ Transaction timeout. The network might be congested. Please try again.');
    } else if (error.message.includes('network error') || error.message.includes('CONNECTION ERROR')) {
      return new Error('❌ Network connection error. Please check your internet connection and try again.');
    } else if (error.code === 4001) {
      return new Error('❌ Transaction was rejected by user.');
    } else if (error.code === -32603) {
      return new Error('❌ Internal RPC error. Please check your network connection and try again.');
    } else {
      return new Error(`❌ Transaction failed: ${error.message || 'Unknown error occurred'}`);
    }
  }

  // Format contract call errors
  formatContractError(error, contractName, methodName) {
    if (error.message.includes('execution reverted')) {
      return new Error(`❌ Contract call reverted (${contractName}.${methodName}). This usually means the operation is not allowed or data is invalid.`);
    } else {
      return new Error(`❌ Contract call failed (${contractName}.${methodName}): ${error.message}`);
    }
  }

  // Get connection status
  getConnectionStatus() {
    return this.connectionStatus;
  }

  // Get network information
  async getNetworkInfo() {
    try {
      const chainId = await this.web3.eth.getChainId();
      const isListening = await this.web3.eth.net.isListening();
      const accounts = await this.web3.eth.getAccounts();
      
      return {
        chainId,
        isListening,
        accountCount: accounts.length,
        currentAccount: accounts[0] || null,
        connectionStatus: this.connectionStatus
      };
    } catch (error) {
      console.error("❌ Error getting network info:", error);
      return {
        chainId: null,
        isListening: false,
        accountCount: 0,
        currentAccount: null,
        connectionStatus: 'error'
      };
    }
  }

  // Cleanup resources
  cleanup() {
    // Remove all event listeners
    this.eventListeners.forEach((subscription, key) => {
      subscription.remove();
      console.log(`🧹 Cleaned up event listener: ${key}`);
    });
    this.eventListeners.clear();
    
    // Close WebSocket connection
    if (this.wsProvider) {
      this.wsProvider.disconnect();
      this.wsProvider = null;
      this.web3ws = null;
    }
    
    console.log("🧹 Web3Service cleanup completed");
  }

  // Wait for initialization to complete
  async waitForInitialization() {
    if (this.initializationPromise) {
      await this.initializationPromise;
    }
    return this.connectionStatus;
  }
}

// Create singleton instance
const web3Service = new Web3Service();

// Export functions for backward compatibility
export const web3 = web3Service.web3;
export const getContract = (name) => web3Service.getContract(name);
export const getWsContract = (name) => web3Service.getWsContract(name);
export const connectWallet = () => web3Service.connectWallet();
export const sendTransaction = (contractName, methodName, params, options) => 
  web3Service.sendTransaction(contractName, methodName, params, options);
export const callContract = (contractName, methodName, params, options) => 
  web3Service.callContract(contractName, methodName, params, options);
export const listenToEvent = (contractName, eventName, callback, options) => 
  web3Service.listenToEvent(contractName, eventName, callback, options);
export const getPastEvents = (contractName, eventName, options) => 
  web3Service.getPastEvents(contractName, eventName, options);
export const contractExists = (contractName) => web3Service.contractExists(contractName);
export const getNetworkInfo = () => web3Service.getNetworkInfo();
export const getConnectionStatus = () => web3Service.getConnectionStatus();
export const waitForInitialization = () => web3Service.waitForInitialization();

// Export the service instance for advanced usage
export { web3Service };

// Legacy function for backward compatibility
export const getAllVerifiedCertificateDetails = async () => {
  try {
    const certificateContract = getContract("certificateManagement");
    return await callContract("certificateManagement", "getAllVerificationRequestDetails");
  } catch (error) {
    console.error("❌ Error getting verified certificate details:", error);
    return [];
  }
};