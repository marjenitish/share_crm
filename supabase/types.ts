export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      customers: {
        Row: {
          australian_citizen: boolean | null
          contact_no: string | null
          country_of_birth: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          english_proficiency: "Very Well" | "Well" | "Not Well" | "Not at All" | null
          equipment_purchased: string[] | null
          first_name: string
          how_did_you_hear: string | null
          id: string
          indigenous_status: "Yes" | "No" | "Prefer not to say" | null
          language_other_than_english: string | null
          next_of_kin_mobile: string | null
          next_of_kin_name: string | null
          next_of_kin_phone: string | null
          next_of_kin_relationship: string | null
          occupation: string | null
          paq_form: boolean | null
          post_code: string | null
          reason_for_class: string | null
          status: "Active" | "Inactive" | null
          street_name: string | null
          street_number: string | null
          suburb: string | null
          surname: string
          updated_at: string | null
          work_mobile: string | null
        }
        Insert: {
          australian_citizen?: boolean | null
          contact_no?: string | null
          country_of_birth?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          english_proficiency?: "Very Well" | "Well" | "Not Well" | "Not at All" | null
          equipment_purchased?: string[] | null
          first_name: string
          how_did_you_hear?: string | null
          id?: string
          indigenous_status?: "Yes" | "No" | "Prefer not to say" | null
          language_other_than_english?: string | null
          next_of_kin_mobile?: string | null
          next_of_kin_name?: string | null
          next_of_kin_phone?: string | null
          next_of_kin_relationship?: string | null
          occupation?: string | null
          paq_form?: boolean | null
          post_code?: string | null
          reason_for_class?: string | null
          status?: "Active" | "Inactive" | null
          street_name?: string | null
          street_number?: string | null
          suburb?: string | null
          surname: string
          updated_at?: string | null
          work_mobile?: string | null
        }
        Update: {
          australian_citizen?: boolean | null
          contact_no?: string | null
          country_of_birth?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          english_proficiency?: "Very Well" | "Well" | "Not Well" | "Not at All" | null
          equipment_purchased?: string[] | null
          first_name?: string
          how_did_you_hear?: string | null
          id?: string
          indigenous_status?: "Yes" | "No" | "Prefer not to say" | null
          language_other_than_english?: string | null
          next_of_kin_mobile?: string | null
          next_of_kin_name?: string | null
          next_of_kin_phone?: string | null
          next_of_kin_relationship?: string | null
          occupation?: string | null
          paq_form?: boolean | null
          post_code?: string | null
          reason_for_class?: string | null
          status?: "Active" | "Inactive" | null
          street_name?: string | null
          street_number?: string | null
          suburb?: string | null
          surname?: string
          updated_at?: string | null
          work_mobile?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Customer = Database['public']['Tables']['customers']['Row'];
export type InsertCustomer = Database['public']['Tables']['customers']['Insert'];
export type UpdateCustomer = Database['public']['Tables']['customers']['Update'];