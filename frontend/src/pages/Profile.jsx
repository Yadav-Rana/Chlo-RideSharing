import React, {useState, useContext, useEffect} from "react";
import {motion} from "framer-motion";
import AuthContext from "../context/AuthContext";
import Button from "../components/Button";
import axios from "axios";
import {useNavigate} from "react-router-dom";

const Profile = () => {
  const {user, updateProfile, logout} = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [vehicleData, setVehicleData] = useState({
    model: "",
    registrationNumber: "",
    vehicleType: "",
  });

  // Initialize form data when user data is available
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      if (user.vehicle) {
        setVehicleData({
          model: user.vehicle.model || "",
          registrationNumber: user.vehicle.registrationNumber || "",
          vehicleType: user.vehicle.vehicleType || "",
        });
      }
    }
  }, [user]);

  const handleChange = (e) => {
    const {name, value} = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleVehicleChange = (e) => {
    const {name, value} = e.target;
    setVehicleData({
      ...vehicleData,
      [name]: value,
    });
  };

  // Handle account deletion
  const deleteAccount = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      try {
        setDeleteLoading(true);
        setError("");

        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };

        const API_URL =
          import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        await axios.delete(`${API_URL}/users/profile`, config);

        // Log the user out and redirect to home page
        logout();
        navigate("/");
      } catch (error) {
        setError(error.response?.data?.message || "Failed to delete account");
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validate password fields if user is trying to change password
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          setError("New passwords do not match");
          setLoading(false);
          return;
        }

        if (!formData.currentPassword) {
          setError("Current password is required to set a new password");
          setLoading(false);
          return;
        }
      }

      // Prepare update data
      const updateData = {
        name: formData.name,
        phone: formData.phone,
      };

      // Add password data if changing password
      if (formData.newPassword && formData.currentPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      // Add vehicle data for riders
      if (user && user.userType === "rider") {
        updateData.vehicle = vehicleData;
      }

      // Call API to update user
      await updateProfile(updateData);

      // Reset password fields
      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setSuccess("Profile updated successfully");
    } catch (error) {
      setError(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container bg-app text-white">
      <div className="absolute inset-0 z-0">
        <canvas
          className="w-full h-full"
          id="particleCanvas"
          style={{pointerEvents: "none"}}
          ref={(canvas) => {
            if (canvas && !canvas.hasInitialized) {
              canvas.hasInitialized = true;
              const ctx = canvas.getContext("2d");
              canvas.width = window.innerWidth;
              canvas.height = window.innerHeight;

              // Particle settings
              const particlesArray = [];
              const numberOfParticles = 50;

              // Create particles
              for (let i = 0; i < numberOfParticles; i++) {
                particlesArray.push({
                  x: Math.random() * canvas.width,
                  y: Math.random() * canvas.height,
                  size: Math.random() * 2 + 0.5,
                  speedX: Math.random() * 0.5 - 0.25,
                  speedY: Math.random() * 0.5 - 0.25,
                  opacity: Math.random() * 0.5 + 0.2,
                });
              }

              // Animation function
              function animate() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                particlesArray.forEach((particle) => {
                  ctx.beginPath();
                  ctx.arc(
                    particle.x,
                    particle.y,
                    particle.size,
                    0,
                    Math.PI * 2
                  );
                  ctx.fillStyle = `rgba(255, 165, 0, ${particle.opacity})`;
                  ctx.fill();

                  // Update particle position
                  particle.x += particle.speedX;
                  particle.y += particle.speedY;

                  // Wrap particles around canvas
                  if (particle.x < 0 || particle.x > canvas.width)
                    particle.speedX *= -1;
                  if (particle.y < 0 || particle.y > canvas.height)
                    particle.speedY *= -1;
                });

                requestAnimationFrame(animate);
              }

              animate();
            }
          }}
        />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.h1
          className="text-3xl font-bold mb-6 text-orange-500"
          initial={{opacity: 0, y: -20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.5}}
        >
          My Profile
        </motion.h1>

        {error && (
          <motion.div
            className="bg-red-900/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-4"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
          >
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            className="bg-green-900/20 border border-green-500/50 text-green-300 px-4 py-3 rounded-lg mb-4"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
          >
            {success}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - User Info */}
          <motion.div
            className="lg:col-span-2 space-y-6"
            initial={{x: -20, opacity: 0}}
            animate={{x: 0, opacity: 1}}
            transition={{delay: 0.2, duration: 0.6}}
          >
            {/* Profile Card */}
            <motion.div
              className="bg-[#1E2235] rounded-2xl p-6 shadow-lg"
              whileHover={{y: -5, transition: {duration: 0.2}}}
            >
              <h2 className="text-xl font-semibold mb-6 text-orange-500">
                Personal Information
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="w-full px-4 py-3 rounded-lg bg-[#141824]/50 border border-gray-700 text-gray-400 cursor-not-allowed"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Email cannot be changed
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Phone Number
                    </label>
                    <motion.input
                      whileFocus={{scale: 1.01}}
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-[#141824] border border-gray-700 text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="userType"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Account Type
                    </label>
                    <input
                      type="text"
                      id="userType"
                      value={
                        user?.userType === "passenger"
                          ? "Passenger"
                          : user?.userType === "rider"
                          ? "Rider"
                          : "Unknown"
                      }
                      disabled
                      className="w-full px-4 py-3 rounded-lg bg-[#141824]/50 border border-gray-700 text-gray-400 cursor-not-allowed"
                    />
                  </div>
                </div>

                {user && user.userType === "rider" && (
                  <div className="border-t border-gray-700/50 pt-6">
                    <h3 className="text-lg font-semibold mb-4 text-orange-400">
                      Vehicle Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          name="model"
                          value={vehicleData.model}
                          onChange={handleVehicleChange}
                          required
                          className="w-full px-4 py-3 rounded-lg bg-[#141824] border border-gray-700 text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all duration-300"
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
                          name="registrationNumber"
                          value={vehicleData.registrationNumber}
                          onChange={handleVehicleChange}
                          required
                          className="w-full px-4 py-3 rounded-lg bg-[#141824] border border-gray-700 text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all duration-300"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Vehicle Type
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          <motion.div
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                              vehicleData.vehicleType === "bike"
                                ? "border-orange-500 bg-orange-500/10"
                                : "border-gray-700 hover:border-orange-300"
                            }`}
                            whileHover={{y: -3, transition: {duration: 0.2}}}
                            onClick={() =>
                              setVehicleData({
                                ...vehicleData,
                                vehicleType: "bike",
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
                              vehicleData.vehicleType === "auto"
                                ? "border-orange-500 bg-orange-500/10"
                                : "border-gray-700 hover:border-orange-300"
                            }`}
                            whileHover={{y: -3, transition: {duration: 0.2}}}
                            onClick={() =>
                              setVehicleData({
                                ...vehicleData,
                                vehicleType: "auto",
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
                              vehicleData.vehicleType === "car"
                                ? "border-orange-500 bg-orange-500/10"
                                : "border-gray-700 hover:border-orange-300"
                            }`}
                            whileHover={{y: -3, transition: {duration: 0.2}}}
                            onClick={() =>
                              setVehicleData({
                                ...vehicleData,
                                vehicleType: "car",
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
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-700/50 pt-6">
                  <h3 className="text-lg font-semibold mb-4 text-orange-400">
                    Change Password
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="currentPassword"
                        className="block text-sm font-medium text-gray-300 mb-2"
                      >
                        Current Password
                      </label>
                      <motion.input
                        whileFocus={{scale: 1.01}}
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg bg-[#141824] border border-gray-700 text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all duration-300"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="newPassword"
                          className="block text-sm font-medium text-gray-300 mb-2"
                        >
                          New Password
                        </label>
                        <motion.input
                          whileFocus={{scale: 1.01}}
                          type="password"
                          id="newPassword"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-lg bg-[#141824] border border-gray-700 text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all duration-300"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="confirmPassword"
                          className="block text-sm font-medium text-gray-300 mb-2"
                        >
                          Confirm New Password
                        </label>
                        <motion.input
                          whileFocus={{scale: 1.01}}
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-lg bg-[#141824] border border-gray-700 text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all duration-300"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <motion.button
                    type="submit"
                    className="px-6 py-3 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 text-white font-medium shadow-lg shadow-orange-500/20"
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 10px 25px rgba(255, 69, 0, 0.4)",
                    }}
                    whileTap={{scale: 0.98}}
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>

          {/* Right Column - Stats & Info */}
          <motion.div
            className="space-y-6"
            initial={{x: 20, opacity: 0}}
            animate={{x: 0, opacity: 1}}
            transition={{delay: 0.3, duration: 0.6}}
          >
            {/* User Card */}
            <motion.div
              className="bg-[#1E2235] rounded-2xl p-6 shadow-lg"
              whileHover={{y: -5, transition: {duration: 0.2}}}
            >
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white text-3xl font-bold mb-4">
                  {user?.name?.charAt(0) || "U"}
                </div>
                <h3 className="text-xl font-semibold text-white">
                  {user?.name}
                </h3>
                <p className="text-gray-400">{user?.email}</p>
                <div className="mt-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-sm">
                  {user?.userType === "passenger"
                    ? "Passenger"
                    : user?.userType === "rider"
                    ? "Rider"
                    : "Unknown"}
                </div>
              </div>
            </motion.div>

            {/* Stats Card */}
            <motion.div
              className="bg-[#1E2235] rounded-2xl p-6 shadow-lg"
              whileHover={{y: -5, transition: {duration: 0.2}}}
            >
              <h2 className="text-xl font-semibold mb-4 text-orange-500">
                Account Statistics
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Member Since</span>
                  <span className="text-white">
                    {new Date(user?.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Rides</span>
                  <span className="text-white">{user?.totalRides || 0}</span>
                </div>

                {user && user.userType === "rider" && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Earnings</span>
                    <span className="text-white">
                      ₹{user?.totalEarnings || 0}
                    </span>
                  </div>
                )}

                {user && user.userType === "passenger" && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Spent</span>
                    <span className="text-white">₹{user?.totalSpent || 0}</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Danger Zone */}
            <motion.div
              className="bg-[#1E2235] rounded-2xl p-6 shadow-lg"
              whileHover={{y: -5, transition: {duration: 0.2}}}
            >
              <h2 className="text-xl font-semibold mb-4 text-red-400">
                Danger Zone
              </h2>

              <p className="text-gray-400 text-sm mb-4">
                These actions are irreversible. Please proceed with caution.
              </p>

              <Button
                variant="danger"
                fullWidth
                onClick={deleteAccount}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting Account..." : "Delete Account"}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
