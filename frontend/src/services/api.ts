import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
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

export const getArtworks = async () => {
  const response = await api.get<{ results: Artwork[] }>('/artworks/');
  return response.data;
};

export const getArtworkDetail = async (id: number) => {
  const response = await api.get<Artwork>(`/artworks/${id}/`);
  return response.data;
};
