'use client';

import { getUserClient } from '@/lib/supabase/getUserClient';
import React from 'react';

export default function CustomerPage() {
  const data = getUserClient();
  console.log('data', data);
  return <div>Customer Page</div>;
}
