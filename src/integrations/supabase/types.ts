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
      activity_logs: {
        Row: {
          action: string
          actor_auth_id: string | null
          actor_user_id: string | null
          after_data: Json | null
          before_data: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_auth_id?: string | null
          actor_user_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_auth_id?: string | null
          actor_user_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_analysis: {
        Row: {
          analysis_type: Database["public"]["Enums"]["ai_analysis_type"]
          case_id: string | null
          confidence: number | null
          cost_usd: number | null
          created_at: string
          id: string
          medical_report_id: string | null
          model: string | null
          output: Json | null
          prompt: string | null
          reviewed: boolean
          reviewed_at: string | null
          reviewed_by: string | null
          summary: string | null
          tokens_input: number | null
          tokens_output: number | null
          updated_at: string
        }
        Insert: {
          analysis_type: Database["public"]["Enums"]["ai_analysis_type"]
          case_id?: string | null
          confidence?: number | null
          cost_usd?: number | null
          created_at?: string
          id?: string
          medical_report_id?: string | null
          model?: string | null
          output?: Json | null
          prompt?: string | null
          reviewed?: boolean
          reviewed_at?: string | null
          reviewed_by?: string | null
          summary?: string | null
          tokens_input?: number | null
          tokens_output?: number | null
          updated_at?: string
        }
        Update: {
          analysis_type?: Database["public"]["Enums"]["ai_analysis_type"]
          case_id?: string | null
          confidence?: number | null
          cost_usd?: number | null
          created_at?: string
          id?: string
          medical_report_id?: string | null
          model?: string | null
          output?: Json | null
          prompt?: string | null
          reviewed?: boolean
          reviewed_at?: string | null
          reviewed_by?: string | null
          summary?: string | null
          tokens_input?: number | null
          tokens_output?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_analysis_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_analysis_medical_report_id_fkey"
            columns: ["medical_report_id"]
            isOneToOne: false
            referencedRelation: "medical_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_analysis_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_intake_audit: {
        Row: {
          action: string
          case_id: string | null
          changed_by: string | null
          created_at: string
          evidence: Json | null
          human_change: Json | null
          id: string
          input_reference: Json | null
          input_source: Database["public"]["Enums"]["evidence_source"] | null
          intake_event_id: string | null
          model: string | null
          output: Json | null
          person_id: string | null
        }
        Insert: {
          action: string
          case_id?: string | null
          changed_by?: string | null
          created_at?: string
          evidence?: Json | null
          human_change?: Json | null
          id?: string
          input_reference?: Json | null
          input_source?: Database["public"]["Enums"]["evidence_source"] | null
          intake_event_id?: string | null
          model?: string | null
          output?: Json | null
          person_id?: string | null
        }
        Update: {
          action?: string
          case_id?: string | null
          changed_by?: string | null
          created_at?: string
          evidence?: Json | null
          human_change?: Json | null
          id?: string
          input_reference?: Json | null
          input_source?: Database["public"]["Enums"]["evidence_source"] | null
          intake_event_id?: string | null
          model?: string | null
          output?: Json | null
          person_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_intake_audit_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_intake_audit_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_intake_audit_intake_event_id_fkey"
            columns: ["intake_event_id"]
            isOneToOne: false
            referencedRelation: "lead_intake_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_intake_audit_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "persons"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_logs: {
        Row: {
          case_id: string | null
          cost_usd: number | null
          created_at: string
          error_message: string | null
          id: string
          latency_ms: number | null
          model: string | null
          prompt_id: string | null
          request_payload: Json | null
          response_payload: Json | null
          status: Database["public"]["Enums"]["ai_log_status"]
          tokens_input: number | null
          tokens_output: number | null
          user_id: string | null
        }
        Insert: {
          case_id?: string | null
          cost_usd?: number | null
          created_at?: string
          error_message?: string | null
          id?: string
          latency_ms?: number | null
          model?: string | null
          prompt_id?: string | null
          request_payload?: Json | null
          response_payload?: Json | null
          status?: Database["public"]["Enums"]["ai_log_status"]
          tokens_input?: number | null
          tokens_output?: number | null
          user_id?: string | null
        }
        Update: {
          case_id?: string | null
          cost_usd?: number | null
          created_at?: string
          error_message?: string | null
          id?: string
          latency_ms?: number | null
          model?: string | null
          prompt_id?: string | null
          request_payload?: Json | null
          response_payload?: Json | null
          status?: Database["public"]["Enums"]["ai_log_status"]
          tokens_input?: number | null
          tokens_output?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_logs_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_logs_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "ai_prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_prompts: {
        Row: {
          category: Database["public"]["Enums"]["ai_analysis_type"] | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          id: string
          is_active: boolean
          model: string | null
          name: string
          template: string
          updated_at: string
          variables: Json | null
          version: number
        }
        Insert: {
          category?: Database["public"]["Enums"]["ai_analysis_type"] | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          model?: string | null
          name: string
          template: string
          updated_at?: string
          variables?: Json | null
          version?: number
        }
        Update: {
          category?: Database["public"]["Enums"]["ai_analysis_type"] | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          model?: string | null
          name?: string
          template?: string
          updated_at?: string
          variables?: Json | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "ai_prompts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_triage_assessments: {
        Row: {
          case_id: string | null
          change_reason: string | null
          confidence: number | null
          created_at: string
          decided_by_type: Database["public"]["Enums"]["triage_decider"]
          evidence: Json | null
          id: string
          information_used: Json | null
          intake_event_id: string | null
          is_current: boolean
          model: string | null
          overridden_by: string | null
          person_id: string | null
          previous_priority: Database["public"]["Enums"]["urgency_level"] | null
          reason: string | null
          recommended_priority:
            | Database["public"]["Enums"]["urgency_level"]
            | null
          requires_human_review: boolean
          superseded_by: string | null
          updated_at: string
        }
        Insert: {
          case_id?: string | null
          change_reason?: string | null
          confidence?: number | null
          created_at?: string
          decided_by_type?: Database["public"]["Enums"]["triage_decider"]
          evidence?: Json | null
          id?: string
          information_used?: Json | null
          intake_event_id?: string | null
          is_current?: boolean
          model?: string | null
          overridden_by?: string | null
          person_id?: string | null
          previous_priority?:
            | Database["public"]["Enums"]["urgency_level"]
            | null
          reason?: string | null
          recommended_priority?:
            | Database["public"]["Enums"]["urgency_level"]
            | null
          requires_human_review?: boolean
          superseded_by?: string | null
          updated_at?: string
        }
        Update: {
          case_id?: string | null
          change_reason?: string | null
          confidence?: number | null
          created_at?: string
          decided_by_type?: Database["public"]["Enums"]["triage_decider"]
          evidence?: Json | null
          id?: string
          information_used?: Json | null
          intake_event_id?: string | null
          is_current?: boolean
          model?: string | null
          overridden_by?: string | null
          person_id?: string | null
          previous_priority?:
            | Database["public"]["Enums"]["urgency_level"]
            | null
          reason?: string | null
          recommended_priority?:
            | Database["public"]["Enums"]["urgency_level"]
            | null
          requires_human_review?: boolean
          superseded_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_triage_assessments_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_triage_assessments_intake_event_id_fkey"
            columns: ["intake_event_id"]
            isOneToOne: false
            referencedRelation: "lead_intake_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_triage_assessments_overridden_by_fkey"
            columns: ["overridden_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_triage_assessments_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_triage_assessments_superseded_by_fkey"
            columns: ["superseded_by"]
            isOneToOne: false
            referencedRelation: "ai_triage_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          actual_arrival_date: string | null
          ai_confidence_score: number | null
          case_health_score: number | null
          case_number: string | null
          clinical_path: Database["public"]["Enums"]["clinical_path"] | null
          coordinator_id: string | null
          created_at: string
          created_by: string | null
          decision_status: Database["public"]["Enums"]["decision_status"]
          deleted_at: string | null
          diagnosis: string | null
          discharge_date: string | null
          disease: string | null
          enquiry_date: string | null
          estimated_stay_days: number | null
          estimated_treatment_cost: number | null
          expected_arrival_date: string | null
          expected_decision_date: string | null
          expected_revenue: number | null
          expected_revenue_currency:
            | Database["public"]["Enums"]["currency_code"]
            | null
          expected_surgery_date: string | null
          id: string
          is_demo: boolean
          lead_source: Database["public"]["Enums"]["lead_source"] | null
          medical_reviewer_id: string | null
          notes: string | null
          person_id: string
          primary_doctor_id: string | null
          primary_hospital_id: string | null
          probability: number | null
          revenue_probability: number | null
          specialty: string | null
          status: Database["public"]["Enums"]["case_status"]
          target_country: string | null
          updated_at: string
          urgency: Database["public"]["Enums"]["urgency_level"]
          workflow_stage: Database["public"]["Enums"]["workflow_stage"]
        }
        Insert: {
          actual_arrival_date?: string | null
          ai_confidence_score?: number | null
          case_health_score?: number | null
          case_number?: string | null
          clinical_path?: Database["public"]["Enums"]["clinical_path"] | null
          coordinator_id?: string | null
          created_at?: string
          created_by?: string | null
          decision_status?: Database["public"]["Enums"]["decision_status"]
          deleted_at?: string | null
          diagnosis?: string | null
          discharge_date?: string | null
          disease?: string | null
          enquiry_date?: string | null
          estimated_stay_days?: number | null
          estimated_treatment_cost?: number | null
          expected_arrival_date?: string | null
          expected_decision_date?: string | null
          expected_revenue?: number | null
          expected_revenue_currency?:
            | Database["public"]["Enums"]["currency_code"]
            | null
          expected_surgery_date?: string | null
          id?: string
          is_demo?: boolean
          lead_source?: Database["public"]["Enums"]["lead_source"] | null
          medical_reviewer_id?: string | null
          notes?: string | null
          person_id: string
          primary_doctor_id?: string | null
          primary_hospital_id?: string | null
          probability?: number | null
          revenue_probability?: number | null
          specialty?: string | null
          status?: Database["public"]["Enums"]["case_status"]
          target_country?: string | null
          updated_at?: string
          urgency?: Database["public"]["Enums"]["urgency_level"]
          workflow_stage?: Database["public"]["Enums"]["workflow_stage"]
        }
        Update: {
          actual_arrival_date?: string | null
          ai_confidence_score?: number | null
          case_health_score?: number | null
          case_number?: string | null
          clinical_path?: Database["public"]["Enums"]["clinical_path"] | null
          coordinator_id?: string | null
          created_at?: string
          created_by?: string | null
          decision_status?: Database["public"]["Enums"]["decision_status"]
          deleted_at?: string | null
          diagnosis?: string | null
          discharge_date?: string | null
          disease?: string | null
          enquiry_date?: string | null
          estimated_stay_days?: number | null
          estimated_treatment_cost?: number | null
          expected_arrival_date?: string | null
          expected_decision_date?: string | null
          expected_revenue?: number | null
          expected_revenue_currency?:
            | Database["public"]["Enums"]["currency_code"]
            | null
          expected_surgery_date?: string | null
          id?: string
          is_demo?: boolean
          lead_source?: Database["public"]["Enums"]["lead_source"] | null
          medical_reviewer_id?: string | null
          notes?: string | null
          person_id?: string
          primary_doctor_id?: string | null
          primary_hospital_id?: string | null
          probability?: number | null
          revenue_probability?: number | null
          specialty?: string | null
          status?: Database["public"]["Enums"]["case_status"]
          target_country?: string | null
          updated_at?: string
          urgency?: Database["public"]["Enums"]["urgency_level"]
          workflow_stage?: Database["public"]["Enums"]["workflow_stage"]
        }
        Relationships: [
          {
            foreignKeyName: "cases_coordinator_id_fkey"
            columns: ["coordinator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_medical_reviewer_id_fkey"
            columns: ["medical_reviewer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_primary_doctor_id_fkey"
            columns: ["primary_doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_primary_hospital_id_fkey"
            columns: ["primary_hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      communications: {
        Row: {
          attachment_path: string | null
          body: string | null
          case_id: string | null
          channel: Database["public"]["Enums"]["comm_channel"]
          created_at: string
          created_by: string | null
          deleted_at: string | null
          direction: Database["public"]["Enums"]["comm_direction"]
          duration_seconds: number | null
          external_message_id: string | null
          from_identifier: string | null
          id: string
          message_status: string | null
          occurred_at: string
          person_id: string | null
          provider: string | null
          provider_message_type: string | null
          provider_payload: Json | null
          status_updated_at: string | null
          subject: string | null
          to_identifier: string | null
          updated_at: string
        }
        Insert: {
          attachment_path?: string | null
          body?: string | null
          case_id?: string | null
          channel: Database["public"]["Enums"]["comm_channel"]
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          direction: Database["public"]["Enums"]["comm_direction"]
          duration_seconds?: number | null
          external_message_id?: string | null
          from_identifier?: string | null
          id?: string
          message_status?: string | null
          occurred_at?: string
          person_id?: string | null
          provider?: string | null
          provider_message_type?: string | null
          provider_payload?: Json | null
          status_updated_at?: string | null
          subject?: string | null
          to_identifier?: string | null
          updated_at?: string
        }
        Update: {
          attachment_path?: string | null
          body?: string | null
          case_id?: string | null
          channel?: Database["public"]["Enums"]["comm_channel"]
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          direction?: Database["public"]["Enums"]["comm_direction"]
          duration_seconds?: number | null
          external_message_id?: string | null
          from_identifier?: string | null
          id?: string
          message_status?: string | null
          occurred_at?: string
          person_id?: string | null
          provider?: string | null
          provider_message_type?: string | null
          provider_payload?: Json | null
          status_updated_at?: string | null
          subject?: string | null
          to_identifier?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "communications_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communications_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communications_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "persons"
            referencedColumns: ["id"]
          },
        ]
      }
      coordinator_assignment_rules: {
        Row: {
          assign_to_role: Database["public"]["Enums"]["app_role"] | null
          assign_to_user_id: string | null
          balance_by_workload: boolean
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          match_case_types: string[] | null
          match_countries: string[] | null
          match_languages: string[] | null
          match_priorities:
            | Database["public"]["Enums"]["urgency_level"][]
            | null
          match_sources: Database["public"]["Enums"]["intake_channel"][] | null
          match_specialties: string[] | null
          max_open_cases: number | null
          name: string
          priority_order: number
          updated_at: string
        }
        Insert: {
          assign_to_role?: Database["public"]["Enums"]["app_role"] | null
          assign_to_user_id?: string | null
          balance_by_workload?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          match_case_types?: string[] | null
          match_countries?: string[] | null
          match_languages?: string[] | null
          match_priorities?:
            | Database["public"]["Enums"]["urgency_level"][]
            | null
          match_sources?: Database["public"]["Enums"]["intake_channel"][] | null
          match_specialties?: string[] | null
          max_open_cases?: number | null
          name: string
          priority_order?: number
          updated_at?: string
        }
        Update: {
          assign_to_role?: Database["public"]["Enums"]["app_role"] | null
          assign_to_user_id?: string | null
          balance_by_workload?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          match_case_types?: string[] | null
          match_countries?: string[] | null
          match_languages?: string[] | null
          match_priorities?:
            | Database["public"]["Enums"]["urgency_level"][]
            | null
          match_sources?: Database["public"]["Enums"]["intake_channel"][] | null
          match_specialties?: string[] | null
          max_open_cases?: number | null
          name?: string
          priority_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coordinator_assignment_rules_assign_to_user_id_fkey"
            columns: ["assign_to_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coordinator_assignment_rules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      countries: {
        Row: {
          created_at: string
          dial_code: string | null
          id: string
          is_active: boolean
          is_gcc: boolean
          iso2: string
          iso3: string | null
          name: string
          region: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          dial_code?: string | null
          id?: string
          is_active?: boolean
          is_gcc?: boolean
          iso2: string
          iso3?: string | null
          name: string
          region?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          dial_code?: string | null
          id?: string
          is_active?: boolean
          is_gcc?: boolean
          iso2?: string
          iso3?: string | null
          name?: string
          region?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      currencies: {
        Row: {
          created_at: string
          decimals: number
          id: string
          is_active: boolean
          iso_code: string
          name: string
          symbol: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          decimals?: number
          id?: string
          is_active?: boolean
          iso_code: string
          name: string
          symbol?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          decimals?: number
          id?: string
          is_active?: boolean
          iso_code?: string
          name?: string
          symbol?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      dashboard_snapshots: {
        Row: {
          created_at: string
          generated_by: string | null
          id: string
          metrics: Json
          scope: string
          scope_id: string | null
          snapshot_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          generated_by?: string | null
          id?: string
          metrics: Json
          scope: string
          scope_id?: string | null
          snapshot_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          generated_by?: string | null
          id?: string
          metrics?: Json
          scope?: string
          scope_id?: string | null
          snapshot_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_snapshots_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      disease_master: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          icd10_code: string | null
          id: string
          is_active: boolean
          name: string
          synonyms: string[] | null
          typical_specialty_id: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          icd10_code?: string | null
          id?: string
          is_active?: boolean
          name: string
          synonyms?: string[] | null
          typical_specialty_id?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          icd10_code?: string | null
          id?: string
          is_active?: boolean
          name?: string
          synonyms?: string[] | null
          typical_specialty_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "disease_master_typical_specialty_id_fkey"
            columns: ["typical_specialty_id"]
            isOneToOne: false
            referencedRelation: "medical_specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_hospitals: {
        Row: {
          created_at: string
          doctor_id: string
          hospital_id: string
          id: string
          is_active: boolean
          role: string | null
          since_date: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          doctor_id: string
          hospital_id: string
          id?: string
          is_active?: boolean
          role?: string | null
          since_date?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          doctor_id?: string
          hospital_id?: string
          id?: string
          is_active?: boolean
          role?: string | null
          since_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_hospitals_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctor_hospitals_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_specialties: {
        Row: {
          created_at: string
          doctor_id: string
          id: string
          is_primary: boolean
          specialty_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          doctor_id: string
          id?: string
          is_primary?: boolean
          specialty_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          doctor_id?: string
          id?: string
          is_primary?: boolean
          specialty_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_specialties_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctor_specialties_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "medical_specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          availability_schedule: Json | null
          consultation_fee: number | null
          consultation_fee_currency:
            | Database["public"]["Enums"]["currency_code"]
            | null
          created_at: string
          deleted_at: string | null
          email: string | null
          full_name: string
          hospital_id: string | null
          id: string
          international_case_experience: number | null
          is_active: boolean
          languages: string[] | null
          notes: string | null
          phone: string | null
          qualifications: string | null
          specialty: string | null
          sub_specialty: string | null
          updated_at: string
          years_experience: number | null
        }
        Insert: {
          availability_schedule?: Json | null
          consultation_fee?: number | null
          consultation_fee_currency?:
            | Database["public"]["Enums"]["currency_code"]
            | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          full_name: string
          hospital_id?: string | null
          id?: string
          international_case_experience?: number | null
          is_active?: boolean
          languages?: string[] | null
          notes?: string | null
          phone?: string | null
          qualifications?: string | null
          specialty?: string | null
          sub_specialty?: string | null
          updated_at?: string
          years_experience?: number | null
        }
        Update: {
          availability_schedule?: Json | null
          consultation_fee?: number | null
          consultation_fee_currency?:
            | Database["public"]["Enums"]["currency_code"]
            | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          full_name?: string
          hospital_id?: string | null
          id?: string
          international_case_experience?: number | null
          is_active?: boolean
          languages?: string[] | null
          notes?: string | null
          phone?: string | null
          qualifications?: string | null
          specialty?: string | null
          sub_specialty?: string | null
          updated_at?: string
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "doctors_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      document_extractions: {
        Row: {
          case_id: string | null
          confidence: number | null
          created_at: string
          detected_document_type: string | null
          document_id: string | null
          error_message: string | null
          extraction: Json | null
          id: string
          medical_report_id: string | null
          model: string | null
          person_id: string | null
          processor_key: string
          raw_text: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["extraction_status"]
          updated_at: string
        }
        Insert: {
          case_id?: string | null
          confidence?: number | null
          created_at?: string
          detected_document_type?: string | null
          document_id?: string | null
          error_message?: string | null
          extraction?: Json | null
          id?: string
          medical_report_id?: string | null
          model?: string | null
          person_id?: string | null
          processor_key: string
          raw_text?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["extraction_status"]
          updated_at?: string
        }
        Update: {
          case_id?: string | null
          confidence?: number | null
          created_at?: string
          detected_document_type?: string | null
          document_id?: string | null
          error_message?: string | null
          extraction?: Json | null
          id?: string
          medical_report_id?: string | null
          model?: string | null
          person_id?: string | null
          processor_key?: string
          raw_text?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["extraction_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_extractions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_extractions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_extractions_medical_report_id_fkey"
            columns: ["medical_report_id"]
            isOneToOne: false
            referencedRelation: "medical_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_extractions_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_extractions_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          case_id: string | null
          created_at: string
          deleted_at: string | null
          document_type: Database["public"]["Enums"]["document_type"]
          file_size_bytes: number | null
          id: string
          mime_type: string | null
          notes: string | null
          person_id: string | null
          storage_path: string
          title: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          case_id?: string | null
          created_at?: string
          deleted_at?: string | null
          document_type: Database["public"]["Enums"]["document_type"]
          file_size_bytes?: number | null
          id?: string
          mime_type?: string | null
          notes?: string | null
          person_id?: string | null
          storage_path: string
          title: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          case_id?: string | null
          created_at?: string
          deleted_at?: string | null
          document_type?: Database["public"]["Enums"]["document_type"]
          file_size_bytes?: number | null
          id?: string
          mime_type?: string | null
          notes?: string | null
          person_id?: string | null
          storage_path?: string
          title?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      extracted_facts: {
        Row: {
          case_id: string | null
          communication_id: string | null
          confidence: number | null
          confirmed_at: string | null
          confirmed_by: string | null
          conflict_group: string | null
          created_at: string
          document_id: string | null
          field_group: string
          field_key: string
          field_label: string | null
          id: string
          intake_event_id: string | null
          medical_report_id: string | null
          observed_at: string | null
          person_id: string | null
          review_note: string | null
          source: Database["public"]["Enums"]["evidence_source"]
          source_quote: string | null
          status: Database["public"]["Enums"]["fact_status"]
          updated_at: string
          value_json: Json | null
          value_text: string | null
        }
        Insert: {
          case_id?: string | null
          communication_id?: string | null
          confidence?: number | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          conflict_group?: string | null
          created_at?: string
          document_id?: string | null
          field_group: string
          field_key: string
          field_label?: string | null
          id?: string
          intake_event_id?: string | null
          medical_report_id?: string | null
          observed_at?: string | null
          person_id?: string | null
          review_note?: string | null
          source: Database["public"]["Enums"]["evidence_source"]
          source_quote?: string | null
          status?: Database["public"]["Enums"]["fact_status"]
          updated_at?: string
          value_json?: Json | null
          value_text?: string | null
        }
        Update: {
          case_id?: string | null
          communication_id?: string | null
          confidence?: number | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          conflict_group?: string | null
          created_at?: string
          document_id?: string | null
          field_group?: string
          field_key?: string
          field_label?: string | null
          id?: string
          intake_event_id?: string | null
          medical_report_id?: string | null
          observed_at?: string | null
          person_id?: string | null
          review_note?: string | null
          source?: Database["public"]["Enums"]["evidence_source"]
          source_quote?: string | null
          status?: Database["public"]["Enums"]["fact_status"]
          updated_at?: string
          value_json?: Json | null
          value_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "extracted_facts_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extracted_facts_communication_id_fkey"
            columns: ["communication_id"]
            isOneToOne: false
            referencedRelation: "communications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extracted_facts_confirmed_by_fkey"
            columns: ["confirmed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extracted_facts_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extracted_facts_intake_event_id_fkey"
            columns: ["intake_event_id"]
            isOneToOne: false
            referencedRelation: "lead_intake_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extracted_facts_medical_report_id_fkey"
            columns: ["medical_report_id"]
            isOneToOne: false
            referencedRelation: "medical_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extracted_facts_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "persons"
            referencedColumns: ["id"]
          },
        ]
      }
      finance: {
        Row: {
          amount: number
          amount_inr: number | null
          case_id: string | null
          created_at: string
          created_by: string | null
          currency: Database["public"]["Enums"]["currency_code"]
          deleted_at: string | null
          description: string | null
          due_date: string | null
          entry_type: Database["public"]["Enums"]["finance_type"]
          fx_rate_to_inr: number | null
          hospital_id: string | null
          id: string
          paid_at: string | null
          party: string | null
          quotation_id: string | null
          reference_number: string | null
          status: Database["public"]["Enums"]["finance_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          amount_inr?: number | null
          case_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: Database["public"]["Enums"]["currency_code"]
          deleted_at?: string | null
          description?: string | null
          due_date?: string | null
          entry_type: Database["public"]["Enums"]["finance_type"]
          fx_rate_to_inr?: number | null
          hospital_id?: string | null
          id?: string
          paid_at?: string | null
          party?: string | null
          quotation_id?: string | null
          reference_number?: string | null
          status?: Database["public"]["Enums"]["finance_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          amount_inr?: number | null
          case_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: Database["public"]["Enums"]["currency_code"]
          deleted_at?: string | null
          description?: string | null
          due_date?: string | null
          entry_type?: Database["public"]["Enums"]["finance_type"]
          fx_rate_to_inr?: number | null
          hospital_id?: string | null
          id?: string
          paid_at?: string | null
          party?: string | null
          quotation_id?: string | null
          reference_number?: string | null
          status?: Database["public"]["Enums"]["finance_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      follow_ups: {
        Row: {
          assigned_to: string | null
          case_id: string
          channel: Database["public"]["Enums"]["comm_channel"] | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          due_at: string
          id: string
          next_followup_at: string | null
          outcome: string | null
          purpose: string | null
          status: Database["public"]["Enums"]["followup_status"]
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          case_id: string
          channel?: Database["public"]["Enums"]["comm_channel"] | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          due_at: string
          id?: string
          next_followup_at?: string | null
          outcome?: string | null
          purpose?: string | null
          status?: Database["public"]["Enums"]["followup_status"]
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          case_id?: string
          channel?: Database["public"]["Enums"]["comm_channel"] | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          due_at?: string
          id?: string
          next_followup_at?: string | null
          outcome?: string | null
          purpose?: string | null
          status?: Database["public"]["Enums"]["followup_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "follow_ups_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_ups_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_ups_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      hospital_opinions: {
        Row: {
          case_id: string
          created_at: string
          deleted_at: string | null
          doctor_id: string | null
          document_path: string | null
          estimated_treatment_days: number | null
          hospital_id: string
          id: string
          notes: string | null
          requested_at: string
          requested_by: string | null
          requires_surgery: boolean | null
          responded_at: string | null
          status: Database["public"]["Enums"]["opinion_status"]
          treatment_recommendation: string | null
          updated_at: string
        }
        Insert: {
          case_id: string
          created_at?: string
          deleted_at?: string | null
          doctor_id?: string | null
          document_path?: string | null
          estimated_treatment_days?: number | null
          hospital_id: string
          id?: string
          notes?: string | null
          requested_at?: string
          requested_by?: string | null
          requires_surgery?: boolean | null
          responded_at?: string | null
          status?: Database["public"]["Enums"]["opinion_status"]
          treatment_recommendation?: string | null
          updated_at?: string
        }
        Update: {
          case_id?: string
          created_at?: string
          deleted_at?: string | null
          doctor_id?: string | null
          document_path?: string | null
          estimated_treatment_days?: number | null
          hospital_id?: string
          id?: string
          notes?: string | null
          requested_at?: string
          requested_by?: string | null
          requires_surgery?: boolean | null
          responded_at?: string | null
          status?: Database["public"]["Enums"]["opinion_status"]
          treatment_recommendation?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hospital_opinions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hospital_opinions_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hospital_opinions_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hospital_opinions_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      hospital_specialties: {
        Row: {
          created_at: string
          department_name: string | null
          hospital_id: string
          id: string
          is_active: boolean
          lead_doctor_id: string | null
          specialty_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department_name?: string | null
          hospital_id: string
          id?: string
          is_active?: boolean
          lead_doctor_id?: string | null
          specialty_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department_name?: string | null
          hospital_id?: string
          id?: string
          is_active?: boolean
          lead_doctor_id?: string | null
          specialty_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hospital_specialties_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hospital_specialties_lead_doctor_id_fkey"
            columns: ["lead_doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hospital_specialties_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "medical_specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      hospitals: {
        Row: {
          accreditation: string | null
          accreditations: string[] | null
          address: string | null
          city: string | null
          commission_percentage: number | null
          contact_person: string | null
          country: string
          created_at: string
          deleted_at: string | null
          email: string | null
          emergency_contact: string | null
          google_maps_url: string | null
          id: string
          international_desk: boolean
          international_desk_contact: string | null
          is_active: boolean
          name: string
          notes: string | null
          phone: string | null
          response_sla_hours: number | null
          specialties: string[] | null
          tier: Database["public"]["Enums"]["hospital_tier"] | null
          updated_at: string
          website: string | null
        }
        Insert: {
          accreditation?: string | null
          accreditations?: string[] | null
          address?: string | null
          city?: string | null
          commission_percentage?: number | null
          contact_person?: string | null
          country?: string
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          emergency_contact?: string | null
          google_maps_url?: string | null
          id?: string
          international_desk?: boolean
          international_desk_contact?: string | null
          is_active?: boolean
          name: string
          notes?: string | null
          phone?: string | null
          response_sla_hours?: number | null
          specialties?: string[] | null
          tier?: Database["public"]["Enums"]["hospital_tier"] | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          accreditation?: string | null
          accreditations?: string[] | null
          address?: string | null
          city?: string | null
          commission_percentage?: number | null
          contact_person?: string | null
          country?: string
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          emergency_contact?: string | null
          google_maps_url?: string | null
          id?: string
          international_desk?: boolean
          international_desk_contact?: string | null
          is_active?: boolean
          name?: string
          notes?: string | null
          phone?: string | null
          response_sla_hours?: number | null
          specialties?: string[] | null
          tier?: Database["public"]["Enums"]["hospital_tier"] | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      identity_match_candidates: {
        Row: {
          candidate_person_id: string | null
          created_at: string
          id: string
          intake_event_id: string | null
          match_score: number | null
          matched_on: Json | null
          new_person_id: string | null
          note: string | null
          resolution: string
          resolved_at: string | null
          resolved_by: string | null
          updated_at: string
        }
        Insert: {
          candidate_person_id?: string | null
          created_at?: string
          id?: string
          intake_event_id?: string | null
          match_score?: number | null
          matched_on?: Json | null
          new_person_id?: string | null
          note?: string | null
          resolution?: string
          resolved_at?: string | null
          resolved_by?: string | null
          updated_at?: string
        }
        Update: {
          candidate_person_id?: string | null
          created_at?: string
          id?: string
          intake_event_id?: string | null
          match_score?: number | null
          matched_on?: Json | null
          new_person_id?: string | null
          note?: string | null
          resolution?: string
          resolved_at?: string | null
          resolved_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "identity_match_candidates_candidate_person_id_fkey"
            columns: ["candidate_person_id"]
            isOneToOne: false
            referencedRelation: "persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "identity_match_candidates_intake_event_id_fkey"
            columns: ["intake_event_id"]
            isOneToOne: false
            referencedRelation: "lead_intake_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "identity_match_candidates_new_person_id_fkey"
            columns: ["new_person_id"]
            isOneToOne: false
            referencedRelation: "persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "identity_match_candidates_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      languages: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          is_rtl: boolean
          iso_code: string
          name: string
          native_name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          is_rtl?: boolean
          iso_code: string
          name: string
          native_name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          is_rtl?: boolean
          iso_code?: string
          name?: string
          native_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      lead_attribution: {
        Row: {
          ad_id: string | null
          ad_name: string | null
          adset_id: string | null
          adset_name: string | null
          campaign_id: string | null
          campaign_name: string | null
          case_id: string | null
          channel: Database["public"]["Enums"]["intake_channel"]
          created_at: string
          form_id: string | null
          id: string
          intake_event_id: string | null
          is_first_touch: boolean
          landing_url: string | null
          person_id: string | null
          platform: string | null
          referral_partner_id: string | null
          referrer_url: string | null
          updated_at: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          ad_id?: string | null
          ad_name?: string | null
          adset_id?: string | null
          adset_name?: string | null
          campaign_id?: string | null
          campaign_name?: string | null
          case_id?: string | null
          channel: Database["public"]["Enums"]["intake_channel"]
          created_at?: string
          form_id?: string | null
          id?: string
          intake_event_id?: string | null
          is_first_touch?: boolean
          landing_url?: string | null
          person_id?: string | null
          platform?: string | null
          referral_partner_id?: string | null
          referrer_url?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          ad_id?: string | null
          ad_name?: string | null
          adset_id?: string | null
          adset_name?: string | null
          campaign_id?: string | null
          campaign_name?: string | null
          case_id?: string | null
          channel?: Database["public"]["Enums"]["intake_channel"]
          created_at?: string
          form_id?: string | null
          id?: string
          intake_event_id?: string | null
          is_first_touch?: boolean
          landing_url?: string | null
          person_id?: string | null
          platform?: string | null
          referral_partner_id?: string | null
          referrer_url?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_attribution_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_attribution_intake_event_id_fkey"
            columns: ["intake_event_id"]
            isOneToOne: false
            referencedRelation: "lead_intake_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_attribution_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_attribution_referral_partner_id_fkey"
            columns: ["referral_partner_id"]
            isOneToOne: false
            referencedRelation: "referral_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_intake_events: {
        Row: {
          case_id: string | null
          channel: Database["public"]["Enums"]["intake_channel"]
          communication_id: string | null
          contact_email: string | null
          contact_handle: string | null
          contact_name: string | null
          contact_phone: string | null
          contact_whatsapp: string | null
          created_at: string
          created_by: string | null
          document_id: string | null
          external_event_id: string | null
          id: string
          is_demo: boolean
          locale: string | null
          media_mime_type: string | null
          media_storage_path: string | null
          person_id: string | null
          processed_at: string | null
          provider: string | null
          raw_content: string | null
          raw_payload: Json | null
          received_at: string
          status: Database["public"]["Enums"]["intake_status"]
          status_reason: string | null
          updated_at: string
        }
        Insert: {
          case_id?: string | null
          channel: Database["public"]["Enums"]["intake_channel"]
          communication_id?: string | null
          contact_email?: string | null
          contact_handle?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contact_whatsapp?: string | null
          created_at?: string
          created_by?: string | null
          document_id?: string | null
          external_event_id?: string | null
          id?: string
          is_demo?: boolean
          locale?: string | null
          media_mime_type?: string | null
          media_storage_path?: string | null
          person_id?: string | null
          processed_at?: string | null
          provider?: string | null
          raw_content?: string | null
          raw_payload?: Json | null
          received_at?: string
          status?: Database["public"]["Enums"]["intake_status"]
          status_reason?: string | null
          updated_at?: string
        }
        Update: {
          case_id?: string | null
          channel?: Database["public"]["Enums"]["intake_channel"]
          communication_id?: string | null
          contact_email?: string | null
          contact_handle?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contact_whatsapp?: string | null
          created_at?: string
          created_by?: string | null
          document_id?: string | null
          external_event_id?: string | null
          id?: string
          is_demo?: boolean
          locale?: string | null
          media_mime_type?: string | null
          media_storage_path?: string | null
          person_id?: string | null
          processed_at?: string | null
          provider?: string | null
          raw_content?: string | null
          raw_payload?: Json | null
          received_at?: string
          status?: Database["public"]["Enums"]["intake_status"]
          status_reason?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_intake_events_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_intake_events_communication_id_fkey"
            columns: ["communication_id"]
            isOneToOne: false
            referencedRelation: "communications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_intake_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_intake_events_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_intake_events_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "persons"
            referencedColumns: ["id"]
          },
        ]
      }
      logistics: {
        Row: {
          case_id: string
          cost: number | null
          created_at: string
          created_by: string | null
          currency: Database["public"]["Enums"]["currency_code"] | null
          deleted_at: string | null
          document_path: string | null
          end_date: string | null
          id: string
          logistics_type: Database["public"]["Enums"]["logistics_type"]
          notes: string | null
          provider: string | null
          reference_number: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["logistics_status"]
          updated_at: string
        }
        Insert: {
          case_id: string
          cost?: number | null
          created_at?: string
          created_by?: string | null
          currency?: Database["public"]["Enums"]["currency_code"] | null
          deleted_at?: string | null
          document_path?: string | null
          end_date?: string | null
          id?: string
          logistics_type: Database["public"]["Enums"]["logistics_type"]
          notes?: string | null
          provider?: string | null
          reference_number?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["logistics_status"]
          updated_at?: string
        }
        Update: {
          case_id?: string
          cost?: number | null
          created_at?: string
          created_by?: string | null
          currency?: Database["public"]["Enums"]["currency_code"] | null
          deleted_at?: string | null
          document_path?: string | null
          end_date?: string | null
          id?: string
          logistics_type?: Database["public"]["Enums"]["logistics_type"]
          notes?: string | null
          provider?: string | null
          reference_number?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["logistics_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "logistics_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "logistics_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_reports: {
        Row: {
          case_id: string
          created_at: string
          deleted_at: string | null
          file_size_bytes: number | null
          id: string
          issuing_doctor: string | null
          issuing_hospital: string | null
          language: string | null
          mime_type: string | null
          notes: string | null
          person_id: string | null
          report_date: string | null
          report_type: string | null
          storage_path: string | null
          title: string
          translated_storage_path: string | null
          translation_status:
            | Database["public"]["Enums"]["report_translation_status"]
            | null
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          case_id: string
          created_at?: string
          deleted_at?: string | null
          file_size_bytes?: number | null
          id?: string
          issuing_doctor?: string | null
          issuing_hospital?: string | null
          language?: string | null
          mime_type?: string | null
          notes?: string | null
          person_id?: string | null
          report_date?: string | null
          report_type?: string | null
          storage_path?: string | null
          title: string
          translated_storage_path?: string | null
          translation_status?:
            | Database["public"]["Enums"]["report_translation_status"]
            | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          case_id?: string
          created_at?: string
          deleted_at?: string | null
          file_size_bytes?: number | null
          id?: string
          issuing_doctor?: string | null
          issuing_hospital?: string | null
          language?: string | null
          mime_type?: string | null
          notes?: string | null
          person_id?: string | null
          report_date?: string | null
          report_type?: string | null
          storage_path?: string | null
          title?: string
          translated_storage_path?: string | null
          translation_status?:
            | Database["public"]["Enums"]["report_translation_status"]
            | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_reports_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_reports_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_reports_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_specialties: {
        Row: {
          code: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          parent_specialty_id: string | null
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          parent_specialty_id?: string | null
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          parent_specialty_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_specialties_parent_specialty_id_fkey"
            columns: ["parent_specialty_id"]
            isOneToOne: false
            referencedRelation: "medical_specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          case_id: string | null
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at: string
          data: Json | null
          id: string
          notification_type: Database["public"]["Enums"]["notification_type"]
          read_at: string | null
          recipient_user_id: string
          scheduled_at: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["notification_status"]
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          case_id?: string | null
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          data?: Json | null
          id?: string
          notification_type: Database["public"]["Enums"]["notification_type"]
          read_at?: string | null
          recipient_user_id: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          case_id?: string | null
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          data?: Json | null
          id?: string
          notification_type?: Database["public"]["Enums"]["notification_type"]
          read_at?: string | null
          recipient_user_id?: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_recipient_user_id_fkey"
            columns: ["recipient_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      persons: {
        Row: {
          address: string | null
          city: string | null
          country_of_residence: string | null
          created_at: string
          created_by: string | null
          date_of_birth: string | null
          deleted_at: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relation: string | null
          first_name: string
          gender: string | null
          id: string
          is_demo: boolean
          last_name: string | null
          marketing_consent: boolean
          middle_name: string | null
          nationality: string | null
          notes: string | null
          passport_expiry: string | null
          passport_issue_country: string | null
          passport_number: string | null
          preferred_doctor_id: string | null
          preferred_hospital_id: string | null
          preferred_language: string | null
          primary_phone: string | null
          updated_at: string
          visa_status: string | null
          whatsapp_number: string | null
          whatsapp_verified: boolean
        }
        Insert: {
          address?: string | null
          city?: string | null
          country_of_residence?: string | null
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          deleted_at?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          first_name: string
          gender?: string | null
          id?: string
          is_demo?: boolean
          last_name?: string | null
          marketing_consent?: boolean
          middle_name?: string | null
          nationality?: string | null
          notes?: string | null
          passport_expiry?: string | null
          passport_issue_country?: string | null
          passport_number?: string | null
          preferred_doctor_id?: string | null
          preferred_hospital_id?: string | null
          preferred_language?: string | null
          primary_phone?: string | null
          updated_at?: string
          visa_status?: string | null
          whatsapp_number?: string | null
          whatsapp_verified?: boolean
        }
        Update: {
          address?: string | null
          city?: string | null
          country_of_residence?: string | null
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          deleted_at?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          first_name?: string
          gender?: string | null
          id?: string
          is_demo?: boolean
          last_name?: string | null
          marketing_consent?: boolean
          middle_name?: string | null
          nationality?: string | null
          notes?: string | null
          passport_expiry?: string | null
          passport_issue_country?: string | null
          passport_number?: string | null
          preferred_doctor_id?: string | null
          preferred_hospital_id?: string | null
          preferred_language?: string | null
          primary_phone?: string | null
          updated_at?: string
          visa_status?: string | null
          whatsapp_number?: string | null
          whatsapp_verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "persons_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "persons_preferred_doctor_id_fkey"
            columns: ["preferred_doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "persons_preferred_hospital_id_fkey"
            columns: ["preferred_hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          accommodation_cost: number | null
          case_id: string
          created_at: string
          created_by: string | null
          currency: Database["public"]["Enums"]["currency_code"]
          deleted_at: string | null
          discount: number
          document_path: string | null
          expected_net_revenue: number | null
          flight_cost: number | null
          fx_rate_to_inr: number | null
          gross_profit: number | null
          hospital_cost: number | null
          hospital_id: string | null
          hospital_opinion_id: string | null
          id: string
          misc_cost: number
          net_profit: number | null
          notes: string | null
          quotation_number: string | null
          quotation_version: number
          riayah_service_fee: number | null
          room_cost: number
          sent_at: string | null
          service_charge: number | null
          status: Database["public"]["Enums"]["quotation_status"]
          total_amount: number
          total_inr: number | null
          total_package_cost: number | null
          translator_cost: number | null
          transport_cost: number | null
          treatment_cost: number
          updated_at: string
          valid_until: string | null
          visa_cost: number | null
        }
        Insert: {
          accommodation_cost?: number | null
          case_id: string
          created_at?: string
          created_by?: string | null
          currency?: Database["public"]["Enums"]["currency_code"]
          deleted_at?: string | null
          discount?: number
          document_path?: string | null
          expected_net_revenue?: number | null
          flight_cost?: number | null
          fx_rate_to_inr?: number | null
          gross_profit?: number | null
          hospital_cost?: number | null
          hospital_id?: string | null
          hospital_opinion_id?: string | null
          id?: string
          misc_cost?: number
          net_profit?: number | null
          notes?: string | null
          quotation_number?: string | null
          quotation_version?: number
          riayah_service_fee?: number | null
          room_cost?: number
          sent_at?: string | null
          service_charge?: number | null
          status?: Database["public"]["Enums"]["quotation_status"]
          total_amount?: number
          total_inr?: number | null
          total_package_cost?: number | null
          translator_cost?: number | null
          transport_cost?: number | null
          treatment_cost?: number
          updated_at?: string
          valid_until?: string | null
          visa_cost?: number | null
        }
        Update: {
          accommodation_cost?: number | null
          case_id?: string
          created_at?: string
          created_by?: string | null
          currency?: Database["public"]["Enums"]["currency_code"]
          deleted_at?: string | null
          discount?: number
          document_path?: string | null
          expected_net_revenue?: number | null
          flight_cost?: number | null
          fx_rate_to_inr?: number | null
          gross_profit?: number | null
          hospital_cost?: number | null
          hospital_id?: string | null
          hospital_opinion_id?: string | null
          id?: string
          misc_cost?: number
          net_profit?: number | null
          notes?: string | null
          quotation_number?: string | null
          quotation_version?: number
          riayah_service_fee?: number | null
          room_cost?: number
          sent_at?: string | null
          service_charge?: number | null
          status?: Database["public"]["Enums"]["quotation_status"]
          total_amount?: number
          total_inr?: number | null
          total_package_cost?: number | null
          translator_cost?: number | null
          transport_cost?: number | null
          treatment_cost?: number
          updated_at?: string
          valid_until?: string | null
          visa_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quotations_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_hospital_opinion_id_fkey"
            columns: ["hospital_opinion_id"]
            isOneToOne: false
            referencedRelation: "hospital_opinions"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_partners: {
        Row: {
          agreement_end_date: string | null
          agreement_start_date: string | null
          city: string | null
          commission_percentage: number | null
          contact_person: string | null
          country: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          email: string | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          partner_type: Database["public"]["Enums"]["referral_partner_type"]
          phone: string | null
          updated_at: string
        }
        Insert: {
          agreement_end_date?: string | null
          agreement_start_date?: string | null
          city?: string | null
          commission_percentage?: number | null
          contact_person?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          partner_type: Database["public"]["Enums"]["referral_partner_type"]
          phone?: string | null
          updated_at?: string
        }
        Update: {
          agreement_end_date?: string | null
          agreement_start_date?: string | null
          city?: string | null
          commission_percentage?: number | null
          contact_person?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          partner_type?: Database["public"]["Enums"]["referral_partner_type"]
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_partners_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_transactions: {
        Row: {
          amount_inr: number | null
          case_id: string
          commission_amount: number
          created_at: string
          created_by: string | null
          currency: Database["public"]["Enums"]["currency_code"]
          deleted_at: string | null
          id: string
          invoice_number: string | null
          invoiced_at: string | null
          notes: string | null
          paid_at: string | null
          partner_id: string
          status: Database["public"]["Enums"]["referral_transaction_status"]
          updated_at: string
        }
        Insert: {
          amount_inr?: number | null
          case_id: string
          commission_amount: number
          created_at?: string
          created_by?: string | null
          currency?: Database["public"]["Enums"]["currency_code"]
          deleted_at?: string | null
          id?: string
          invoice_number?: string | null
          invoiced_at?: string | null
          notes?: string | null
          paid_at?: string | null
          partner_id: string
          status?: Database["public"]["Enums"]["referral_transaction_status"]
          updated_at?: string
        }
        Update: {
          amount_inr?: number | null
          case_id?: string
          commission_amount?: number
          created_at?: string
          created_by?: string | null
          currency?: Database["public"]["Enums"]["currency_code"]
          deleted_at?: string | null
          id?: string
          invoice_number?: string | null
          invoiced_at?: string | null
          notes?: string | null
          paid_at?: string | null
          partner_id?: string
          status?: Database["public"]["Enums"]["referral_transaction_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_transactions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_transactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_transactions_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "referral_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string | null
          case_id: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          due_at: string | null
          id: string
          priority: Database["public"]["Enums"]["priority_level"]
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          case_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["priority_level"]
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          case_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["priority_level"]
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          auth_user_id: string | null
          avatar_url: string | null
          created_at: string
          deleted_at: string | null
          department: string | null
          email: string | null
          full_name: string
          id: string
          is_active: boolean
          job_title: string | null
          last_login_at: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          auth_user_id?: string | null
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          department?: string | null
          email?: string | null
          full_name: string
          id?: string
          is_active?: boolean
          job_title?: string | null
          last_login_at?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          auth_user_id?: string | null
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          department?: string | null
          email?: string | null
          full_name?: string
          id?: string
          is_active?: boolean
          job_title?: string | null
          last_login_at?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      voice_transcripts: {
        Row: {
          audio_mime_type: string | null
          audio_storage_path: string | null
          case_id: string | null
          communication_id: string | null
          created_at: string
          duration_seconds: number | null
          error_message: string | null
          id: string
          intake_event_id: string | null
          language: string | null
          model: string | null
          person_id: string | null
          status: Database["public"]["Enums"]["extraction_status"]
          transcript: string | null
          updated_at: string
        }
        Insert: {
          audio_mime_type?: string | null
          audio_storage_path?: string | null
          case_id?: string | null
          communication_id?: string | null
          created_at?: string
          duration_seconds?: number | null
          error_message?: string | null
          id?: string
          intake_event_id?: string | null
          language?: string | null
          model?: string | null
          person_id?: string | null
          status?: Database["public"]["Enums"]["extraction_status"]
          transcript?: string | null
          updated_at?: string
        }
        Update: {
          audio_mime_type?: string | null
          audio_storage_path?: string | null
          case_id?: string | null
          communication_id?: string | null
          created_at?: string
          duration_seconds?: number | null
          error_message?: string | null
          id?: string
          intake_event_id?: string | null
          language?: string | null
          model?: string | null
          person_id?: string | null
          status?: Database["public"]["Enums"]["extraction_status"]
          transcript?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_transcripts_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_transcripts_communication_id_fkey"
            columns: ["communication_id"]
            isOneToOne: false
            referencedRelation: "communications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_transcripts_intake_event_id_fkey"
            columns: ["intake_event_id"]
            isOneToOne: false
            referencedRelation: "lead_intake_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_transcripts_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "persons"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_templates: {
        Row: {
          clinical_path: Database["public"]["Enums"]["clinical_path"] | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          sla_hours: number | null
          stage: Database["public"]["Enums"]["workflow_stage"] | null
          tasks: Json
          updated_at: string
          version: number
        }
        Insert: {
          clinical_path?: Database["public"]["Enums"]["clinical_path"] | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          sla_hours?: number | null
          stage?: Database["public"]["Enums"]["workflow_stage"] | null
          tasks?: Json
          updated_at?: string
          version?: number
        }
        Update: {
          clinical_path?: Database["public"]["Enums"]["clinical_path"] | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          sla_hours?: number | null
          stage?: Database["public"]["Enums"]["workflow_stage"] | null
          tasks?: Json
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "workflow_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
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
      ai_analysis_type:
        | "lead_summary"
        | "urgency_detection"
        | "missing_reports"
        | "duplicate_detection"
        | "conversion_probability"
        | "next_action"
        | "medical_summary"
        | "translation"
        | "other"
      ai_log_status: "success" | "error" | "timeout" | "rate_limited"
      app_role:
        | "admin"
        | "coordinator"
        | "medical_reviewer"
        | "hospital_relations"
        | "finance"
        | "travel"
        | "viewer"
      case_status:
        | "new"
        | "in_review"
        | "awaiting_reports"
        | "awaiting_hospital_opinion"
        | "quotation_sent"
        | "awaiting_decision"
        | "confirmed"
        | "travel_planning"
        | "in_treatment"
        | "post_treatment"
        | "completed"
        | "cancelled"
        | "lost"
      clinical_path: "op_consultation" | "surgery" | "medical_management"
      comm_channel:
        | "whatsapp"
        | "call"
        | "email"
        | "sms"
        | "note"
        | "voice_note"
        | "in_person"
      comm_direction: "incoming" | "outgoing" | "internal"
      currency_code:
        | "INR"
        | "USD"
        | "AED"
        | "SAR"
        | "QAR"
        | "KWD"
        | "BHD"
        | "OMR"
        | "EUR"
        | "GBP"
      decision_status:
        | "pending"
        | "accepted"
        | "declined"
        | "deferred"
        | "no_response"
      document_type:
        | "passport"
        | "visa"
        | "medical_report"
        | "hospital_opinion"
        | "quotation"
        | "invoice"
        | "receipt"
        | "itinerary"
        | "discharge_summary"
        | "prescription"
        | "insurance"
        | "consent_form"
        | "other"
      evidence_source:
        | "patient_message"
        | "voice_transcript"
        | "medical_report"
        | "discharge_summary"
        | "prescription"
        | "lab_report"
        | "pathology_report"
        | "radiology_report"
        | "other_document"
        | "existing_record"
        | "doctor_opinion"
        | "hospital_opinion"
        | "manual_entry"
        | "lead_form"
      extraction_status:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "unsupported"
      fact_status:
        | "proposed"
        | "confirmed"
        | "rejected"
        | "conflicted"
        | "superseded"
      finance_status:
        | "pending"
        | "partial"
        | "paid"
        | "overdue"
        | "cancelled"
        | "refunded"
      finance_type:
        | "invoice"
        | "payment"
        | "refund"
        | "commission"
        | "expense"
        | "adjustment"
      followup_status:
        | "scheduled"
        | "completed"
        | "missed"
        | "cancelled"
        | "rescheduled"
      hospital_tier: "tier_1" | "tier_2" | "tier_3" | "partner" | "preferred"
      intake_channel:
        | "website"
        | "whatsapp"
        | "messenger"
        | "instagram"
        | "facebook"
        | "facebook_lead_ad"
        | "instagram_lead_ad"
        | "referral"
        | "manual"
        | "email"
        | "other"
      intake_status:
        | "received"
        | "processing"
        | "processed"
        | "needs_review"
        | "failed"
        | "duplicate_ignored"
      lead_source:
        | "whatsapp"
        | "website"
        | "referral"
        | "meta_ads"
        | "google_ads"
        | "instagram"
        | "facebook"
        | "email"
        | "phone"
        | "walk_in"
        | "partner"
        | "other"
        | "messenger"
        | "facebook_lead_ad"
        | "instagram_lead_ad"
        | "manual"
      logistics_status:
        | "pending"
        | "booked"
        | "in_progress"
        | "completed"
        | "cancelled"
      logistics_type:
        | "visa"
        | "flight"
        | "hotel"
        | "transport"
        | "insurance"
        | "local_stay"
        | "other"
      notification_channel: "in_app" | "email" | "sms" | "whatsapp" | "push"
      notification_status: "pending" | "sent" | "delivered" | "read" | "failed"
      notification_type:
        | "case_update"
        | "sla_breach"
        | "new_lead"
        | "task_assigned"
        | "follow_up_due"
        | "quotation_response"
        | "payment_received"
        | "document_uploaded"
        | "ai_insight"
        | "system"
      opinion_status:
        | "requested"
        | "in_review"
        | "received"
        | "declined"
        | "expired"
      priority_level: "low" | "medium" | "high" | "critical"
      quotation_status:
        | "draft"
        | "sent"
        | "accepted"
        | "declined"
        | "expired"
        | "revised"
      referral_partner_type:
        | "individual"
        | "clinic"
        | "agency"
        | "corporate"
        | "embassy"
        | "insurance"
        | "other"
      referral_transaction_status:
        | "pending"
        | "approved"
        | "invoiced"
        | "paid"
        | "cancelled"
      report_translation_status:
        | "not_required"
        | "pending"
        | "in_progress"
        | "completed"
      task_status: "open" | "in_progress" | "blocked" | "done" | "cancelled"
      triage_decider: "ai" | "human"
      urgency_level: "low" | "medium" | "high" | "critical"
      workflow_stage:
        | "lead_captured"
        | "reports_requested"
        | "reports_received"
        | "medical_review"
        | "hospital_shortlist"
        | "hospital_opinion_requested"
        | "hospital_opinion_received"
        | "quotation_prepared"
        | "quotation_sent"
        | "patient_decision"
        | "confirmed"
        | "visa_processing"
        | "travel_booking"
        | "arrival"
        | "op_consultation"
        | "admission"
        | "surgery"
        | "icu"
        | "recovery"
        | "discharge"
        | "follow_up"
        | "closed"
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
    Enums: {
      ai_analysis_type: [
        "lead_summary",
        "urgency_detection",
        "missing_reports",
        "duplicate_detection",
        "conversion_probability",
        "next_action",
        "medical_summary",
        "translation",
        "other",
      ],
      ai_log_status: ["success", "error", "timeout", "rate_limited"],
      app_role: [
        "admin",
        "coordinator",
        "medical_reviewer",
        "hospital_relations",
        "finance",
        "travel",
        "viewer",
      ],
      case_status: [
        "new",
        "in_review",
        "awaiting_reports",
        "awaiting_hospital_opinion",
        "quotation_sent",
        "awaiting_decision",
        "confirmed",
        "travel_planning",
        "in_treatment",
        "post_treatment",
        "completed",
        "cancelled",
        "lost",
      ],
      clinical_path: ["op_consultation", "surgery", "medical_management"],
      comm_channel: [
        "whatsapp",
        "call",
        "email",
        "sms",
        "note",
        "voice_note",
        "in_person",
      ],
      comm_direction: ["incoming", "outgoing", "internal"],
      currency_code: [
        "INR",
        "USD",
        "AED",
        "SAR",
        "QAR",
        "KWD",
        "BHD",
        "OMR",
        "EUR",
        "GBP",
      ],
      decision_status: [
        "pending",
        "accepted",
        "declined",
        "deferred",
        "no_response",
      ],
      document_type: [
        "passport",
        "visa",
        "medical_report",
        "hospital_opinion",
        "quotation",
        "invoice",
        "receipt",
        "itinerary",
        "discharge_summary",
        "prescription",
        "insurance",
        "consent_form",
        "other",
      ],
      evidence_source: [
        "patient_message",
        "voice_transcript",
        "medical_report",
        "discharge_summary",
        "prescription",
        "lab_report",
        "pathology_report",
        "radiology_report",
        "other_document",
        "existing_record",
        "doctor_opinion",
        "hospital_opinion",
        "manual_entry",
        "lead_form",
      ],
      extraction_status: [
        "pending",
        "processing",
        "completed",
        "failed",
        "unsupported",
      ],
      fact_status: [
        "proposed",
        "confirmed",
        "rejected",
        "conflicted",
        "superseded",
      ],
      finance_status: [
        "pending",
        "partial",
        "paid",
        "overdue",
        "cancelled",
        "refunded",
      ],
      finance_type: [
        "invoice",
        "payment",
        "refund",
        "commission",
        "expense",
        "adjustment",
      ],
      followup_status: [
        "scheduled",
        "completed",
        "missed",
        "cancelled",
        "rescheduled",
      ],
      hospital_tier: ["tier_1", "tier_2", "tier_3", "partner", "preferred"],
      intake_channel: [
        "website",
        "whatsapp",
        "messenger",
        "instagram",
        "facebook",
        "facebook_lead_ad",
        "instagram_lead_ad",
        "referral",
        "manual",
        "email",
        "other",
      ],
      intake_status: [
        "received",
        "processing",
        "processed",
        "needs_review",
        "failed",
        "duplicate_ignored",
      ],
      lead_source: [
        "whatsapp",
        "website",
        "referral",
        "meta_ads",
        "google_ads",
        "instagram",
        "facebook",
        "email",
        "phone",
        "walk_in",
        "partner",
        "other",
        "messenger",
        "facebook_lead_ad",
        "instagram_lead_ad",
        "manual",
      ],
      logistics_status: [
        "pending",
        "booked",
        "in_progress",
        "completed",
        "cancelled",
      ],
      logistics_type: [
        "visa",
        "flight",
        "hotel",
        "transport",
        "insurance",
        "local_stay",
        "other",
      ],
      notification_channel: ["in_app", "email", "sms", "whatsapp", "push"],
      notification_status: ["pending", "sent", "delivered", "read", "failed"],
      notification_type: [
        "case_update",
        "sla_breach",
        "new_lead",
        "task_assigned",
        "follow_up_due",
        "quotation_response",
        "payment_received",
        "document_uploaded",
        "ai_insight",
        "system",
      ],
      opinion_status: [
        "requested",
        "in_review",
        "received",
        "declined",
        "expired",
      ],
      priority_level: ["low", "medium", "high", "critical"],
      quotation_status: [
        "draft",
        "sent",
        "accepted",
        "declined",
        "expired",
        "revised",
      ],
      referral_partner_type: [
        "individual",
        "clinic",
        "agency",
        "corporate",
        "embassy",
        "insurance",
        "other",
      ],
      referral_transaction_status: [
        "pending",
        "approved",
        "invoiced",
        "paid",
        "cancelled",
      ],
      report_translation_status: [
        "not_required",
        "pending",
        "in_progress",
        "completed",
      ],
      task_status: ["open", "in_progress", "blocked", "done", "cancelled"],
      triage_decider: ["ai", "human"],
      urgency_level: ["low", "medium", "high", "critical"],
      workflow_stage: [
        "lead_captured",
        "reports_requested",
        "reports_received",
        "medical_review",
        "hospital_shortlist",
        "hospital_opinion_requested",
        "hospital_opinion_received",
        "quotation_prepared",
        "quotation_sent",
        "patient_decision",
        "confirmed",
        "visa_processing",
        "travel_booking",
        "arrival",
        "op_consultation",
        "admission",
        "surgery",
        "icu",
        "recovery",
        "discharge",
        "follow_up",
        "closed",
      ],
    },
  },
} as const
