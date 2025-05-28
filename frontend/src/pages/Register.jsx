import {useState, useContext} from "react";
import {Link, useNavigate} from "react-router-dom";
import {motion} from "framer-motion";
import AuthContext from "../context/AuthContext";
import Button from "../components/Button";
import Loader from "../components/Loader";
import ParticleBackground from "../components/ParticleBackground";
import ChloLogo from "../components/ChloLogo";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "passenger",
    vehicle: {
      type: "car",
      model: "",
      registrationNumber: "",
    },
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {register} = useContext(AuthContext);
  const navigate = useNavigate();

  const {name, email, password, confirmPassword, userType, vehicle} = formData;

  const handleChange = (e) => {
    if (e.target.name.startsWith("vehicle.")) {
      const vehicleField = e.target.name.split(".")[1];
      setFormData({
        ...formData,
        vehicle: {
          ...formData.vehicle,
          [vehicleField]: e.target.value,
        },
      });
    } else {
      setFormData({...formData, [e.target.name]: e.target.value});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all required fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (
      userType === "rider" &&
      (!vehicle.model || !vehicle.registrationNumber)
    ) {
      setError("Please provide vehicle information");
      return;
    }

    try {
      setLoading(true);

      // Remove confirmPassword before sending to API
      const userData = {...formData};
      delete userData.confirmPassword;

      await register(userData);
      navigate("/dashboard");
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-app overflow-hidden pt-16 pb-16">
      <ParticleBackground />

      <div className="absolute inset-0 flex items-center justify-center px-4 py-12 overflow-auto">
        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.6}}
          className="w-full max-w-md"
        >
          <div className="bg-[#1E2235] rounded-2xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto animate-glow-subtle">
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
                  Create Account
                </h2>
                <p className="mt-2 text-sm text-gray-400">
                  Join CHLO and start your journey
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
                  <Loader text="Creating account..." color="orange" />
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Full Name
                    </label>
                    <motion.input
                      whileFocus={{scale: 1.01}}
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-[#141824] border border-gray-700 text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all duration-300"
                      placeholder="Enter your full name"
                    />
                  </div>

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
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-[#141824] border border-gray-700 text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all duration-300"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Password
                    </label>
                    <motion.input
                      whileFocus={{scale: 1.01}}
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-[#141824] border border-gray-700 text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all duration-300"
                      placeholder="Create a password"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Confirm Password
                    </label>
                    <motion.input
                      whileFocus={{scale: 1.01}}
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-[#141824] border border-gray-700 text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all duration-300"
                      placeholder="Confirm your password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      I want to register as
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <motion.div
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          formData.userType === "passenger"
                            ? "border-orange-500 bg-orange-500/10"
                            : "border-gray-700 hover:border-orange-300"
                        }`}
                        whileHover={{y: -5, transition: {duration: 0.2}}}
                        onClick={() =>
                          setFormData({...formData, userType: "passenger"})
                        }
                      >
                        <div className="flex flex-col items-center">
                          <span className="text-2xl mb-2">🧑</span>
                          <span className="font-medium text-white">
                            Passenger
                          </span>
                        </div>
                      </motion.div>

                      <motion.div
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          formData.userType === "rider"
                            ? "border-orange-500 bg-orange-500/10"
                            : "border-gray-700 hover:border-orange-300"
                        }`}
                        whileHover={{y: -5, transition: {duration: 0.2}}}
                        onClick={() =>
                          setFormData({...formData, userType: "rider"})
                        }
                      >
                        <div className="flex flex-col items-center">
                          <span className="text-2xl mb-2">🚗</span>
                          <span className="font-medium text-white">Rider</span>
                        </div>
                      </motion.div>
                    </div>
                  </div>

                  {userType === "rider" && (
                    <motion.div
                      className="space-y-4 border-t border-gray-700/50 pt-4"
                      initial={{opacity: 0, height: 0}}
                      animate={{opacity: 1, height: "auto"}}
                      transition={{duration: 0.3}}
                    >
                      <h3 className="text-lg font-medium text-orange-400">
                        Vehicle Information
                      </h3>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Vehicle Type
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          <motion.div
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                              vehicle.type === "bike"
                                ? "border-orange-500 bg-orange-500/10"
                                : "border-gray-700 hover:border-orange-300"
                            }`}
                            whileHover={{y: -3, transition: {duration: 0.2}}}
                            onClick={() =>
                              setFormData({
                                ...formData,
                                vehicle: {...formData.vehicle, type: "bike"},
                              })
                            }
                          >
                            <div className="flex flex-col items-center">
                              <span className="text-xl mb-1">🏍️</span>
                              <span className="text-sm font-medium text-white">
                                Bike
                              </span>
                            </div>
                          </motion.div>

                          <motion.div
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                              vehicle.type === "auto"
                                ? "border-orange-500 bg-orange-500/10"
                                : "border-gray-700 hover:border-orange-300"
                            }`}
                            whileHover={{y: -3, transition: {duration: 0.2}}}
                            onClick={() =>
                              setFormData({
                                ...formData,
                                vehicle: {...formData.vehicle, type: "auto"},
                              })
                            }
                          >
                            <div className="flex flex-col items-center">
                              <span className="text-xl mb-1">🛺</span>
                              <span className="text-sm font-medium text-white">
                                Auto
                              </span>
                            </div>
                          </motion.div>

                          <motion.div
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                              vehicle.type === "car"
                                ? "border-orange-500 bg-orange-500/10"
                                : "border-gray-700 hover:border-orange-300"
                            }`}
                            whileHover={{y: -3, transition: {duration: 0.2}}}
                            onClick={() =>
                              setFormData({
                                ...formData,
                                vehicle: {...formData.vehicle, type: "car"},
                              })
                            }
                          >
                            <div className="flex flex-col items-center">
                              <span className="text-xl mb-1">🚗</span>
                              <span className="text-sm font-medium text-white">
                                Car
                              </span>
                            </div>
                          </motion.div>
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="model"
                          className="block text-sm font-medium text-gray-300 mb-2"
                        >
                          Vehicle Model
                        </label>
                        <motion.input
                          whileFocus={{scale: 1.01}}
                          type="text"
                          id="model"
                          name="vehicle.model"
                          value={vehicle.model}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 rounded-lg bg-[#141824] border border-gray-700 text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all duration-300"
                          placeholder="e.g. Honda Activa, Maruti Swift"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="registrationNumber"
                          className="block text-sm font-medium text-gray-300 mb-2"
                        >
                          Registration Number
                        </label>
                        <motion.input
                          whileFocus={{scale: 1.01}}
                          type="text"
                          id="registrationNumber"
                          name="vehicle.registrationNumber"
                          value={vehicle.registrationNumber}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 rounded-lg bg-[#141824] border border-gray-700 text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all duration-300"
                          placeholder="e.g. MH01AB1234"
                        />
                      </div>
                    </motion.div>
                  )}

                  <div className="flex items-center">
                    <input
                      id="agreeToTerms"
                      name="agreeToTerms"
                      type="checkbox"
                      required
                      className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-700 rounded bg-[#141824]"
                    />
                    <label
                      htmlFor="agreeToTerms"
                      className="ml-2 block text-sm text-gray-300"
                    >
                      I agree to the{" "}
                      <Link
                        to="/terms"
                        className="text-orange-500 hover:text-orange-400"
                      >
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link
                        to="/privacy"
                        className="text-orange-500 hover:text-orange-400"
                      >
                        Privacy Policy
                      </Link>
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
                    Create Account
                  </motion.button>
                </form>
              )}

              <div className="mt-8 text-center">
                <p className="text-sm text-gray-400">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-orange-500 hover:text-orange-400 font-medium"
                  >
                    Sign in
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

export default Register;
