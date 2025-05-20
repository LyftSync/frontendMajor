import axios from "axios";
import { API_BASE_URL } from "../constants/api";

export const createRide = async (rideData) => {
  const response = await axios.post(`${API_BASE_URL}/rides`, rideData);
  return response.data;
};

export const searchRides = async (params) => {
  const response = await axios.get(`${API_BASE_URL}/rides`, { params });
  return response.data;
};

export const getMyOfferedRides = async () => {
  const response = await axios.get(`${API_BASE_URL}/rides/my-offered`);
  return response.data;
};

export const getRideById = async (rideId) => {
  const response = await axios.get(`${API_BASE_URL}/rides/${rideId}`);
  return response.data;
};

export const updateRide = async (rideId, rideData) => {
  const response = await axios.put(`${API_BASE_URL}/rides/${rideId}`, rideData);
  return response.data;
};

export const updateRideStatus = async (rideId, status) => {
  const response = await axios.patch(`${API_BASE_URL}/rides/${rideId}/status`, { status });
  return response.data;
};

export const getRideBookings = async (rideId) => {
  const response = await axios.get(`${API_BASE_URL}/rides/${rideId}/bookings`);
  return response.data;
};
