import {useState, useEffect} from "react";
import {motion} from "framer-motion";
import {getUserRideHistory} from "../utils/api";

const UserRideHistory = ({userId, refreshTrigger = 0}) => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRideHistory = async () => {
      try {
        setLoading(true);
        const data = await getUserRideHistory(userId);
        setRides(data);
        setError("");
      } catch (err) {
        console.error("Error fetching ride history:", err);
        setError("Failed to load ride history");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchRideHistory();
    }
  }, [userId, refreshTrigger]);

  if (loading) {
    return (
      <div className="bg-[#1E2235] p-4 rounded-lg shadow-md animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1E2235] p-4 rounded-lg shadow-md text-white">
        <h3 className="text-lg font-semibold mb-2">Your Ride History</h3>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  // Helper function to get status badge
  const getStatusBadge = (status) => {
    const statusClasses = {
      completed: "bg-green-900/30 text-green-500 border border-green-500/50",
      cancelled: "bg-red-900/30 text-red-500 border border-red-500/50",
      "in-progress": "bg-blue-900/30 text-blue-500 border border-blue-500/50",
      pending: "bg-yellow-900/30 text-yellow-500 border border-yellow-500/50",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          statusClasses[status] ||
          "bg-gray-800/50 text-gray-300 border border-gray-600"
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <motion.div
      className="bg-[#1E2235] p-4 rounded-lg shadow-md text-white"
      initial={{opacity: 0, y: 20}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.3}}
    >
      <h3 className="text-lg font-semibold mb-3 text-orange-500">
        Your Ride History
      </h3>

      {rides.length === 0 ? (
        <p className="text-gray-300 text-center py-4">
          You haven't taken any rides yet.
        </p>
      ) : (
        <div className="space-y-3">
          {rides.map((ride) => (
            <div
              key={ride._id}
              className="border border-gray-700 rounded-lg p-3 bg-[#2A2F45]"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm text-gray-300">
                    {new Date(ride.createdAt).toLocaleDateString()} at{" "}
                    {new Date(ride.createdAt).toLocaleTimeString()}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge(ride.status)}
                    <span className="text-sm font-medium text-orange-500">
                      ₹{ride.fare}
                    </span>
                  </div>
                </div>
                {ride.riderId && (
                  <div className="text-right">
                    <p className="text-xs text-gray-300">Driver</p>
                    <p className="text-sm font-medium text-white">
                      {ride.riderName || "Unknown"}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-start gap-2 mt-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div className="w-0.5 h-10 bg-gray-600 my-1"></div>
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                </div>

                <div className="flex-1">
                  <div className="mb-2">
                    <p className="text-xs text-gray-300">From</p>
                    <p className="text-sm truncate text-white">
                      {ride.pickupLocation.address}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-300">To</p>
                    <p className="text-sm truncate text-white">
                      {ride.destinationLocation.address}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default UserRideHistory;
