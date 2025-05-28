import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import {AuthProvider} from "./context/AuthContext";
import {SocketProvider} from "./context/SocketContext";
import {useContext} from "react";
import AuthContext from "./context/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import GoogleMapsLoader from "./components/GoogleMapsLoader";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ToastProvider from "./components/ToastProvider";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PassengerDashboard from "./pages/PassengerDashboard";
import RiderDashboard from "./pages/RiderDashboard";
import Profile from "./pages/Profile";
import ActiveRide from "./pages/ActiveRide";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import FAQPage from "./pages/FAQPage";
import NotFoundPage from "./pages/NotFoundPage";

// Styles
import "./index.css";
import "./styles/theme.css";

// Component to route to the correct dashboard based on user type
const DashboardSelector = () => {
  const {user} = useContext(AuthContext);
  return user?.userType === "rider" ? (
    <RiderDashboard />
  ) : (
    <PassengerDashboard />
  );
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <SocketProvider>
            <GoogleMapsLoader>
              <div className="flex flex-col min-h-screen">
                <ToastProvider>
                  <Navbar />
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/faq" element={<FAQPage />} />

                    {/* Protected Routes */}
                    <Route element={<ProtectedRoute />}>
                      {/* Dashboard based on user type */}
                      <Route
                        path="/dashboard"
                        element={<DashboardSelector />}
                      />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/ride/:rideId" element={<ActiveRide />} />
                    </Route>

                    {/* 404 Page - This should be the last route */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                  <Footer />
                </ToastProvider>
              </div>
            </GoogleMapsLoader>
          </SocketProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
