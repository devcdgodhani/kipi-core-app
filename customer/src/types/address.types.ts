export interface Location {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface Address {
  _id: string;
  userId: string;
  name: string;
  mobile: string;
  alternateMobile?: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  type: 'HOME' | 'WORK' | 'OTHER';
  location?: Location;
  isDefault: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressRequest {
  userId: string;
  name: string;
  mobile: string;
  alternateMobile?: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  type?: 'HOME' | 'WORK' | 'OTHER';
  location?: Location;
  isDefault?: boolean;
}

export interface UpdateAddressRequest {
  name?: string;
  mobile?: string;
  alternateMobile?: string;
  street?: string;
  landmark?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  type?: 'HOME' | 'WORK' | 'OTHER';
  location?: Location;
  isDefault?: boolean;
  status?: string;
}
