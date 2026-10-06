import { ApiError } from '../middleware/errorHandler.js';

// Executes approved actions inside Guidia's practice simulations. It moves
// pretend money between pretend balances and nothing else — there is no
// code path from here to a real payment provider. Real integrations would
// be separate adapters (PaymentAdapter, BookingAdapter, …) behind the same
// `execute(tx, proposal)` contract.

export const STARTING_BALANCE_MINOR = { BDT: 2_500_000, INR: 2_500_000, VND: 5_000_000, USD: 50_000 };

export async function ensureSimulationAccount(tx, userId, applicationSlug, currency) {
  return tx.simulationAccount.upsert({
    where: { userId_applicationSlug: { userId, applicationSlug } },
    create: { userId, applicationSlug, currency, balanceMinor: STARTING_BALANCE_MINOR[currency] ?? 50_000 },
    update: {},
  });
}

export const simulationExecutor = {
  name: 'simulation',

  async execute(tx, proposal) {
    if (!proposal.isSimulation) {
      throw new ApiError(501, 'Guidia only carries out practice actions. Real payments happen in the official app.', 'REAL_EXECUTION_UNSUPPORTED');
    }
    if (proposal.amountMinor == null || !proposal.currency) {
      return { transactionId: null };
    }
    const account = await ensureSimulationAccount(tx, proposal.userId, proposal.applicationSlug, proposal.currency);
    // Conditional debit — balance can't go negative even under races.
    const { count } = await tx.simulationAccount.updateMany({
      where: { id: account.id, balanceMinor: { gte: proposal.amountMinor } },
      data: { balanceMinor: { decrement: proposal.amountMinor } },
    });
    if (count !== 1) throw new ApiError(409, 'There is not enough practice money in this account.', 'INSUFFICIENT_PRACTICE_BALANCE');

    const transaction = await tx.simulationTransaction.create({
      data: {
        accountId: account.id,
        actionProposalId: proposal.id, // unique → a proposal can only execute once
        direction: 'DEBIT',
        amountMinor: proposal.amountMinor,
        currency: proposal.currency,
        counterpartyLabel: proposal.payload?.recipientLabel || 'Recipient',
      },
    });
    return { transactionId: transaction.id };
  },
};
