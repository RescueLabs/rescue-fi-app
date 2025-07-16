# Rescue.fi Backend

This backend handles the EIP 7702 wallet rescue process for compromised wallets. It provides three main endpoints for gas payment processing, user details retrieval, and rescue execution.

## Features

- **Multi-chain Support**: Supports Ethereum Mainnet, Arbitrum, BSC, Base, and Optimism (and their testnet equivalents)
- **Gas Payment Processing**: Automatically scans blocks for gas payments to the backend wallet
- **EIP 7702 Integration**: Handles account upgrades and token rescue using the Rescurooor contract
- **Database Management**: Tracks gas payments, rescue transactions, and user statistics
- **Environment-based Configuration**: Separate databases and networks for test and production modes
- **ETH-based Gas Tracking**: All gas calculations are done in ETH values, not gas units

## API Endpoints

### 1. POST /api/updateGasTransactions
Updates gas transactions by scanning all supported chains for payments to the backend wallet.

**Process:**
1. Scans new blocks for transactions to backend wallet
2. Fetches transaction details from blockchain for accuracy
3. Extracts compromised address from transaction data
4. Records valid gas payments in database
5. Updates last processed block

**Response:**
```json
{
  "success": true,
  "data": {
    "processed": 5,
    "errors": []
  }
}
```

### 2. GET /api/user/{address}
Returns user details for a specific compromised address.

**Response:**
```json
{
  "success": true,
  "data": {
    "compromised_address": "0x...",
    "gas_payments": [
      {
        "id": "uuid",
        "gas_transaction_hash": "0x...",
        "eth_paid": "0.1",
        "chain_id": 1,
        "block_number": 123456,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "rescue_transactions": [
      {
        "id": "uuid",
        "rescue_transaction_hash": "0x...",
        "eth_used": "0.05",
        "tokens": ["0x...", "0x..."],
        "receiver_address": "0x...",
        "chain_id": 1,
        "deadline": 1234567890,
        "rescue_count": 1,
        "status": "success"
      }
    ],
    "total_eth_paid": "0.1",
    "total_eth_used": "0.05",
    "remaining_eth": "0.05",
    "rescue_count": 1
  }
}
```

### 3. POST /api/rescue
Executes the rescue process for a compromised wallet.

**Request Body:**
```json
{
  "authorization": "0x...", // EIP 7702 authorization in RSV format
  "eip712Signature": "0x...", // EIP 712 signature for rescue
  "tokens": ["0x...", "0x..."], // Array of token addresses to rescue
  "deadline": 1234567890, // Unix timestamp deadline
  "receiverWallet": "0x...", // Address to receive rescued tokens
  "gasTransactionHash": "0x...", // Hash of gas payment transaction
  "compromisedAddress": "0x...", // Compromised wallet address
  "chainId": 1, // Chain ID for the rescue
  "nonce": 0 // Nonce for the authorization
}
```

**Process:**
1. Validates all input parameters including nonce
2. **Gas Payment Verification**: 
   - First checks if gas payment exists in database
   - If not found, updates gas payments for the specific chain to latest block
   - Checks database again after update
   - Returns 404 if still not found
3. Verifies gas payment matches compromised address
4. Calculates remaining gas balance (in ETH)
5. Parses RSV authorization and creates authorization list with nonce, chainId, contractAddress, r, s, yparity
6. Estimates gas for rescue transaction and converts to ETH value
7. Creates rescue transaction record with pending status
8. Executes EIP 7702 upgrade and token rescue to compromised address
9. Records transaction hash, gas used, ETH used, and status

**Response:**
```json
{
  "success": true,
  "data": {
    "rescueTransactionHash": "0x...",
    "gasUsed": "0.02",
    "remainingEth": "0.03",
    "status": "success"
  }
}
```

**Error Response (Gas Payment Not Found):**
```json
{
  "success": false,
  "error": "Gas payment not found",
  "details": "Transaction hash 0x... not found in database or blockchain"
}
```

