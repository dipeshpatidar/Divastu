import { Property, PropertyMediaAsset, RoomTag } from '../types';

const API_BASE_URL = 'http://localhost:8080/api/v1/properties';

export const propertyService = {
  /**
   * Fetches active properties from Spring Boot backend REST API
   */
  async fetchProperties(sector?: string, city?: string): Promise<Property[]> {
    const url = new URL(API_BASE_URL);
    if (sector) url.searchParams.append('sector', sector);
    if (city) url.searchParams.append('city', city);

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    const listings = await response.json();
    
    return listings.map((item: any) => {
      const rawMedia = item.mediaGalleryUrls ? item.mediaGalleryUrls.split(',') : [];
      const images = rawMedia.filter((m: string) => !m.endsWith('.mp4'));
      const video = rawMedia.find((m: string) => m.endsWith('.mp4'));

      return {
        id: item.id,
        title: item.title || '',
        listingType: item.listingType || 'RENT',
        propertyType: item.propertyType || 'FLAT',
        city: item.city || 'Indore',
        sector: item.sector || '',
        bhk: item.bhkCount || item.bhk || '',
        monthlyRent: item.monthlyRent ? Number(item.monthlyRent) : 0,
        securityDeposit: item.securityDeposit ? Number(item.securityDeposit) : 0,
        askingPrice: item.askingPrice ? Number(item.askingPrice) : undefined,
        totalAreaSqFt: item.totalAreaSqFt ? Number(item.totalAreaSqFt) : 0,
        images: images,
        videoUrl: video || '',
        verified: item.status === 'ACTIVE',
        ownerPhone: item.ownerPhoneNumber || '',
        latitude: item.latitude,
        longitude: item.longitude
      };
    });
  },

  /**
   * Admin Creates Property Directly in PostgreSQL Database
   */
  async createProperty(payload: any): Promise<any> {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Failed to create property in PostgreSQL DB: status ${response.status}`);
    }

    return await response.json();
  },

  /**
   * Admin Uploads Single Tagged Photo/Video with Metadata to Cloudinary
   */
  async uploadTaggedMedia(
    propertyId: number, 
    file: File, 
    metadata: {
      roomTag: RoomTag;
      mediaType?: 'IMAGE' | 'VIDEO_WALKTHROUGH';
      caption?: string;
      isPrimaryCover?: boolean;
      sector?: string;
      priceTag?: string;
      vastuFacing?: string;
    }
  ): Promise<PropertyMediaAsset> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('roomTag', metadata.roomTag);
    formData.append('mediaType', metadata.mediaType || 'IMAGE');
    if (metadata.caption) formData.append('caption', metadata.caption);
    if (metadata.isPrimaryCover) formData.append('isPrimaryCover', String(metadata.isPrimaryCover));
    if (metadata.sector) formData.append('sector', metadata.sector);
    if (metadata.priceTag) formData.append('priceTag', metadata.priceTag);
    if (metadata.vastuFacing) formData.append('vastuFacing', metadata.vastuFacing);

    const response = await fetch(`${API_BASE_URL}/${propertyId}/tagged-media`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload tagged media to Cloudinary');
    }

    return await response.json();
  },

  /**
   * Fetch Rich Tagged Media Assets for a Property
   */
  async fetchTaggedMedia(propertyId: number): Promise<PropertyMediaAsset[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/${propertyId}/tagged-media`);
      if (!response.ok) return [];
      return await response.json();
    } catch (err) {
      console.warn('Failed to fetch tagged media:', err);
      return [];
    }
  },

  /**
   * Admin Uploads Photos to Cloudinary via Spring Boot REST API
   */
  async uploadPhotosToCloudinary(propertyId: number, files: File[]): Promise<string[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    const response = await fetch(`${API_BASE_URL}/${propertyId}/photos`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload photos to Cloudinary');
    }

    const data = await response.json();
    return data.urls || [];
  },

  /**
   * Admin Uploads Walkthrough Video to Cloudinary via Spring Boot REST API
   */
  async uploadVideoToCloudinary(propertyId: number, videoFile: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', videoFile);

    const response = await fetch(`${API_BASE_URL}/${propertyId}/video`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload video walkthrough to Cloudinary');
    }

    const data = await response.json();
    return data.videoUrl || '';
  },

  /**
   * Calls Spring Boot backend REST API to parse natural language prompt and auto-save locality in PostgreSQL database
   */
  async parsePropertyPrompt(prompt: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/parse-prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      throw new Error(`Failed to parse prompt on backend: status ${response.status}`);
    }

    return await response.json();
  },

  /**
   * Persists verified ParsedPropertyDTO to PostgreSQL database listings & rental_details tables
   */
  async createPropertyFromParsed(dto: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/create-from-parsed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(dto)
    });

    if (!response.ok) {
      throw new Error(`Failed to create property from parsed DTO: status ${response.status}`);
    }

    return await response.json();
  },

  /**
   * High-Performance Multi-Prompt & Voice Batch Parser API
   */
  async parseBatchPrompts(prompts: string): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/parse-batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ prompts })
    });

    if (!response.ok) {
      throw new Error(`Failed to parse batch prompts: status ${response.status}`);
    }

    return await response.json();
  },

  /**
   * Batch Persist Verified Property Listings to PostgreSQL
   */
  async createBatchProperties(listings: any[]): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/create-batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ listings })
    });

    if (!response.ok) {
      throw new Error(`Failed to create batch properties: status ${response.status}`);
    }

    return await response.json();
  }
};
