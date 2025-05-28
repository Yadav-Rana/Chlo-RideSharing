import React, {useState, useContext} from "react";
import {Link, useNavigate, useLocation} from "react-router-dom";
import {motion, AnimatePresence} from "framer-motion";
import AuthContext from "../context/AuthContext";
import Avatar from "./Avatar";
import ChloLogo from "./ChloLogo";

const Navbar = () => {
  const {user, logout} = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setProfileMenuOpen(false);
    setMobileMenuOpen(false);
  };

  // Don't show navbar on login, register, and landing pages
  if (["/login", "/register", "/"].includes(location.pathname)) {
    return null;
  }

  return (
    <nav className="bg-app border-b border-gray-700/50 fixed top-0 left-0 right-0 z-50 h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <ChloLogo size="sm" animate={true} />
              <span className="ml-2 text-xl font-bold text-orange-500">
                CHLO
              </span>
            </Link>

            <div className="hidden md:ml-6 md:flex md:space-x-6">
              <NavLink to="/dashboard">Dashboard</NavLink>
              <NavLink to="/about">About</NavLink>
              <NavLink to="/contact">Contact</NavLink>
              <NavLink to="/faq">FAQ</NavLink>
            </div>
          </div>

          <div className="flex items-center">
            {user ? (
              <div className="hidden md:flex md:items-center">
                <div className="relative">
                  <motion.button
                    className="flex items-center space-x-2 text-white focus:outline-none"
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    whileHover={{scale: 1.05}}
                    whileTap={{scale: 0.95}}
                  >
                    <Avatar name={user.name} size="sm" status="online" />
                    <span className="text-sm font-medium">{user.name}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </motion.button>

                  <AnimatePresence>
                    {profileMenuOpen && (
                      <motion.div
                        className="absolute right-0 mt-2 w-48 py-2 bg-[#1E2235] rounded-lg shadow-xl z-50 border border-gray-700"
                        initial={{opacity: 0, y: -10}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, y: -10}}
                        transition={{duration: 0.2}}
                      >
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-orange-500/10 hover:text-white"
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          Your Profile
                        </Link>
                        <Link
                          to="/dashboard"
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-orange-500/10 hover:text-white"
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-orange-500/10 hover:text-white"
                        >
                          Sign out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex md:items-center md:space-x-4">
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-2 rounded-md text-sm font-medium shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all duration-300"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <motion.button
                className="text-gray-400 hover:text-white focus:outline-none"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                whileTap={{scale: 0.95}}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {mobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden bg-[#1E2235] border-t border-gray-700/50"
            initial={{opacity: 0, height: 0}}
            animate={{opacity: 1, height: "auto"}}
            exit={{opacity: 0, height: 0}}
            transition={{duration: 0.3}}
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              <MobileNavLink
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </MobileNavLink>
              <MobileNavLink
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </MobileNavLink>
              <MobileNavLink
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </MobileNavLink>
              <MobileNavLink to="/faq" onClick={() => setMobileMenuOpen(false)}>
                FAQ
              </MobileNavLink>
            </div>

            {user ? (
              <div className="pt-4 pb-3 border-t border-gray-700/50">
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <Avatar name={user.name} size="md" />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-white">
                      {user.name}
                    </div>
                    <div className="text-sm font-medium text-gray-400">
                      {user.email}
                    </div>
                  </div>
                </div>
                <div className="mt-3 px-2 space-y-1">
                  <Link
                    to="/profile"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-orange-500/10 hover:text-white"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Your Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-orange-500/10 hover:text-white"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-4 pb-3 border-t border-gray-700/50 px-4 flex flex-col space-y-2">
                <Link
                  to="/login"
                  className="w-full text-center px-3 py-2 rounded-md text-base font-medium text-gray-300 border border-gray-700 hover:bg-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="w-full text-center px-3 py-2 rounded-md text-base font-medium bg-gradient-to-r from-amber-400 to-orange-500 text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// Desktop Navigation Link
const NavLink = ({to, children}) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive ? "text-orange-400" : "text-gray-300 hover:text-white"
      }`}
    >
      {children}
      {isActive && (
        <motion.div
          className="h-0.5 bg-orange-500 mt-1"
          layoutId="navbar-indicator"
          transition={{type: "spring", stiffness: 300, damping: 30}}
        />
      )}
    </Link>
  );
};

// Mobile Navigation Link
const MobileNavLink = ({to, onClick, children}) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`block px-3 py-2 rounded-md text-base font-medium ${
        isActive
          ? "bg-orange-500/10 text-orange-400"
          : "text-gray-300 hover:bg-gray-700 hover:text-white"
      }`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
};

export default Navbar;
