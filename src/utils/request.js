import axios from "axios";

const axiosConfig = {
    baseURL: process.env.REACT_APP_SERVER_URL ? process.env.REACT_APP_SERVER_URL : `http://${window.location.hostname}:3100`,
    timeout: 20000,
}

const request = axios.create(axiosConfig);

export default request;