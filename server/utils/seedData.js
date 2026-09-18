const Hospital = require('../models/Hospital');
const GovernmentScheme = require('../models/GovernmentScheme');

const sampleHospitals = [
  {
    name: 'Apollo Hospital Ahmedabad',
    type: 'Hospital',
    address: 'Plot No. 1A, Bhat GIDC Estate, Gandhinagar - Ahmedabad',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '382428',
    location: { type: 'Point', coordinates: [72.6369, 23.1065] },
    phone: '+91 79 6670 1800',
    emergencyAvailable: true,
    specialties: ['Cardiology', 'Neurology', 'Orthopedics', 'Geriatrics', 'Emergency Medicine'],
    services: ['24/7 Trauma Care', 'ICU', 'Ambulance Service', 'Blood Bank', 'Dialysis'],
    openingHours: '24/7 Open',
    rating: 4.8
  },
  {
    name: 'Zydus Hospitals',
    type: 'Hospital',
    address: 'Zydus Hospital Road, S.G. Highway, Thaltej, Ahmedabad',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380054',
    location: { type: 'Point', coordinates: [72.5085, 23.0538] },
    phone: '+91 79 6619 0201',
    emergencyAvailable: true,
    specialties: ['Cardiology', 'Oncology', 'Organ Transplant', 'Critical Care', 'Pulmonology'],
    services: ['Emergency Care', 'Pharmacy 24/7', 'Pathology Lab', 'Cardiac Care Unit'],
    openingHours: '24/7 Open',
    rating: 4.7
  },
  {
    name: 'Shree Krishna Hospital & Medical Research Centre',
    type: 'Hospital',
    address: 'Gokalnagar, Karamsad, Anand',
    city: 'Anand',
    state: 'Gujarat',
    pincode: '388325',
    location: { type: 'Point', coordinates: [72.9038, 22.5484] },
    phone: '+91 2692 228411',
    emergencyAvailable: true,
    specialties: ['General Medicine', 'Geriatrics', 'Cardiology', 'Nephrology', 'Emergency Care'],
    services: ['24/7 Emergency', 'Charitable Healthcare', 'Advanced ICU', 'Geriatric Ward'],
    openingHours: '24/7 Open',
    rating: 4.9
  },
  {
    name: 'LifeCare Senior Wellness Clinic',
    type: 'Clinic',
    address: '102, Shivalik Plaza, IIM Road, Panjrapole, Ahmedabad',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380015',
    location: { type: 'Point', coordinates: [72.5350, 23.0305] },
    phone: '+91 79 2630 4455',
    emergencyAvailable: false,
    specialties: ['Geriatric Care', 'Physiotherapy', 'Diabetes Care', 'Hypertension Management'],
    services: ['Routine Health Checkup', 'Memory Screening', 'Diet Counseling', 'Home Sample Collection'],
    openingHours: '08:00 AM - 08:00 PM',
    rating: 4.6
  },
  {
    name: 'Sterling Hospitals',
    type: 'Hospital',
    address: 'Sterling Hospital Road, Memnagar, Ahmedabad',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380052',
    location: { type: 'Point', coordinates: [72.5332, 23.0526] },
    phone: '+91 79 4001 1111',
    emergencyAvailable: true,
    specialties: ['Cardiology', 'Neurology', 'Gastroenterology', 'Spine Care'],
    services: ['24/7 Emergency', 'Cath Lab', 'CT & MRI Scan', 'Dialysis Centre'],
    openingHours: '24/7 Open',
    rating: 4.6
  },
  {
    name: 'Anand Care Polyclinic',
    type: 'Clinic',
    address: 'Station Road, Near Town Hall, Anand',
    city: 'Anand',
    state: 'Gujarat',
    pincode: '388001',
    location: { type: 'Point', coordinates: [72.9289, 22.5645] },
    phone: '+91 2692 245678',
    emergencyAvailable: false,
    specialties: ['Family Medicine', 'Cardiology Consultations', 'Orthopedics'],
    services: ['ECG', 'Pathology Lab', 'Senior Consultation', 'Physiotherapy'],
    openingHours: '09:00 AM - 09:00 PM',
    rating: 4.5
  }
];

