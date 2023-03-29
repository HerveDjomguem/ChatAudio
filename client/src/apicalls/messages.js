import { axiosInstance } from ".";

export const GetMessages = async (chatId) => {
  try {
    const response = await axiosInstance.get(
      `/api/messages/get-all-messages/${chatId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