## Environment Variables

### Required Variables

```env
# Backend Configuration
BACKEND_PRIVATE_KEY=0x... # Private key for the backend wallet
BACKEND_WALLET_ADDRESS=0x... # Address of the backend wallet

# Supabase Configuration (Production)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Supabase Configuration (Test)
SUPABASE_TEST_URL=https://your-test-project.supabase.co
SUPABASE_TEST_ANON_KEY=your-test-anon-key

# RPC URLs (Optional - defaults provided)
ETHEREUM_RPC_URL=https://ethereum-rpc.publicnode.com
ARBITRUM_RPC_URL=https://arbitrum-one.publicnode.com
BSC_RPC_URL=https://bsc-dataseed1.binance.org
BASE_RPC_URL=https://mainnet.base.org
OPTIMISM_RPC_URL=https://mainnet.optimism.io

# Testnet RPC URLs (Optional - defaults provided)
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
ARBITRUM_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
OPTIMISM_SEPOLIA_RPC_URL=https://sepolia.optimism.io
```

## Database Schema

### Tables Required

1. **gas_payments**
   - id (uuid, primary key)
   - compromised_address (text)
   - gas_transaction_hash (text)
   - eth_paid (text) - ETH value paid
   - chain_id (integer)
   - block_number (integer)
   - created_at (timestamp)

2. **rescue_transactions**
   - id (uuid, primary key)
   - compromised_address (text)
   - receiver_address (text)
   - tokens (text[])
   - gas_transaction_hash (text)
   - rescue_transaction_hash (text)
   - gas_used (text) - Gas units used
   - eth_used (text) - ETH value used for gas
   - chain_id (integer)
   - deadline (bigint)
   - created_at (timestamp)
   - rescue_count (integer)
   - status (text) - 'pending', 'success', or 'failed'

3. **last_blocks**
   - id (uuid, primary key)
   - chain_id (integer)
   - last_block (bigint)
   - updated_at (timestamp)

**Note**: Since we use separate Supabase databases for production and test environments, there's no need for mode columns in the tables.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Configure Environment Variables**
   Create a `.env.local` file with the required environment variables.

3. **Set Up Supabase**
   - Create two Supabase projects (one for test, one for production)
   - Create the required tables with the schema above
   - Add the environment variables for both projects

4. **Fund Backend Wallet**
   - Ensure the backend wallet has sufficient funds on all networks for gas fees

## Usage

### Gas Payment Processing
The `/api/updateGasTransactions` endpoint should be called periodically (e.g., every 5 minutes) to scan for new gas payments.

### Rescue Process
1. User pays ETH to backend wallet with compromised address in transaction data
2. Backend processes gas payment via `/api/updateGasTransactions`
3. Frontend calls `/api/rescue` with authorization and signature
4. Backend executes EIP 7702 upgrade and token rescue to compromised address
5. Transaction details are recorded in database with status

## Key Changes from Previous Version

1. **ETH-based Gas Tracking**: All gas calculations now use ETH values instead of gas units
2. **Transaction Status Tracking**: Rescue transactions now track status (pending/success/failed)
3. **Blockchain Verification**: Gas payments are fetched from blockchain before database storage
4. **Proper Gas Estimation**: Gas estimation now encodes function data and includes authorization
5. **Direct Transaction to Compromised Address**: Rescue transactions are sent directly to the compromised wallet address
6. **Enhanced Error Handling**: Better error handling and status tracking throughout the process

## Security Considerations

- Private keys are never sent to the backend
- All signatures are verified on-chain
- Gas payments are validated before processing
- Separate databases for test and production environments
- Input validation on all endpoints
- Transaction status tracking for audit trails

## Error Handling

The API returns consistent error responses:
```json
{
  "success": false,
  "error": "Error description",
  "details": "Additional error details"
}
```

Common error scenarios:
- Invalid address format
- Missing required fields
- Gas payment not found
- Insufficient gas for rescue (in ETH)
- Transaction execution failure 