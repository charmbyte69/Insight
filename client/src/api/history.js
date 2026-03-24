import axios from "axios";


const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR – handle errors globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log("Unauthorized – maybe redirect to login");
    }
    return Promise.reject(error);
  }
);

export const getHistory = () => {
  return API.get("/history/");  // GET request to /history/
};

export const deleteHistory = (dataIds) => {
  return API.delete("/history/", { data: { data_ids: dataIds } });  // DELETE request to /history/ with body
}


