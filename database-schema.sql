-- Database Schema for Rescue.fi Backend
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Gas Payments Table
CREATE TABLE IF NOT EXISTS gas_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    compromised_address TEXT NOT NULL,
    gas_transaction_hash TEXT NOT NULL UNIQUE,
    eth_paid TEXT NOT NULL, -- ETH value paid for gas
    chain_id INTEGER NOT NULL,
    block_number INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for better query performance
    INDEX idx_gas_payments_address (compromised_address),
    INDEX idx_gas_payments_hash (gas_transaction_hash),
    INDEX idx_gas_payments_chain (chain_id),
    INDEX idx_gas_payments_created (created_at)
);

-- Rescue Transactions Table
CREATE TABLE IF NOT EXISTS rescue_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    compromised_address TEXT NOT NULL,
    receiver_address TEXT NOT NULL,
    tokens TEXT[] NOT NULL,
    gas_transaction_hash TEXT NOT NULL,
    rescue_transaction_hash TEXT,
    gas_used TEXT DEFAULT '0', -- Gas units used
    eth_used TEXT DEFAULT '0', -- ETH value used for gas
    chain_id INTEGER NOT NULL,
    deadline BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    rescue_count INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
    
    -- Indexes for better query performance
    INDEX idx_rescue_address (compromised_address),
    INDEX idx_rescue_gas_hash (gas_transaction_hash),
    INDEX idx_rescue_chain (chain_id),
    INDEX idx_rescue_created (created_at),
    INDEX idx_rescue_status (status)
);

-- Last Blocks Table (for tracking processed blocks)
CREATE TABLE IF NOT EXISTS last_blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chain_id INTEGER NOT NULL UNIQUE,
    last_block BIGINT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for better query performance
    INDEX idx_last_blocks_chain (chain_id)
);

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE gas_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE rescue_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE last_blocks ENABLE ROW LEVEL SECURITY;

-- Create policies for service role access
-- Note: These policies allow full access to the service role
-- In production, you might want to restrict this further

-- Gas Payments Policies
CREATE POLICY "Service role can manage gas payments" ON gas_payments
    FOR ALL USING (auth.role() = 'service_role');

-- Rescue Transactions Policies
CREATE POLICY "Service role can manage rescue transactions" ON rescue_transactions
    FOR ALL USING (auth.role() = 'service_role');

-- Last Blocks Policies
CREATE POLICY "Service role can manage last blocks" ON last_blocks
    FOR ALL USING (auth.role() = 'service_role');

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for last_blocks table
CREATE TRIGGER update_last_blocks_updated_at 
    BEFORE UPDATE ON last_blocks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert initial last block records for all supported chains
-- Production chains
INSERT INTO last_blocks (chain_id, last_block) VALUES
    (1, 0),      -- Ethereum Mainnet
    (42161, 0),  -- Arbitrum
    (56, 0),     -- BSC
    (8453, 0),   -- Base
    (10, 0)      -- Optimism
ON CONFLICT (chain_id) DO NOTHING;

-- Create views for easier querying
CREATE OR REPLACE VIEW user_summary AS
SELECT 
    gp.compromised_address,
    COUNT(gp.id) as gas_payment_count,
    COUNT(rt.id) as rescue_count,
    SUM(CAST(gp.eth_paid AS NUMERIC)) as total_eth_paid,
    SUM(CAST(rt.eth_used AS NUMERIC)) as total_eth_used,
    (SUM(CAST(gp.eth_paid AS NUMERIC)) - SUM(CAST(rt.eth_used AS NUMERIC))) as remaining_eth
FROM gas_payments gp
LEFT JOIN rescue_transactions rt ON gp.compromised_address = rt.compromised_address
GROUP BY gp.compromised_address;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role; 