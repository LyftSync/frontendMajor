import axios from "axios";
import { API_BASE_URL } from "../constants/api";

export const getMe = async () => {
  const response = await axios.get(`${API_BASE_URL}/auth/me`);
  return response.data;
};
