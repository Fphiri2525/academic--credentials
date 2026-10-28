# Network/RPC Troubleshooting Guide

## Current Issue
The JSON-RPC error is now affecting all transactions, including the previously working direct test. This indicates a network-level issue rather than a code problem.

## Immediate Actions to Try

### 1. **Check Network Status**
Click the **"Check Contract"** button to see:
- Current network chain ID
- Connected account
- Account balance
- Contract accessibility

### 2. **Reset MetaMask**
1. Open MetaMask
2. Go to Settings → Advanced
3. Click "Reset Account"
4. This clears transaction history and resets nonce

### 3. **Switch RPC Endpoint**
1. Open MetaMask
2. Go to Settings → Networks
3. Edit your current network
4. Try a different RPC URL:

**For Ethereum Mainnet:**
- `https://mainnet.infura.io/v3/YOUR_PROJECT_ID`
- `https://eth-mainnet.alchemyapi.io/v2/YOUR_API_KEY`
- `https://rpc.ankr.com/eth`

**For Polygon:**
- `https://polygon-rpc.com/`
- `https://rpc-mainnet.matic.network`
- `https://rpc.ankr.com/polygon`

**For BSC:**
- `https://bsc-dataseed.binance.org/`
- `https://rpc.ankr.com/bsc`

### 4. **Check Gas Settings**
Try the **"Minimal Test"** button which uses:
- Lower gas limit (500,000)
- Lower gas price (10 gwei)

## Common Causes & Solutions

### Cause 1: Network Congestion
**Symptoms:** All transactions fail with JSON-RPC error
**Solutions:**
- Wait 10-30 minutes and try again
- Increase gas price to 30+ gwei
- Try during off-peak hours (early morning/late night)

### Cause 2: RPC Node Issues
**Symptoms:** Intermittent failures, some calls work, others don't
**Solutions:**
- Switch to different RPC endpoint
- Use premium RPC services (Infura, Alchemy)
- Try multiple RPC endpoints

### Cause 3: MetaMask Issues
**Symptoms:** Nonce errors, transaction stuck
**Solutions:**
- Reset MetaMask account
- Clear browser cache
- Restart browser
- Update MetaMask extension

### Cause 4: Network Mismatch
**Symptoms:** Contract not found, wrong chain
**Solutions:**
- Verify you're on the correct network
- Check contract address is deployed on current network
- Switch to correct network in MetaMask

## Step-by-Step Debugging

### Step 1: Network Verification
1. Click **"Check Contract"** button
2. Look for these in console:
   ```
   🌐 Network Chain ID: 0x1 (Ethereum) or 0x89 (Polygon)
   👤 Connected Account: 0x...
   💰 Account Balance: (should be > 0)
   ✅ Contract read successful
   ```

### Step 2: RPC Endpoint Test
1. Open MetaMask → Settings → Networks
2. Note current RPC URL
3. Try switching to different RPC
4. Test again with **"Minimal Test"**

### Step 3: Gas Price Analysis
1. Check current network gas prices:
   - Ethereum: https://etherscan.io/gastracker
   - Polygon: https://polygonscan.com/gastracker
   - BSC: https://bscscan.com/gastracker
2. Use recommended gas prices

### Step 4: Account Reset
1. MetaMask → Settings → Advanced → Reset Account
2. Refresh browser page
3. Reconnect wallet
4. Try **"Minimal Test"**

## Emergency Solutions

### Solution 1: Use Different Browser
1. Try Chrome/Firefox/Edge
2. Install fresh MetaMask
3. Import your wallet
4. Test transaction

### Solution 2: Use Different Device
1. Try on mobile with MetaMask mobile app
2. Or different computer
3. Same wallet, different environment

### Solution 3: Wait and Retry
1. Network congestion often resolves in 30-60 minutes
2. Try during different time zones
3. Monitor network status websites

## Network-Specific Troubleshooting

### Ethereum Mainnet
- High gas fees during congestion
- Use 30+ gwei during peak times
- Consider Layer 2 solutions

### Polygon
- Usually faster and cheaper
- Occasional RPC issues
- Try official Polygon RPC

### BSC
- Fast but can have RPC instability
- Use official Binance RPC
- Check BSC network status

## Advanced Debugging

### Check Browser Console
Look for specific patterns:
```
- "nonce too low" → Reset MetaMask
- "insufficient funds" → Add more native token
- "execution reverted" → Contract issue
- "timeout" → Network congestion
- "Internal JSON-RPC error" → RPC node issue
```

### Test with Web3 Directly
Open browser console and test:
```javascript
// Check if Web3 is available
console.log(window.ethereum);

// Check network
await window.ethereum.request({ method: 'eth_chainId' });

// Check balance
await window.ethereum.request({
  method: 'eth_getBalance',
  params: [YOUR_ADDRESS, 'latest']
});
```

## When to Contact Support

Contact if you've tried:
1. ✅ Reset MetaMask account
2. ✅ Switched RPC endpoints
3. ✅ Tried different gas settings
4. ✅ Waited for network congestion to clear
5. ✅ Tested on different browser/device

Provide:
- Network you're using
- RPC endpoint
- Gas settings tried
- Console error messages
- Time when it last worked

## Quick Recovery Checklist

- [ ] Reset MetaMask account
- [ ] Switch to different RPC endpoint
- [ ] Clear browser cache
- [ ] Try minimal gas settings
- [ ] Wait 30 minutes for network congestion
- [ ] Test on different browser
- [ ] Check network status websites
- [ ] Verify sufficient balance for gas
