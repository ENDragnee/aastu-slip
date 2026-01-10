export interface Exits {
  id: string;
  student: string;
  items: string[];
  laptops: string[];
}

export interface UserExitInfo {
  name?: string;
  universityId?: string;
  block?: string;
  dormNumber?: number;
  profileUrl: string;
}

export interface SelectedItem {
  name: string;
  quantity: number;
}

export interface ItemOption {
  name: string;
  description: string;
}

export interface RouteParam {
  params: Promise<{
    id: string;
  }>;
}
