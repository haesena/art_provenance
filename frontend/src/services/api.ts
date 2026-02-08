import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // Required for sessions/cookies
});

// Helper to get CSRF token from cookies
api.interceptors.request.use(config => {
  const name = 'csrftoken';
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  if (cookieValue) {
    config.headers['X-CSRFToken'] = cookieValue;
  }
  return config;
});

export interface Artwork {
  id: number;
  title: string;
  medium: string;
  dimensions: string;
  creation_date: string;
  image: string | null;
  notes?: string;
  provenance?: ProvenanceEvent[];
}

export interface ProvenanceEvent {
  id: number;
  sequence: number;
  type: string;
  date: string | null;
  actor: string;
  role: string | null;
  certainty: string;
  source: string | null;
  notes: string;
}

export interface User {
  username: string;
  email: string;
  is_authenticated: boolean;
  is_staff: boolean;
}

export const getArtworks = async () => {
  const response = await api.get<{ results: Artwork[] }>('/artworks/');
  return response.data;
};

export const getArtworkDetail = async (id: number) => {
  const response = await api.get<Artwork>(`/artworks/${id}/`);
  return response.data;
};

export const login = async (credentials: any) => {
  const response = await api.post<User>('/auth/login/', credentials);
  return response.data;
};

export const logout = async () => {
  await api.post('/auth/logout/');
};

export const getMe = async () => {
  const response = await api.get<User>('/auth/me/');
  return response.data;
};

export const fetchCsrfToken = async () => {
  await api.get('/auth/csrf/');
};
