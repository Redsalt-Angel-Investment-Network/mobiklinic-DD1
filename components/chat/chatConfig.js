// chatConfig.js
import { StreamChat } from 'stream-chat';

export const chatApiKey = 'dz5f4d5kzrue';
export const chatUserId = 'black-leaf-8';
export const chatUserToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYmxhY2stbGVhZi04IiwiZXhwIjoxNzA5NjYyMDA0fQ.ZdlgPyijqhcaaWu6f-aRKXsKlsH7V4tF208jpwjEw0E';
export const chatUserName = 'black';


const chatClient = StreamChat.getInstance(chatApiKey);

export { chatClient };