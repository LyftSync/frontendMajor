import axios from "axios";
import { API_BASE_URL } from "../constants/api";

export const updateUserProfile = async (profileData) => {
  const response = await axios.put(`${API_BASE_URL}/users/profile`, profileData);
  return response.data;
};

export const getUserProfile = async (userId) => {
  const response = await axios.get(`${API_BASE_URL}/users/${userId}`);
  return response.data;
};

export const getUserReviews = async (userId) => {
  const response = await axios.get(`${API_BASE_URL}/users/${userId}/reviews`);
  return response.data;
};
