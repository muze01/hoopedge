export interface FlutterwaveOptions {
  public_key: string;
  tx_ref: string;
  amount: number;
  currency?: string;
  payment_plan?: string | number;
  payment_options?: string;
  meta?: Record<string, any>;
  customer: {
    email: string;
    name?: string;
    phone_number?: string;
  };
  customizations?: {
    title?: string;
    description?: string;
    logo?: string;
  };
  callback: (response: FlutterwaveResponse) => void;
  onclose: () => void;
}

export interface FlutterwaveResponse {
  transaction_id: number;
  tx_ref: string;
  flw_ref: string;
  status: "successful" | "failed" | "cancelled";
  amount: number;
  currency: string;
  customer: {
    email: string;
    name: string;
    phone_number: string;
  };
}

declare global {
  interface Window {
    FlutterwaveCheckout?: (
      options: FlutterwaveOptions,
    ) => { close: () => void };
  }
}
