import Constants from "expo-constants";

// export const API_BASE_URL = "http://10.178.240.221:5000/api";
const HOST = Constants.expoConfig.extra.API_HOST;
console.log("this the host ip" + HOST)
export const API_BASE_URL = `http://${HOST}:5000/api`;
