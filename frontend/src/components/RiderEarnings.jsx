import {useState, useEffect} from "react";
import {motion} from "framer-motion";
import {getRiderEarnings} from "../utils/api";

const RiderEarnings = ({riderId, refreshTrigger = 0}) => {
  const [earnings, setEarnings] = useState({
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    total: 0,
    recentRides: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setLoading(true);
        const data = await getRiderEarnings(riderId);
        setEarnings(data);
        setError("");
      } catch (err) {
        console.error("Error fetching rider earnings:", err);
        setError("Failed to load earnings data");
      } finally {
        setLoading(false);
      }
    };

    if (riderId) {
      fetchEarnings();
    }
  }, [riderId, refreshTrigger]);

  if (loading) {
    return (
      <div className="bg-[#1E2235] p-4 rounded-lg shadow-md animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1E2235] p-4 rounded-lg shadow-md text-white">
        <h3 className="text-lg font-semibold mb-2 text-orange-500">Earnings</h3>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <motion.div
      className="bg-[#1E2235] p-4 rounded-lg shadow-md text-white"
      initial={{opacity: 0, y: 20}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.3}}
    >
      <h3 className="text-lg font-semibold mb-3 text-orange-500">
        Your Earnings
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-500/30">
          <p className="text-sm text-gray-300">Today</p>
          <p className="text-xl font-bold text-blue-400">₹{earnings.today}</p>
        </div>
        <div className="bg-green-900/20 p-3 rounded-lg border border-green-500/30">
          <p className="text-sm text-gray-300">This Week</p>
          <p className="text-xl font-bold text-green-400">
            ₹{earnings.thisWeek}
          </p>
        </div>
        <div className="bg-purple-900/20 p-3 rounded-lg border border-purple-500/30">
          <p className="text-sm text-gray-300">This Month</p>
          <p className="text-xl font-bold text-purple-400">
            ₹{earnings.thisMonth}
          </p>
        </div>
        <div className="bg-orange-900/20 p-3 rounded-lg border border-orange-500/30">
          <p className="text-sm text-gray-300">Total</p>
          <p className="text-xl font-bold text-orange-500">₹{earnings.total}</p>
        </div>
      </div>

      {earnings.recentRides && earnings.recentRides.length > 0 && (
        <div>
          <h4 className="text-md font-medium mb-2 text-orange-400">
            Recent Earnings
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-800">
                  <th className="py-2 px-3 text-left">Date</th>
                  <th className="py-2 px-3 text-left">From</th>
                  <th className="py-2 px-3 text-left">To</th>
                  <th className="py-2 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {earnings.recentRides.map((ride) => (
                  <tr key={ride._id} className="border-b border-gray-700">
                    <td className="py-2 px-3">
                      {new Date(ride.completedAt).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-3 truncate max-w-[100px]">
                      {ride.pickupLocation.address}
                    </td>
                    <td className="py-2 px-3 truncate max-w-[100px]">
                      {ride.destinationLocation.address}
                    </td>
                    <td className="py-2 px-3 text-right font-medium text-orange-500">
                      ₹{ride.fare}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default RiderEarnings;
