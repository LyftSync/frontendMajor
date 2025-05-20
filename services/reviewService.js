import axios from "axios";
import { API_BASE_URL } from "../constants/api";

export const createReview = async (reviewData) => {
  const response = await axios.post(`${API_BASE_URL}/reviews`, reviewData);
  return response.data;
};
