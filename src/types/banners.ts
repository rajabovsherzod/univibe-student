// Banner Types for Univibe Student Platform

export interface Banner {
  public_id: string;
  title: string;
  subtitle?: string;
  image: string;
  mobile_image?: string | null;
  cta_text?: string;
  cta_link?: string;
  scope: 'GLOBAL' | 'UNIVERSITY';
  university_name?: string | null;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  is_active?: boolean;
  display_order?: number;
  start_at?: string | null;
  end_at?: string | null;
  created_at?: string;
}

export interface BannersResponse {
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    next: string | null;
    previous: string | null;
  };
  results: Banner[];
}
