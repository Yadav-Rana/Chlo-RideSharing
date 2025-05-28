import {useContext} from "react";
import {Link} from "react-router-dom";
import {motion} from "framer-motion";
import AuthContext from "../context/AuthContext";
import Button from "../components/Button";

const HomePage = () => {
  const {user} = useContext(AuthContext);

  const containerVariants = {
    hidden: {opacity: 0},
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: {y: 20, opacity: 0},
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          className="text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className="text-4xl md:text-6xl font-bold text-gray-800 mb-6"
            variants={itemVariants}
          >
            Welcome to <span className="text-blue-600">Chlo</span>
          </motion.h1>

          <motion.p
            className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            Your friendly neighborhood ride-sharing platform. Fast, reliable,
            and affordable rides right in your local community.
          </motion.p>

          <motion.div variants={itemVariants}>
            {user ? (
              <Link to="/dashboard">
                <Button size="lg" variant="primary">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/login">
                  <Button size="lg" variant="primary">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="lg" variant="outline">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        </motion.div>

        <motion.div
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
          initial={{opacity: 0, y: 50}}
          animate={{opacity: 1, y: 0}}
          transition={{delay: 0.5, duration: 0.5}}
        >
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4 text-blue-500">🚗</div>
            <h3 className="text-xl font-semibold mb-2">Quick & Easy</h3>
            <p className="text-gray-600">
              Book a ride in seconds and get picked up in minutes. No waiting,
              no hassle.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4 text-blue-500">💰</div>
            <h3 className="text-xl font-semibold mb-2">Affordable</h3>
            <p className="text-gray-600">
              Enjoy competitive rates and transparent pricing with no hidden
              fees.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4 text-blue-500">🛡️</div>
            <h3 className="text-xl font-semibold mb-2">Safe & Secure</h3>
            <p className="text-gray-600">
              All rides are tracked in real-time and verified with OTP for your
              safety.
            </p>
          </div>
        </motion.div>

        <motion.div
          className="mt-20 text-center"
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          transition={{delay: 0.8, duration: 0.5}}
        >
          <h2 className="text-3xl font-bold mb-6">How It Works</h2>

          <div className="flex flex-col md:flex-row justify-center items-center gap-8">
            <div className="flex flex-col items-center max-w-xs">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl font-bold mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">Enter Location</h3>
              <p className="text-gray-600 text-center">
                Enter your pickup and destination locations on the map.
              </p>
            </div>

            <div className="flex flex-col items-center max-w-xs">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl font-bold mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">Choose Ride</h3>
              <p className="text-gray-600 text-center">
                Select from available vehicle types based on your preference.
              </p>
            </div>

            <div className="flex flex-col items-center max-w-xs">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl font-bold mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">Enjoy the Ride</h3>
              <p className="text-gray-600 text-center">
                Track your ride in real-time and pay when you reach your
                destination.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;
