import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import PassengerDashboard from './PassengerDashboard';
import RiderDashboard from './RiderDashboard';
import Loader from '../components/Loader';

const Dashboard = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <Loader text="Loading dashboard..." />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return user.userType === 'passenger' ? <PassengerDashboard /> : <RiderDashboard />;
};

export default Dashboard;
