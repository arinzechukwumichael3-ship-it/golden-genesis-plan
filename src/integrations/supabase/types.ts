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
      crypto_wallets: {
        Row: {
          coin_name: string
          created_at: string
          id: string
          is_active: boolean
          network: string
          sort_order: number
          symbol: string
          updated_at: string
          wallet_address: string
        }
        Insert: {
          coin_name: string
          created_at?: string
          id?: string
          is_active?: boolean
          network: string
          sort_order?: number
          symbol: string
          updated_at?: string
          wallet_address?: string
        }
        Update: {
          coin_name?: string
          created_at?: string
          id?: string
          is_active?: boolean
          network?: string
          sort_order?: number
          symbol?: string
          updated_at?: string
          wallet_address?: string
        }
        Relationships: []
      }
      deposits: {
        Row: {
          amount: number
          coin: Database["public"]["Enums"]["coin"]
          created_at: string
          id: string
          proof_url: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["tx_status"]
          user_id: string
        }
        Insert: {
          amount: number
          coin: Database["public"]["Enums"]["coin"]
          created_at?: string
          id?: string
          proof_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["tx_status"]
          user_id: string
        }
        Update: {
          amount?: number
          coin?: Database["public"]["Enums"]["coin"]
          created_at?: string
          id?: string
          proof_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["tx_status"]
          user_id?: string
        }
        Relationships: []
      }
      earnings_log: {
        Row: {
          amount: number
          credited_at: string
          id: string
          investment_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          credited_at?: string
          id?: string
          investment_id?: string | null
          type?: string
          user_id: string
        }
        Update: {
          amount?: number
          credited_at?: string
          id?: string
          investment_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "earnings_log_investment_id_fkey"
            columns: ["investment_id"]
            isOneToOne: false
            referencedRelation: "investments"
            referencedColumns: ["id"]
          },
        ]
      }
      investments: {
        Row: {
          amount: number
          duration_days: number
          end_at: string
          expected_return: number
          id: string
          maturity_date: string | null
          payment_method: string | null
          plan_id: string
          proof_url: string | null
          roi_percent_snapshot: number
          start_at: string
          status: Database["public"]["Enums"]["investment_status"]
          tx_hash: string | null
          user_id: string
          wallet_address_used: string | null
        }
        Insert: {
          amount: number
          duration_days: number
          end_at: string
          expected_return: number
          id?: string
          maturity_date?: string | null
          payment_method?: string | null
          plan_id: string
          proof_url?: string | null
          roi_percent_snapshot: number
          start_at?: string
          status?: Database["public"]["Enums"]["investment_status"]
          tx_hash?: string | null
          user_id: string
          wallet_address_used?: string | null
        }
        Update: {
          amount?: number
          duration_days?: number
          end_at?: string
          expected_return?: number
          id?: string
          maturity_date?: string | null
          payment_method?: string | null
          plan_id?: string
          proof_url?: string | null
          roi_percent_snapshot?: number
          start_at?: string
          status?: Database["public"]["Enums"]["investment_status"]
          tx_hash?: string | null
          user_id?: string
          wallet_address_used?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          read: boolean
          title: string
          user_id: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          read?: boolean
          title: string
          user_id?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          read?: boolean
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      plans: {
        Row: {
          active: boolean
          duration_days: number
          id: string
          max_amount: number | null
          min_amount: number
          name: string
          roi_percent: number
          slug: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          duration_days?: number
          id?: string
          max_amount?: number | null
          min_amount: number
          name: string
          roi_percent: number
          slug: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          duration_days?: number
          id?: string
          max_amount?: number | null
          min_amount?: number
          name?: string
          roi_percent?: number
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          balance: number
          created_at: string
          email: string
          full_name: string | null
          id: string
          referral_code: string
          referred_by: string | null
          total_earned: number
        }
        Insert: {
          balance?: number
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          referral_code: string
          referred_by?: string | null
          total_earned?: number
        }
        Update: {
          balance?: number
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          referral_code?: string
          referred_by?: string | null
          total_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          bonus_amount: number
          bonus_paid: boolean
          created_at: string
          id: string
          referred_id: string
          referrer_id: string
        }
        Insert: {
          bonus_amount?: number
          bonus_paid?: boolean
          created_at?: string
          id?: string
          referred_id: string
          referrer_id: string
        }
        Update: {
          bonus_amount?: number
          bonus_paid?: boolean
          created_at?: string
          id?: string
          referred_id?: string
          referrer_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          address: string
          coin: Database["public"]["Enums"]["coin"]
          updated_at: string
        }
        Insert: {
          address: string
          coin: Database["public"]["Enums"]["coin"]
          updated_at?: string
        }
        Update: {
          address?: string
          coin?: Database["public"]["Enums"]["coin"]
          updated_at?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          amount: number
          coin: Database["public"]["Enums"]["coin"]
          created_at: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["tx_status"]
          user_id: string
          wallet_address: string
        }
        Insert: {
          amount: number
          coin: Database["public"]["Enums"]["coin"]
          created_at?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["tx_status"]
          user_id: string
          wallet_address: string
        }
        Update: {
          amount?: number
          coin?: Database["public"]["Enums"]["coin"]
          created_at?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["tx_status"]
          user_id?: string
          wallet_address?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_deposit: { Args: { _deposit_id: string }; Returns: undefined }
      approve_withdrawal: { Args: { _id: string }; Returns: undefined }
      create_investment: {
        Args: { _amount: number; _duration_days: number; _plan_id: string }
        Returns: string
      }
      create_pending_investment: {
        Args: {
          _amount: number
          _payment_method: string
          _plan_id: string
          _wallet_address?: string
        }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      reject_deposit: { Args: { _deposit_id: string }; Returns: undefined }
      reject_withdrawal: { Args: { _id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "user"
      coin: "BTC" | "ETH" | "USDT" | "BNB"
      investment_status: "pending" | "active" | "completed" | "cancelled"
      tx_status: "pending" | "approved" | "rejected"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      coin: ["BTC", "ETH", "USDT", "BNB"],
      investment_status: ["pending", "active", "completed", "cancelled"],
      tx_status: ["pending", "approved", "rejected"],
    },
  },
} as const
