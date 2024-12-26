'use client'

import { motion } from 'framer-motion';
import { Ship, Users, Globe } from 'lucide-react';
import PartageButton from './PartageButton';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { plex } from '../fonts/plex';

interface UploadStats {
  totalUsers: number;
  following: number;
  followers: number;
}

interface UploadResultsProps {
  showRedirectMessage?: boolean;
  onShare: (url: string, platform: string) => void;
  stats: {
    totalUsers: number;
    following: number;
    followers: number;
  };
  hasTwitter?: boolean;
  hasBluesky?: boolean;
  hasMastodon?: boolean;
  hasOnboarded?: boolean;
  userId?: string;
  twitterId?: string;
  twitter_username?: string;
  mastodon_username?: string;
  bluesky_username?: string;
  isLoading?: boolean;
  setIsLoading?: (loading: boolean) => void;
  setIsModalOpen: (open: boolean) => void;
}

export default function UploadResults({ 
  showRedirectMessage = false,
  onShare,
  stats,
  hasTwitter = false,
  hasBluesky = false,
  hasMastodon = false,
  hasOnboarded = false,
  userId,
  twitterId,
  twitter_username,
  mastodon_username,
  bluesky_username,
  isLoading,
  setIsLoading,
  setIsModalOpen
}: UploadResultsProps) {
  const [totalUsers, setTotalUsers] = useState<number>(stats.totalUsers);

  // Calculate completion status
  const totalSteps = 4; 
  const completedSteps = [hasTwitter, hasBluesky, hasMastodon, hasOnboarded].filter(Boolean).length;
  const isThreeQuartersComplete = completedSteps >= (totalSteps * 0.75);

  useEffect(() => {
    if (setIsLoading) {
      setIsLoading(false);
    }
  }, [setIsLoading]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full max-w-2xl mx-auto mb-8 ${plex.className}`}
    >
      <div className="bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10 
                    backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl p-6 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="bg-pink-500/20 p-3 rounded-full">
              <Ship className="w-6 h-6 text-pink-400" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-rose-500 
                       bg-clip-text text-transparent">
              Félicitations @{twitter_username || mastodon_username || bluesky_username || ''}, vous êtes inscrit.e pour le voyage !
            </h2>
          </div>
{/* 
          <div className={`flex items-center justify-center transition-opacity duration-300 ${isThreeQuartersComplete ? 'opacity-100' : 'opacity-70'}`}>
            <PartageButton onShare={onShare} />
          </div> */}
        </div>

        <p className="text-white/80 text-center">
          L'importation de vos fichiers a permis d'inscrire {stats.following + stats.followers} nouveaux passagers !
        </p>

        <div className="flex justify-center gap-4">
          <div className="bg-black/20 rounded-xl p-4 flex items-center gap-4">
            <div className="bg-pink-500/20 p-2 rounded-full">
              <Users className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <p className="text-sm text-white/60">Comptes Twitters</p>
              <p className="text-2xl font-bold text-white">{stats.following + stats.followers}</p>
            </div>
          </div>

          <div className="bg-black/20 rounded-xl p-4 flex items-center gap-4">
            <div className="bg-pink-500/20 p-2 rounded-full">
              <Globe className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <p className="text-sm text-white/60">Voyageurs prêts</p>
              <p className="text-2xl font-bold text-white">20314</p>
            </div>
          </div>
        </div>

        <p className="text-white/80 text-center">
            Invitez vos abonné.e.s à partir avec vous !
        </p>
        <div className={`flex items-center justify-center transition-opacity duration-300 ${isThreeQuartersComplete ? 'opacity-100' : 'opacity-70'}`}>
          <PartageButton onClick={() => setIsModalOpen(true)} />
        </div>

        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-black/20 rounded-xl p-4 flex items-center gap-4">
            <div className="bg-emerald-500/20 p-2 rounded-full">
              <Globe className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-white/60">Migrations</p>
              <p className="text-2xl font-bold text-white">{totalUsers}</p>
            </div>
          </div>
        </div> */}

        {/* {showRedirectMessage && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-white/60 text-center mt-4"
          >
            Redirection vers le tableau de bord...
          </motion.p>
        )} */}
      </div>
    </motion.div>
  );
}