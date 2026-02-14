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
  name: string;
  medium: string;
  medium_id: number | null;
  art_type: string;
  art_type_id: number | null;
  dimension: string;
  creation_date: string;
  image: string | null;
  notes?: string;
  provenance?: ProvenanceEvent[];
}

export interface ArtType {
  id: number;
  name: string;
}

export interface Medium {
  id: number;
  name: string;
  art_type_id: number | null;
  art_type_name: string;
}

export interface ProvenanceEvent {
  id: number;
  sequence: number;
  type: string;
  date: string | null;
  person: string;
  institution: string;
  actor: string;
  certainty: string;
  sources: string[];
  notes: string;
}

export interface Person {
  id: number;
  family_name: string;
  first_name: string;
  birth_date: string | null;
  death_date: string | null;
}

export interface EventType {
  id: string;
  name: string;
}

export interface PersonDetail extends Person {
  biography: string;
  events: {
    id: number;
    artwork_id: number;
    artwork_name: string;
    event_type: string;
    date: string;
    notes: string;
  }[];
}

export interface User {
  username: string;
  email: string;
  is_authenticated: boolean;
  is_staff: boolean;
}

export const getArtworks = async (params?: { medium?: number; art_type?: number }) => {
  const response = await api.get<{ results: Artwork[] }>('/artworks/', { params });
  return response.data;
};

export const getArtworkDetail = async (id: number) => {
  const response = await api.get<Artwork>(`/artworks/${id}/`);
  return response.data;
};

export const getPersons = async (params?: { event_type?: string }) => {
  const response = await api.get<{ results: Person[] }>('/persons/', { params });
  return response.data;
};

export const getEventTypes = async () => {
  const response = await api.get<{ results: EventType[] }>('/event-types/');
  return response.data;
};

export const getArtTypes = async () => {
  const response = await api.get<{ results: ArtType[] }>('/art-types/');
  return response.data;
};

export const getMediums = async () => {
  const response = await api.get<{ results: Medium[] }>('/mediums/');
  return response.data;
};

export const getPersonDetail = async (id: number) => {
  const response = await api.get<PersonDetail>(`/persons/${id}/`);
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
