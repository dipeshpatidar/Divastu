export type UserRole = 'GUEST' | 'TENANT' | 'EMPLOYEE' | 'SUB_ADMIN' | 'SUPER_ADMIN' | 'ADMIN';

export interface UserProfile {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  freeVisitsUsed: number;
  walletBalance: number;
  avatarUrl?: string;
  department?: string;
  permissions?: string[];
}

export interface BhkConfig {
  id: string;
  label: string;
  enabled: boolean;
  demandScore: string;
  avgRent: string;
}

export interface Property {
  id: number;
  title: string;
  listingType: 'RENT' | 'SALE';
  propertyType: 'FLAT' | 'HOUSE' | 'PLOT' | 'LAND';
  city?: string;
  sector: string;
  bhk?: '1RK' | '1BHK' | '2BHK' | '3BHK' | '4BHK' | string;
  monthlyRent: number;
  securityDeposit: number;
  askingPrice?: number;
  totalAreaSqFt: number;
  images: string[];
  videoUrl?: string;
  vastuScore?: number;
  verified: boolean;
  ownerPhone: string;
  latitude: number;
  longitude: number;
  bachelorAllowed?: boolean;
}

