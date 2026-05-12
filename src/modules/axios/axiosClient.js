import axios from 'axios';

const axiosClient = axios.create({
  timeout: 10000,
});

export default axiosClient;
