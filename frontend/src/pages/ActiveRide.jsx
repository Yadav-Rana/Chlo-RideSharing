import React, {useState, useEffect, useContext} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {motion} from "framer-motion";
import AuthContext from "../context/AuthContext";
import SocketContext from "../context/SocketContext";
import Button from "../components/Button";
import Loader from "../components/Loader";
import Card from "../components/Card";
import Badge from "../components/Badge";

const ActiveRide = () => {
  const {rideId} = useParams();
  const navigate = useNavigate();
  const {user} = useContext(AuthContext);
  const {socket, validateOTP, respondToOTPValidation} =
    useContext(SocketContext);

  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [rideStatus, setRideStatus] = useState("");

  // Placeholder for actual implementation
  useEffect(() => {
    // This would be replaced with actual API call to get ride details
    const fetchRideDetails = async () => {
      try {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
          setRide({
            _id: rideId,
            status: "in-progress",
            otp: "1234", // This would not be exposed in a real app
            fare: 150,
            distance: 5.2,
            duration: 15,
            vehicleType: "car",
            passenger: {
              name: "John Doe",
              phone: "9876543210",
            },
            rider: {
              name: "Jane Smith",
              phone: "9876543211",
              vehicle: {
                model: "Honda City",
                registrationNumber: "MH01AB1234",
              },
            },
            pickupLocation: {
              address: "123 Main St, Mumbai",
              coordinates: [72.8777, 19.076],
            },
            destinationLocation: {
              address: "456 Park Ave, Mumbai",
              coordinates: [72.8856, 19.0822],
            },
          });
          setRideStatus("in-progress");
          setLoading(false);
        }, 1500);
      } catch (error) {
        setError("Failed to load ride details");
        setLoading(false);
      }
    };

    fetchRideDetails();
  }, [rideId]);

  const handleOTPSubmit = (e) => {
    e.preventDefault();
    // This would be replaced with actual OTP validation
    if (otpInput === "1234") {
      setOtpVerified(true);
      setRideStatus("completed");
    } else {
      setError("Invalid OTP");
    }
  };

  const handleEndRide = () => {
    // This would be replaced with actual ride completion logic
    navigate("/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F1218] to-[#1A1E2E] flex items-center justify-center">
        <Loader text="Loading ride details..." color="orange" size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F1218] to-[#1A1E2E] flex items-center justify-center">
        <Card title="Error" className="max-w-md">
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-container bg-app text-white px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.5}}
        >
          <Card title="Active Ride" className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">
                Ride #{rideId.substring(0, 8)}
              </h2>
              <Badge
                variant={
                  rideStatus === "completed"
                    ? "success"
                    : rideStatus === "in-progress"
                    ? "primary"
                    : "warning"
                }
                animate={rideStatus === "in-progress"}
              >
                {rideStatus === "completed"
                  ? "Completed"
                  : rideStatus === "in-progress"
                  ? "In Progress"
                  : "Pending"}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-medium text-orange-400 mb-2">
                  Ride Details
                </h3>
                <div className="space-y-2 text-gray-300">
                  <p>
                    <span className="text-gray-400">Distance:</span>{" "}
                    {ride?.distance} km
                  </p>
                  <p>
                    <span className="text-gray-400">Duration:</span>{" "}
                    {ride?.duration} mins
                  </p>
                  <p>
                    <span className="text-gray-400">Fare:</span> ₹{ride?.fare}
                  </p>
                  <p>
                    <span className="text-gray-400">Vehicle:</span>{" "}
                    {ride?.vehicleType.charAt(0).toUpperCase() +
                      ride?.vehicleType.slice(1)}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-orange-400 mb-2">
                  {user?.userType === "passenger" ? "Rider" : "Passenger"}{" "}
                  Information
                </h3>
                <div className="space-y-2 text-gray-300">
                  <p>
                    <span className="text-gray-400">Name:</span>{" "}
                    {user?.userType === "passenger"
                      ? ride?.rider?.name
                      : ride?.passenger?.name}
                  </p>
                  <p>
                    <span className="text-gray-400">Phone:</span>{" "}
                    {user?.userType === "passenger"
                      ? ride?.rider?.phone
                      : ride?.passenger?.phone}
                  </p>
                  {user?.userType === "passenger" && ride?.rider?.vehicle && (
                    <>
                      <p>
                        <span className="text-gray-400">Vehicle:</span>{" "}
                        {ride.rider.vehicle.model}
                      </p>
                      <p>
                        <span className="text-gray-400">Registration:</span>{" "}
                        {ride.rider.vehicle.registrationNumber}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-700/50 pt-6">
              <h3 className="text-lg font-medium text-orange-400 mb-4">
                Location
              </h3>
              <div className="bg-[#141824] h-64 rounded-lg flex items-center justify-center mb-4">
                <p className="text-gray-400">Map would be displayed here</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">
                    Pickup Location
                  </h4>
                  <p className="text-white">{ride?.pickupLocation?.address}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">
                    Destination
                  </h4>
                  <p className="text-white">
                    {ride?.destinationLocation?.address}
                  </p>
                </div>
              </div>
            </div>

            {!otpVerified && rideStatus === "in-progress" && (
              <div className="border-t border-gray-700/50 mt-6 pt-6">
                <h3 className="text-lg font-medium text-orange-400 mb-4">
                  Verify OTP
                </h3>
                <form
                  onSubmit={handleOTPSubmit}
                  className="flex flex-col md:flex-row gap-4"
                >
                  <input
                    type="text"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    placeholder="Enter 4-digit OTP"
                    className="flex-1 px-4 py-3 rounded-lg bg-[#141824] border border-gray-700 text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 transition-all duration-300"
                    maxLength={4}
                    required
                  />
                  <Button type="submit">Verify OTP</Button>
                </form>
              </div>
            )}

            {(otpVerified || rideStatus === "completed") && (
              <div className="border-t border-gray-700/50 mt-6 pt-6 flex justify-end">
                <Button onClick={handleEndRide}>End Ride</Button>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ActiveRide;
