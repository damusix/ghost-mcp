export interface GhostPaginationMeta {
  pagination: {
    page: number;
    limit: number;
    pages: number;
    total: number;
    next: number | null;
    prev: number | null;
  };
}

export interface GhostPost {
  id: string;
  uuid: string;
  title: string;
  slug: string;
  lexical: string | null;
  html: string | null;
  comment_id: string;
  feature_image: string | null;
  feature_image_alt: string | null;
  feature_image_caption: string | null;
  featured: boolean;
  status: "published" | "draft" | "scheduled";
  visibility: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  custom_excerpt: string | null;
  codeinjection_head: string | null;
  codeinjection_foot: string | null;
  custom_template: string | null;
  canonical_url: string | null;
  tags: GhostTag[];
  authors: GhostAuthor[];
  primary_author: GhostAuthor | null;
  primary_tag: GhostTag | null;
  url: string;
  excerpt: string;
  og_image: string | null;
  og_title: string | null;
  og_description: string | null;
  twitter_image: string | null;
  twitter_title: string | null;
  twitter_description: string | null;
  meta_title: string | null;
  meta_description: string | null;
  email_subject: string | null;
  email_only: boolean;
}

export interface GhostPage {
  id: string;
  uuid: string;
  title: string;
  slug: string;
  lexical: string | null;
  html: string | null;
  feature_image: string | null;
  feature_image_alt: string | null;
  feature_image_caption: string | null;
  featured: boolean;
  status: "published" | "draft" | "scheduled";
  visibility: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  custom_excerpt: string | null;
  codeinjection_head: string | null;
  codeinjection_foot: string | null;
  custom_template: string | null;
  canonical_url: string | null;
  tags: GhostTag[];
  authors: GhostAuthor[];
  url: string;
  excerpt: string;
  og_image: string | null;
  og_title: string | null;
  og_description: string | null;
  twitter_image: string | null;
  twitter_title: string | null;
  twitter_description: string | null;
  meta_title: string | null;
  meta_description: string | null;
}

export interface GhostTag {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  feature_image: string | null;
  visibility: string;
  og_image: string | null;
  og_title: string | null;
  og_description: string | null;
  twitter_image: string | null;
  twitter_title: string | null;
  twitter_description: string | null;
  meta_title: string | null;
  meta_description: string | null;
  codeinjection_head: string | null;
  codeinjection_foot: string | null;
  canonical_url: string | null;
  accent_color: string | null;
  url: string;
}

export interface GhostAuthor {
  id: string;
  name: string;
  slug: string;
  profile_image: string | null;
  cover_image: string | null;
  bio: string | null;
  website: string | null;
  location: string | null;
  facebook: string | null;
  twitter: string | null;
  meta_title: string | null;
  meta_description: string | null;
  url: string;
}

export interface GhostMember {
  id: string;
  uuid: string;
  email: string;
  name: string | null;
  note: string | null;
  geolocation: string | null;
  status: "free" | "paid" | "comped";
  labels: Array<{ id: string; name: string; slug: string }>;
  subscriptions: unknown[];
  newsletters: Array<{ id: string; name: string }>;
  avatar_image: string;
  email_count: number;
  email_opened_count: number;
  email_open_rate: number | null;
  created_at: string;
  updated_at: string;
  last_seen_at: string | null;
}

export interface GhostNewsletter {
  id: string;
  uuid: string;
  name: string;
  description: string | null;
  slug: string;
  sender_name: string | null;
  sender_email: string | null;
  sender_reply_to: string;
  status: "active" | "archived";
  visibility: string;
  subscribe_on_signup: boolean;
  sort_order: number;
  header_image: string | null;
  show_header_icon: boolean;
  show_header_title: boolean;
  show_header_name: boolean;
  title_font_category: string;
  title_alignment: string;
  show_feature_image: boolean;
  body_font_category: string;
  footer_content: string | null;
  show_badge: boolean;
  created_at: string;
  updated_at: string;
}

export interface GhostOffer {
  id: string;
  name: string;
  code: string;
  display_title: string;
  display_description: string;
  type: "percent" | "fixed";
  cadence: "month" | "year";
  amount: number;
  duration: "once" | "forever" | "repeating";
  duration_in_months: number | null;
  currency_restriction: boolean;
  currency: string | null;
  status: string;
  redemption_count: number;
  tier: { id: string; name: string };
}

export interface GhostTier {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  active: boolean;
  type: "free" | "paid";
  welcome_page_url: string | null;
  visibility: string;
  monthly_price: number | null;
  yearly_price: number | null;
  currency: string | null;
  benefits: string[];
  created_at: string;
  updated_at: string;
}

export interface GhostUser {
  id: string;
  name: string;
  slug: string;
  email: string;
  profile_image: string | null;
  cover_image: string | null;
  bio: string | null;
  website: string | null;
  location: string | null;
  facebook: string | null;
  twitter: string | null;
  accessibility: string | null;
  status: string;
  meta_title: string | null;
  meta_description: string | null;
  tour: string | null;
  last_seen: string | null;
  created_at: string;
  updated_at: string;
  roles: Array<{ id: string; name: string; description: string }>;
  url: string;
}

export interface GhostWebhook {
  id: string;
  event: string;
  target_url: string;
  name: string | null;
  secret: string | null;
  api_version: string;
  integration_id: string;
  status: string;
  last_triggered_at: string | null;
  last_triggered_status: string | null;
  last_triggered_error: string | null;
  created_at: string;
  updated_at: string;
}

export interface GhostTheme {
  name: string;
  package: Record<string, unknown>;
  active: boolean;
}

export interface GhostImage {
  url: string;
  ref: string | null;
}
