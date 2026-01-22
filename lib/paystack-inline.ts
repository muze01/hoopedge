export interface PaystackOptions {
  key: string;
  email: string;
  amount: number;
  currency?: string;
  ref?: string;
  metadata?: Record<string, any>;
  callback?: (response: PaystackResponse) => void;
  onClose?: () => void;
}

export interface PaystackResponse {
  reference: string;
  status: string;
  message: string;
  trans: string;
  transaction: string;
  trxref: string;
}

declare global {
  interface Window {
    PaystackPop: {
      setup(options: PaystackOptions): {
        openIframe(): void;
      };
    };
  }
}
