export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          role: "admin" | "student";
          theme: "light" | "dark" | "system";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          role?: "admin" | "student";
          theme?: "light" | "dark" | "system";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          role?: "admin" | "student";
          theme?: "light" | "dark" | "system";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      courses: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          color: string | null;
          icon: string | null;
          order_index: number;
          is_published: boolean;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description?: string | null;
          color?: string | null;
          icon?: string | null;
          order_index?: number;
          is_published?: boolean;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          description?: string | null;
          color?: string | null;
          icon?: string | null;
          order_index?: number;
          is_published?: boolean;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "courses_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      subjects: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          slug: string;
          description: string | null;
          color: string | null;
          icon: string | null;
          order_index: number;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          slug: string;
          description?: string | null;
          color?: string | null;
          icon?: string | null;
          order_index?: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          title?: string;
          slug?: string;
          description?: string | null;
          color?: string | null;
          icon?: string | null;
          order_index?: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subjects_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
        ];
      };
      chapters: {
        Row: {
          id: string;
          subject_id: string;
          title: string;
          slug: string;
          description: string | null;
          order_index: number;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          subject_id: string;
          title: string;
          slug: string;
          description?: string | null;
          order_index?: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          subject_id?: string;
          title?: string;
          slug?: string;
          description?: string | null;
          order_index?: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chapters_subject_id_fkey";
            columns: ["subject_id"];
            isOneToOne: false;
            referencedRelation: "subjects";
            referencedColumns: ["id"];
          },
        ];
      };
      resources: {
        Row: {
          id: string;
          chapter_id: string;
          title: string;
          description: string | null;
          resource_type: "pdf" | "ppt" | "doc" | "image" | "link" | "video";
          category: string | null;
          is_paid: boolean;
          payhip_url: string | null;
          file_path: string | null;
          file_name: string | null;
          file_size: number | null;
          mime_type: string | null;
          external_url: string | null;
          order_index: number;
          is_published: boolean;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          chapter_id: string;
          title: string;
          description?: string | null;
          resource_type: "pdf" | "ppt" | "doc" | "image" | "link" | "video";
          category?: string | null;
          is_paid?: boolean;
          payhip_url?: string | null;
          file_path?: string | null;
          file_name?: string | null;
          file_size?: number | null;
          mime_type?: string | null;
          external_url?: string | null;
          order_index?: number;
          is_published?: boolean;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          chapter_id?: string;
          title?: string;
          description?: string | null;
          resource_type?: "pdf" | "ppt" | "doc" | "image" | "link" | "video";
          category?: string | null;
          is_paid?: boolean;
          payhip_url?: string | null;
          file_path?: string | null;
          file_name?: string | null;
          file_size?: number | null;
          mime_type?: string | null;
          external_url?: string | null;
          order_index?: number;
          is_published?: boolean;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "resources_chapter_id_fkey";
            columns: ["chapter_id"];
            isOneToOne: false;
            referencedRelation: "chapters";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "resources_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      chapter_views: {
        Row: {
          user_id: string;
          chapter_id: string;
          viewed_at: string;
        };
        Insert: {
          user_id: string;
          chapter_id: string;
          viewed_at?: string;
        };
        Update: {
          user_id?: string;
          chapter_id?: string;
          viewed_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chapter_views_chapter_id_fkey";
            columns: ["chapter_id"];
            isOneToOne: false;
            referencedRelation: "chapters";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "chapter_views_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      admin_top_viewed_chapters: {
        Args: { limit_count?: number };
        Returns: {
          chapter_id: string;
          title: string;
          course_title: string;
          subject_title: string;
          course_slug: string;
          subject_slug: string;
          chapter_slug: string;
          view_count: number;
          learner_count: number;
          last_viewed_at: string;
        }[];
      };
      admin_engagement_summary: {
        Args: Record<string, never>;
        Returns: {
          total_views: number;
          learners: number;
          views_7d: number;
        }[];
      };
      admin_resource_type_breakdown: {
        Args: Record<string, never>;
        Returns: {
          resource_type: string;
          count: number;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
