import axios from "axios";
const BASE_URL = "https://talking-dreams-backend.onrender.com";
// const BASE_URL = "http://localhost:3500";
// const BASE_URL = "http://192.168.1.4:3500";

export default axios.create({
    baseURL: BASE_URL,
});

export const axiosPrivate = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});
