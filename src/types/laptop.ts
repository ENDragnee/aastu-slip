export interface LaptopUser {
  id: string;
  name: string;
  universityId: string;
  email: string;
}

export interface LaptopRecord {
  id: string;
  serialNumber: string;
  model: string;
  manufacturer: string;
  createdAt: string;
  user: LaptopUser;
}

export interface LaptopFetchParams {
  page: number;
  limit: number;
  sort: string;
  search?: string;
}
