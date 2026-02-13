export interface PaystackOptions {
  key: string;
  email: string;
  amount: number;
  currency?: string;
  ref?: string;
  metadata?: Record<string, any>;
  planCode?: string;
  planInterval?: string;
  subscriptionLimit?: number;
  callback?: (response: PaystackResponse) => void;
  onSuccess?: (transaction: PaystackResponse) => void;
  onLoad?: (response: PaystackLoadResponse) => void;
  onCancel?: () => void;
  onError?: (error: PaystackError) => void;
}

export interface PaystackResponse {
  reference: string;
  status: string;
  message: string;
  trans: string;
  transaction: string;
  trxref: string;
}

export interface PaystackLoadResponse {
  id: string;
  accessCode: string;
  customer: Record<string, any>;
}

export interface PaystackError {
  message: string;
}

declare global {
  interface Window {
    PaystackPop?: any;
  }
}
