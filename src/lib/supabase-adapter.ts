import { createClient } from "@supabase/supabase-js"
import type {
  Adapter,
  AdapterUser,
  AdapterAccount,
  AdapterSession,
  VerificationToken
} from "next-auth/adapters"

interface CustomAdapterUser extends Omit<AdapterUser, 'email' | 'emailVerified' | 'image'> {
  has_onboarded: boolean
  twitter_id?: string | null
  twitter_username?: string | null
  twitter_image?: string | null
  bluesky_id?: string | null
  bluesky_username?: string | null
  bluesky_image?: string | null
  mastodon_id?: string | null
  mastodon_username?: string | null
  mastodon_image?: string | null
  mastodon_instance?: string | null
}

// Créer deux clients Supabase distincts
const authClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: "next-auth"
    }
  }
)

const publicClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

const createUser = async (user) => {
  console.log("\n=== [Adapter] Starting user creation ===")
  console.log("→ Input user data:", JSON.stringify(user, null, 2))
  try {
    console.log("→ Attempting to insert user into next-auth.users...")
    // Créer l'utilisateur avec les infos disponibles (Twitter, BlueSky ou Mastodon)
    const { data: authUser, error: authError } = await authClient
      .from("users")
      .insert([
        {
          name: user.name,
          email: user.email,
          email_verified: user.email_verified,
          // Twitter data
          twitter_id: user.twitter_id || null,
          twitter_username: user.twitter_username || null,
          twitter_image: user.twitter_image || null,
          // BlueSky data
          bluesky_id: user.bluesky_id || null,
          bluesky_username: user.bluesky_username || null,
          bluesky_image: user.bluesky_image || null,
          // Mastodon data
          mastodon_id: user.mastodon_id || null,
          mastodon_username: user.mastodon_username || null,
          mastodon_image: user.mastodon_image || null,
          mastodon_instance: user.mastodon_instance || null,
          has_onboarded: user.has_onboarded || false
        }
      ])
      .select()
      .single()

    if (authError) {
      console.error("❌ [Adapter] Error creating user in next-auth:")
      console.error("  Error code:", authError.code)
      console.error("  Error message:", authError.message)
      console.error("  Error details:", authError.details)
      throw authError
    }

    console.log("✅ [Adapter] User successfully created in next-auth:")
    console.log("  User ID:", authUser.id)
    console.log("  Full user data:", JSON.stringify(authUser, null, 2))

    return {
      id: authUser.id,
      name: authUser.name,
      email: authUser.email,
      email_verified: authUser.email_verified,
      twitter_id: authUser.twitter_id,
      twitter_username: authUser.twitter_username,
      twitter_image: authUser.twitter_image,
      bluesky_id: authUser.bluesky_id,
      bluesky_username: authUser.bluesky_username,
      bluesky_image: authUser.bluesky_image,
      mastodon_id: authUser.mastodon_id,
      mastodon_username: authUser.mastodon_username,
      mastodon_image: authUser.mastodon_image,
      mastodon_instance: authUser.mastodon_instance,
      has_onboarded: authUser.has_onboarded
    }
  } catch (error) {
    console.error("❌ [Adapter] Unexpected error during user creation:", error)
    throw error
  }
}

const getUser = async (id: string): Promise<CustomAdapterUser | null> => {
  const { data: user, error: userError } = await authClient
    .from("users")
    .select("*")
    .eq("id", id)
    .single()

  if (userError) return null
  if (!user) return null

  return {
    id: user.id,
    name: user.name,
    twitter_id: user.twitter_id,
    twitter_username: user.twitter_username,
    twitter_image: user.twitter_image,
    bluesky_id: user.bluesky_id,
    bluesky_username: user.bluesky_username,
    bluesky_image: user.bluesky_image,
    mastodon_id: user.mastodon_id,
    mastodon_username: user.mastodon_username,
    mastodon_image: user.mastodon_image,
    mastodon_instance: user.mastodon_instance,
    has_onboarded: user.has_onboarded
  }
}

