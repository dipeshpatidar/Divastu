import { Property, PropertyMediaAsset, RoomTag } from '../types';

const API_BASE_URL = 'http://localhost:8080/api/v1/properties';

export const propertyService = {
  /**
   * Fetches active properties from Spring Boot backend REST API
   */
  async fetchProperties(sector?: string, city?: string): Promise<Property[]> {
    try {
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
          title: item.title || 'Indore Property',
          listingType: item.listingType || 'RENT',
          propertyType: item.propertyType || 'FLAT',
          city: item.city || 'Indore',
          sector: item.sector || 'Vijay Nagar',
          bhk: item.bhk || '3BHK',
          monthlyRent: item.monthlyRent ? Number(item.monthlyRent) : 20000,
          securityDeposit: item.securityDeposit ? Number(item.securityDeposit) : 40000,
          askingPrice: item.askingPrice ? Number(item.askingPrice) : undefined,
          totalAreaSqFt: item.totalAreaSqFt || 1500,
          images: images.length > 0 ? images : ['/assets/hero_luxury.jpg', '/assets/interior_living.jpg'],
          videoUrl: video || '/assets/videos/property_walkthrough_1.mp4',
          verified: item.status === 'ACTIVE',
          ownerPhone: item.ownerPhoneNumber || '+91 98260 *****',
          latitude: item.latitude || 22.7533,
          longitude: item.longitude || 75.8937
        };
      });
    } catch (err) {
      console.warn('Backend API offline or unreachable, using live fallback properties:', err);
      return [];
    }
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
  }
};
