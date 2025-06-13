import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '../../utils/validationSchemas';
import type { RegisterFormInputs } from '../../utils/validationSchemas';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { register as registerUser } from '../../features/auth/authSlice';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { usePasswordVisibility } from '../../hooks/useForm';

export const RegisterForm = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth as any);
  const isLoading = auth?.isLoading || false;
  const error = auth?.error || null;
  const { showPassword, togglePasswordVisibility } = usePasswordVisibility();
  const { showPassword: showConfirmPassword, togglePasswordVisibility: toggleConfirmPasswordVisibility } = usePasswordVisibility();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data: RegisterFormInputs) => {
    dispatch(registerUser(data));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
          First Name
        </label>
        <Input
          id="firstName"
          error={errors.firstName?.message}
          placeholder="John"
          {...register('firstName')}
        />
      </div>

      <div>
        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
          Last Name
        </label>
        <Input
          id="lastName"
          error={errors.lastName?.message}
          placeholder="Doe"
          {...register('lastName')}
        />
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <Input
          id="email"
          type="email"
          error={errors.email?.message}
          placeholder="you@example.com"
          {...register('email')}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            error={errors.password?.message}
            placeholder="••••••••"
            {...register('password')}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 focus:outline-none"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
            <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
          Confirm Password
        </label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            error={errors.confirmPassword?.message}
            placeholder="••••••••"
            {...register('confirmPassword')}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 focus:outline-none"
            onClick={toggleConfirmPasswordVisibility}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
            <span className="sr-only">{showConfirmPassword ? 'Hide password' : 'Show password'}</span>
          </button>
        </div>
      </div>

      <div>
        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
          className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Create Account
        </Button>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      </div>
    </form>
  );
};
