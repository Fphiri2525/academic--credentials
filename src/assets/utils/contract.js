import Web3 from "web3";
import { contractAbi } from "../../config";
import { address } from "../../config";

// Initialize Web3 with Ganache (local development) or MetaMask provider if available
const web3 = new Web3(Web3.givenProvider || "http://127.0.0.1:7545");

// Access the ABI and contract address
const abi = contractAbi;
const contractAddress = address;

// Debugging: Ensure ABI is valid
if (!Array.isArray(abi)) {
  console.error("Invalid ABI:", abi);
  throw new Error("The ABI must be an array.");
}

// Debugging: Ensure the contract address is valid
if (!contractAddress) {
  console.error("Contract address is not defined. Please verify your deployment.");
  throw new Error("The contract address is missing.");
}

// Initialize the contract instance
let contractInstance;
try {
  contractInstance = new web3.eth.Contract(abi, contractAddress);
  console.log("Contract initialized successfully.");
} catch (error) {
  console.error("Error initializing the contract instance:", error);
  throw new Error("Failed to initialize the contract.");
}

function handleAccountVerification(accounts) {
  const account = accounts[0];
  const balance = web3.eth.getBalance(account);
  console.log('Account balance:', web3.utils.fromWei(balance, 'ether'), 'ETH');
  if (!userAccount) {
      console.error('userAccount is not defined');
      return;
  }
  if (account.toLowerCase() !== userAccount.toLowerCase()) {
      console.error('Mismatch between MetaMask account and sender account');
      return;
  }
  console.log('Account verified successfully!');
 

}


// Ensure the sender account matches MetaMask's connected account



// Debugging: Check if contract methods exist
if (Object.keys(contractInstance.methods).length === 0) {
  console.error("No methods available in the contract. Check the ABI or contract deployment.");
}

// Export the contract instance for use elsewhere
export default contractInstance;
