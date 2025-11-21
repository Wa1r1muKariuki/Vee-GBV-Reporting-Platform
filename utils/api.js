import axios from "axios";

const API_BASE = "http://localhost:5000/api"; // Flask backend URL

export const sendMessage = async (message, sessionId) => {
  try {
    const response = await axios.post(`${API_BASE}/chatbot`, {
      message,
      session_id: sessionId,
    });
    return response.data; // Rasa response
  } catch (err) {
    console.error(err);
    return { text: "Oops! Something went wrong." };
  }
};

export const fetchResources = async () => {
  try {
    const res = await axios.get(`${API_BASE}/resources`);
    return res.data;
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const fetchIncidents = async () => {
  try {
    const res = await axios.get(`${API_BASE}/incidents`);
    return res.data;
  } catch (err) {
    console.error(err);
    return [];
  }
};
