export type DogSize = "small" | "medium" | "large" | "xlarge";
export type DogStatus = "available" | "pending" | "adopted" | "on_hold";
export type EnergyLevel = "low" | "moderate" | "high";
export type ApplicationStatus =
  | "submitted"
  | "reviewing"
  | "approved"
  | "more_info"
  | "declined"
  | "withdrawn";

export interface Dog {
  id: string;
  shelter_id: string;
  name: string;
  breed_primary: string | null;
  breed_secondary: string | null;
  age_years: number | null;
  age_months: number | null;
  size: DogSize;
  weight_lbs: number | null;
  sex: "male" | "female";
  energy_level: EnergyLevel;
  good_with_kids: boolean | null;
  good_with_dogs: boolean | null;
  good_with_cats: boolean | null;
  house_trained: boolean | null;
  special_needs: string | null;
  medical_notes: string | null;
  personality: string | null;
  adoption_fee_cents: number | null;
  status: DogStatus;
  photos: string[];
  source: "manual" | "rescuegroups" | "shelterluv" | "24petconnect";
  external_id: string | null;
  coat_primary: string | null;
  coat_secondary: string | null;
  created_at: string;
  updated_at: string;
  shelter?: Shelter;
}

export interface Shelter {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  website: string | null;
  description: string | null;
  logo_url: string | null;
  verified: boolean;
  tax_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdopterProfile {
  id: string;
  user_id: string;
  living_situation: string | null;
  has_yard: boolean | null;
  has_kids: boolean | null;
  has_dogs: boolean | null;
  has_cats: boolean | null;
  activity_level: string | null;
  size_preference: string | null;
  age_preference: string | null;
  experience_level: string | null;
  deal_breakers: string | null;
  zip: string | null;
  max_adoption_fee_cents: number | null;
  raw_chat_transcript: ChatMessage[] | null;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  user_id: string;
  dog_id: string;
  shelter_id: string;
  profile_id?: string | null;
  status: ApplicationStatus;
  applicant_notes?: string | null;
  match_score: number | null;
  shelter_notes: string | null;
  created_at: string;
  updated_at: string;
  dog?: Dog;
  shelter?: Shelter;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface MatchResult {
  dog: Dog;
  score: number;
  reasons: string[];
}

export interface AdopterPreferences {
  living_situation?: string;
  has_yard?: boolean;
  has_kids?: boolean;
  has_dogs?: boolean;
  has_cats?: boolean;
  activity_level?: string;
  size_preference?: DogSize | null;
  age_preference?: string;
  experience_level?: string;
  zip?: string;
  max_fee_cents?: number;
  deal_breakers?: string[];
}
