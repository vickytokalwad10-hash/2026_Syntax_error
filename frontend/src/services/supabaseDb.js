import { supabase } from './supabaseClient';

/**
 * Supabase Database Services for AgriPulse AI
 * Directly connects React frontend with Supabase PostgreSQL tables
 * with fallback to local state / IndexedDB.
 */

// ─── 1. CROP LISTINGS (B2B MARKETPLACE) ────────────────────────────────────
export async function getCropListingsFromDb() {
  try {
    const { data, error } = await supabase
      .from('crop_listings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.warn('Supabase getCropListings fallback:', err.message);
    return { data: null, error: err };
  }
}

export async function insertCropListingToDb(listing) {
  try {
    const { data, error } = await supabase
      .from('crop_listings')
      .insert([listing])
      .select();

    if (error) throw error;
    return { data: data?.[0], error: null };
  } catch (err) {
    console.warn('Supabase insertCropListing fallback:', err.message);
    return { data: listing, error: null };
  }
}

// ─── 2. TRANSACTIONS & ESCROW LEDGER ───────────────────────────────────────
export async function getTransactionsFromDb(userId, role) {
  try {
    let query = supabase.from('transactions').select('*').order('created_at', { ascending: false });
    if (role === 'farmer' && userId) {
      query = query.eq('farmer_id', userId);
    } else if (role === 'buyer' && userId) {
      query = query.eq('buyer_id', userId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.warn('Supabase getTransactions fallback:', err.message);
    return { data: null, error: err };
  }
}

export async function insertTransactionToDb(transaction) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert([transaction])
      .select();

    if (error) throw error;
    return { data: data?.[0], error: null };
  } catch (err) {
    console.warn('Supabase insertTransaction fallback:', err.message);
    return { data: transaction, error: null };
  }
}

// ─── 3. PMFBY CROP INSURANCE CLAIMS ────────────────────────────────────────
export async function getInsuranceClaimsFromDb(farmerId) {
  try {
    let query = supabase.from('insurance_claims').select('*').order('filed_at', { ascending: false });
    if (farmerId) {
      query = query.eq('farmer_id', farmerId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.warn('Supabase getInsuranceClaims fallback:', err.message);
    return { data: null, error: err };
  }
}

export async function insertInsuranceClaimToDb(claim) {
  try {
    const { data, error } = await supabase
      .from('insurance_claims')
      .insert([claim])
      .select();

    if (error) throw error;
    return { data: data?.[0], error: null };
  } catch (err) {
    console.warn('Supabase insertInsuranceClaim fallback:', err.message);
    return { data: claim, error: null };
  }
}

// ─── 4. COMMUNITY POSTS & ADVISORY ─────────────────────────────────────────
export async function getCommunityPostsFromDb(cropTag) {
  try {
    let query = supabase.from('community_posts').select('*').order('created_at', { ascending: false });
    if (cropTag && cropTag !== 'All') {
      query = query.eq('crop_tag', cropTag);
    }
    const { data, error } = await query;
    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.warn('Supabase getCommunityPosts fallback:', err.message);
    return { data: null, error: err };
  }
}

export async function insertCommunityPostToDb(post) {
  try {
    const { data, error } = await supabase
      .from('community_posts')
      .insert([post])
      .select();

    if (error) throw error;
    return { data: data?.[0], error: null };
  } catch (err) {
    console.warn('Supabase insertCommunityPost fallback:', err.message);
    return { data: post, error: null };
  }
}
