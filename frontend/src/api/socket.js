import { io } from 'socket.io-client';

// ✅ Use Render backend URL in production
const URL =
  process.env.NODE_ENV === 'production'
    ? 'https://book-base-1.onrender.com' // live backend
    : 'http://localhost:5000';       // local dev

export const socket = io(URL, {
  autoConnect: true,
});