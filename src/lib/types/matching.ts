export interface MatchingTarget {
  target_twitter_id: string;
  bluesky_handle: string | null;
  mastodon_handle: string | null;
  mastodon_username: string | null;
  mastodon_instance: string | null;
  mastodon_id: string | null;
  has_follow_bluesky: boolean;
  has_follow_mastodon: boolean;
  total_count?: number;
}

export interface MatchingStats {
  total_following: number;
  matched_following: number;
  bluesky_matches: number;
  mastodon_matches: number;
}

export interface MatchingResult {
  following: MatchingTarget[];
  stats: MatchingStats;
}