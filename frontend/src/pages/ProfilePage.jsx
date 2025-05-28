import { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import AuthContext from '../context/AuthContext';
import Button from '../components/Button';
import Loader from '../components/Loader';

const ProfilePage = () => {
  const { user, updateProfile } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    confirmPassword: '',
    vehicle: {
      type: user?.vehicle?.type || 'car',
      model: user?.vehicle?.model || '',
      registrationNumber: user?.vehicle?.registrationNumber || '',
    },
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { name, email, password, confirmPassword, vehicle } = formData;

  const handleChange = (e) => {
    if (e.target.name.startsWith('vehicle.')) {
      const vehicleField = e.target.name.split('.')[1];
      setFormData({
        ...formData,
        vehicle: {
          ...formData.vehicle,
          [vehicleField]: e.target.value,
        },
      });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validation
    if (password && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password && password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (user?.userType === 'rider' && (!vehicle.model || !vehicle.registrationNumber)) {
      setError('Please provide vehicle information');
      return;
    }

    try {
      setLoading(true);
      
      // Remove confirmPassword and empty password before sending to API
      const userData = { ...formData };
      delete userData.confirmPassword;
      if (!userData.password) delete userData.password;
      
      await updateProfile(userData);
      setSuccess('Profile updated successfully');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <Loader text="Loading profile..." />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h1
        className="text-3xl font-bold mb-6 text-gray-800"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Your Profile
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <motion.div
            className="bg-white p-6 rounded-lg shadow-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {error && (
              <motion.div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {error}
              </motion.div>
            )}
            
            {success && (
              <motion.div
                className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {success}
              </motion.div>
            )}
            
            {loading ? (
              <Loader text="Updating profile..." />
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password (leave blank to keep current)
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                {user.userType === 'rider' && (
                  <div className="mb-6 border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-700 mb-4">Vehicle Information</h3>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vehicle Type
                      </label>
                      <select
                        name="vehicle.type"
                        value={vehicle.type}
                        onChange={handleChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option value="car">Car</option>
                        <option value="bike">Bike</option>
                        <option value="auto">Auto</option>
                      </select>
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="vehicleModel" className="block text-sm font-medium text-gray-700 mb-1">
                        Vehicle Model
                      </label>
                      <input
                        id="vehicleModel"
                        name="vehicle.model"
                        type="text"
                        value={vehicle.model}
                        onChange={handleChange}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700 mb-1">
                        Registration Number
                      </label>
                      <input
                        id="registrationNumber"
                        name="vehicle.registrationNumber"
                        type="text"
                        value={vehicle.registrationNumber}
                        onChange={handleChange}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                )}
                
                <Button
                  type="submit"
                  variant="primary"
                >
                  Update Profile
                </Button>
              </form>
            )}
          </motion.div>
        </div>

        <div>
          <motion.div
            className="bg-white p-6 rounded-lg shadow-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="text-center mb-4">
              <div className="inline-block bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center text-blue-600 text-3xl font-bold mb-3">
                {user.name.charAt(0)}
              </div>
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-gray-500">{user.email}</p>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Account Type:</span>
                <span className="font-medium capitalize">{user.userType}</span>
              </div>
              
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Rating:</span>
                <span className="font-medium">{user.rating ? `${user.rating.toFixed(1)} ⭐` : 'No ratings yet'}</span>
              </div>
              
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Total Rides:</span>
                <span className="font-medium">{user.totalRides || 0}</span>
              </div>
              
              {user.userType === 'rider' && user.vehicle && (
                <>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Vehicle:</span>
                    <span className="font-medium capitalize">{user.vehicle.type}</span>
                  </div>
                  
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Model:</span>
                    <span className="font-medium">{user.vehicle.model}</span>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
