import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';

const Login = () => {
  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-gray-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
          <p className="text-gray-500 mt-2">Sign in to access SmartCampus Hub</p>
        </div>

        <div className="space-y-4">
          {/* Google Login Button */}
          <button onClick={() => window.location.href = "http://localhost:8081/oauth2/authorization/google"} className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition font-medium shadow-sm">
            <FcGoogle className="text-2xl" />
            Continue with Google
          </button>

          <button
            onClick={() => window.location.href = "http://localhost:8081/oauth2/authorization/github"}
            className="flex items-center justify-center gap-2 w-full border border-gray-300 rounded-md py-2 px-4 hover:bg-gray-50 transition mt-3"
          >
            <FaGithub className="w-5 h-5" /> {/* react-icons/fa වලින් import කරගන්න */}
            Continue with GitHub
          </button>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>By signing in, you agree to the University's Terms of Service and Privacy Policy.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;