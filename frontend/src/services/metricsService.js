import API from "../api";

export const getUserMetrics = async (userId) => {
  const response = await API.get(`/metrics/${userId}`);
  return response.data;
};
