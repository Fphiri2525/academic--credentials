# JSON-RPC Error Resolution Guide

## Problem
You're encountering "Internal JSON-RPC error" when trying to add university graduates to the blockchain. This error typically occurs due to:

1. **Network congestion or RPC node issues**
2. **Invalid transaction parameters**
3. **Gas estimation failures**
4. **Data format issues**
5. **Nonce conflicts**

## Solutions Implemented

### 1. Enhanced Web3 Service (`web3service.js`)

#### ✅ **Retry Logic for JSON-RPC Errors**
```javascript
// Retry failed transactions up to 3 times with exponential backoff
for (let attempt = 1; attempt <= 3; attempt++) {
  try {
    const result = await contract.methods[methodName](...params).send(txParams);
    return result;
  } catch (attemptError) {
    if (attemptError.message.includes('Internal JSON-RPC error') && attempt < 3) {
      await this.delay(2000 * attempt); // Wait 2s, 4s, 6s
      continue;
    }
    throw attemptError;
  }
}
```

#### ✅ **Improved Gas Management**
```javascript
// EIP-1559 gas pricing with fallback
txParams.maxFeePerGas = '50000000000'; // 50 gwei
txParams.maxPriorityFeePerGas = '3000000000'; // 3 gwei
txParams.gas = 2000000; // Higher gas limit for batch operations
```

#### ✅ **Parameter Validation**
```javascript
// Validates addUniversityGraduates parameters before sending
validateGraduateParams(params) {
  // Checks all 6 required parameters
  // Validates array lengths match
  // Ensures no empty values
}
```

### 2. Enhanced Graduate Component (`Grsduate.jsx`)

#### ✅ **Better Error Handling**
```javascript
if (error.message.includes('Internal JSON-RPC error')) {
  errorMessage = 'Network error occurred. Please try again in a few moments.';
} else if (error.message.includes('Invalid parameters')) {
  errorMessage = 'Invalid data format - please check your Excel file structure';
}
```

#### ✅ **Data Validation & Cleaning**
```javascript
// Clean and validate data before sending
const validateAndCleanData = (graduates) => {
  return graduates.map(grad => ({
    studentName: String(grad.studentName || '').trim(),
    registrationNumber: String(grad.registrationNumber || '').trim(),
    // ... other fields
  })).filter(grad => 
    grad.studentName && grad.registrationNumber // Remove empty entries
  );
};
```

#### ✅ **Enhanced Debugging**
```javascript
console.log('Sample data preview:', {
  firstStudent: graduateData.studentNames[0],
  firstRegNumber: graduateData.registrationNumbers[0],
  university: graduateData.universityName,
  program: graduateData.programOfStudy
});
```

## Troubleshooting Steps

### Step 1: Check Your Data
1. **Excel File Format**: Ensure your Excel file has the correct columns:
   - Student Name
   - Registration Number
   - Program of Study
   - Award
   - Year of Graduation

2. **Data Quality**: 
   - No empty cells
   - No special characters in registration numbers
   - Consistent data format

### Step 2: Network Issues
1. **Check MetaMask Network**: Ensure you're connected to the correct network
2. **Reset MetaMask**: Account Settings → Advanced → Reset Account (if nonce issues)
3. **Try Different RPC**: Switch to a different RPC endpoint if available

### Step 3: Gas Settings
1. **Increase Gas Limit**: Try 3,000,000 or higher for large batches
2. **Increase Gas Price**: Use 50+ gwei during network congestion
3. **Reduce Batch Size**: Try adding fewer graduates at once

### Step 4: Transaction Timing
1. **Wait for Network**: Try during off-peak hours
2. **Check Pending Transactions**: Ensure no pending transactions in MetaMask
3. **Refresh Page**: Clear any cached state

## Quick Fixes to Try

### Fix 1: Reduce Batch Size
If adding many graduates, try smaller batches (10-20 at a time).

### Fix 2: Increase Gas
```javascript
await addUniversityGraduates(graduateData, { 
  gas: 3000000,
  maxFeePerGas: '60000000000', // 60 gwei
  maxPriorityFeePerGas: '5000000000' // 5 gwei
});
```

### Fix 3: Reset MetaMask
1. MetaMask → Settings → Advanced → Reset Account
2. This clears transaction history and resets nonce

### Fix 4: Check Data Format
Ensure your Excel data matches this structure:
```
| Student Name | Registration Number | Program | Award | Year |
|-------------|-------------------|---------|-------|------|
| John Doe    | REG001           | CS      | BSc   | 2023 |
```

## Error Messages Explained

- **"Internal JSON-RPC error"**: Network/RPC node issue - retry or change network
- **"Gas required exceeds allowance"**: Increase gas limit
- **"Execution reverted"**: Smart contract rejected data - check parameters
- **"Nonce too low"**: Reset MetaMask account
- **"Insufficient funds"**: Add more ETH to wallet

## Contact Support
If issues persist after trying these solutions:
1. Check browser console for detailed error logs
2. Verify smart contract is deployed and accessible
3. Test with a single graduate first
4. Consider using a different RPC endpoint