const sampleSchemes = [
  {
    name: 'Ayushman Bharat — Pradhan Mantri Jan Arogya Yojana (PM-JAY)',
    department: 'National Health Authority (NHA)',
    description: 'World\'s largest government health insurance scheme offering Rs. 5 Lakh per family per year for secondary and tertiary healthcare hospitalizations.',
    category: 'Healthcare',
    state: 'All India',
    ageCriteria: { min: 0, max: 120 },
    incomeCriteria: 'Low Income & Deprived Families as per SECC',
    eligibility: [
      'Identified under SECC 2011 database',
      'Families without male earning members aged 16-59',
      'Senior citizens in vulnerable rural/urban households',
      'All senior citizens aged 70+ (Expanded PM-JAY coverage)'
    ],
    benefits: [
      'Cashless hospital coverage up to Rs. 5,00,000 per family per year',
      'Covers 3 days of pre-hospitalization and 15 days of post-hospitalization',
      'Covers pre-existing conditions from Day 1',
      'Access to 27,000+ empaneled public & private hospitals across India'
    ],
    requiredDocuments: [
      'Aadhaar Card',
      'Ration Card / PM-JAY Golden Card',
      'Income Certificate (if applicable)',
      'Proof of Residence'
    ],
    applicationUrl: 'https://mera.pmjay.gov.in/search/login',
    officialLink: 'https://nha.gov.in/PM-JAY',
    isActive: true
  },
  {
    name: 'Pradhan Mantri Vaya Vandana Yojana (PMVVY)',
    department: 'Ministry of Finance & Life Insurance Corporation of India (LIC)',
    description: 'A government-backed pension scheme for senior citizens aged 60+ offering guaranteed monthly pension for 10 years with assured 7.4% annual returns.',
    category: 'Pension',
    state: 'All India',
    ageCriteria: { min: 60, max: 120 },
    incomeCriteria: 'All Income Groups (Senior Citizens)',
    eligibility: [
      'Must be a citizen of India',
      'Minimum entry age: 60 years (completed)',
      'No maximum age limit'
    ],
    benefits: [
      'Guaranteed pension of Rs. 1,000 to Rs. 9,250 per month',
      'Assured return rate of 7.40% p.a. payable monthly',
      'Loan facility available up to 75% of purchase price after 3 policy years',
      'Maturity benefit: Return of total purchase price along with final pension installment'
    ],
    requiredDocuments: [
      'Aadhaar Card',
      'PAN Card',
      'Proof of Age (Passport / Birth Certificate / Voter ID)',
      'Bank Account Passbook / Cancelled Cheque'
    ],
    applicationUrl: 'https://licindia.in/Products/Pension-Plans/pradhan-mantri-vaya-vandana-yojana',
    officialLink: 'https://financialservices.gov.in/insurance-divisions/National-Social-Assistance-Programme',
    isActive: true
  },
  {
    name: 'Rashtriya Vayoshri Yojana (RVY)',
    department: 'Ministry of Social Justice and Empowerment',
    description: 'Provides free physical aids and assisted-living devices for senior citizens belonging to BPL categories suffering from age-related disabilities or impairments.',
    category: 'Senior Support',
    state: 'All India',
    ageCriteria: { min: 60, max: 120 },
    incomeCriteria: 'BPL / Low Income (< Rs. 15,000 per month)',
    eligibility: [
      'Senior citizens aged 60 years or above',
      'Belonging to Below Poverty Line (BPL) or monthly family income below Rs. 15,000',
      'Suffering from age-related infirmities (low vision, hearing loss, locomotion disability, loss of teeth)'
    ],
    benefits: [
      'Free high-quality assisted living devices: Walking sticks, Elbow crutches, Walkers',
      'Hearing aids, Spectacles, Artificial dentures, Wheelchairs',
      'Free medical assessment camps conducted by ALIMCO'
    ],
    requiredDocuments: [
      'Aadhaar Card',
      'Age Certificate / Voter ID',
      'BPL Card / Income Certificate from Competent Authority',
      'Medical Certificate certifying disability / impairment'
    ],
    applicationUrl: 'https://alimco.in/Default.aspx',
    officialLink: 'https://socialjustice.gov.in/schemes/62',
    isActive: true
  },
  {
    name: 'National Programme for Health Care of the Elderly (NPHCE)',
    department: 'Ministry of Health and Family Welfare',
    description: 'Dedicated healthcare infrastructure providing free, accessible, and specialized comprehensive medical care to senior citizens at all primary and community levels.',
    category: 'Healthcare',
    state: 'All India',
    ageCriteria: { min: 60, max: 120 },
    incomeCriteria: 'All Senior Citizens',
    eligibility: [
      'All Indian senior citizens aged 60 and above',
      'Available across government district hospitals and community health centers'
    ],
    benefits: [
      'Free dedicated weekly geriatric OPD clinics',
      'Special 10-bedded geriatric wards in district hospitals',
      'Free investigations, rehabilitation, and physiotherapy services',
      'Free essential geriatric medicines'
    ],
    requiredDocuments: [
      'Age Proof (Aadhaar / Voter ID)',
      'Hospital Registration Card'
    ],
    applicationUrl: 'https://mohfw.gov.in/major-programmes/non-communicable-diseases-injury-trauma/national-programme-health-care-elderly-nphce',
    officialLink: 'https://mohfw.gov.in',
    isActive: true
  },
  {
    name: 'Indira Gandhi National Old Age Pension Scheme (IGNOAPS)',
    department: 'Ministry of Rural Development',
    description: 'Non-contributory monthly old age financial pension for elderly citizens living below the poverty line.',
    category: 'Pension',
    state: 'All India',
    ageCriteria: { min: 60, max: 120 },
    incomeCriteria: 'BPL Card Holders',
    eligibility: [
      'Age 60 years or above',
      'Belongs to Below Poverty Line (BPL) household'
    ],
    benefits: [
      'Direct Benefit Transfer (DBT) monthly financial pension',
      'State government supplementary pension addon',
      'Higher pension amount for seniors aged 80+'
    ],
    requiredDocuments: [
      'Aadhaar Card',
      'BPL Ration Card',
      'Bank Account details',
      'Age Proof'
    ],
    applicationUrl: 'https://nsap.nic.in/',
    officialLink: 'https://nsap.nic.in/',
    isActive: true
  }
];

const seedDatabase = async () => {
  try {
    const hospitalCount = await Hospital.countDocuments();
    if (hospitalCount === 0) {
      await Hospital.insertMany(sampleHospitals);
      console.log('✅ Seeded 6 verified Hospitals and Clinics into MongoDB');
    }

    const schemeCount = await GovernmentScheme.countDocuments();
    if (schemeCount === 0) {
      await GovernmentScheme.insertMany(sampleSchemes);
      console.log('✅ Seeded 5 official Government Healthcare Schemes into MongoDB');
    }
  } catch (error) {
    console.warn('⚠️ Seeding note:', error.message);
  }
};

module.exports = { seedDatabase };
