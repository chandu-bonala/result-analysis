import axios from 'axios';

const API_BASE_URL = 'http://172.16.3.237:8000'; // 🔁 Replace with your FastAPI URL

export const fetchResult = async (htno: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/get_result/${htno}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Result not found for the given Hall Ticket number');
    } else {
      throw new Error('Error fetching result');
    }
  }
};
