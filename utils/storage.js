import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "authToken";
const USER_KEY = "authUser";

export const storeToken = async (token) => {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
};

export const getToken = async () => {
  return await SecureStore.getItemAsync(TOKEN_KEY);
};

export const removeToken = async () => {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
};

export const storeUser = async (user) => {
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
};

export const getUser = async () => {
  const userStr = await SecureStore.getItemAsync(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

export const removeUser = async () => {
  await SecureStore.deleteItemAsync(USER_KEY);
};
