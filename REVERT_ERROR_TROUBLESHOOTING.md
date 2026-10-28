# ContractExecutionError: Revert Error Troubleshooting Guide

## Understanding the Error

```
ContractExecutionError: Error happened while trying to execute a function inside a smart contract
...
RuntimeError: VM Exception while processing transaction: revert
```

This error occurs when the **smart contract function rejects the transaction** by executing a `revert` statement. This is intentional behavior to prevent invalid operations.

## Common Causes

### 1. **Missing or Invalid Data**
The contract may have `require()` statements checking for:
- Non-empty strings
- Valid addresses
- Non-duplicate entries
- Specific data formats

**Solution**: Check that all form fields are properly filled with valid data.

### 2. **Duplicate Verification Request**
The contract may prevent adding the same verification request twice.

**Solution**: 
- Use different data each time
- Check if the verification request already exists
- Use different registration number or student name

### 3. **Access Control / Authorization**
The contract may only allow:
- Specific roles (admin, employer, etc.)
- The contract owner
- Specific callers

**Solution**:
- Verify you're logged in with the correct account
- Check that your account has the necessary permissions
- Look for `onlyOwner` or `onlyRole()` modifiers in the contract

### 4. **State Issues**
The contract state might prevent the operation:
- Certificate might not exist yet
- Student might not be registered
- Previous transaction not confirmed

**Solution**:
- Ensure the certificate/student is registered first
- Wait for previous transactions to confirm
- Refresh the page and try again

## Debugging Steps

### Step 1: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for detailed error messages with 🔍 symbols
4. Check the "Sanitized parameters" log to see exactly what's being sent

### Step 2: Verify Form Data
The system now logs all parameters before sending. Check console for:
```
📊 Sanitized parameters:
  - universityName: "..."
  - studentName: "..."
  - programOfStudy: "..."
  - yearOfGraduation: "..."
  - registrationNumber: "..."
  - award: "..."
```

**Ensure**:
- All fields have values (not empty)
- No extra whitespace
- Correct spelling and format
- All fields are strings

### Step 3: Test with Simple Data
1. Try submitting with minimal, simple data
2. Use single character names if allowed
3. Use a simple year like "2023"
4. This helps isolate which field is causing issues

### Step 4: Check Account & Network
In browser console, run:
```javascript
// Check current account
web3.eth.getAccounts().then(accounts => {
  console.log('Current account:', accounts[0]);
  console.log('Account balance:', web3.eth.getBalance(accounts[0]));
});

// Check network
web3.eth.getChainId().then(chainId => {
  console.log('Chain ID:', chainId);
  console.log('Expected: 1337 (Ganache) or 11155111 (Sepolia)');
});
```

## Solutions to Try

### Fix 1: Increase Gas
The error might be hidden by low gas. Try with more gas:
- Current setting: 600000 gas for addVerificationRequest
- Try: 1000000 gas

### Fix 2: Clear and Retry
1. Clear browser cache (Ctrl+Shift+Delete)
2. Refresh page
3. Try again with fresh data

### Fix 3: Reset Account (MetaMask)
If using MetaMask:
1. Settings → Advanced → Reset Account
2. This clears transaction history
3. Try the transaction again

### Fix 4: Use Different Data
If you suspect a duplicate, try:
- Different student name
- Different registration number
- Different year

### Fix 5: Check Contract State
Run this in console to see if data exists:
```javascript
// Example - adjust based on your contract
const contract = getContract('certificateManagement');
contract.methods.getVerificationRequests().call()
  .then(data => console.log('Existing requests:', data))
  .catch(err => console.error('Error:', err));
```

## Advanced Debugging

### Enable Detailed Logging
Open browser console and search for these log entries when the error occurs:

1. **Data Validation Logs**:
   ```
   ❌ Validation failed: [error details]
   ```
   Fix the validation errors shown.

2. **Parameter Sanitization**:
   ```
   📊 Sanitized parameters: {...}
   ```
   Verify all parameters are correct.

3. **Gas Estimation Error**:
   ```
   ❌ Gas estimation indicates contract will revert
   ```
   Check parameters - contract is rejecting them.

4. **Transaction Details**:
   ```
   🎯 Calling: contract.methods.addVerificationRequest(...)
   ```
   Verify method name and parameter count.

### Check Smart Contract Requirements

Ask your smart contract developer or check the contract ABI for `addVerificationRequest`:

The function requires 6 string parameters:
1. **universityName** - Name of the university
2. **studentName** - Name of the student
3. **programOfStudy** - Program/degree name
4. **yearOfGraduation** - Year as string (e.g., "2023")
5. **registrationNumber** - Student registration/ID
6. **award** - Award/degree type (e.g., "BSc", "MSc")

Check if your contract has additional requirements:
- Specific format for registration numbers
- Allowed characters in names
- Valid award types
- Duplicate prevention logic

## If Problem Persists

1. **Collect Diagnostic Info**:
   - Screenshot of console error
   - Console logs (Ctrl+C to copy console output)
   - Form data you were trying to submit
   - Network details (chain ID, account)

2. **Check Contract Deployment**:
   - Verify contract is deployed on current network
   - Check contract address matches config.js
   - Ensure contract has no errors

3. **Test with Different Scenario**:
   - Try QR code verification instead (if available)
   - Try adding via other methods if available
   - Test on different account if possible

4. **Review Smart Contract Code**:
   - Ask developer to check `addVerificationRequest` function
   - Look for `require()` statements
   - Check for access control modifiers
   - Verify validation logic

## Contact Support

If you've tried all these steps, provide:
1. Browser console error screenshot
2. The console logs (especially "Sanitized parameters")
3. The form data you tried to submit
4. Network and account information
5. Steps to reproduce

This will help identify if it's a data validation issue, access control problem, or contract bug.
