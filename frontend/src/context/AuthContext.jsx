import {createContext, useState, useEffect} from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const checkUserLoggedIn = async () => {
      try {
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error("Error checking authentication status:", error);
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []);

  // Register user
  const register = async (userData) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/users",
        userData
      );

      if (response.data) {
        // Ensure memberSince is properly set
        const memberSince =
          response.data.memberSince ||
          response.data.createdAt ||
          new Date().toISOString();
        const userData = {
          ...response.data,
          memberSince,
        };
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
      }

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Registration failed");
    }
  };

  // Login user
  const login = async (userData) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/users/login",
        userData
      );

      if (response.data) {
        // Ensure memberSince is properly set
        const memberSince =
          response.data.memberSince ||
          response.data.createdAt ||
          new Date().toISOString();
        const userData = {
          ...response.data,
          memberSince,
        };
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
      }

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const response = await axios.put(
        "http://localhost:5000/api/users/profile",
        userData,
        config
      );

      if (response.data) {
        // Ensure memberSince is properly set
        const memberSince =
          response.data.memberSince || response.data.createdAt;
        const updatedUser = {
          ...response.data,
          token: user.token,
          memberSince,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
      }

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Profile update failed");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
