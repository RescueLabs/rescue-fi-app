# Rescue.fi Backend Implementation

## Overview

This backend implementation provides a complete solution for rescuing funds from compromised wallets using EIP 7702. The system supports multiple chains, handles gas payments, and executes rescue transactions securely.

## Architecture

### Core Components

1. **Configuration Layer** (`src/lib/config/`)
   - `networks.ts`: Multi-chain network configuration
   - `supabase.ts`: Database configuration with test/production modes

2. **Services Layer** (`src/lib/services/`)
   - `web3.ts`: Blockchain interactions using viem
   - `database.ts`: Supabase database operations
   - `gasPaymentService.ts`: Gas payment processing and block scanning

3. **API Endpoints** (`src/app/api/`)
   - `/updateGasTransactions`: Processes gas payments from all chains
   - `/user/{address}`: Retrieves user details and transaction history
   - `/rescue`: Executes EIP 7702 upgrade and token rescue

4. **Types** (`src/lib/types/`)
   - `rescue.ts`: TypeScript interfaces for all data structures

## Key Features

### Multi-Chain Support
- **Production**: Ethereum Mainnet, Arbitrum, BSC, Base, Optimism
- **Test**: Sepolia, Arbitrum Sepolia, BSC Testnet, Base Sepolia, Optimism Sepolia

### Gas Payment Processing
- Automatic block scanning across all supported chains
- Transaction validation and gas payment recording
- Incremental processing with last block tracking

### EIP 7702 Integration
- Account upgrade using authorization signatures
- Token rescue via Rescurooor contract
- Gas estimation and validation

### Database Management
- Separate databases for test and production environments
- Comprehensive transaction tracking
- User statistics and gas balance management

## API Endpoints

### 1. POST /api/updateGasTransactions
Scans all supported chains for gas payments to the backend wallet.

**Process:**
1. Retrieves last processed block for each chain
2. Scans new blocks for transactions to backend wallet
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
Returns comprehensive user details for a compromised address.

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
        "gas_used": "0.05",
        "tokens": ["0x...", "0x..."],
        "receiver_address": "0x...",
        "chain_id": 1,
        "deadline": 1234567890,
        "rescue_count": 1
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
Executes the complete rescue process for a compromised wallet.

**Request Body:**
```json
{
  "authorization": "0x...", // EIP 7702 authorization in RSV format (65 bytes)
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

**Authorization Format:**
The authorization is parsed from RSV format and converted to:
```json
{
  "nonce": 0,
  "chainId": 1,
  "contractAddress": "0x...", // Rescurooor contract address
  "r": "0x...", // 32-byte r value
  "s": "0x...", // 32-byte s value
  "yParity": 0 // 0 or 1 (derived from v value)
}
```

**Process:**
1. Validates all input parameters including nonce
2. Verifies gas payment exists and matches compromised address
3. Calculates remaining gas balance
4. Parses RSV authorization and creates authorization list
5. Estimates gas for rescue transaction
6. Creates rescue transaction record
7. Executes EIP 7702 upgrade and token rescue
8. Records transaction hash and gas used

**Response:**
```json
{
  "success": true,
  "data": {
    "rescueTransactionHash": "0x...",
    "gasUsed": "0.02",
    "remainingEth": "0.03"
  }
}
```

## Database Schema

### Tables

1. **gas_payments**
   - Tracks all gas payments made to backend wallet
   - Links payments to compromised addresses
   - Stores transaction details and chain information

2. **rescue_transactions**
   - Records all rescue attempts and their outcomes
   - Tracks gas usage and token transfers
   - Maintains rescue count per user

3. **last_blocks**
   - Tracks last processed block for each chain
   - Enables incremental block processing
   - Separates test and production data

### Views

- **user_summary**: Aggregated user statistics and gas balances

## Security Features

### Input Validation
- Address format validation using regex
- Required field validation
- Array and data type validation

### Gas Management
- Gas estimation before transaction execution
- Buffer calculation (20% extra)
- Insufficient gas error handling

### Transaction Security
- Gas payment verification
- Address matching validation
- Transaction receipt confirmation

### Database Security
- Row Level Security (RLS) enabled
- Service role access policies
- Separate test/production environments

## Environment Configuration

### Required Variables
```env
# Backend Configuration
BACKEND_PRIVATE_KEY=0x... # Private key for backend wallet
BACKEND_WALLET_ADDRESS=0x... # Backend wallet address
RESCUROOOR_CONTRACT_ADDRESS=0x... # Rescurooor contract address

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_TEST_URL=https://your-test-project.supabase.co
SUPABASE_TEST_ANON_KEY=your-test-anon-key

# Environment Mode
NODE_ENV=development # or production
```

### Optional RPC URLs
Default RPC URLs are provided for all supported networks, but custom URLs can be configured via environment variables.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Set Up Supabase**
   - Create two Supabase projects (test and production)
   - Run the SQL schema from `database-schema.sql`
   - Configure environment variables

3. **Deploy Rescurooor Contract**
   - Deploy to all supported networks
   - Add contract addresses to environment variables

4. **Fund Backend Wallet**
   - Ensure sufficient funds for gas fees on all networks

5. **Configure Environment**
   - Copy `env.example` to `.env.local`
   - Fill in all required variables

## Usage Workflow

1. **Gas Payment Processing**
   - Call `/api/updateGasTransactions` periodically
   - System automatically scans and records gas payments

2. **User Details Retrieval**
   - Frontend calls `/api/user/{address}` to get user status
   - Displays gas balance and transaction history

3. **Rescue Execution**
   - Frontend collects user signatures and authorization
   - Calls `/api/rescue` with all required data
   - Backend executes rescue and returns results

## Error Handling

The API provides consistent error responses:
```json
{
  "success": false,
  "error": "Error description",
  "details": "Additional error details"
}
```

Common error scenarios are handled with appropriate HTTP status codes and descriptive messages.

## Monitoring and Logging

- Console logging for all major operations
- Error tracking and reporting
- Transaction status monitoring
- Gas usage tracking

## Future Enhancements

- Webhook notifications for transaction status
- Batch processing for multiple rescues
- Advanced gas optimization
- Real-time transaction monitoring
- Analytics and reporting dashboard 