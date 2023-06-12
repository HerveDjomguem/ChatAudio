import { axiosInstance } from ".";

/*
  //Je lui ai deja defini sur messages.js
export const SendMessage = async (message) => {
  try {
    const response = await axiosInstance.post(
      "/api/messages/new-message",
      message
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};*/
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

export const DeleteMessages  = async (messageId) => {
  try {
    const response = await  axiosInstance.delete(
      `/api/messages/${messageId}`
    );
    console.log('delete',response.data)
    return response.data;
  } catch (error) {
    throw error;
  }
};
