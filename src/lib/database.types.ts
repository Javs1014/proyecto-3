export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'admin' | 'empleado'
          updated_at: string
          name: string | null
          email: string | null
          encrypted_data: Json
        }
        Insert: {
          id: string
          role: 'admin' | 'empleado'
          updated_at?: string
          name?: string | null
          email?: string | null
          encrypted_data?: Json
        }
        Update: {
          id?: string
          role?: 'admin' | 'empleado'
          updated_at?: string
          name?: string | null
          email?: string | null
          encrypted_data?: Json
        }
      }
      inventory_items: {
        Row: {
          id: string
          name: string
          category: 'ingredient' | 'packaging' | 'equipment'
          quantity: number
          unit: string
          reorder_level: number
          last_updated: string
          updated_by: string
        }
        Insert: {
          id?: string
          name: string
          category: 'ingredient' | 'packaging' | 'equipment'
          quantity: number
          unit: string
          reorder_level: number
          last_updated?: string
          updated_by: string
        }
        Update: {
          id?: string
          name?: string
          category?: 'ingredient' | 'packaging' | 'equipment'
          quantity?: number
          unit?: string
          reorder_level?: number
          last_updated?: string
          updated_by?: string
        }
      }
      sales: {
        Row: {
          id: string
          flavor: string
          quantity: number
          total_amount: string
          total_amount_raw: number
          created_at: string
          created_by: string
          bag_size: string
        }
        Insert: {
          id?: string
          flavor: string
          quantity: number
          total_amount: number
          total_amount_raw?: number
          created_at?: string
          created_by: string
          bag_size: string
        }
        Update: {
          id?: string
          flavor?: string
          quantity?: number
          total_amount?: number
          total_amount_raw?: number
          created_at?: string
          created_by?: string
          bag_size?: string
        }
      }
      recipes: {
        Row: {
          id: string
          name: string
          description: string | null
          ingredients: Json
          steps: Json
          tips: Json | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          ingredients: Json
          steps: Json
          tips?: Json | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          ingredients?: Json
          steps?: Json
          tips?: Json | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      store_settings: {
        Row: {
          id: string
          name: string
          address: string | null
          phone: string | null
          email: string | null
          updated_at: string
          updated_by: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          phone?: string | null
          email?: string | null
          updated_at?: string
          updated_by: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          phone?: string | null
          email?: string | null
          updated_at?: string
          updated_by?: string
        }
      }
    }
  }
}