const getUserByEmail = async (email) => {
  try {
    console.log("\n=== [Adapter] getUserByEmail ===")
    console.log("→ Looking for user with email:", email)

    const { data, error } = await authClient
      .from("users")
      .select()
      .eq("email", email)
      .single()

    if (error) {
      console.log("❌ User not found:", error.message)
      return null
    }

    console.log("✅ User found:", data)
    return data as CustomAdapterUser
  } catch (error) {
    console.error(" [Adapter] Error getting user by email:", error)
    return null
  }
}

const getUserByAccount = async ({ providerAccountId, provider }): Promise<CustomAdapterUser | null> => {
  try {
    console.log("\n=== [Adapter] getUserByAccount ===")
    console.log("→ Looking for account with:", { provider, providerAccountId })

    const { data: account, error: accountError } = await authClient
      .from("accounts")
      .select("user_id")
      .eq("provider", provider)
      .eq("provider_account_id", providerAccountId)
      .single()

    if (accountError) {
      console.log("❌ Account not found:", accountError.message)
      return null
    }
    if (!account) {
      console.log("❌ No account found")
      return null
    }

    console.log("✅ Account found:", account)

    const { data: user, error: userError } = await authClient
      .from("users")
      .select("*")
      .eq("id", account.user_id)
      .single()

    if (userError) {
      console.log("❌ User not found:", userError.message)
      return null
    }
    if (!user) {
      console.log("❌ No user found")
      return null
    }

    console.log("✅ User found:", user)
    return {
      id: user.id,
      name: user.name,
      twitter_id: user.twitter_id,
      twitter_username: user.twitter_username,
      twitter_image: user.twitter_image,
      bluesky_id: user.bluesky_id,
      bluesky_username: user.bluesky_username,
      bluesky_image: user.bluesky_image,
      mastodon_id: user.mastodon_id,
      mastodon_username: user.mastodon_username,
      mastodon_image: user.mastodon_image,
      mastodon_instance: user.mastodon_instance,
      has_onboarded: user.has_onboarded
    }
  } catch (error) {
    console.error("❌ [Adapter] Error getting user by account:", error)
    return null
  }
}

const updateUser = async (user: Partial<CustomAdapterUser>): Promise<CustomAdapterUser> => {
  console.log("\n=== [Adapter] updateUser ===")
  console.log("→ Updating user with ID:", user.id)

  const { data: updatedUser, error: userError } = await authClient
    .from("users")
    .update({
      name: user.name,
      twitter_id: user.twitter_id,
      twitter_username: user.twitter_username,
      twitter_image: user.twitter_image,
      bluesky_id: user.bluesky_id,
      bluesky_username: user.bluesky_username,
      bluesky_image: user.bluesky_image,
      mastodon_id: user.mastodon_id,
      mastodon_username: user.mastodon_username,
      mastodon_image: user.mastodon_image,
      mastodon_instance: user.mastodon_instance,
      has_onboarded: user.has_onboarded
    })
    .eq("id", user.id)
    .select()
    .single()

  if (userError) {
    console.log("❌ Error updating user:", userError.message)
    throw userError
  }

  console.log("✅ User updated:", updatedUser)
  return {
    id: updatedUser.id,
    name: updatedUser.name,
    twitter_id: updatedUser.twitter_id,
    twitter_username: updatedUser.twitter_username,
    twitter_image: updatedUser.twitter_image,
    bluesky_id: updatedUser.bluesky_id,
    bluesky_username: updatedUser.bluesky_username,
    bluesky_image: updatedUser.bluesky_image,
    mastodon_id: updatedUser.mastodon_id,
    mastodon_username: updatedUser.mastodon_username,
    mastodon_image: updatedUser.mastodon_image,
    mastodon_instance: updatedUser.mastodon_instance,
    has_onboarded: updatedUser.has_onboarded
  }
}

