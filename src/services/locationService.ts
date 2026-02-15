/**
 * Service untuk menangani data wilayah Indonesia menggunakan API emsifa (CDN GitHub).
 * Pendekatan ini menggantikan penggunaan data statis yang besar untuk meningkatkan performa.
 */

export interface Region {
  id: string;
  name: string;
}

const BASE_URL = 'https://www.emsifa.com/api-wilayah-indonesia/api';

// Simple in-memory cache to avoid redundant requests during a single session
const cache: Record<string, Region[]> = {};

export const locationService = {
  /**
   * Mengambil daftar provinsi
   */
  getProvinces: async (): Promise<Region[]> => {
    const cacheKey = 'provinces';
    if (cache[cacheKey]) return cache[cacheKey];

    try {
      const response = await fetch(`${BASE_URL}/provinces.json`);
      if (!response.ok) throw new Error('Failed to fetch provinces');
      const data = await response.json();
      cache[cacheKey] = data;
      return data;
    } catch (error) {
      console.error('Error in locationService.getProvinces:', error);
      return [];
    }
  },

  /**
   * Mengambil daftar kabupaten/kota berdasarkan ID provinsi
   */
  getRegencies: async (provinceId: string): Promise<Region[]> => {
    if (!provinceId) return [];
    const cacheKey = `regencies-${provinceId}`;
    if (cache[cacheKey]) return cache[cacheKey];

    try {
      const response = await fetch(`${BASE_URL}/regencies/${provinceId}.json`);
      if (!response.ok) throw new Error('Failed to fetch regencies');
      const data = await response.json();
      cache[cacheKey] = data;
      return data;
    } catch (error) {
      console.error(`Error in locationService.getRegencies for province ${provinceId}:`, error);
      return [];
    }
  },

  /**
   * Mengambil daftar kecamatan berdasarkan ID kabupaten/kota
   */
  getDistricts: async (regencyId: string): Promise<Region[]> => {
    if (!regencyId) return [];
    const cacheKey = `districts-${regencyId}`;
    if (cache[cacheKey]) return cache[cacheKey];

    try {
      const response = await fetch(`${BASE_URL}/districts/${regencyId}.json`);
      if (!response.ok) throw new Error('Failed to fetch districts');
      const data = await response.json();
      cache[cacheKey] = data;
      return data;
    } catch (error) {
      console.error(`Error in locationService.getDistricts for regency ${regencyId}:`, error);
      return [];
    }
  },

  /**
   * Mengambil daftar kelurahan berdasarkan ID kecamatan
   */
  getVillages: async (districtId: string): Promise<Region[]> => {
    if (!districtId) return [];
    const cacheKey = `villages-${districtId}`;
    if (cache[cacheKey]) return cache[cacheKey];

    try {
      const response = await fetch(`${BASE_URL}/villages/${districtId}.json`);
      if (!response.ok) throw new Error('Failed to fetch villages');
      const data = await response.json();
      cache[cacheKey] = data;
      return data;
    } catch (error) {
      console.error(`Error in locationService.getVillages for district ${districtId}:`, error);
      return [];
    }
  },

  /**
   * Mendapatkan nama wilayah berdasarkan ID dari daftar wilayah yang ada
   */
  getNameById: (regions: Region[], id: string): string => {
    const region = regions.find(r => r.id === id);
    return region ? region.name : '';
  }
};
