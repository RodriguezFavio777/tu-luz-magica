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

    public: {
        Tables: {
            bookings: {
                Row: {
                    created_at: string | null
                    end_time: string
                    id: string
                    notes: string | null
                    product_id: string
                    start_time: string
                    status: string
                    updated_at: string | null
                    user_id: string
                }
                Insert: {
                    created_at?: string | null
                    end_time: string
                    id?: string
                    notes?: string | null
                    product_id: string
                    start_time: string
                    status?: string
                    updated_at?: string | null
                    user_id: string
                }
                Update: {
                    created_at?: string | null
                    end_time?: string
                    id?: string
                    notes?: string | null
                    product_id?: string
                    start_time?: string
                    status?: string
                    updated_at?: string | null
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "bookings_product_id_fkey"
                        columns: ["product_id"]
                        isOneToOne: false
                        referencedRelation: "products"
                        referencedColumns: ["id"]
                    },
                ]
            }
            order_items: {
                Row: {
                    booking_id: string | null
                    created_at: string | null
                    id: string
                    order_id: string
                    product_id: string
                    product_name: string
                    product_type: string
                    quantity: number
                    subtotal: number
                    unit_price: number
                }
                Insert: {
                    booking_id?: string | null
                    created_at?: string | null
                    id?: string
                    order_id: string
                    product_id: string
                    product_name: string
                    product_type: string
                    quantity: number
                    subtotal: number
                    unit_price: number
                }
                Update: {
                    booking_id?: string | null
                    created_at?: string | null
                    id?: string
                    order_id?: string
                    product_id?: string
                    product_name?: string
                    product_type?: string
                    quantity?: number
                    subtotal?: number
                    unit_price?: number
                }
                Relationships: [
                    {
                        foreignKeyName: "order_items_booking_id_fkey"
                        columns: ["booking_id"]
                        isOneToOne: false
                        referencedRelation: "bookings"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "order_items_order_id_fkey"
                        columns: ["order_id"]
                        isOneToOne: false
                        referencedRelation: "orders"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "order_items_product_id_fkey"
                        columns: ["product_id"]
                        isOneToOne: false
                        referencedRelation: "products"
                        referencedColumns: ["id"]
                    },
                ]
            }
            orders: {
                Row: {
                    created_at: string | null
                    id: string
                    mercadopago_payment_id: string | null
                    mercadopago_preference_id: string | null
                    payment_status: string
                    requires_shipping: boolean | null
                    shipping_address: string | null
                    shipping_city: string | null
                    shipping_cost: number | null
                    shipping_country: string | null
                    shipping_postal_code: string | null
                    shipping_state: string | null
                    subtotal: number
                    total: number
                    updated_at: string | null
                    user_id: string
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    mercadopago_payment_id?: string | null
                    mercadopago_preference_id?: string | null
                    payment_status?: string
                    requires_shipping?: boolean | null
                    shipping_address?: string | null
                    shipping_city?: string | null
                    shipping_cost?: number | null
                    shipping_country?: string | null
                    shipping_postal_code?: string | null
                    shipping_state?: string | null
                    subtotal: number
                    total: number
                    updated_at?: string | null
                    user_id: string
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    mercadopago_payment_id?: string | null
                    mercadopago_preference_id?: string | null
                    payment_status?: string
                    requires_shipping?: boolean | null
                    shipping_address?: string | null
                    shipping_city?: string | null
                    shipping_cost?: number | null
                    shipping_country?: string | null
                    shipping_postal_code?: string | null
                    shipping_state?: string | null
                    subtotal?: number
                    total?: number
                    updated_at?: string | null
                    user_id?: string
                }
                Relationships: []
            }
            products: {
                Row: {
                    category_id: string | null
                    created_at: string | null
                    description: string | null
                    duration_minutes: number | null
                    id: string
                    image_url: string | null
                    is_active: boolean | null
                    name: string
                    price: number
                    shipping_weight: number | null
                    stock: number | null
                    type: string
                    updated_at: string | null
                    variants: Json | null
                    images: string[] | null
                }
                Insert: {
                    category_id?: string | null
                    created_at?: string | null
                    description?: string | null
                    duration_minutes?: number | null
                    id?: string
                    image_url?: string | null
                    is_active?: boolean | null
                    name: string
                    price: number
                    shipping_weight?: number | null
                    stock?: number | null
                    type: string
                    updated_at?: string | null
                    variants?: Json | null
                    images?: string[] | null
                }
                Update: {
                    category_id?: string | null
                    created_at?: string | null
                    description?: string | null
                    duration_minutes?: number | null
                    id?: string
                    image_url?: string | null
                    is_active?: boolean | null
                    name?: string
                    price?: number
                    shipping_weight?: number | null
                    stock?: number | null
                    type?: string
                    updated_at?: string | null
                    variants?: Json | null
                    images?: string[] | null
                }
                Relationships: [
                    {
                        foreignKeyName: "products_category_id_fkey"
                        columns: ["category_id"]
                        isOneToOne: false
                        referencedRelation: "service_categories"
                        referencedColumns: ["id"]
                    },
                ]
            }
            profiles: {
                Row: {
                    birth_date: string | null
                    birth_place: string | null
                    birth_time: string | null
                    created_at: string | null
                    full_name: string | null
                    id: string
                    phone: string | null
                    shipping_address: string | null
                    shipping_city: string | null
                    shipping_country: string | null
                    shipping_postal_code: string | null
                    shipping_state: string | null
                    updated_at: string | null
                }
                Insert: {
                    birth_date?: string | null
                    birth_place?: string | null
                    birth_time?: string | null
                    created_at?: string | null
                    full_name?: string | null
                    id: string
                    phone?: string | null
                    shipping_address?: string | null
                    shipping_city?: string | null
                    shipping_country?: string | null
                    shipping_postal_code?: string | null
                    shipping_state?: string | null
                    updated_at?: string | null
                }
                Update: {
                    birth_date?: string | null
                    birth_place?: string | null
                    birth_time?: string | null
                    created_at?: string | null
                    full_name?: string | null
                    id?: string
                    phone?: string | null
                    shipping_address?: string | null
                    shipping_city?: string | null
                    shipping_country?: string | null
                    shipping_postal_code?: string | null
                    shipping_state?: string | null
                    updated_at?: string | null
                }
                Relationships: []
            }
            service_categories: {
                Row: {
                    color: string | null
                    created_at: string | null
                    description: string | null
                    display_order: number | null
                    icon: string | null
                    id: string
                    is_active: boolean | null
                    name: string
                    slug: string
                    updated_at: string | null
                }
                Insert: {
                    color?: string | null
                    created_at?: string | null
                    description?: string | null
                    display_order?: number | null
                    icon?: string | null
                    id?: string
                    is_active?: boolean | null
                    name: string
                    slug: string
                    updated_at?: string | null
                }
                Update: {
                    color?: string | null
                    created_at?: string | null
                    description?: string | null
                    display_order?: number | null
                    icon?: string | null
                    id?: string
                    is_active?: boolean | null
                    name?: string
                    slug?: string
                    updated_at?: string | null
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
    DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
    EnumName extends DefaultSchemaEnumNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
}
    ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

// Helper types for service categories
export type ServiceCategory = Tables<'service_categories'>
export type Product = Tables<'products'>
export type Booking = Tables<'bookings'>
export type Order = Tables<'orders'>
export type OrderItem = Tables<'order_items'>
export type Profile = Tables<'profiles'>


