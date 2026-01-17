import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase credentials missing. Using mock client for preview.')

    // safe mock for browsing the UI
    const queryBuilder: any = {
      select: () => queryBuilder,
      insert: () => queryBuilder,
      update: () => queryBuilder,
      eq: () => queryBuilder,
      single: async () => ({ data: null, error: null }),
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
