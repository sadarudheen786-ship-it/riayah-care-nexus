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
      cases: {
        Row: {
          actual_arrival_date: string | null
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
          expected_arrival_date: string | null
          expected_decision_date: string | null
          expected_revenue: number | null
          expected_revenue_currency:
            | Database["public"]["Enums"]["currency_code"]
            | null
          id: string
          lead_source: Database["public"]["Enums"]["lead_source"] | null
          medical_reviewer_id: string | null
          notes: string | null
          person_id: string
          primary_doctor_id: string | null
          primary_hospital_id: string | null
          probability: number | null
          specialty: string | null
          status: Database["public"]["Enums"]["case_status"]
          target_country: string | null
          updated_at: string
          urgency: Database["public"]["Enums"]["urgency_level"]
          workflow_stage: Database["public"]["Enums"]["workflow_stage"]
        }
        Insert: {
          actual_arrival_date?: string | null
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
          expected_arrival_date?: string | null
          expected_decision_date?: string | null
          expected_revenue?: number | null
          expected_revenue_currency?:
            | Database["public"]["Enums"]["currency_code"]
            | null
          id?: string
          lead_source?: Database["public"]["Enums"]["lead_source"] | null
          medical_reviewer_id?: string | null
          notes?: string | null
          person_id: string
          primary_doctor_id?: string | null
          primary_hospital_id?: string | null
          probability?: number | null
          specialty?: string | null
          status?: Database["public"]["Enums"]["case_status"]
          target_country?: string | null
          updated_at?: string
          urgency?: Database["public"]["Enums"]["urgency_level"]
          workflow_stage?: Database["public"]["Enums"]["workflow_stage"]
        }
        Update: {
          actual_arrival_date?: string | null
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
          expected_arrival_date?: string | null
          expected_decision_date?: string | null
          expected_revenue?: number | null
          expected_revenue_currency?:
            | Database["public"]["Enums"]["currency_code"]
            | null
          id?: string
          lead_source?: Database["public"]["Enums"]["lead_source"] | null
          medical_reviewer_id?: string | null
          notes?: string | null
          person_id?: string
          primary_doctor_id?: string | null
          primary_hospital_id?: string | null
          probability?: number | null
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
          occurred_at: string
          person_id: string | null
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
          occurred_at?: string
          person_id?: string | null
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
          occurred_at?: string
          person_id?: string | null
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
      doctors: {
        Row: {
          created_at: string
          deleted_at: string | null
          email: string | null
          full_name: string
          hospital_id: string | null
          id: string
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
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          full_name: string
          hospital_id?: string | null
          id?: string
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
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          full_name?: string
          hospital_id?: string | null
          id?: string
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
      hospitals: {
        Row: {
          accreditations: string[] | null
          address: string | null
          city: string | null
          commission_percentage: number | null
          contact_person: string | null
          country: string
          created_at: string
          deleted_at: string | null
          email: string | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          phone: string | null
          specialties: string[] | null
          tier: Database["public"]["Enums"]["hospital_tier"] | null
          updated_at: string
          website: string | null
        }
        Insert: {
          accreditations?: string[] | null
          address?: string | null
          city?: string | null
          commission_percentage?: number | null
          contact_person?: string | null
          country?: string
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          phone?: string | null
          specialties?: string[] | null
          tier?: Database["public"]["Enums"]["hospital_tier"] | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          accreditations?: string[] | null
          address?: string | null
          city?: string | null
          commission_percentage?: number | null
          contact_person?: string | null
          country?: string
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          phone?: string | null
          specialties?: string[] | null
          tier?: Database["public"]["Enums"]["hospital_tier"] | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
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
          last_name: string | null
          middle_name: string | null
          nationality: string | null
          notes: string | null
          passport_expiry: string | null
          passport_issue_country: string | null
          passport_number: string | null
          preferred_language: string | null
          primary_phone: string | null
          updated_at: string
          whatsapp_number: string | null
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
          last_name?: string | null
          middle_name?: string | null
          nationality?: string | null
          notes?: string | null
          passport_expiry?: string | null
          passport_issue_country?: string | null
          passport_number?: string | null
          preferred_language?: string | null
          primary_phone?: string | null
          updated_at?: string
          whatsapp_number?: string | null
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
          last_name?: string | null
          middle_name?: string | null
          nationality?: string | null
          notes?: string | null
          passport_expiry?: string | null
          passport_issue_country?: string | null
          passport_number?: string | null
          preferred_language?: string | null
          primary_phone?: string | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "persons_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          case_id: string
          created_at: string
          created_by: string | null
          currency: Database["public"]["Enums"]["currency_code"]
          deleted_at: string | null
          discount: number
          document_path: string | null
          expected_net_revenue: number | null
          fx_rate_to_inr: number | null
          hospital_id: string | null
          hospital_opinion_id: string | null
          id: string
          misc_cost: number
          notes: string | null
          quotation_number: string | null
          room_cost: number
          sent_at: string | null
          service_charge: number | null
          status: Database["public"]["Enums"]["quotation_status"]
          total_amount: number
          total_inr: number | null
          treatment_cost: number
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          case_id: string
          created_at?: string
          created_by?: string | null
          currency?: Database["public"]["Enums"]["currency_code"]
          deleted_at?: string | null
          discount?: number
          document_path?: string | null
          expected_net_revenue?: number | null
          fx_rate_to_inr?: number | null
          hospital_id?: string | null
          hospital_opinion_id?: string | null
          id?: string
          misc_cost?: number
          notes?: string | null
          quotation_number?: string | null
          room_cost?: number
          sent_at?: string | null
          service_charge?: number | null
          status?: Database["public"]["Enums"]["quotation_status"]
          total_amount?: number
          total_inr?: number | null
          treatment_cost?: number
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          case_id?: string
          created_at?: string
          created_by?: string | null
          currency?: Database["public"]["Enums"]["currency_code"]
          deleted_at?: string | null
          discount?: number
          document_path?: string | null
          expected_net_revenue?: number | null
          fx_rate_to_inr?: number | null
          hospital_id?: string | null
          hospital_opinion_id?: string | null
          id?: string
          misc_cost?: number
          notes?: string | null
          quotation_number?: string | null
          room_cost?: number
          sent_at?: string | null
          service_charge?: number | null
          status?: Database["public"]["Enums"]["quotation_status"]
          total_amount?: number
          total_inr?: number | null
          treatment_cost?: number
          updated_at?: string
          valid_until?: string | null
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
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
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
      report_translation_status:
        | "not_required"
        | "pending"
        | "in_progress"
        | "completed"
      task_status: "open" | "in_progress" | "blocked" | "done" | "cancelled"
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
      report_translation_status: [
        "not_required",
        "pending",
        "in_progress",
        "completed",
      ],
      task_status: ["open", "in_progress", "blocked", "done", "cancelled"],
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
