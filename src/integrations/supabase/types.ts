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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          created_at: string | null
          details: string | null
          entity: string
          entity_id: string
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: string | null
          entity: string
          entity_id: string
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: string | null
          entity?: string
          entity_id?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_evidence_files: {
        Row: {
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          task_id: string | null
          uploaded_by: string | null
          vehicle_id: string
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          task_id?: string | null
          uploaded_by?: string | null
          vehicle_id: string
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          task_id?: string | null
          uploaded_by?: string | null
          vehicle_id?: string
        }
        Relationships: []
      }
      demo_inspections: {
        Row: {
          created_at: string | null
          findings: string | null
          id: string
          inspector: string | null
          result: Database["public"]["Enums"]["inspection_result"] | null
          scheduled_date: string
          type: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string | null
          findings?: string | null
          id?: string
          inspector?: string | null
          result?: Database["public"]["Enums"]["inspection_result"] | null
          scheduled_date: string
          type: string
          vehicle_id: string
        }
        Update: {
          created_at?: string | null
          findings?: string | null
          id?: string
          inspector?: string | null
          result?: Database["public"]["Enums"]["inspection_result"] | null
          scheduled_date?: string
          type?: string
          vehicle_id?: string
        }
        Relationships: []
      }
      demo_vehicle_equipment: {
        Row: {
          created_at: string | null
          equipment_id: string
          id: string
          installed_date: string | null
          last_service_date: string | null
          next_service_date: string | null
          notes: string | null
          serial_number: string | null
          updated_at: string | null
          vehicle_id: string
        }
        Insert: {
          created_at?: string | null
          equipment_id: string
          id?: string
          installed_date?: string | null
          last_service_date?: string | null
          next_service_date?: string | null
          notes?: string | null
          serial_number?: string | null
          updated_at?: string | null
          vehicle_id: string
        }
        Update: {
          created_at?: string | null
          equipment_id?: string
          id?: string
          installed_date?: string | null
          last_service_date?: string | null
          next_service_date?: string | null
          notes?: string | null
          serial_number?: string | null
          updated_at?: string | null
          vehicle_id?: string
        }
        Relationships: []
      }
      demo_vehicle_tasks: {
        Row: {
          approved_by: string | null
          approved_on: string | null
          assignee_id: string | null
          created_at: string | null
          due_date: string | null
          evidence_url: string | null
          id: string
          notes: string | null
          percent_complete: number | null
          requires_approval: boolean | null
          requires_evidence: boolean | null
          sla_hours: number | null
          status: Database["public"]["Enums"]["task_status"]
          step_category: Database["public"]["Enums"]["task_category"]
          step_name: string
          template_id: string | null
          updated_at: string | null
          vehicle_id: string
        }
        Insert: {
          approved_by?: string | null
          approved_on?: string | null
          assignee_id?: string | null
          created_at?: string | null
          due_date?: string | null
          evidence_url?: string | null
          id?: string
          notes?: string | null
          percent_complete?: number | null
          requires_approval?: boolean | null
          requires_evidence?: boolean | null
          sla_hours?: number | null
          status?: Database["public"]["Enums"]["task_status"]
          step_category: Database["public"]["Enums"]["task_category"]
          step_name: string
          template_id?: string | null
          updated_at?: string | null
          vehicle_id: string
        }
        Update: {
          approved_by?: string | null
          approved_on?: string | null
          assignee_id?: string | null
          created_at?: string | null
          due_date?: string | null
          evidence_url?: string | null
          id?: string
          notes?: string | null
          percent_complete?: number | null
          requires_approval?: boolean | null
          requires_evidence?: boolean | null
          sla_hours?: number | null
          status?: Database["public"]["Enums"]["task_status"]
          step_category?: Database["public"]["Enums"]["task_category"]
          step_name?: string
          template_id?: string | null
          updated_at?: string | null
          vehicle_id?: string
        }
        Relationships: []
      }
      demo_vehicles: {
        Row: {
          build_type: string | null
          chp_permit: string | null
          commissioning_template: string | null
          created_at: string | null
          created_by: string | null
          dmv_expiration: string | null
          fuel_type: string | null
          id: string
          in_service_date: string | null
          la_county_expiration: string | null
          last_chp_inspection: string | null
          lytx_id: string | null
          make: string
          mod_type: string | null
          model: string
          next_chp_inspection: string | null
          oc_expiration: string | null
          odometer: number | null
          plate: string
          primary_depot: string | null
          radio_id: string | null
          region_id: string | null
          riverside_expiration: string | null
          smog_expiration: string | null
          status: Database["public"]["Enums"]["vehicle_status"]
          status_date: string | null
          type: Database["public"]["Enums"]["vehicle_type"]
          updated_at: string | null
          vehicle_id: string
          vin: string
          year: number
        }
        Insert: {
          build_type?: string | null
          chp_permit?: string | null
          commissioning_template?: string | null
          created_at?: string | null
          created_by?: string | null
          dmv_expiration?: string | null
          fuel_type?: string | null
          id?: string
          in_service_date?: string | null
          la_county_expiration?: string | null
          last_chp_inspection?: string | null
          lytx_id?: string | null
          make: string
          mod_type?: string | null
          model: string
          next_chp_inspection?: string | null
          oc_expiration?: string | null
          odometer?: number | null
          plate: string
          primary_depot?: string | null
          radio_id?: string | null
          region_id?: string | null
          riverside_expiration?: string | null
          smog_expiration?: string | null
          status?: Database["public"]["Enums"]["vehicle_status"]
          status_date?: string | null
          type?: Database["public"]["Enums"]["vehicle_type"]
          updated_at?: string | null
          vehicle_id: string
          vin: string
          year: number
        }
        Update: {
          build_type?: string | null
          chp_permit?: string | null
          commissioning_template?: string | null
          created_at?: string | null
          created_by?: string | null
          dmv_expiration?: string | null
          fuel_type?: string | null
          id?: string
          in_service_date?: string | null
          la_county_expiration?: string | null
          last_chp_inspection?: string | null
          lytx_id?: string | null
          make?: string
          mod_type?: string | null
          model?: string
          next_chp_inspection?: string | null
          oc_expiration?: string | null
          odometer?: number | null
          plate?: string
          primary_depot?: string | null
          radio_id?: string | null
          region_id?: string | null
          riverside_expiration?: string | null
          smog_expiration?: string | null
          status?: Database["public"]["Enums"]["vehicle_status"]
          status_date?: string | null
          type?: Database["public"]["Enums"]["vehicle_type"]
          updated_at?: string | null
          vehicle_id?: string
          vin?: string
          year?: number
        }
        Relationships: []
      }
      equipment_catalog: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          equipment_id: string
          evidence_type: string | null
          id: string
          manufacturer: string | null
          model: string | null
          name: string
          part_number: string | null
          requires_calibration: boolean | null
          service_interval_days: number | null
          service_interval_miles: number | null
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          equipment_id: string
          evidence_type?: string | null
          id?: string
          manufacturer?: string | null
          model?: string | null
          name: string
          part_number?: string | null
          requires_calibration?: boolean | null
          service_interval_days?: number | null
          service_interval_miles?: number | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          equipment_id?: string
          evidence_type?: string | null
          id?: string
          manufacturer?: string | null
          model?: string | null
          name?: string
          part_number?: string | null
          requires_calibration?: boolean | null
          service_interval_days?: number | null
          service_interval_miles?: number | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_catalog_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence_files: {
        Row: {
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          task_id: string | null
          uploaded_by: string | null
          vehicle_id: string
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          task_id?: string | null
          uploaded_by?: string | null
          vehicle_id: string
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          task_id?: string | null
          uploaded_by?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "evidence_files_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "vehicle_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_files_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      inspections: {
        Row: {
          created_at: string | null
          findings: string | null
          id: string
          inspector: string | null
          result: Database["public"]["Enums"]["inspection_result"] | null
          scheduled_date: string
          type: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string | null
          findings?: string | null
          id?: string
          inspector?: string | null
          result?: Database["public"]["Enums"]["inspection_result"] | null
          scheduled_date: string
          type: string
          vehicle_id: string
        }
        Update: {
          created_at?: string | null
          findings?: string | null
          id?: string
          inspector?: string | null
          result?: Database["public"]["Enums"]["inspection_result"] | null
          scheduled_date?: string
          type?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspections_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          role: Database["public"]["Enums"]["app_role"]
          status: Database["public"]["Enums"]["invitation_status"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          role: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          tenant_type: Database["public"]["Enums"]["tenant_type"]
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          tenant_type?: Database["public"]["Enums"]["tenant_type"]
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          tenant_type?: Database["public"]["Enums"]["tenant_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      regions: {
        Row: {
          cert_checklist_url: string | null
          code: string
          created_at: string | null
          id: string
          name: string
          policy_links: string | null
        }
        Insert: {
          cert_checklist_url?: string | null
          code: string
          created_at?: string | null
          id?: string
          name: string
          policy_links?: string | null
        }
        Update: {
          cert_checklist_url?: string | null
          code?: string
          created_at?: string | null
          id?: string
          name?: string
          policy_links?: string | null
        }
        Relationships: []
      }
      smartsheet_data: {
        Row: {
          created_at: string
          id: string
          row_data: Json
          row_id: string
          sheet_id: string
          sheet_name: string
          synced_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          row_data: Json
          row_id: string
          sheet_id: string
          sheet_name: string
          synced_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          row_data?: Json
          row_id?: string
          sheet_id?: string
          sheet_name?: string
          synced_at?: string
        }
        Relationships: []
      }
      smartsheet_sync_config: {
        Row: {
          created_at: string
          id: string
          last_synced_at: string | null
          sheet_id: string
          sheet_name: string
          sync_enabled: boolean
          sync_interval_minutes: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_synced_at?: string | null
          sheet_id: string
          sheet_name: string
          sync_enabled?: boolean
          sync_interval_minutes?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_synced_at?: string | null
          sheet_id?: string
          sheet_name?: string
          sync_enabled?: boolean
          sync_interval_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      smartsheet_sync_log: {
        Row: {
          error_message: string | null
          id: string
          rows_synced: number | null
          sheet_id: string
          status: string
          synced_at: string
        }
        Insert: {
          error_message?: string | null
          id?: string
          rows_synced?: number | null
          sheet_id: string
          status: string
          synced_at?: string
        }
        Update: {
          error_message?: string | null
          id?: string
          rows_synced?: number | null
          sheet_id?: string
          status?: string
          synced_at?: string
        }
        Relationships: []
      }
      task_templates: {
        Row: {
          created_at: string | null
          dependent_step_id: string | null
          evidence_type: string | null
          id: string
          name: string
          region_id: string | null
          requires_approval: boolean | null
          requires_evidence: boolean | null
          sla_hours: number | null
          step_category: Database["public"]["Enums"]["task_category"]
          step_name: string
          step_order: number
          template_id: string
          vehicle_type: Database["public"]["Enums"]["vehicle_type"]
        }
        Insert: {
          created_at?: string | null
          dependent_step_id?: string | null
          evidence_type?: string | null
          id?: string
          name: string
          region_id?: string | null
          requires_approval?: boolean | null
          requires_evidence?: boolean | null
          sla_hours?: number | null
          step_category: Database["public"]["Enums"]["task_category"]
          step_name: string
          step_order: number
          template_id: string
          vehicle_type: Database["public"]["Enums"]["vehicle_type"]
        }
        Update: {
          created_at?: string | null
          dependent_step_id?: string | null
          evidence_type?: string | null
          id?: string
          name?: string
          region_id?: string | null
          requires_approval?: boolean | null
          requires_evidence?: boolean | null
          sla_hours?: number | null
          step_category?: Database["public"]["Enums"]["task_category"]
          step_name?: string
          step_order?: number
          template_id?: string
          vehicle_type?: Database["public"]["Enums"]["vehicle_type"]
        }
        Relationships: [
          {
            foreignKeyName: "task_templates_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_equipment: {
        Row: {
          created_at: string | null
          equipment_id: string
          id: string
          installed_date: string | null
          last_service_date: string | null
          next_service_date: string | null
          notes: string | null
          serial_number: string | null
          updated_at: string | null
          vehicle_id: string
        }
        Insert: {
          created_at?: string | null
          equipment_id: string
          id?: string
          installed_date?: string | null
          last_service_date?: string | null
          next_service_date?: string | null
          notes?: string | null
          serial_number?: string | null
          updated_at?: string | null
          vehicle_id: string
        }
        Update: {
          created_at?: string | null
          equipment_id?: string
          id?: string
          installed_date?: string | null
          last_service_date?: string | null
          next_service_date?: string | null
          notes?: string | null
          serial_number?: string | null
          updated_at?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_equipment_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_equipment_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_tasks: {
        Row: {
          approved_by: string | null
          approved_on: string | null
          assignee_id: string | null
          created_at: string | null
          due_date: string | null
          evidence_url: string | null
          id: string
          notes: string | null
          percent_complete: number | null
          requires_approval: boolean | null
          requires_evidence: boolean | null
          sla_hours: number | null
          status: Database["public"]["Enums"]["task_status"]
          step_category: Database["public"]["Enums"]["task_category"]
          step_name: string
          template_id: string | null
          updated_at: string | null
          vehicle_id: string
        }
        Insert: {
          approved_by?: string | null
          approved_on?: string | null
          assignee_id?: string | null
          created_at?: string | null
          due_date?: string | null
          evidence_url?: string | null
          id?: string
          notes?: string | null
          percent_complete?: number | null
          requires_approval?: boolean | null
          requires_evidence?: boolean | null
          sla_hours?: number | null
          status?: Database["public"]["Enums"]["task_status"]
          step_category: Database["public"]["Enums"]["task_category"]
          step_name: string
          template_id?: string | null
          updated_at?: string | null
          vehicle_id: string
        }
        Update: {
          approved_by?: string | null
          approved_on?: string | null
          assignee_id?: string | null
          created_at?: string | null
          due_date?: string | null
          evidence_url?: string | null
          id?: string
          notes?: string | null
          percent_complete?: number | null
          requires_approval?: boolean | null
          requires_evidence?: boolean | null
          sla_hours?: number | null
          status?: Database["public"]["Enums"]["task_status"]
          step_category?: Database["public"]["Enums"]["task_category"]
          step_name?: string
          template_id?: string | null
          updated_at?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_tasks_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_tasks_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          build_type: string | null
          chp_permit: string | null
          commissioning_template: string | null
          created_at: string | null
          created_by: string | null
          dmv_expiration: string | null
          fuel_type: string | null
          id: string
          in_service_date: string | null
          la_county_expiration: string | null
          last_chp_inspection: string | null
          lytx_id: string | null
          make: string
          mod_type: string | null
          model: string
          next_chp_inspection: string | null
          oc_expiration: string | null
          odometer: number | null
          plate: string
          primary_depot: string | null
          radio_id: string | null
          region_id: string | null
          riverside_expiration: string | null
          smog_expiration: string | null
          status: Database["public"]["Enums"]["vehicle_status"]
          status_date: string | null
          type: Database["public"]["Enums"]["vehicle_type"]
          updated_at: string | null
          vehicle_id: string
          vin: string
          year: number
        }
        Insert: {
          build_type?: string | null
          chp_permit?: string | null
          commissioning_template?: string | null
          created_at?: string | null
          created_by?: string | null
          dmv_expiration?: string | null
          fuel_type?: string | null
          id?: string
          in_service_date?: string | null
          la_county_expiration?: string | null
          last_chp_inspection?: string | null
          lytx_id?: string | null
          make: string
          mod_type?: string | null
          model: string
          next_chp_inspection?: string | null
          oc_expiration?: string | null
          odometer?: number | null
          plate: string
          primary_depot?: string | null
          radio_id?: string | null
          region_id?: string | null
          riverside_expiration?: string | null
          smog_expiration?: string | null
          status?: Database["public"]["Enums"]["vehicle_status"]
          status_date?: string | null
          type?: Database["public"]["Enums"]["vehicle_type"]
          updated_at?: string | null
          vehicle_id: string
          vin: string
          year: number
        }
        Update: {
          build_type?: string | null
          chp_permit?: string | null
          commissioning_template?: string | null
          created_at?: string | null
          created_by?: string | null
          dmv_expiration?: string | null
          fuel_type?: string | null
          id?: string
          in_service_date?: string | null
          la_county_expiration?: string | null
          last_chp_inspection?: string | null
          lytx_id?: string | null
          make?: string
          mod_type?: string | null
          model?: string
          next_chp_inspection?: string | null
          oc_expiration?: string | null
          odometer?: number | null
          plate?: string
          primary_depot?: string | null
          radio_id?: string | null
          region_id?: string | null
          riverside_expiration?: string | null
          smog_expiration?: string | null
          status?: Database["public"]["Enums"]["vehicle_status"]
          status_date?: string | null
          type?: Database["public"]["Enums"]["vehicle_type"]
          updated_at?: string | null
          vehicle_id?: string
          vin?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          contact: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          service: string | null
          sla_hours: number | null
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          contact?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          service?: string | null
          sla_hours?: number | null
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          contact?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          service?: string | null
          sla_hours?: number | null
          updated_at?: string | null
          vendor_id?: string
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
      app_role: "admin" | "supervisor" | "technician" | "viewer"
      inspection_result: "Pass" | "Fail" | "Pending"
      invitation_status: "pending" | "accepted" | "expired"
      task_category:
        | "Safety"
        | "Compliance"
        | "Logistics"
        | "IT"
        | "Branding"
        | "Clinical"
        | "Admin"
      task_status:
        | "Not Started"
        | "In Progress"
        | "Blocked"
        | "Submitted"
        | "Approved"
        | "Rejected"
      tenant_type: "internal" | "demo"
      vehicle_status:
        | "Draft"
        | "Commissioning"
        | "Ready"
        | "Out-of-Service"
        | "Decommissioned"
      vehicle_type: "ALS" | "BLS" | "CCT" | "Supervisor" | "Other"
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
      app_role: ["admin", "supervisor", "technician", "viewer"],
      inspection_result: ["Pass", "Fail", "Pending"],
      invitation_status: ["pending", "accepted", "expired"],
      task_category: [
        "Safety",
        "Compliance",
        "Logistics",
        "IT",
        "Branding",
        "Clinical",
        "Admin",
      ],
      task_status: [
        "Not Started",
        "In Progress",
        "Blocked",
        "Submitted",
        "Approved",
        "Rejected",
      ],
      tenant_type: ["internal", "demo"],
      vehicle_status: [
        "Draft",
        "Commissioning",
        "Ready",
        "Out-of-Service",
        "Decommissioned",
      ],
      vehicle_type: ["ALS", "BLS", "CCT", "Supervisor", "Other"],
    },
  },
} as const
