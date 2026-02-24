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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      config_kpis: {
        Row: {
          alimenta_kpi: string | null
          area: string | null
          ativo: boolean | null
          codigo: string
          created_at: string | null
          descricao: string | null
          faixa_amarela: number | null
          faixa_verde: number | null
          fonte: string | null
          frequencia: string | null
          id: string
          meta_texto: string | null
          meta_valor: number | null
          nome: string
          perspectiva: string | null
          projeto: string | null
          tipo: string | null
          unidade: string | null
        }
        Insert: {
          alimenta_kpi?: string | null
          area?: string | null
          ativo?: boolean | null
          codigo: string
          created_at?: string | null
          descricao?: string | null
          faixa_amarela?: number | null
          faixa_verde?: number | null
          fonte?: string | null
          frequencia?: string | null
          id?: string
          meta_texto?: string | null
          meta_valor?: number | null
          nome: string
          perspectiva?: string | null
          projeto?: string | null
          tipo?: string | null
          unidade?: string | null
        }
        Update: {
          alimenta_kpi?: string | null
          area?: string | null
          ativo?: boolean | null
          codigo?: string
          created_at?: string | null
          descricao?: string | null
          faixa_amarela?: number | null
          faixa_verde?: number | null
          fonte?: string | null
          frequencia?: string | null
          id?: string
          meta_texto?: string | null
          meta_valor?: number | null
          nome?: string
          perspectiva?: string | null
          projeto?: string | null
          tipo?: string | null
          unidade?: string | null
        }
        Relationships: []
      }
      dados_kpis: {
        Row: {
          created_at: string | null
          data_registro: string
          fonte_origem: string | null
          id: string
          kpi_id: string | null
          observacoes: string | null
          periodo: string
          registrado_por: string | null
          status_semaforo: string | null
          updated_at: string | null
          valor_numerico: number | null
          valor_texto: string | null
        }
        Insert: {
          created_at?: string | null
          data_registro?: string
          fonte_origem?: string | null
          id?: string
          kpi_id?: string | null
          observacoes?: string | null
          periodo: string
          registrado_por?: string | null
          status_semaforo?: string | null
          updated_at?: string | null
          valor_numerico?: number | null
          valor_texto?: string | null
        }
        Update: {
          created_at?: string | null
          data_registro?: string
          fonte_origem?: string | null
          id?: string
          kpi_id?: string | null
          observacoes?: string | null
          periodo?: string
          registrado_por?: string | null
          status_semaforo?: string | null
          updated_at?: string | null
          valor_numerico?: number | null
          valor_texto?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dados_kpis_kpi_id_fkey"
            columns: ["kpi_id"]
            isOneToOne: false
            referencedRelation: "config_kpis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dados_kpis_registrado_por_fkey"
            columns: ["registrado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      financeiro: {
        Row: {
          created_at: string | null
          despesas_admin: number | null
          despesas_programaticas: number | null
          id: string
          orcamento_periodo: number | null
          origem_dados: string | null
          periodo: string
          projeto_id: string | null
          registrado_por: string | null
          saldo: number | null
          valor_captado: number | null
          valor_executado: number | null
        }
        Insert: {
          created_at?: string | null
          despesas_admin?: number | null
          despesas_programaticas?: number | null
          id?: string
          orcamento_periodo?: number | null
          origem_dados?: string | null
          periodo: string
          projeto_id?: string | null
          registrado_por?: string | null
          saldo?: number | null
          valor_captado?: number | null
          valor_executado?: number | null
        }
        Update: {
          created_at?: string | null
          despesas_admin?: number | null
          despesas_programaticas?: number | null
          id?: string
          orcamento_periodo?: number | null
          origem_dados?: string | null
          periodo?: string
          projeto_id?: string | null
          registrado_por?: string | null
          saldo?: number | null
          valor_captado?: number | null
          valor_executado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "financeiro_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_registrado_por_fkey"
            columns: ["registrado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      log_atualizacoes: {
        Row: {
          acao: string | null
          created_at: string | null
          dados_anteriores: Json | null
          dados_novos: Json | null
          id: string
          registro_id: string
          tabela: string
          usuario_id: string | null
        }
        Insert: {
          acao?: string | null
          created_at?: string | null
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          id?: string
          registro_id: string
          tabela: string
          usuario_id?: string | null
        }
        Update: {
          acao?: string | null
          created_at?: string | null
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          id?: string
          registro_id?: string
          tabela?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "log_atualizacoes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          area: string | null
          created_at: string | null
          email: string | null
          id: string
          role: string | null
        }
        Insert: {
          area?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          role?: string | null
        }
        Update: {
          area?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          role?: string | null
        }
        Relationships: []
      }
      projetos: {
        Row: {
          created_at: string | null
          data_fim: string | null
          data_inicio: string | null
          fonte_financiamento: string | null
          id: string
          nome: string
          orcamento_aprovado: number | null
          responsavel_id: string | null
          sigla: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          fonte_financiamento?: string | null
          id?: string
          nome: string
          orcamento_aprovado?: number | null
          responsavel_id?: string | null
          sigla?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          fonte_financiamento?: string | null
          id?: string
          nome?: string
          orcamento_aprovado?: number | null
          responsavel_id?: string | null
          sigla?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projetos_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_custo_por_beneficiario: {
        Row: {
          custo_por_beneficiario: number | null
          periodo: string | null
          projeto: string | null
        }
        Relationships: []
      }
      v_diversificacao_receitas: {
        Row: {
          fontes_acima_10pct: number | null
          periodo: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_user_area: { Args: never; Returns: string }
      get_user_role: { Args: never; Returns: string }
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
    Enums: {},
  },
} as const
