import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  ExternalLink, 
  ShieldCheck, 
  HeartPulse, 
  Wallet,
  CheckCircle2,
  AlertCircle,
  Award,
  FileCheck,
  UserCheck,
  RefreshCw,
  Sparkles,
  Edit3,
  X,
  SlidersHorizontal,
  ChevronRight,
  Info
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { schemeService } from '../services/schemeService';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

const CATEGORIES = [
  { id: 'All', label: 'All Schemes' },
  { id: 'Healthcare', label: 'Healthcare & Hospitalization', icon: HeartPulse },
  { id: 'Pension', label: 'Old Age Pension & Annuity', icon: Wallet },
  { id: 'Senior Support', label: 'Senior Assisted Devices', icon: Award },
  { id: 'Insurance', label: 'Health Insurance & Care', icon: ShieldCheck }
];

const INDIAN_STATES = [
  'All India',
  'Andhra Pradesh',
  'Bihar',
  'Delhi',
  'Gujarat',
  'Haryana',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'West Bengal'
];

const INCOME_TIERS = [
  'BPL / Low Income (< Rs. 1.5 Lakh)',
  'Low Income (Rs. 1.5 - 2.5 Lakh)',
  'Middle Income (Rs. 2.5 - 5 Lakh)',
  'Above Rs. 5 Lakh / All Groups'
];

