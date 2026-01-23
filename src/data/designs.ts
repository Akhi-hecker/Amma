export interface Design {
    id: string;
    name: string;      // Mapped from 'title'
    category: string;  // Mapped from 'category'
    image: string;     // Computed based on props/category
    descriptor: string; // Mapped from 'short_description'
    badge?: string;
    // New fields from DB
    long_description?: string;
    fabric_suitability?: string;
    complexity?: string;
    base_price?: number;
    is_active?: boolean;
}

// NOTE: Hardcoded DESIGNS array has been removed.
// Data is now fetched from Supabase 'designs' table.
export const DESIGNS: Design[] = [];
