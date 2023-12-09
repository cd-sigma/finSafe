import axios from "axios";

const token = localStorage.getItem("token") || "";
axios.defaults.headers.post["Authorization"] = `Bearer ${token}`;

let userAxios = axios.create({
    baseURL: "http://localhost:3001/user/"
})

let tokenAxios = axios.create({
    baseURL: "http://localhost:3001/token/"
});

export  { userAxios, tokenAxios };