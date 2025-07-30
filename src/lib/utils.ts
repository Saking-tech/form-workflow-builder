import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// Email validation function
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }

  if (!email.includes('@')) {
    return { isValid: false, error: 'Email must contain @ symbol' };
  }

  if (!email.includes('.')) {
    return { isValid: false, error: 'Email must contain a dot (.)' };
  }

  // Check for @ and . in correct positions
  const atIndex = email.indexOf('@');
  const lastDotIndex = email.lastIndexOf('.');

  if (atIndex === 0) {
    return { isValid: false, error: 'Email cannot start with @' };
  }

  if (atIndex === email.length - 1) {
    return { isValid: false, error: 'Email cannot end with @' };
  }

  if (lastDotIndex <= atIndex) {
    return { isValid: false, error: 'Email must have a dot (.) after the @ symbol' };
  }

  if (lastDotIndex === email.length - 1) {
    return { isValid: false, error: 'Email cannot end with a dot' };
  }

  // Check for multiple @ symbols
  if (email.split('@').length !== 2) {
    return { isValid: false, error: 'Email must contain exactly one @ symbol' };
  }

  // Basic pattern validation (more comprehensive than just @ and .)
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailPattern.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true };
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) {
    return 'N/A';
  }

  let dateObj: Date;
  
  if (typeof date === 'string') {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }

  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'in-progress':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getStatusIcon(status: string): string {
  switch (status) {
    case 'pending':
      return '⏳';
    case 'in-progress':
      return '🔄';
    case 'completed':
      return '✅';
    case 'cancelled':
      return '❌';
    default:
      return '📋';
  }
}