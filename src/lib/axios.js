import axios from "axios";
import qs from "qs";

const serverOption = process.env.NEXT_PUBLIC_SERVER_OPTION;
const productionApiUrl = process.env.NEXT_PUBLIC_API_URL;
const devApiUrl = process.env.NEXT_PUBLIC_DEV_API_URL;

const apiUrl = serverOption === "dev" ? devApiUrl : productionApiUrl;
console.log("CHECK API URL", apiUrl);

export default axios.create({
  baseURL: apiUrl,
  paramsSerializer: (params) => {
    return qs.stringify(params, { arrayFormat: "brackets" });
  },
});