export default function GovernmentSchemesPage() {
  const { user, updateUserProfile } = useAuth();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedState, setSelectedState] = useState('All India');
  const [eligibleCount, setEligibleCount] = useState(0);

  // User Beneficiary Profile State
  const [profileData, setProfileData] = useState({
    age: user?.age || 65,
    state: user?.state || 'Gujarat',
    incomeCategory: user?.incomeCategory || 'BPL / Low Income (< Rs. 1.5 Lakh)',
    hasDisability: Boolean(user?.hasDisability),
    gender: user?.gender || 'All'
  });

  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [detailModalScheme, setDetailModalScheme] = useState(null);

  // Sync profile data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        age: user.age || 65,
        state: user.state || 'Gujarat',
        incomeCategory: user.incomeCategory || 'BPL / Low Income (< Rs. 1.5 Lakh)',
        hasDisability: Boolean(user.hasDisability),
        gender: user.gender || 'All'
      });
      if (user.state) {
        setSelectedState(user.state);
      }
    }
  }, [user]);

  // Load Continuous Personalized Schemes
  const loadPersonalizedSchemes = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch continuous matched schemes for this user
      const res = await schemeService.getPersonalizedSchemes({
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        state: selectedState !== 'All India' ? selectedState : undefined,
        search: searchQuery || undefined
      });

      if (res.data?.schemes) {
        setSchemes(res.data.schemes);
        setEligibleCount(res.data.eligibleCount || 0);
      } else {
        // Fallback to standard schemes
        const fallbackRes = await schemeService.getSchemes({
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          state: selectedState !== 'All India' ? selectedState : undefined,
          search: searchQuery || undefined
        });
        setSchemes(fallbackRes.data || []);
      }
    } catch (err) {
      console.warn('Personalized schemes API fallback to standard:', err.message);
      try {
        const fallback = await schemeService.getSchemes({
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          state: selectedState !== 'All India' ? selectedState : undefined,
          search: searchQuery || undefined
        });
        setSchemes(fallback.data || []);
      } catch (e) {
        setError('Unable to load government schemes. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPersonalizedSchemes();
  }, [selectedCategory, selectedState]);

  // Save updated beneficiary profile & re-evaluate schemes immediately
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      if (updateUserProfile) {
        await updateUserProfile(profileData);
      } else {
        await schemeService.updateProfileCriteria(profileData);
      }
      setSelectedState(profileData.state);
      setShowEditProfileModal(false);
      await loadPersonalizedSchemes();
    } catch (err) {
      console.error('Failed to update scheme profile criteria:', err);
    } finally {
      setSavingProfile(false);
    }
  };

  const filteredSchemes = schemes.filter(s => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      s.name?.toLowerCase().includes(query) ||
      s.description?.toLowerCase().includes(query) ||
      s.department?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* 1. Header & Live Profile Eligibility Banner */}
      <div className="bg-gradient-to-r from-[#3D5A45] to-[#2c4232] rounded-3xl p-6 sm:p-8 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 text-xs font-bold text-[#E07A5F] bg-white/10 backdrop-blur-xs px-3.5 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-Time Government Scheme Matching</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Government Health & Welfare Schemes
            </h1>
            <p className="text-xs sm:text-sm text-gray-200 max-w-2xl leading-relaxed">
              We continuously cross-reference your beneficiary profile with active state and central government health policies to show only schemes you qualify for.
            </p>
          </div>

          {/* User Profile Summary Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 sm:p-5 rounded-2xl flex flex-col justify-between min-w-[280px]">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/15">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-[#E07A5F]" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">Your Saved Profile</span>
              </div>
              <button
                type="button"
                onClick={() => setShowEditProfileModal(true)}
                className="text-xs font-bold text-[#E07A5F] hover:text-white flex items-center space-x-1 cursor-pointer transition-colors bg-white/10 px-2.5 py-1 rounded-lg"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit Profile</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-300 block text-[10px] uppercase font-semibold">Age</span>
                <span className="font-extrabold text-white text-sm">{profileData.age} Years</span>
              </div>
              <div>
                <span className="text-gray-300 block text-[10px] uppercase font-semibold">State</span>
                <span className="font-extrabold text-white text-sm truncate">{profileData.state}</span>
              </div>
              <div>
                <span className="text-gray-300 block text-[10px] uppercase font-semibold">Income Tier</span>
                <span className="font-bold text-white text-[11px] truncate block">{profileData.incomeCategory.split('(')[0]}</span>
              </div>
              <div>
                <span className="text-gray-300 block text-[10px] uppercase font-semibold">Assisted Aid</span>
                <span className="font-bold text-white text-[11px]">
                  {profileData.hasDisability ? 'Aid Required' : 'General Care'}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-white/15 flex items-center justify-between text-xs">
              <span className="text-gray-300">Live Eligible Matches:</span>
              <span className="px-2 py-0.5 bg-[#E07A5F] text-white font-extrabold text-xs rounded-full">
                {eligibleCount} Schemes
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scheme name, Ayushman Bharat, pension, free surgery, medical aid..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#3D5A45] focus:bg-white transition-all text-gray-900"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-gray-500 whitespace-nowrap">Filter State:</span>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[#3D5A45] text-gray-800"
            >
              {INDIAN_STATES.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-[#3D5A45] text-white shadow-xs'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Continuously Evaluated Scheme Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-gray-500 font-semibold px-1">
          <span>Showing {filteredSchemes.length} Schemes Available for Your Region</span>
          <span className="text-[#3D5A45] font-bold flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#3D5A45]" />
            <span>Automatically updated based on your age ({profileData.age} yrs)</span>
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => <LoadingSkeleton key={i} className="h-64 rounded-3xl" />)}
          </div>
        ) : filteredSchemes.length === 0 ? (
          <div className="bg-white p-10 rounded-3xl border border-gray-100 text-center">
            <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-gray-800">No Schemes Found</h4>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Try adjusting your state filter or search keywords.
            </p>
            <button
              onClick={() => { setSelectedCategory('All'); setSelectedState('All India'); setSearchQuery(''); }}
              className="mt-4 px-4 py-2 bg-[#3D5A45] text-white text-xs font-semibold rounded-xl cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredSchemes.map((scheme) => {
              const matchScore = scheme.matchScore ?? 90;
              const isEligible = scheme.isEligible !== false;

              return (
                <div
                  key={scheme._id}
                  className={`bg-white p-6 rounded-3xl border transition-all flex flex-col justify-between shadow-xs ${
                    isEligible && matchScore >= 70
                      ? 'border-[#3D5A45] ring-2 ring-[#3D5A45]/15 bg-gradient-to-b from-white to-[#fbfdfb]' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div>
                    {/* Top Row: Department & Eligibility Badge */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                          {scheme.department || 'Government of India'}
                        </span>
                        <h3 className="font-extrabold text-gray-900 text-base leading-snug">
                          {scheme.name}
                        </h3>
                      </div>
                      <span className={`px-2.5 py-1 font-extrabold text-[11px] rounded-full whitespace-nowrap flex-shrink-0 flex items-center space-x-1 ${
                        isEligible 
                          ? 'bg-[#eef3ef] text-[#3D5A45]' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {isEligible ? <CheckCircle2 className="w-3 h-3 text-[#3D5A45]" /> : <Info className="w-3 h-3" />}
                        <span>{isEligible ? `${matchScore}% Match • Eligible` : 'General Scheme'}</span>
                      </span>
                    </div>

                    {/* Match Score Meter */}
                    <div className="mb-3 flex items-center space-x-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${isEligible ? 'bg-[#3D5A45]' : 'bg-amber-500'}`} 
                          style={{ width: `${matchScore}%` }}
                        />
                      </div>
                      <span className="text-xs font-extrabold text-[#3D5A45]">
                        {matchScore}%
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-3 mb-4">
                      {scheme.description}
                    </p>

                    {/* Eligibility Reasons Breakdown */}
                    {scheme.eligibilityReasons && scheme.eligibilityReasons.length > 0 && (
                      <div className="bg-[#EEF3EF]/60 p-3 rounded-2xl mb-3 space-y-1 border border-[#3D5A45]/15">
                        <span className="text-[10px] font-extrabold text-[#3D5A45] uppercase tracking-wider block">
                          Why you qualify:
                        </span>
                        {scheme.eligibilityReasons.slice(0, 2).map((reason, idx) => (
                          <div key={idx} className="flex items-center space-x-1.5 text-xs text-[#2b4031] font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#3D5A45] flex-shrink-0" />
                            <span className="line-clamp-1">{reason}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Benefits Preview */}
                    {scheme.benefits && scheme.benefits.length > 0 && (
                      <div className="bg-gray-50 p-3.5 rounded-2xl mb-4 space-y-1.5 border border-gray-100">
                        <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block">
                          Key Benefits:
                        </span>
                        {scheme.benefits.slice(0, 2).map((b, idx) => (
                          <div key={idx} className="flex items-start space-x-1.5 text-xs text-gray-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#3D5A45] flex-shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{b}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                    <button
                      onClick={() => setDetailModalScheme(scheme)}
                      className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs transition-all text-center cursor-pointer"
                    >
                      View Full Details
                    </button>

                    <a
                      href={scheme.applicationUrl || scheme.officialLink || 'https://www.india.gov.in'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 px-4 bg-[#3D5A45] hover:bg-[#324a3a] text-white font-bold rounded-xl text-xs transition-all shadow-xs flex items-center justify-center space-x-1.5"
                    >
                      <span>Official Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Edit My Eligibility Profile Modal */}
      <AnimatePresence>
        {showEditProfileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-xl bg-[#EEF3EF] text-[#3D5A45]">
                    <SlidersHorizontal className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Edit Scheme Profile</h3>
                    <p className="text-xs text-gray-500">Update your details to re-match government schemes</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                {/* Age */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-gray-700 uppercase">Age of Beneficiary</label>
                    <span className="text-sm font-extrabold text-[#3D5A45]">{profileData.age} Years</span>
                  </div>
                  <input
                    type="range"
                    min="45"
                    max="100"
                    value={profileData.age}
                    onChange={(e) => setProfileData({ ...profileData, age: parseInt(e.target.value) })}
                    className="w-full accent-[#3D5A45]"
                  />
                </div>

                {/* State */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">State / Region</label>
                  <select
                    value={profileData.state}
                    onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-[#3D5A45]"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                {/* Income Tier */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Annual Family Income</label>
                  <select
                    value={profileData.incomeCategory}
                    onChange={(e) => setProfileData({ ...profileData, incomeCategory: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-[#3D5A45]"
                  >
                    {INCOME_TIERS.map((tier) => (
                      <option key={tier} value={tier}>{tier}</option>
                    ))}
                  </select>
                </div>

                {/* Disability / Impairment Aid */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    Requires Assisted Living / Disability Aid?
                  </label>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setProfileData({ ...profileData, hasDisability: true })}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        profileData.hasDisability 
                          ? 'bg-[#3D5A45] text-white shadow-xs' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Yes (Aid Required)
                    </button>
                    <button
                      type="button"
                      onClick={() => setProfileData({ ...profileData, hasDisability: false })}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        !profileData.hasDisability 
                          ? 'bg-[#3D5A45] text-white shadow-xs' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      No (General Senior)
                    </button>
                  </div>
                </div>

                <div className="pt-3 flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEditProfileModal(false)}
                    className="flex-1 py-3 border border-gray-200 text-gray-700 font-bold rounded-xl text-xs cursor-pointer hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="flex-1 py-3 bg-[#3D5A45] hover:bg-[#324a3a] text-white font-bold rounded-xl text-xs shadow-sm flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
                  >
                    {savingProfile ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Save & Re-Match Schemes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. Full Scheme Details Modal */}
      {detailModalScheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  {detailModalScheme.department}
                </span>
                <h3 className="text-xl font-extrabold text-gray-900">
                  {detailModalScheme.name}
                </h3>
              </div>
              <button 
                onClick={() => setDetailModalScheme(null)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm text-gray-700">
              <p className="text-gray-600 text-xs leading-relaxed bg-gray-50 p-3.5 rounded-2xl">
                {detailModalScheme.description}
              </p>

              {/* Benefits */}
              {detailModalScheme.benefits && (
                <div>
                  <strong className="block text-xs uppercase text-gray-400 font-bold mb-2">
                    Complete Benefits
                  </strong>
                  <div className="space-y-1.5">
                    {detailModalScheme.benefits.map((ben, i) => (
                      <div key={i} className="flex items-start space-x-2 text-xs text-gray-800">
                        <CheckCircle2 className="w-4 h-4 text-[#3D5A45] flex-shrink-0 mt-0.5" />
                        <span>{ben}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Eligibility */}
              {detailModalScheme.eligibility && (
                <div>
                  <strong className="block text-xs uppercase text-gray-400 font-bold mb-2">
                    Eligibility Criteria
                  </strong>
                  <div className="space-y-1.5">
                    {detailModalScheme.eligibility.map((el, i) => (
                      <div key={i} className="flex items-start space-x-2 text-xs text-gray-800">
                        <ShieldCheck className="w-4 h-4 text-[#E07A5F] flex-shrink-0 mt-0.5" />
                        <span>{el}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents Required */}
              {detailModalScheme.requiredDocuments && (
                <div>
                  <strong className="block text-xs uppercase text-gray-400 font-bold mb-2">
                    Documents Required for Application
                  </strong>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
                    {detailModalScheme.requiredDocuments.map((doc, i) => (
                      <div key={i} className="flex items-center space-x-1.5 bg-gray-50 p-2 rounded-xl">
                        <FileCheck className="w-3.5 h-3.5 text-[#3D5A45]" />
                        <span>{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex space-x-3">
              <button
                type="button"
                onClick={() => setDetailModalScheme(null)}
                className="flex-1 py-3 border border-gray-200 text-gray-700 font-bold rounded-xl text-sm cursor-pointer hover:bg-gray-50"
              >
                Close
              </button>
              <a
                href={detailModalScheme.applicationUrl || detailModalScheme.officialLink || 'https://www.india.gov.in'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 bg-[#3D5A45] hover:bg-[#324a3a] text-white font-bold rounded-xl text-sm text-center flex items-center justify-center space-x-1.5"
              >
                <span>Apply on Official Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
