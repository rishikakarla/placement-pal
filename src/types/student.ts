export interface PlacementOffer {
  id: string;
  companyName: string;
  role: string;
  packageLPA: number;
  offerType: 'placement' | 'internship';
  offerDate: string;
  status: 'accepted' | 'rejected' | 'pending';
}

export interface Student {
  id: string;
  registerNumber: string;
  name: string;
  email: string;
  phone: string;
  branch: string;
  batch: string;
  cgpa: number;
  placementOffers: PlacementOffer[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalStudents: number;
  placedStudents: number;
  avgPackage: number;
  highestPackage: number;
  totalCompanies: number;
  branchWiseStats: Record<string, { total: number; placed: number }>;
}

export const BRANCHES = [
  'Computer Science',
  'Information Technology',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
] as const;

export type Branch = typeof BRANCHES[number];