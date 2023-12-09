import { userAxios, tokenAxios } from "./axios.instance";

export const getPortfolioDetails = async (address) => {
  try {
    const response = await userAxios.get(address);
    const { result } = response.data;
    const { data } = result;
    return data;
  } catch (err) {
    console.log(`Error occured while fetching portfolio details`, err);
  }
};

export const getTokenDetails = async (token) => {
  try {
    const response = await tokenAxios.get(token);
    const { result } = response.data;
    const { data } = result;
    const { logoURI, price } = data;
    return { logoURI: logoURI, price: price };
  } catch (err) {
    console.log(`Error occured while fetching token details`, err);
  }
};
