import { useState } from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';

/**
 * Custom hook to handle form submission states
 * @returns Form submission related helpers
 */
export const useFormSubmission = <T extends FieldValues>() => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (
    form: UseFormReturn<T>,
    submitFn: (data: T) => Promise<any>
  ) => {
    return form.handleSubmit(async (data) => {
      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(false);

      try {
        await submitFn(data);
        setSubmitSuccess(true);
        
        // Reset submission state after success
        setTimeout(() => setSubmitSuccess(false), 3000);
      } catch (error: any) {
        setSubmitError(
          error.response?.data?.message || 
          error.message || 
          'An error occurred during submission'
        );
      } finally {
        setIsSubmitting(false);
      }
    });
  };

  return {
    isSubmitting,
    submitError,
    submitSuccess,
    setSubmitError,
    handleSubmit,
  };
};

/**
 * Custom hook to handle password visibility toggle
 * @returns Password visibility state and toggle function
 */
export const usePasswordVisibility = () => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return {
    showPassword,
    togglePasswordVisibility,
  };
};
