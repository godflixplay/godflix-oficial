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
      categorias: {
        Row: {
          created_at: string
          id: string
          nome: string
          ordem: number
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          ordem?: number
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          ordem?: number
        }
        Relationships: []
      }
      equipe_membros: {
        Row: {
          created_at: string
          id: string
          instagram_url: string | null
          nome: string
          papel: string
          projeto_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          instagram_url?: string | null
          nome: string
          papel?: string
          projeto_id: string
        }
        Update: {
          created_at?: string
          id?: string
          instagram_url?: string | null
          nome?: string
          papel?: string
          projeto_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipe_membros_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
        ]
      }
      opcoes_apoio: {
        Row: {
          created_at: string
          descricao: string
          id: string
          ordem: number
          projeto_id: string
          recompensas: string[]
          titulo: string
          valor: number
        }
        Insert: {
          created_at?: string
          descricao?: string
          id?: string
          ordem?: number
          projeto_id: string
          recompensas?: string[]
          titulo: string
          valor?: number
        }
        Update: {
          created_at?: string
          descricao?: string
          id?: string
          ordem?: number
          projeto_id?: string
          recompensas?: string[]
          titulo?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "opcoes_apoio_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
        ]
      }
      projeto_reels: {
        Row: {
          created_at: string
          id: string
          ordem: number
          projeto_id: string
          thumbnail_url: string | null
          tipo: string
          titulo: string
          video_url: string
        }
        Insert: {
          created_at?: string
          id?: string
          ordem?: number
          projeto_id: string
          thumbnail_url?: string | null
          tipo?: string
          titulo?: string
          video_url: string
        }
        Update: {
          created_at?: string
          id?: string
          ordem?: number
          projeto_id?: string
          thumbnail_url?: string | null
          tipo?: string
          titulo?: string
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "projeto_reels_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
        ]
      }
      projetos: {
        Row: {
          apoiadores: number
          arrecadado: number
          categoria: string
          created_at: string
          destaque: boolean
          dias_restantes: number
          id: string
          imagem_url: string
          meta: number
          ordem_categoria: number
          ordem_destaque: number
          sinopse: string
          sinopse_completa: string
          slug: string
          status: string
          titulo: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          apoiadores?: number
          arrecadado?: number
          categoria?: string
          created_at?: string
          destaque?: boolean
          dias_restantes?: number
          id?: string
          imagem_url?: string
          meta?: number
          ordem_categoria?: number
          ordem_destaque?: number
          sinopse: string
          sinopse_completa?: string
          slug: string
          status?: string
          titulo: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          apoiadores?: number
          arrecadado?: number
          categoria?: string
          created_at?: string
          destaque?: boolean
          dias_restantes?: number
          id?: string
          imagem_url?: string
          meta?: number
          ordem_categoria?: number
          ordem_destaque?: number
          sinopse?: string
          sinopse_completa?: string
          slug?: string
          status?: string
          titulo?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      status_options: {
        Row: {
          created_at: string
          id: string
          label: string
          ordem: number
          valor: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          ordem?: number
          valor: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          ordem?: number
          valor?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin"
      categoria_projeto:
        | "Filme"
        | "Série"
        | "Documentário"
        | "Animação"
        | "Teatro"
      status_projeto: "em_financiamento" | "em_producao" | "concluido"
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
      app_role: ["admin"],
      categoria_projeto: [
        "Filme",
        "Série",
        "Documentário",
        "Animação",
        "Teatro",
      ],
      status_projeto: ["em_financiamento", "em_producao", "concluido"],
    },
  },
} as const
