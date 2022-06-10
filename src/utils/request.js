import axios from "axios";

export const SERVER_URL = process.env.REACT_APP_SERVER_URL ? process.env.REACT_APP_SERVER_URL : `http://${window.location.hostname}:3100`;

const axiosConfig = {
    baseURL: SERVER_URL,
    timeout: 20000,
}

const request = axios.create(axiosConfig);

export default request;