const linkAccount = async (account: any) => {
  try {
    console.log("\n=== [Adapter] linkAccount ===")
    console.log("→ Linking account:", account)

    // Créer le compte dans next-auth.accounts
    const { error: accountError } = await authClient
      .from("accounts")
      .insert([
        {
          user_id: account.userId,
          type: account.type,
          provider: account.provider,
          provider_account_id: account.providerAccountId,
          refresh_token: account.refresh_token,
          access_token: account.access_token,
          expires_at: account.expires_at,
          token_type: account.token_type,
          scope: account.scope,
          id_token: account.id_token,
          session_state: account.session_state,
        }
      ])

    if (accountError) {
      console.log("❌ Error linking account:", accountError)
      throw accountError
    }

    console.log("✅ Account linked successfully")
    return account
  } catch (error) {
    console.error("❌ [Adapter] Error linking account:", error)
    throw error
  }
}

const createSession = async (session) => {
  try {
    console.log("\n=== [Adapter] createSession ===")
    console.log("→ Creating session:", session)

    const { data, error } = await authClient
      .from("sessions")
      .insert([session])
      .select()
      .single()

    if (error) {
      console.log("❌ Error creating session:", error)
      throw error
    }

    console.log("✅ Session created:", data)
    return data
  } catch (error) {
    console.error("❌ [Adapter] Error creating session:", error)
    throw error
  }
}

const getSessionAndUser = async (sessionToken: string): Promise<{ session: AdapterSession; user: CustomAdapterUser } | null> => {
  console.log("\n=== [Adapter] getSessionAndUser ===")
  console.log("→ Looking for session with token:", sessionToken)

  const { data: session, error: sessionError } = await authClient
    .from("sessions")
    .select("*, user:user_id(*)")
    .eq("session_token", sessionToken)
    .single()

  if (sessionError) {
    console.log("❌ Session not found:", sessionError.message)
    return null
  }
  if (!session) {
    console.log("❌ No session found")
    return null
  }

  console.log("✅ Session found:", session)

  const user = session.user as any

  console.log("✅ User found:", user)
  return {
    session: {
      sessionToken: session.session_token,
      userId: session.user_id,
      expires: session.expires
    },
    user: {
      id: user.id,
      name: user.name,
      twitter_id: user.twitter_id,
      twitter_username: user.twitter_username,
      twitter_image: user.twitter_image,
      bluesky_id: user.bluesky_id,
      bluesky_username: user.bluesky_username,
      bluesky_image: user.bluesky_image,
      mastodon_id: user.mastodon_id,
      mastodon_username: user.mastodon_username,
      mastodon_image: user.mastodon_image,
      mastodon_instance: user.mastodon_instance,
      has_onboarded: user.has_onboarded
    }
  }
}

const updateSession = async (session) => {
  console.log("\n=== [Adapter] updateSession ===")
  console.log("→ Updating session with token:", session.session_token)

  try {
    const { data, error } = await authClient
      .from("sessions")
      .update(session)
      .eq("session_token", session.session_token)
      .select()
      .single()

    if (error) {
      console.log("❌ Error updating session:", error)
      throw error
    }

    console.log("✅ Session updated:", data)
    return data
  } catch (error) {
    console.error("❌ [Adapter] Error updating session:", error)
    throw error
  }
}

const deleteSession = async (sessionToken) => {
  console.log("\n=== [Adapter] deleteSession ===")
  console.log("→ Deleting session with token:", sessionToken)

  try {
    await authClient
      .from("sessions")
      .delete()
      .eq("session_token", sessionToken)
  } catch (error) {
    console.error("❌ [Adapter] Error deleting session:", error)
    throw error
  }
}

const getAccountsByUserId = async (userId: string) => {
  console.log("\n=== [Adapter] getAccountsByUserId ===")
  console.log("→ Looking for accounts with user ID:", userId)

  try {
    const { data: accounts, error } = await authClient
      .from("accounts")
      .select("*")
      .eq("user_id", userId)

    if (error) {
      console.log("❌ Error getting accounts:", error.message)
      throw error
    }

    console.log("✅ Accounts found:", accounts)
    return accounts
  } catch (error) {
    console.error("❌ [Adapter] Error getting accounts by user ID:", error)
    return []
  }
}

export const supabaseAdapter = {
  createUser,
  getUser,
  getUserByEmail,
  getUserByAccount,
  updateUser,
  linkAccount,
  createSession,
  getSessionAndUser,
  updateSession,
  deleteSession,
  getAccountsByUserId
}