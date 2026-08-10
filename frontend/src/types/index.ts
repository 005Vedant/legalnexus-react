export type UserRole = 'client' | 'lawyer' | 'admin';

export interface Profile {
  id: string;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  role?: UserRole | null;
  gender?: string | null;
  age?: number | string | null;
  photo_url?: string | null;
  created_at?: string;
}

export interface Lawyer {
  id: string;
  user_id?: string | null;
  name: string;
  bio?: string | null;
  specialty: string;
  experience_years?: number | null;
  phone?: string | null;
  email?: string | null;
  rating?: number | null;
  profile_image?: string | null;
  created_at?: string;
}

export interface Case {
  id: string;
  title: string;
  description?: string | null;
  case_type?: string | null;
  status: 'Pending' | 'Active' | 'Resolved' | 'Closed' | string;
  client_id?: string | null;
  assigned_lawyer_id?: string | null;
  hearing_date?: string | null;
  case_location?: string | null;
  document_url?: string | null;
  notes?: string | null;
  created_at?: string;
}

export interface Hearing {
  id: string;
  case_id: string;
  hearing_date: string;
  location?: string | null;
  notes?: string | null;
  created_at?: string;
}

export interface Review {
  id?: string;
  name: string;
  location?: string | null;
  message: string;
  rating: number;
  created_at?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}
