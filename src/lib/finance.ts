/**
 * Finance architecture for RiayahOS.
 *
 * Riayah Care receives quotations in OMR, AED, SAR, USD and other currencies,
 * but business reporting is primarily in INR. Every financial record stores
 * the original currency + amount, an exchange rate snapshot, and the
 * converted INR amount. Calculations are NOT implemented here — this file
 * only defines the reusable shape that future modules (Finance, Proposals,
 * Reports, BI) will consume.
 */

export type CurrencyCode =
  | "INR"
  | "AED"
  | "OMR"
  | "SAR"
  | "USD"
  | "KWD"
  | "QAR"
  | "BHD"
  | "EUR"
  | "GBP";

export interface MoneyAmount {
  /** Three-letter currency code as received from the source document. */
  originalCurrency: CurrencyCode;
  /** Amount in the original currency, stored as a number with up to 2 dp. */
  originalAmount: number;
  /** FX rate snapshot at the moment of capture (1 unit original = rate INR). */
  exchangeRate: number;
  /** Pre-computed INR amount = originalAmount * exchangeRate. */
  convertedInrAmount: number;
  /** ISO timestamp when the rate was captured. */
  capturedAt?: string;
}

export interface FinancialRecord {
  id: string;
  caseId: string;
  /** Total billed by the hospital for treatment. */
  hospitalBill: MoneyAmount;
  /** Commission paid by the hospital to Riayah Care. */
  hospitalCommission: MoneyAmount;
  /** Service charges Riayah Care invoices the patient/family. */
  riayahServiceCharges: MoneyAmount;
  /** Commission paid out to partners / referrers. */
  partnerCommissions: MoneyAmount;
  /** Operational expenses tied to this case. */
  expenses: MoneyAmount;
  /** Net profit on the case (INR). Computed by future Finance module. */
  netProfitInr?: number;
}
