export interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}
