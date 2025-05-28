import {useState, useContext} from "react";
import {Link, useNavigate} from "react-router-dom";
import {motion} from "framer-motion";
import AuthContext from "../context/AuthContext";
import Button from "../components/Button";
import Loader from "../components/Loader";
import ParticleBackground from "../components/ParticleBackground";
import ChloLogo from "../components/ChloLogo";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {login} = useContext(AuthContext);
  const navigate = useNavigate();

  const {email, password} = formData;

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      await login(formData);
      navigate("/dashboard");
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-app overflow-hidden pt-16 pb-16">
      <ParticleBackground />

      <div className="absolute inset-0 flex items-center justify-center px-4">
        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.6}}
          className="w-full max-w-md"
        >
          <div className="bg-[#1E2235] rounded-2xl shadow-xl overflow-hidden animate-glow-subtle">
            <div className="p-8">
              <div className="text-center mb-8">
                <Link to="/">
                  <ChloLogo
                    size="lg"
                    animate={true}
                    className="mx-auto animate-glow-pulse"
                  />
                </Link>
                <h2 className="mt-6 text-3xl font-bold text-orange-500">
                  Welcome Back
                </h2>
                <p className="mt-2 text-sm text-gray-400">
                  Sign in to continue to CHLO
                </p>
              </div>

              {error && (
                <motion.div
                  className="bg-red-900/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-4"
                  initial={{opacity: 0}}
                  animate={{opacity: 1}}
                >
                  {error}
                </motion.div>
              )}

              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader text="Signing in..." color="orange" />
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Email Address
                    </label>
                    <motion.input
                      whileFocus={{scale: 1.01}}
                      type="email"
                      id="email"
                      name="email"
                      value={email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-[#141824] border border-gray-700 text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all duration-300"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-300"
                      >
                        Password
                      </label>
                      <Link
                        to="/forgot-password"
                        className="text-sm text-orange-500 hover:text-orange-400"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <motion.input
                      whileFocus={{scale: 1.01}}
                      type="password"
                      id="password"
                      name="password"
                      value={password}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-[#141824] border border-gray-700 text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all duration-300"
                      placeholder="Enter your password"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      id="rememberMe"
                      name="rememberMe"
                      type="checkbox"
                      className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-700 rounded bg-[#141824]"
                    />
                    <label
                      htmlFor="rememberMe"
                      className="ml-2 block text-sm text-gray-300"
                    >
                      Remember me
                    </label>
                  </div>

                  <motion.button
                    type="submit"
                    className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 text-white font-medium shadow-lg shadow-orange-500/20"
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 10px 25px rgba(255, 69, 0, 0.4)",
                    }}
                    whileTap={{scale: 0.98}}
                  >
                    Sign In
                  </motion.button>
                </form>
              )}

              <div className="mt-8 text-center">
                <p className="text-sm text-gray-400">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="text-orange-500 hover:text-orange-400 font-medium"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
