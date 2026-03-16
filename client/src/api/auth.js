import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export const registerUser = (data) => {
  return API.post("/auth/register", data);
};

export const loginUser = (data) => {
  return API.post("/auth/login", data);
};