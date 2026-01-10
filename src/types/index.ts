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
