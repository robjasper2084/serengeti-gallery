export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          actor: string | null
          created_at: string
          id: number
          record_id: string
          record_type: string
        }
        Insert: {
          action: string
          actor?: string | null
          created_at?: string
          id?: never
          record_id: string
          record_type: string
        }
        Update: {
          action?: string
          actor?: string | null
          created_at?: string
          id?: never
          record_id?: string
          record_type?: string
        }
        Relationships: []
      }
      artworks: {
        Row: {
          alt_text: string
          credit: string
          description: string
          display_approved: boolean
          id: string
          preview_path: string
          rights_note: string
          sale_approved: boolean
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          alt_text: string
          credit: string
          description?: string
          display_approved?: boolean
          id: string
          preview_path: string
          rights_note?: string
          sale_approved?: boolean
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          alt_text?: string
          credit?: string
          description?: string
          display_approved?: boolean
          id?: string
          preview_path?: string
          rights_note?: string
          sale_approved?: boolean
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      films: {
        Row: {
          caption_path: string | null
          creator: string
          display_approved: boolean
          duration_seconds: number | null
          id: string
          light_cues: Json | null
          rights_note: string
          source_url: string
          status: string
          title: string
          transcript: string | null
        }
        Insert: {
          caption_path?: string | null
          creator: string
          display_approved?: boolean
          duration_seconds?: number | null
          id: string
          light_cues?: Json | null
          rights_note?: string
          source_url: string
          status?: string
          title: string
          transcript?: string | null
        }
        Update: {
          caption_path?: string | null
          creator?: string
          display_approved?: boolean
          duration_seconds?: number | null
          id?: string
          light_cues?: Json | null
          rights_note?: string
          source_url?: string
          status?: string
          title?: string
          transcript?: string | null
        }
        Relationships: []
      }
      gallery_roles: {
        Row: {
          role: string
          user_id: string
        }
        Insert: {
          role: string
          user_id: string
        }
        Update: {
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      passport_progress: {
        Row: {
          created_at: string
          item_id: string
          kind: string
          user_id: string
        }
        Insert: {
          created_at?: string
          item_id: string
          kind: string
          user_id: string
        }
        Update: {
          created_at?: string
          item_id?: string
          kind?: string
          user_id?: string
        }
        Relationships: []
      }
      placements: {
        Row: {
          artwork_id: string
          id: string
          position: Json | null
          room_id: string
          slot: number
          updated_at: string
        }
        Insert: {
          artwork_id: string
          id?: string
          position?: Json | null
          room_id: string
          slot: number
          updated_at?: string
        }
        Update: {
          artwork_id?: string
          id?: string
          position?: Json | null
          room_id?: string
          slot?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "placements_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "placements_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          artwork_id: string
          currency: string
          fulfillment: Json
          id: string
          kind: string
          license_version: string | null
          price_minor: number
          status: string
          stock: number
        }
        Insert: {
          artwork_id: string
          currency: string
          fulfillment?: Json
          id?: string
          kind: string
          license_version?: string | null
          price_minor: number
          status?: string
          stock?: number
        }
        Update: {
          artwork_id?: string
          currency?: string
          fulfillment?: Json
          id?: string
          kind?: string
          license_version?: string | null
          price_minor?: number
          status?: string
          stock?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          anchor: Json
          id: string
          title: string
        }
        Insert: {
          anchor: Json
          id: string
          title: string
        }
        Update: {
          anchor?: Json
          id?: string
          title?: string
        }
        Relationships: []
      }
      saved_artworks: {
        Row: {
          artwork_id: string
          created_at: string
          user_id: string
        }
        Insert: {
          artwork_id: string
          created_at?: string
          user_id: string
        }
        Update: {
          artwork_id?: string
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_artworks_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks"
            referencedColumns: ["id"]
          },
        ]
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

