'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { User } from '@/types'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  supabaseUser: SupabaseUser | null
  loading: boolean
  signInWithOtp: (phone: string) => Promise<{ error: string | null }>
  verifyOtp: (phone: string, token: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchUserProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
    return data as User
  }, [supabase])

  const refreshUser = async () => {
    if (supabaseUser) {
      const profile = await fetchUserProfile(supabaseUser.id)
      setUser(profile)
    }
  }

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        setSupabaseUser(session.user)
        const profile = await fetchUserProfile(session.user.id)
        setUser(profile)
      }
      setLoading(false)
    }

    getInitialSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setSupabaseUser(session.user)
          const profile = await fetchUserProfile(session.user.id)
          setUser(profile)
        } else {
          setSupabaseUser(null)
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth, fetchUserProfile])

  const signInWithOtp = async (phone: string): Promise<{ error: string | null }> => {
    const formattedPhone = phone.replace(/\s/g, '')

    const { error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone,
    })

    if (error) {
      return { error: error.message }
    }
    return { error: null }
  }

  const verifyOtp = async (phone: string, token: string): Promise<{ error: string | null }> => {
    const formattedPhone = phone.replace(/\s/g, '')

    const { data, error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token,
      type: 'sms',
    })

    if (error) {
      return { error: error.message }
    }

    // Create user profile if it doesn't exist
    if (data.user) {
      const existingProfile = await fetchUserProfile(data.user.id)

      if (!existingProfile) {
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            phone: formattedPhone,
            reputation_score: 50,
            is_verified_seller: false,
          })

        if (insertError) {
          console.error('Error creating user profile:', insertError)
        }

        // Fetch the newly created profile
        const newProfile = await fetchUserProfile(data.user.id)
        setUser(newProfile)
      }
    }

    return { error: null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSupabaseUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      supabaseUser,
      loading,
      signInWithOtp,
      verifyOtp,
      signOut,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
