import axios, { type AxiosInstance } from 'axios';
import type { Coin } from '../types';

const MARKETS_API_URL =
  import.meta.env.VITE_MARKETS_API_URL || 'https://markets.moliedev.xyz/admin/api';

class MarketsApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: MARKETS_API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - could redirect to login
          console.error('Markets API: Unauthorized');
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic CRUD methods
  async getAll<T>(resource: string, params?: Record<string, unknown>): Promise<T[]> {
    const response = await this.client.get<T[]>(`/${resource}`, { params });
    return response.data;
  }

  async getOne<T>(resource: string, id: number | string): Promise<T> {
    const response = await this.client.get<T>(`/${resource}/${id}`);
    return response.data;
  }

  async create<T, D = Partial<T>>(resource: string, data: D): Promise<T> {
    const response = await this.client.post<T>(`/${resource}`, data);
    return response.data;
  }

  async update<T, D = Partial<T>>(
    resource: string,
    id: number | string,
    data: D
  ): Promise<T> {
    const response = await this.client.put<T>(`/${resource}/${id}`, data);
    return response.data;
  }

  async delete(resource: string, id: number | string): Promise<void> {
    await this.client.delete(`/${resource}/${id}`);
  }

  // Resource-specific methods
  coins = {
    getAll: () => this.getAll<Coin>('coins'),
    getOne: (id: number) => this.getOne<Coin>('coins', id),
    create: (data: Partial<Coin>) => this.create<Coin, Partial<Coin>>('coins', data),
    update: (id: number, data: Partial<Coin>) => this.update<Coin, Partial<Coin>>('coins', id, data),
    delete: (id: number) => this.delete('coins', id),
  };

  categories = {
    getAll: () => this.getAll('categories'),
    getOne: (id: number) => this.getOne('categories', id),
    create: (data: unknown) => this.create('categories', data),
    update: (id: number, data: unknown) => this.update('categories', id, data),
    delete: (id: number) => this.delete('categories', id),
  };

  exchanges = {
    getAll: () => this.getAll('verified_exchanges'),
    getOne: (id: number) => this.getOne('verified_exchanges', id),
    create: (data: unknown) => this.create('verified_exchanges', data),
    update: (id: number, data: unknown) => this.update('verified_exchanges', id, data),
    delete: (id: number) => this.delete('verified_exchanges', id),
  };

  platforms = {
    getAll: () => this.getAll('platforms'),
    getOne: (id: number) => this.getOne('platforms', id),
    create: (data: unknown) => this.create('platforms', data),
    update: (id: number, data: unknown) => this.update('platforms', id, data),
    delete: (id: number) => this.delete('platforms', id),
  };

  chains = {
    getAll: () => this.getAll('chains'),
    getOne: (id: number) => this.getOne('chains', id),
    create: (data: unknown) => this.create('chains', data),
    update: (id: number, data: unknown) => this.update('chains', id, data),
    delete: (id: number) => this.delete('chains', id),
  };

  funds = {
    getAll: () => this.getAll('funds'),
    getOne: (id: number) => this.getOne('funds', id),
    create: (data: unknown) => this.create('funds', data),
    update: (id: number, data: unknown) => this.update('funds', id, data),
    delete: (id: number) => this.delete('funds', id),
  };

  treasuries = {
    getAll: () => this.getAll('treasuries'),
    getOne: (id: number) => this.getOne('treasuries', id),
    create: (data: unknown) => this.create('treasuries', data),
    update: (id: number, data: unknown) => this.update('treasuries', id, data),
    delete: (id: number) => this.delete('treasuries', id),
  };

  treasuryEntities = {
    getAll: () => this.getAll('treasury_entities'),
    getOne: (id: number) => this.getOne('treasury_entities', id),
    create: (data: unknown) => this.create('treasury_entities', data),
    update: (id: number, data: unknown) => this.update('treasury_entities', id, data),
    delete: (id: number) => this.delete('treasury_entities', id),
  };

  languages = {
    getAll: () => this.getAll('languages'),
    getOne: (id: number) => this.getOne('languages', id),
    create: (data: unknown) => this.create('languages', data),
    update: (id: number, data: unknown) => this.update('languages', id, data),
    delete: (id: number) => this.delete('languages', id),
  };
}

export const marketsApi = new MarketsApiClient();
