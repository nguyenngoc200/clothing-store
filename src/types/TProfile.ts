import { EInternalRole } from './ERole';

export type TProfile = {
  id: string; // uuid, PK, FK to auth.users.id
  email: string; // user's email address
  full_name: string; // user's display name
  avatar_url: string; // URL for the user's avatar
  has_onboarded: boolean; // whether the user has onboarded
  job_title: string; // user's self-reported job role
  primary_use_case: string; // user's intended goal
  internal_staff_role?: EInternalRole; // enum: super_admin, customer_support. NULL for regular customers
};
