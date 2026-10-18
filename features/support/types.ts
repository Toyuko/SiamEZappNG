/** Canonical support service keys for Chatwoot routing attributes. */
export type SupportServiceKey = 'license' | 'vehicle_registration' | 'marriage' | 'general';

/** Where the customer opened Chat with SiamEZ. */
export type SupportSource =
  | 'home'
  | 'support'
  | 'contact'
  | 'booking'
  | 'job'
  | 'service'
  | 'profile';

export type SupportChatContext = {
  service?: SupportServiceKey;
  bookingId?: string;
  jobId?: string;
  source: SupportSource;
  /** Optional human label already known to the app (e.g. case title). Agents only. */
  caseTitle?: string;
};

export type ChatwootUserProps = {
  identifier: string;
  name?: string;
  email?: string;
  /** Chatwoot website SDK field name. */
  phone_number?: string;
  avatar_url?: string;
  identifier_hash?: string;
};

export type ChatwootCustomAttributes = {
  siamez_customer_id?: string;
  siamez_role?: string;
  customer_type?: string;
  preferred_language?: string;
  current_service?: SupportServiceKey;
  active_booking_id?: string;
  active_job_id?: string;
  source_app?: string;
  entry_point?: SupportSource;
  case_title?: string;
};

export type OpenSupportChatOptions = SupportChatContext;
