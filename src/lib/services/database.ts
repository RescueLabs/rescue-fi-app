import { supabase } from '../config/supabase';

import type {
  GasPayment,
  RescueTransaction,
  UserDetails,
  LastBlockRecord,
} from '../types/rescue';

export class DatabaseService {
  // Gas Payment Operations
  static async createGasPayment(
    data: Omit<GasPayment, 'id' | 'created_at'>,
  ): Promise<GasPayment> {
    const { data: payment, error } = await supabase
      .from('gas_payments')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return payment;
  }

  static async getGasPaymentsByAddress(address: string): Promise<GasPayment[]> {
    const { data: payments, error } = await supabase
      .from('gas_payments')
      .select('*')
      .eq('compromised_address', address.toLowerCase());

    if (error) throw error;
    return payments || [];
  }

  static async getGasPaymentByHash(hash: string): Promise<GasPayment | null> {
    const { data: payment, error } = await supabase
      .from('gas_payments')
      .select('*')
      .eq('gas_transaction_hash', hash)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return payment;
  }

  // Rescue Transaction Operations
  static async createRescueTransaction(
    data: Omit<RescueTransaction, 'id' | 'created_at'>,
  ): Promise<RescueTransaction> {
    const { data: transaction, error } = await supabase
      .from('rescue_transactions')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return transaction;
  }

  static async getRescueTransactionsByAddress(
    address: string,
  ): Promise<RescueTransaction[]> {
    const { data: transactions, error } = await supabase
      .from('rescue_transactions')
      .select('*')
      .eq('compromised_address', address.toLowerCase());

    if (error) throw error;
    return transactions || [];
  }

  static async updateRescueTransaction(
    id: string,
    updates: Partial<
      Pick<
        RescueTransaction,
        'rescue_transaction_hash' | 'gas_used' | 'eth_used' | 'status'
      >
    >,
  ): Promise<RescueTransaction> {
    const { data: transaction, error } = await supabase
      .from('rescue_transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return transaction;
  }

  // Last Block Operations
  static async getLastBlock(chainId: number): Promise<LastBlockRecord | null> {
    const { data: record, error } = await supabase
      .from('last_blocks')
      .select('*')
      .eq('chain_id', chainId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return record;
  }

  static async updateLastBlock(
    chainId: number,
    lastBlock: number,
  ): Promise<LastBlockRecord> {
    const { data: record, error } = await supabase
      .from('last_blocks')
      .upsert({
        chain_id: chainId,
        last_block: lastBlock,
      })
      .select()
      .single();

    if (error) throw error;
    return record;
  }

  // User Details
  static async getUserDetails(address: string): Promise<UserDetails> {
    const normalizedAddress = address.toLowerCase();

    // Get gas payments
    const gasPayments =
      await DatabaseService.getGasPaymentsByAddress(normalizedAddress);

    // Get rescue transactions
    const rescueTransactions =
      await DatabaseService.getRescueTransactionsByAddress(normalizedAddress);

    // Calculate totals
    const totalEthPaid = gasPayments.reduce((sum, payment) => {
      return sum + BigInt(payment.eth_paid);
    }, BigInt(0));

    const totalEthUsed = rescueTransactions.reduce((sum, transaction) => {
      return sum + BigInt(transaction.eth_used);
    }, BigInt(0));

    const remainingEth = totalEthPaid - totalEthUsed;

    // Get rescue count
    const rescueCount = rescueTransactions.length;

    return {
      compromised_address: normalizedAddress,
      gas_payments: gasPayments,
      rescue_transactions: rescueTransactions,
      total_eth_paid: totalEthPaid.toString(),
      total_eth_used: totalEthUsed.toString(),
      remaining_eth: remainingEth.toString(),
      rescue_count: rescueCount,
    };
  }

  // Check if gas payment exists
  static async gasPaymentExists(hash: string): Promise<boolean> {
    const payment = await DatabaseService.getGasPaymentByHash(hash);
    return payment !== null;
  }
}

export const databaseService = new DatabaseService();
