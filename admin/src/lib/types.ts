// src/lib/types.ts
export type ReceiptSettings = {
  orgName?: string;
  logoUrl?: string;
  addressLines?: string[];
  contactLines?: string[];
  receiptPrefix?: string;        // e.g. "RW/"
  currency?: "INR" | "USD" | "EUR";
  pan?: string;
  tan?: string;
  gst?: string;
  show80GBlock?: boolean;
  eightyGText?: string;
  signerName?: string;
  signerTitle?: string;
  footerNote?: string;
  templateHtml?: string;         // optional HTML template (Handlebars)
  autoFiscalReset?: boolean;     // <— FY auto reset
  panThreshold?: number;         // e.g. 10000 (ask PAN ≥ threshold)
};
