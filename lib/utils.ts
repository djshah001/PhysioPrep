import { AxiosError } from 'axios';
import { Alert } from 'react-native';
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const handleError = (error: unknown) => {
  const axiosError = error as AxiosError;
  console.error('Error creating subject:', axiosError.response?.data || axiosError.message);
  // Fix: Avoid accessing 'errors' on possibly untyped object
  const errorData = axiosError.response?.data as
    | { errors?: { msg?: string }[]; message?: string }
    | undefined;
  const errorMsg =
    (errorData?.errors && Array.isArray(errorData.errors) && errorData.errors[0]?.msg) ||
    errorData?.message ||
    'Failed to create question. Please try again.';
  Alert.alert('Error', errorMsg);
};
