import { getSupabaseAdminClient } from './supabaseClient';

/**
 * Syncs a Clerk user to the Supabase users table.
 * Creates a new user if they don't exist, or updates existing user data.
 * 
 * @param {Object} clerkUser - The Clerk user object
 * @param {string} clerkUser.id - Clerk user ID
 * @param {string} clerkUser.emailAddresses - Array of email addresses
 * @param {string} clerkUser.firstName - User's first name
 * @param {string} clerkUser.lastName - User's last name
 * @param {string} clerkUser.imageUrl - User's avatar URL
 * @returns {Promise<Object>} The upserted user data
 */
export async function syncClerkUserToSupabase(clerkUser) {
  const supabase = getSupabaseAdminClient();
  
  const email = clerkUser.emailAddresses?.[0]?.emailAddress || 
                clerkUser.primaryEmailAddress?.emailAddress ||
                clerkUser.email_addresses?.[0]?.email_address;
  
  const firstName = clerkUser.firstName || clerkUser.first_name || '';
  const lastName = clerkUser.lastName || clerkUser.last_name || '';
  const name = `${firstName} ${lastName}`.trim() || null;
  const avatarUrl = clerkUser.imageUrl || clerkUser.image_url || clerkUser.profile_image_url || null;
  
  if (!email) {
    throw new Error('User email is required for sync');
  }
  
  // Upsert user - insert if not exists, update if exists
  const { data, error } = await supabase
    .from('users')
    .upsert(
      {
        clerk_user_id: clerkUser.id,
        email: email,
        name: name,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'clerk_user_id',
        ignoreDuplicates: false,
      }
    )
    .select()
    .single();
  
  if (error) {
    console.error('Error syncing user to Supabase:', error);
    throw error;
  }
  
  return data;
}

/**
 * Gets a user from Supabase by their Clerk user ID.
 * Creates the user if they don't exist.
 * 
 * @param {Object} clerkUser - The Clerk user object
 * @returns {Promise<Object>} The user data from Supabase
 */
export async function getOrCreateUser(clerkUser) {
  const supabase = getSupabaseAdminClient();
  
  // First try to get existing user
  const { data: existingUser, error: selectError } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_user_id', clerkUser.id)
    .single();
  
  if (existingUser) {
    return existingUser;
  }
  
  // If not found, create new user
  if (selectError && selectError.code === 'PGRST116') {
    return await syncClerkUserToSupabase(clerkUser);
  }
  
  if (selectError) {
    throw selectError;
  }
  
  return existingUser;
}

/**
 * Gets a user from Supabase by their Clerk user ID.
 * Returns null if user doesn't exist.
 * 
 * @param {string} clerkUserId - The Clerk user ID
 * @returns {Promise<Object|null>} The user data or null
 */
export async function getUserByClerkId(clerkUserId) {
  const supabase = getSupabaseAdminClient();
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user:', error);
    throw error;
  }
  
  return data || null;
}

/**
 * Deletes a user from Supabase by their Clerk user ID.
 * This will cascade delete all related resumes and analysis logs.
 * 
 * @param {string} clerkUserId - The Clerk user ID
 * @returns {Promise<void>}
 */
export async function deleteUserByClerkId(clerkUserId) {
  const supabase = getSupabaseAdminClient();
  
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('clerk_user_id', clerkUserId);
  
  if (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

/**
 * Updates a user's subscription information.
 * 
 * @param {string} clerkUserId - The Clerk user ID
 * @param {Object} subscriptionData - Subscription data to update
 * @returns {Promise<Object>} The updated user data
 */
export async function updateUserSubscription(clerkUserId, subscriptionData) {
  // NOTE: This function is DEPRECATED and should not be used.
  // Subscription data is now stored in user_subscriptions table.
  // Use subscription-service.js functions instead:
  // - getOrCreateSubscription()
  // - getSubscriptionStatus()
  console.warn('updateUserSubscription() is deprecated. Use subscription-service.js instead.');
  
  // For backward compatibility, return basic user data
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .single();
  
  if (error) {
    console.error('Error getting user:', error);
    throw error;
  }
  
  return data;
}
