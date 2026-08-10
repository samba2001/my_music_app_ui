'use client';

import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

client.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem('homelab-admin-token');
    if (token) {
      if (config.headers) {
        (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
      } else {
        config.headers = { Authorization: `Bearer ${token}` } as any;
      }
    }
  }
  return config;
});

export default client;
