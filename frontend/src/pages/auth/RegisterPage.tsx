import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { RegisterForm } from '../../components/forms/RegisterForm';
import { motion } from 'framer-motion';

const RegisterPage = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="flex justify-center">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-blue-600">PlanIt</h1>
            <p className="text-gray-500">Your personal productivity companion</p>
          </div>
        </div>
      </motion.div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Create your account</CardTitle>
            <CardDescription className="text-center">
              Sign up to start planning your future
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
