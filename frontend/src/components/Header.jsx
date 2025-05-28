import {useContext} from "react";
import {Link, useNavigate} from "react-router-dom";
import {motion} from "framer-motion";
import AuthContext from "../context/AuthContext";

const Header = () => {
  const {user, logout} = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <motion.div
          initial={{x: -50, opacity: 0}}
          animate={{x: 0, opacity: 1}}
          transition={{duration: 0.5}}
        >
          <Link to="/" className="text-2xl font-bold flex items-center">
            <span className="mr-2">🚗</span>
            Chlo
          </Link>
        </motion.div>

        <nav>
          <ul className="flex space-x-6">
            <motion.li whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}>
              <Link
                to="/about"
                className="hover:text-blue-200 transition-colors"
              >
                About
              </Link>
            </motion.li>
            <motion.li whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}>
              <Link to="/faq" className="hover:text-blue-200 transition-colors">
                FAQ
              </Link>
            </motion.li>
            <motion.li whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}>
              <Link
                to="/contact"
                className="hover:text-blue-200 transition-colors"
              >
                Contact
              </Link>
            </motion.li>
            {user ? (
              <>
                <motion.li whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}>
                  <Link
                    to="/dashboard"
                    className="hover:text-blue-200 transition-colors"
                  >
                    Dashboard
                  </Link>
                </motion.li>
                <motion.li whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}>
                  <Link
                    to="/profile"
                    className="hover:text-blue-200 transition-colors"
                  >
                    Profile
                  </Link>
                </motion.li>
                <motion.li whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}>
                  <button
                    onClick={handleLogout}
                    className="hover:text-blue-200 transition-colors"
                  >
                    Logout
                  </button>
                </motion.li>
              </>
            ) : (
              <>
                <motion.li whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}>
                  <Link
                    to="/login"
                    className="hover:text-blue-200 transition-colors"
                  >
                    Login
                  </Link>
                </motion.li>
                <motion.li whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}>
                  <Link
                    to="/register"
                    className="hover:text-blue-200 transition-colors"
                  >
                    Register
                  </Link>
                </motion.li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
