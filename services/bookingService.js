import axios from "axios";
import { API_BASE_URL } from "../constants/api";

export const createBooking = async (rideId, bookingData) => {
  const response = await axios.post(`${API_BASE_URL}/rides/${rideId}/bookings`, bookingData);
  return response.data;
};

export const getMyBookingRequests = async () => {
  const response = await axios.get(`${API_BASE_URL}/bookings/my-requests`);
  return response.data;
};

export const updateBookingStatus = async (bookingId, status) => {
  const response = await axios.patch(`${API_BASE_URL}/bookings/${bookingId}/status`, { status });
  return response.data;
};

export const getBookingById = async (bookingId) => {
  const response = await axios.get(`${API_BASE_URL}/bookings/${bookingId}`);
  return response.data;
};
