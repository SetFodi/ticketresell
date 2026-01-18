import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase credentials missing. Using mock client for preview.')

    // safe mock for browsing the UI - includes all query methods
    const queryBuilder: any = {
      select: () => queryBuilder,
      insert: () => queryBuilder,
      update: () => queryBuilder,
      delete: () => queryBuilder,
      eq: () => queryBuilder,
      neq: () => queryBuilder,
      gt: () => queryBuilder,
      gte: () => queryBuilder,
      lt: () => queryBuilder,
      lte: () => queryBuilder,
      like: () => queryBuilder,
      ilike: () => queryBuilder,
      is: () => queryBuilder,
      in: () => queryBuilder,
      contains: () => queryBuilder,
      containedBy: () => queryBuilder,
      order: () => queryBuilder,
      limit: () => queryBuilder,
      range: () => queryBuilder,
      single: async () => ({ data: null, error: null }),
      maybeSingle: async () => ({ data: null, error: null }),
      then: (resolve: any) => resolve({ data: [], error: null }),
    }

    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
        signInWithOtp: async () => ({ error: { message: 'Preview mode: Auth disabled' } }),
        verifyOtp: async () => ({ error: { message: 'Preview mode: Auth disabled' } }),
        signOut: async () => ({ error: null }),
      },
      storage: {
        from: () => ({
          upload: async () => ({ error: { message: 'Preview mode: Storage disabled' } }),
          getPublicUrl: () => ({ data: { publicUrl: 'https://placehold.co/600x400' } }),
        }),
      },
      from: () => queryBuilder,
    } as any
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}
