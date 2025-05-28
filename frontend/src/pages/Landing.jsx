import React, {useContext} from "react";
import {Link} from "react-router-dom";
import {motion} from "framer-motion";
import AuthContext from "../context/AuthContext";
import Button from "../components/Button";
import ParticleBackground from "../components/ParticleBackground";
import ChloLogo from "../components/ChloLogo";

const Landing = () => {
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
    <div className="relative min-h-screen bg-app overflow-x-hidden">
      <ParticleBackground />

      <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-16 overflow-y-auto">
        <motion.div
          className="text-center mb-12 z-10 w-full max-w-4xl mx-auto px-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <ChloLogo
              size="xl"
              animate={true}
              className="mx-auto animate-glow"
            />
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl md:text-7xl font-bold mt-6"
            variants={itemVariants}
          >
            <span className="text-orange-500">CHLO</span>
          </motion.h1>

          <motion.p
            className="text-gray-300 mt-4 max-w-md mx-auto px-4 text-sm sm:text-base"
            variants={itemVariants}
          >
            Your friendly neighborhood ride-sharing platform. Fast, reliable,
            and affordable rides right in your local community.
          </motion.p>

          <motion.div className="mt-8" variants={itemVariants}>
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
          className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 w-full max-w-4xl z-10 px-4"
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          transition={{delay: 1, duration: 0.8}}
        >
          <motion.div
            className="bg-[#1E2235] p-6 rounded-xl shadow-lg"
            whileHover={{y: -5, transition: {duration: 0.2}}}
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
              Quick & Easy
            </h3>
            <p className="text-gray-400">
              Book a ride in seconds and get picked up in minutes. No waiting,
              no hassle.
            </p>
          </motion.div>

          <motion.div
            className="bg-[#1E2235] p-6 rounded-xl shadow-lg"
            whileHover={{y: -5, transition: {duration: 0.2}}}
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
              Affordable
            </h3>
            <p className="text-gray-400">
              Enjoy competitive rates and transparent pricing with no hidden
              fees.
            </p>
          </motion.div>

          <motion.div
            className="bg-[#1e2131] p-6 rounded-xl shadow-lg"
            whileHover={{y: -5, transition: {duration: 0.2}}}
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
              Safe & Secure
            </h3>
            <p className="text-gray-400">
              All rides are tracked in real-time and verified with OTP for your
              safety.
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          className="mt-20 mb-24 text-center z-10 w-full max-w-4xl px-4"
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          transition={{delay: 1.5, duration: 0.8}}
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-10 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
            How It Works
          </h2>

          <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-4 lg:gap-8">
            <div className="flex flex-col items-center max-w-xs mb-8 md:mb-0">
              <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">
                Enter Location
              </h3>
              <p className="text-gray-400 text-center">
                Enter your pickup and destination locations on the map.
              </p>
            </div>

            <div className="flex flex-col items-center max-w-xs mb-8 md:mb-0">
              <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">
                Choose Ride
              </h3>
              <p className="text-gray-400 text-center">
                Select from available vehicle types based on your preference.
              </p>
            </div>

            <div className="flex flex-col items-center max-w-xs">
              <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white text-xl font-bold mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">
                Enjoy the Ride
              </h3>
              <p className="text-gray-400 text-center">
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

export default Landing;
