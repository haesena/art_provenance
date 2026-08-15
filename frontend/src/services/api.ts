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
  event_count?: number;
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
  artwork_id: number;
  artwork_name: string;
  sequence: number;
  type: string;
  date: string | null;
  person: string;
  institution: string;
  actor: string;
  auction?: string;
  auction_id?: number;
  auction_institution?: string;
  exhibition?: string;
  exhibition_id?: number;
  exhibition_institution?: string;
  certainty: string;
  sources: { source: string; notes?: string }[];
  notes: string;
}

export interface Person {
  id: number;
  family_name: string;
  first_name: string;
  birth_date: string | null;
  death_date: string | null;
  artwork_count?: number;
  event_count?: number;
  image?: string | null;
}

export interface EventType {
  id: number;
  name: string;
}

export interface Institution {
  id: number;
  name: string;
  place: string;
  artwork_count: number;
  artworks: {
    id: number;
    name: string;
    image: string | null;
    event_types: string[];
  }[];
}

export interface AuctionReport {
  id: number;
  name: string;
  date: string;
  institution: string;
  artwork_count: number;
  artworks: {
    id: number;
    name: string;
    image: string | null;
    event_types: string[];
  }[];
}

export interface ExhibitionReport {
  id: number;
  name: string;
  date_start: string;
  date_end: string;
  institution: string;
  artwork_count: number;
  artworks: {
    id: number;
    name: string;
    image: string | null;
    event_types: string[];
  }[];
}

export interface SourceReport {
  id: number;
  name: string;
  type: string;
  link: string | null;
  artwork_count: number;
  artworks: {
    id: number;
    name: string;
    image: string | null;
    event_types: string[];
  }[];
}

export interface PersonDetail extends Person {
  biography: string;
  events: (ProvenanceEvent & {
    artwork_id: number;
    artwork_name: string;
  })[];
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

export const getInstitutions = async () => {
  const response = await api.get<{ results: Institution[] }>('/institutions/');
  return response.data;
};

export const getAuctionsReport = async () => {
  const response = await api.get<{ results: AuctionReport[] }>('/auctions/');
  return response.data;
};

export const getExhibitionsReport = async () => {
  const response = await api.get<{ results: ExhibitionReport[] }>('/exhibitions/');
  return response.data;
};

export const getSourcesReport = async () => {
  const response = await api.get<{ results: SourceReport[] }>('/sources/');
  return response.data;
};

export interface UnusedSource {
  id: number;
  name: string;
  type: string;
  link: string | null;
}

export const getUnusedSources = async () => {
  const response = await api.get<{ results: UnusedSource[] }>('/sources/unused/');
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

export interface EventReportRow {
  id: string | number;
  event_id: number;
  artwork_id: number;
  artwork_name: string;
  sequence_number: number;
  event_type_id: number | null;
  event_type_name: string;
  date: string | null;
  person: string;
  institution: string;
  auction: string;
  exhibition: string;
  certainty: string;
  notes: string;
  sources: string;
  source_notes: string;
}

export const getEventReport = async () => {
  const response = await api.get<{ results: EventReportRow[] }>('/events/report/');
  return response.data;
};

export interface InteractionEntity {
  type: 'person' | 'institution';
  id: number;
  name: string;
}

export interface InteractionSourceItem {
  source_id: number;
  source_name: string;
  notes?: string;
}

export interface Interaction {
  id: number;
  entity1: InteractionEntity;
  entity2: InteractionEntity;
  interaction_type: 'long term' | 'singular';
  date: string;
  place: string;
  notes: string;
  sources: InteractionSourceItem[];
}

export interface InteractionPayload {
  entity1_type: 'person' | 'institution';
  entity1_id: number;
  entity2_type: 'person' | 'institution';
  entity2_id: number;
  interaction_type: 'long term' | 'singular';
  date: string;
  place: string;
  notes: string;
  sources: { source_id: number; notes?: string }[];
}

export interface LookupItem {
  id: number;
  name: string;
  place?: string;
}

export const getInteractions = async () => {
  const response = await api.get<{ results: Interaction[] }>('/interactions/');
  return response.data;
};

export const createInteraction = async (payload: InteractionPayload) => {
  const response = await api.post<Interaction>('/interactions/', payload);
  return response.data;
};

export const updateInteraction = async (id: number, payload: InteractionPayload) => {
  const response = await api.put<Interaction>(`/interactions/${id}/`, payload);
  return response.data;
};

export const deleteInteraction = async (id: number) => {
  const response = await api.delete(`/interactions/${id}/`);
  return response.data;
};

export const getPersonLookup = async () => {
  const response = await api.get<{ results: LookupItem[] }>('/persons/lookup/');
  return response.data;
};

export const getInstitutionLookup = async () => {
  const response = await api.get<{ results: LookupItem[] }>('/institutions/lookup/');
  return response.data;
};

export const getSourceLookup = async () => {
  const response = await api.get<{ results: LookupItem[] }>('/sources/lookup/');
  return response.data;
};


