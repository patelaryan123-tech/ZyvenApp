import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ExternalLink, 
  ShieldCheck, 
  HeartPulse, 
  Home, 
  Wallet,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Award,
  FileCheck,
  Building,
  UserCheck,
  RefreshCw,
  Sparkles,
  X
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { schemeService } from '../services/schemeService';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ErrorState from '../components/common/ErrorState';

const CATEGORIES = [
  { id: 'All', label: 'All Schemes' },
  { id: 'Healthcare', label: 'Healthcare & Hospitalization', icon: HeartPulse },
  { id: 'Pension', label: 'Old Age Pension & Annuity', icon: Wallet },
  { id: 'Senior Support', label: 'Senior Assisted Devices', icon: Award },
  { id: 'Insurance', label: 'Health Insurance & Care', icon: ShieldCheck }
];

export default function GovernmentSchemesPage() {
  const { user } = useAuth();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedState, setSelectedState] = useState('All India');

  // Questionnaire State
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [questionnaireData, setQuestionnaireData] = useState({
    age: 65,
    state: 'All India',
    income: 'Low Income (< Rs. 2.5 Lakh/yr)',
    hasDisability: false,
    category: 'All'
  });
  const [evaluatedResult, setEvaluatedResult] = useState(null);

  // Detail Modal
  const [detailModalScheme, setDetailModalScheme] = useState(null);

  const fetchSchemes = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await schemeService.getSchemes({
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        state: selectedState !== 'All India' ? selectedState : undefined,
        search: searchQuery || undefined
      });
      setSchemes(res.data || []);
    } catch (err) {
      console.error('Fetch schemes error:', err);
      setError('Unable to load government schemes. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, [selectedCategory, selectedState]);

  const handleRunQuestionnaire = async (e) => {
    e.preventDefault();
    setEvaluating(true);
    try {
      const res = await schemeService.checkEligibility(questionnaireData);
      setEvaluatedResult(res.data);
      if (res.data?.schemes) {
        setSchemes(res.data.schemes);
      }
    } catch (err) {
      console.error('Eligibility evaluation error:', err);
    } finally {
      setEvaluating(false);
    }
  };

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSelectedState('All India');
    setSearchQuery('');
    setEvaluatedResult(null);
    fetchSchemes();
  };

  const filteredSchemes = schemes.filter(s => {
    const matchesSearch = s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.department?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-3xl border border-gray-100 shadow-xs gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-semibold text-[#3D5A45] bg-[#eef3ef] px-3 py-1 rounded-full mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>Government Welfare & Senior Citizen Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Government Health Schemes
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Discover official medical benefits, pension schemes, and assistive healthcare subsidies
          </p>
        </div>

        <button
          onClick={() => setShowQuestionnaire(!showQuestionnaire)}
          className="px-5 py-3 bg-[#3D5A45] hover:bg-[#324a3a] text-white font-bold rounded-2xl text-sm flex items-center justify-center space-x-2 transition-all shadow-sm cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-[#E07A5F]" />
          <span>{showQuestionnaire ? 'Hide Eligibility Checker' : 'Check My Eligibility'}</span>
        </button>
      </div>

      {/* 2. Step-by-Step Interactive Eligibility Questionnaire */}
      <AnimatePresence>
        {showQuestionnaire && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-br from-[#eef3ef] to-white p-6 sm:p-8 rounded-3xl border border-[#3D5A45]/30 shadow-sm"
          >
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-6">
                <h3 className="text-xl font-extrabold text-gray-900 flex items-center justify-center space-x-2">
                  <UserCheck className="w-6 h-6 text-[#3D5A45]" />
                  <span>Senior Eligibility Questionnaire</span>
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  Answer 4 quick questions to compute your matching central & state healthcare schemes.
                </p>
              </div>

              <form onSubmit={handleRunQuestionnaire} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Age */}
                  <div className="bg-white p-4 rounded-2xl border border-gray-200">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      1. Age of Beneficiary
                    </label>
                    <div className="flex items-center space-x-3 mt-2">
                      <input
                        type="range"
                        min="50"
                        max="95"
                        value={questionnaireData.age}
                        onChange={(e) => setQuestionnaireData({ ...questionnaireData, age: parseInt(e.target.value) })}
                        className="flex-1 accent-[#3D5A45]"
                      />
                      <span className="font-extrabold text-lg text-[#3D5A45] min-w-[50px] text-right">
                        {questionnaireData.age} yrs
                      </span>
                    </div>
                  </div>

                  {/* State */}
                  <div className="bg-white p-4 rounded-2xl border border-gray-200">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      2. State / Region
                    </label>
                    <select
                      value={questionnaireData.state}
                      onChange={(e) => setQuestionnaireData({ ...questionnaireData, state: e.target.value })}
                      className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-[#3D5A45]"
                    >
                      <option value="All India">All India (National)</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Rajasthan">Rajasthan</option>
                    </select>
                  </div>

                  {/* Income */}
                  <div className="bg-white p-4 rounded-2xl border border-gray-200">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      3. Annual Family Income
                    </label>
                    <select
                      value={questionnaireData.income}
                      onChange={(e) => setQuestionnaireData({ ...questionnaireData, income: e.target.value })}
                      className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-[#3D5A45]"
                    >
                      <option value="BPL / Low Income (< Rs. 1.5 Lakh)">BPL / Low Income (&lt; Rs. 1.5 Lakh)</option>
                      <option value="Middle Income (Rs. 1.5 - 5 Lakh)">Middle Income (Rs. 1.5 - 5 Lakh)</option>
                      <option value="Above Rs. 5 Lakh">Above Rs. 5 Lakh / All</option>
                    </select>
                  </div>

                  {/* Disability / Impairment */}
                  <div className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col justify-between">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      4. Requires Assisted Living Aid?
                    </label>
                    <div className="flex space-x-2 mt-1">
                      <button
                        type="button"
                        onClick={() => setQuestionnaireData({ ...questionnaireData, hasDisability: true })}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                          questionnaireData.hasDisability 
                            ? 'bg-[#3D5A45] text-white shadow-xs' 
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        Yes (Aids / Impairment)
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuestionnaireData({ ...questionnaireData, hasDisability: false })}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                          !questionnaireData.hasDisability 
                            ? 'bg-[#3D5A45] text-white shadow-xs' 
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        No / General Care
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center pt-2">
                  <button
                    type="submit"
                    disabled={evaluating}
                    className="py-3 px-8 bg-[#3D5A45] hover:bg-[#324a3a] text-white font-bold rounded-xl text-sm shadow-md flex items-center space-x-2 cursor-pointer"
                  >
                    {evaluating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Evaluating Eligibility Rules...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-[#E07A5F]" />
                        <span>Find My Eligible Schemes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {evaluatedResult && (
                <div className="mt-6 p-4 bg-green-100 text-green-900 rounded-2xl text-center text-sm font-semibold flex items-center justify-center space-x-2">
                  <Award className="w-5 h-5 text-green-700" />
                  <span>
                    Found <strong>{evaluatedResult.eligibleCount}</strong> highly eligible schemes matching your profile!
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scheme name, ministry, health coverage, pension benefits..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#3D5A45] focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-[#3D5A45]"
            >
              <option value="All India">All India</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
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

      {/* 4. Schemes Grid List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-gray-500 font-semibold px-1">
          <span>Showing {filteredSchemes.length} Verified Government Welfare Schemes</span>
          {evaluatedResult && <span className="text-[#3D5A45] font-bold">✨ Sorted by Personalized Match</span>}
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
              Try clearing your search or category filters.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-4 px-4 py-2 bg-[#3D5A45] text-white text-xs font-semibold rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredSchemes.map((scheme) => {
              const isHighlyEligible = scheme.matchScore && scheme.matchScore >= 60;

              return (
                <div
                  key={scheme._id}
                  className={`bg-white p-6 rounded-3xl border transition-all flex flex-col justify-between shadow-xs ${
                    isHighlyEligible 
                      ? 'border-[#3D5A45] ring-2 ring-[#3D5A45]/20 bg-gradient-to-b from-white to-[#f8faf8]' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div>
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                          {scheme.department}
                        </span>
                        <h3 className="font-extrabold text-gray-900 text-base leading-snug">
                          {scheme.name}
                        </h3>
                      </div>
                      <span className="px-2.5 py-1 bg-[#eef3ef] text-[#3D5A45] font-bold text-[11px] rounded-full whitespace-nowrap flex-shrink-0">
                        {scheme.category}
                      </span>
                    </div>

                    {/* Eligibility Match Badge if calculated */}
                    {scheme.matchScore !== undefined && (
                      <div className="mb-3 flex items-center space-x-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${scheme.matchScore >= 60 ? 'bg-[#3D5A45]' : 'bg-amber-500'}`} 
                            style={{ width: `${scheme.matchScore}%` }}
                          />
                        </div>
                        <span className="text-xs font-extrabold text-[#3D5A45]">
                          {scheme.matchScore}% Match
                        </span>
                      </div>
                    )}

                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-3 mb-4">
                      {scheme.description}
                    </p>

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

                  {/* Actions Row */}
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                    <button
                      onClick={() => setDetailModalScheme(scheme)}
                      className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs transition-all text-center cursor-pointer"
                    >
                      View Full Details
                    </button>

                    <a
                      href={scheme.applicationUrl || scheme.officialLink}
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
                className="p-1 rounded-full text-gray-400 hover:text-gray-600"
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
                className="flex-1 py-3 border border-gray-200 text-gray-700 font-bold rounded-xl text-sm"
              >
                Close
              </button>
              <a
                href={detailModalScheme.applicationUrl || detailModalScheme.officialLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 bg-[#3D5A45] hover:bg-[#324a3a] text-white font-bold rounded-xl text-sm text-center flex items-center justify-center space-x-1.5"
              >
                <span>Apply on Official Website</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
