// Common API types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  error: string;
  details?: ValidationError[];
}

export interface RequestWithValidation<T = unknown> {
  validated: T;
  json: () => Promise<T>;
}

// Answer types
export interface Answer {
  questionId: string;
  answer: string | string[] | number | boolean;
  isCorrect?: boolean;
  timeSpent?: number;
}

// Package types
export interface PackageData {
  name: string;
  description: string;
  price: number;
  features: string[];
}

// Razorpay types
export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt?: string;
}

export interface RazorpayPayment {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

// User types
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string;
}
