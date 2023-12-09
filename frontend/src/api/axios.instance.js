import axios from "axios";

const token = localStorage.getItem("token") || "";
axios.defaults.headers.post["Authorization"] = `Bearer ${token}`;

let userAxios = axios.create({
    baseURL: "https://finsafe-backend.insidefi.io/user/"
})

let tokenAxios = axios.create({
    baseURL: "https://finsafe-backend.insidefi.io/token/"
});

export  { userAxios, tokenAxios };