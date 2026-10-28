# Student Smart Contract Integration

## Overview
The Student.jsx component now integrates with the smart contract to retrieve student details when tertiary education level is selected.

## Smart Contract Function Used
- **Function**: `getStudentDetailsByRegAndYear`
- **Contract**: `certificateManagement`
- **Parameters**: 
  - `_registrationNumber` (string)
  - `_award` (string) 
  - `_yearOfGraduation` (string)
- **Returns**:
  - `universityName` (string)
  - `studentName` (string)
  - `programOfStudy` (string)
  - `award` (string)
  - `yearOfGraduation` (string)
  - `registrationNumber` (string)
  - `dateApproved` (string)

## Implementation Details

### 1. Smart Contract Integration
```javascript
// Function calls the smart contract
const getStudentDetailsByRegAndYear = async (registrationNumber, award, yearOfGraduation) => {
  const certificateContract = getContract('certificateManagement');
  const result = await certificateContract.methods
    .getStudentDetailsByRegAndYear(registrationNumber, award, yearOfGraduation)
    .call();
  // Returns formatted student data
}
```

### 2. Form Validation
- Registration number must be at least 3 characters
- Year must be exactly 4 digits
- All fields required for tertiary education

### 3. User Experience Improvements
- Loading states during blockchain calls
- Detailed error messages
- Success/error message auto-clear
- Form validation feedback

## Testing Instructions

### Prerequisites
1. MetaMask installed and connected
2. Contract deployed on current network
3. Student data exists in the contract

### Test Steps
1. **Navigate to Student Portal**
   - Open the student page
   - Click "Request Certificate Verification"

2. **Select Tertiary Education**
   - Choose "Tertiary Level" from dropdown
   - Fill in the form:
     - Award: Select from dropdown (diploma, degree, masters, phd)
     - Year of Graduation: Enter 4-digit year (e.g., 2023)
     - Registration Number: Enter student's registration number

3. **Submit Form**
   - Click "Submit" button
   - Watch for loading state: "Retrieving Data..."
   - Check browser console for debug logs

4. **Expected Results**
   - Success: Student details displayed
   - Error: User-friendly error message shown

### Debug Information
Check browser console for these logs:
- `🔍 Calling smart contract with:` - Shows input parameters
- `✅ Smart contract result:` - Shows raw contract response
- `📋 Formatted student data:` - Shows processed data
- `🎓 Tertiary education selected` - Confirms tertiary path taken

### Common Error Messages
1. **"Student record not found"** - No matching record in contract
2. **"Network error"** - Connection issues
3. **"Please fill in all fields"** - Form validation failed
4. **"Registration number must be at least 3 characters"** - Validation error
5. **"Please enter a valid 4-digit year"** - Year format error

## Browser Console Testing
```javascript
// Test contract connection
const contract = getContract('certificateManagement');
console.log('Contract address:', contract.options.address);

// Test method call directly
contract.methods.getStudentDetailsByRegAndYear('REG123', 'degree', '2023').call()
  .then(result => console.log('Direct call result:', result))
  .catch(error => console.log('Direct call error:', error));
```

## Error Handling
The implementation includes comprehensive error handling:
- Contract revert errors → "Student record not found"
- Parameter decoding errors → "No matching student record found"
- Network errors → "Network error. Please check connection"
- Generic errors → Original error message displayed

## Data Flow
1. User selects "Tertiary Level"
2. User fills Award, Year, Registration Number
3. Form validates input
4. Smart contract called with parameters
5. Result processed and formatted
6. Student details displayed or error shown

## Next Steps
1. Test with actual student data in the contract
2. Verify error handling with invalid data
3. Test network switching scenarios
4. Add more detailed logging if needed
