import React, { createContext, useState, useEffect, useContext } from "react";
import {
  getToken,
  getUser,
  storeToken,
  storeUser,
  removeToken,
  removeUser,
} from "../utils/storage";
import axios from "axios";
import { API_BASE_URL } from "../constants/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCredentials = async () => {
      const storedToken = await getToken();
      const storedUser = await getUser();
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
        axios.defaults.headers.common["Authorization"] =
          `Bearer ${storedToken}`;
      }
      setIsLoading(false);
    };
    loadCredentials();
  }, []);

  const login = async (emailOrPhone, password) => {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      emailOrPhone,
      password,
    });
    const { token: newToken, ...userData } = response.data;
    setToken(newToken);
    setUser(userData);
    await storeToken(newToken);
    await storeUser(userData);
    axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    return userData;
  };

  const register = async (userData) => {
    const response = await axios.post(
      `${API_BASE_URL}/auth/register`,
      userData,
    );
    const { token: newToken, ...newUserData } = response.data;
    setToken(newToken);
    setUser(newUserData);
    await storeToken(newToken);
    await storeUser(newUserData);
    axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    return newUserData;
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await removeToken();
    await removeUser();
    delete axios.defaults.headers.common["Authorization"];
  };

  const updateUserContext = async (updatedUserData) => {
    setUser(updatedUserData);
    await storeUser(updatedUserData);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        isLoading,
        updateUserContext,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
