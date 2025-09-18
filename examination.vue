<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, watch, computed } from 'vue';
import axios from 'axios';
import Cookies from 'js-cookie';
import keywordsData from '@/assets/keywords_ortho_updated.json';
import RecordDetailNew from './recorddetail_new.vue';
import {
  LoaderCircle,
  Calendar,
  Stethoscope,
  CircleAlert,
  Smile,
  AlertTriangle,
  Eye,
  Zap,
  Heart,
  Activity,
  FileText,
  Info,
  Save,
  X,
  Search,
  Trash2,
  Plus
} from 'lucide-vue-next';

// --- PROPS & EMITS ---
const props = defineProps({
  patientId: {
    type: [Number, String],
    required: true
  },
  records: {
    type: Array,
    default: () => []
  }
});
const emit = defineEmits(['error', 'save-success', 'close', 'save', 'add-record-for-tooth', 'tooth-selected']);

// --- RUNTIME CONFIG ---
const config = useRuntimeConfig();

// Get the correct API base URL
const getApiBaseUrl = () => {
  return config.public.API_BASE_URL || 'http://localhost:2095';
};

// --- STATE MANAGEMENT ---
const loading = ref(true);
const saving = ref(false);
const error = ref(null);
const showFloatingNotification = ref(true);

// Examination data state
const examinations = ref([]);
const selectedExamination = ref(null);
const mode = ref('create'); // 'create' or 'view' mode

// State for tooth history and popup - similar to DentalChart
const toothHistoryData = ref({});
const showToothHistory = ref(false);
const showHoverSummary = ref(false);
const hoveredTooth = ref(null);
let hoverTimeout = null;

// Popup modal state for RecordDetailNew
const showRecordDetailPopup = ref(false);
const selectedToothForRecord = ref(null);
const recordDetailData = ref(null);

// Condition history popover
const showConditionHistory = ref(false);
const selectedToothForHistory = ref(null);
const historyPopoverPosition = ref({ x: 0, y: 0 });

// Double-click detection
const clickTimer = ref(null);
const clickCount = ref(0);

// Teeth data for chart and forms
const allTeeth = [
  ...[18, 17, 16, 15, 14, 13, 12, 11], ...[21, 22, 23, 24, 25, 26, 27, 28],
  ...[48, 47, 46, 45, 44, 43, 42, 41], ...[38, 37, 36, 35, 34, 33, 32, 31]
];

// Children's teeth (Primary/Deciduous teeth)
const allChildrenTeeth = [
  ...[55, 54, 53, 52, 51], ...[61, 62, 63, 64, 65],
  ...[85, 84, 83, 82, 81], ...[71, 72, 73, 74, 75]
];

// Global condition fields from the API
const globalConditionFields = [
  'generalized_gingivitis',
  'generalized_periodontitis', 
  'gingival_recession',
  'swollen_gums',
  'oral_ulcers',
  'oral_thrush_candidiasis',
  'plaque_generalized',
  'generalized_calculus',
  'halitosis',
  'tmj_disorder',
  'bruxism',
  'clenching_habit',
  'xerostomia',
  'leukoplakia',
  'lichen_planus',
  'mucosal_pigmentation',
  'tobacco_stains',
  'medication_related_changes',
  'nutritional_deficiency_signs'
];

// Factory for creating a clean examination object
const createNewExaminationObject = () => ({
  exam_date: new Date().toISOString().split('T')[0],
  condition_of_teeth: {},
  extra_oral_findings: '',
  malocclusion: { 
    overjet: false, 
    overbite: false, 
    crossbite: false, 
    open_bite: false,
    // Additional malocclusion types from the API response
    anterior_cross_bite: false,
    anterior_open_bite: false,
    class_i: false,
    class_ii: false,
    class_iii: false,
    crowding: false,
    deep_bite: false,
    division_1: false,
    division_2: false,
    midline_diastema: false,
    posterior_cross_bite: false,
    posterior_open_bite: false,
    protrusion: false,
    single_tooth_cross_bite: false,
    spacing: false
  },
  pocket_depths: {}, // Format: { "11": [3, 2, 4, 3, 2, 3] } (6 measurements per tooth)
  impaction_info: {}, // Format: { "18": "mesioangular", "28": "vertical" }
  // New global conditionsssssssssss

  // Calculus : false,
  generalized_gingivitis: false,
  generalized_periodontitis: false,
  gingival_recession: false,
  swollen_gums: false,
  oral_ulcers: false,
  oral_thrush_candidiasis: false,
  plaque_generalized: false,
  generalized_calculus: false,
  halitosis: false,
  tmj_disorder: false,
  bruxism: false,
  clenching_habit: false,
  xerostomia: false,
  leukoplakia: false,
  lichen_planus: false,
  mucosal_pigmentation: false,
  tobacco_stains: false,
  medication_related_changes: false,
  nutritional_deficiency_signs: false,
  custom_conditions: [],
  global_conditions_notes: ''
});

// State for 'create' mode
const newExaminationData = reactive(createNewExaminationObject());
const selectedCondition = ref('Healthy');
const otherConditionText = ref('');
const toothImageExists = reactive({});
const newCustomCondition = ref('');
const showInstructions = ref(true); // Show instructions initially, hide after 5 seconds
const activeChartTab = ref('adult');

// Search functionality state
const searchQuery = ref('');
const showSearchDropdown = ref(false);
const showOtherConditionDropdown = ref(false);
const otherConditionQuery = ref('');
const otherConditionFocusedIndex = ref(-1);
const searchFocusedIndex = ref(-1);
const otherConditionInput = ref(null);
const searchInput = ref(null);

// --- STATIC DATA ---
// Predefined conditions with cartoon tooth images (matching RecordDetailView) - Reversed order (newest first)
const predefinedConditionsWithImages = [
  { value: 'Removed', label: 'Removed', color: 'bg-slate-600', image: '/img/cartoon/11_ct.png' },
  { value: 'Root Canal Done', label: 'Root Canal Done', color: 'bg-violet-600', image: '/img/cartoon/9_ct.png' },
  { value: 'Tooth Removed', label: 'Tooth Removed', color: 'bg-slate-600', image: '/img/cartoon/11_ct.png' },
  { value: 'Impacted', label: 'Impacted', color: 'bg-amber-500', image: '/img/cartoon/10_ct.png' },
  { value: 'Root Canal', label: 'Root Canal', color: 'bg-violet-500', image: '/img/cartoon/9_ct.png' },
  { value: 'Fully Decayed', label: 'Fully Decayed', color: 'bg-rose-600', image: '/img/cartoon/8_ct.png' },
  { value: 'Wisdom', label: 'Wisdom', color: 'bg-violet-400', image: '/img/cartoon/6_ct.png' },
  { value: 'Cracked', label: 'Cracked', color: 'bg-orange-400', image: '/img/cartoon/5_ct.png' },
  { value: 'Missing', label: 'Missing', color: 'bg-slate-400', image: '/img/cartoon/4_ct.png' },
  { value: 'Filled', label: 'Filled', color: 'bg-sky-400', image: '/img/cartoon/3_ct.png' },
  { value: 'Decayed', label: 'Decayed', color: 'bg-rose-400', image: '/img/cartoon/2_ct.png' },
  { value: 'Healthy', label: 'Healthy', color: 'bg-emerald-400', image: '/img/cartoon/1_ct.png' }
];

// Additional conditions with images and detailed descriptions (matching RecordDetailView)
const additionalConditions = [
  { 
    number: '12',
    value: 'Stained', 
    label: 'Stained', 
    color: 'bg-yellow-400',
    shortDescription: 'Teeth that look dirty or colored',
    description: 'Teeth that look dirty or colored because of things like coffee, tea, or not brushing well.',
    image: '/img/cartoon/12.png'
  },
  { 
    number: '13',
    value: 'Worn', 
    label: 'Worn', 
    color: 'bg-orange-300',
    shortDescription: 'Teeth that look flat or small',
    description: 'Teeth that look flat or small because they have been used a lot over time.',
    image: '/img/cartoon/13.png'
  },
  { 
    number: '14',
    value: 'Abrasion', 
    label: 'Abrasion', 
    color: 'bg-orange-500',
    shortDescription: 'Part of tooth rubbed away',
    description: 'A part of the tooth is rubbed away, usually from brushing too hard.',
    image: '/img/cartoon/14.png'
  },
  { 
    number: '15',
    value: 'Erosion', 
    label: 'Erosion', 
    color: 'bg-rose-300',
    shortDescription: 'Enamel dissolved by acids',
    description: 'The hard cover of the tooth (enamel) gets slowly dissolved by acids (like from soda or juice).',
    image: '/img/cartoon/15.png'
  },
  { 
    number: '16',
    value: 'Chipped', 
    label: 'Chipped', 
    color: 'bg-amber-400',
    shortDescription: 'Small piece broken off',
    description: 'A small piece of the tooth is broken off, like when biting something hard.',
    image: '/img/cartoon/16.png'
  },
  { 
    number: '18',
    value: 'Fractured Cusp', 
    label: 'Fractured Cusp', 
    color: 'bg-orange-600',
    shortDescription: 'Corner or point breaks off',
    description: 'A corner or point of the tooth breaks off.',
    image: '/img/cartoon/18.png'
  },
  { 
    number: '19',
    value: 'Hypersensitive', 
    label: 'Hypersensitive', 
    color: 'bg-pink-400',
    shortDescription: 'Sharp pain with hot/cold',
    description: 'Teeth that hurt or feel sharp pain when you eat hot, cold, or sweet things.',
    image: '/img/cartoon/19.png'
  },
  { 
    number: '20',
    value: 'Periapical Abscess', 
    label: 'Periapical Abscess', 
    color: 'bg-rose-700',
    shortDescription: 'Painful lump at tooth root',
    description: 'A painful lump filled with pus at the tip of the tooth root caused by infection.',
    image: '/img/cartoon/20.png'
  },
  { 
    number: '22',
    value: 'Gingivitis', 
    label: 'Gingivitis', 
    color: 'bg-pink-300',
    shortDescription: 'Red, swollen gums',
    description: 'Gums look red, swollen, and may bleed when brushing.',
    image: '/img/cartoon/22.png'
  },
  { 
    number: '23',
    value: 'Periodontitis', 
    label: 'Periodontitis', 
    color: 'bg-rose-500',
    shortDescription: 'Serious gum disease',
    description: 'A serious gum disease that makes teeth loose because the bone around them gets weak.',
    image: '/img/cartoon/23.png'
  },
  { 
    number: '27',
    value: 'Pericoronitis', 
    label: 'Pericoronitis', 
    color: 'bg-pink-500',
    shortDescription: 'Swelling around wisdom teeth',
    description: 'Swelling and pain around a tooth that is half-covered by gum (often wisdom teeth).',
    image: '/img/cartoon/27.png'
  },
  { 
    number: '28',
    value: 'Supernumerary', 
    label: 'Supernumerary', 
    color: 'bg-indigo-300',
    shortDescription: 'Extra teeth beyond normal',
    description: 'Extra teeth that grow in addition to the normal set.',
    image: '/img/cartoon/28.png'
  },
  { 
    number: '29',
    value: 'Un-erupted Primary', 
    label: 'Un-erupted Primary', 
    color: 'bg-slate-300',
    shortDescription: 'Baby tooth never came out',
    description: 'A baby tooth that never came out through the gums.',
    image: '/img/cartoon/29.png'
  },
  { 
    number: '30',
    value: 'Retained Primary', 
    label: 'Retained Primary', 
    color: 'bg-slate-400',
    shortDescription: 'Baby tooth didn\'t fall out',
    description: 'A baby tooth that didn\'t fall out even when the adult tooth should replace it.',
    image: '/img/cartoon/30.png'
  },
  { 
    number: '31',
    value: 'Malocclusion', 
    label: 'Malocclusion', 
    color: 'bg-indigo-500',
    shortDescription: 'Teeth don\'t fit properly',
    description: 'Teeth don\'t fit together properly, making the bite look uneven or crowded.',
    image: '/img/cartoon/31.png'
  },
  { 
    number: '32',
    value: 'Attrition', 
    label: 'Attrition', 
    color: 'bg-amber-600',
    shortDescription: 'Teeth wear from grinding',
    description: 'Teeth wear down because they rub against each other too much (like grinding).',
    image: '/img/cartoon/32.png'
  },
  { 
    number: '33',
    value: 'Enamel Hypoplasia', 
    label: 'Enamel Hypoplasia', 
    color: 'bg-yellow-500',
    shortDescription: 'Thin or weak enamel',
    description: 'Teeth that didn\'t grow strong because the enamel (outer cover) is thin or weak.',
    image: '/img/cartoon/33.png'
  },
  { 
    number: '34',
    value: 'Amelogenesis Imperfecta', 
    label: 'Amelogenesis Imperfecta', 
    color: 'bg-yellow-600',
    shortDescription: 'Discolored, fragile teeth',
    description: 'Teeth are discolored and fragile because enamel didn\'t form properly since birth.',
    image: '/img/cartoon/34.png'
  },
  { 
    number: '35',
    value: 'Dentinogenesis Imperfecta', 
    label: 'Dentinogenesis Imperfecta', 
    color: 'bg-blue-400',
    shortDescription: 'Gray/blue, brittle teeth',
    description: 'Teeth look gray or blue and break easily because the inside part (dentin) is weak.',
    image: '/img/cartoon/35.png'
  },
  { 
    number: '36',
    value: 'Gingival Recession', 
    label: 'Gingival Recession', 
    color: 'bg-pink-600',
    shortDescription: 'Gums recede, roots exposed',
    description: 'Gums move down, making the tooth look longer and roots get exposed.',
    image: '/img/cartoon/36.png'
  }
];

const conditions = ref([...predefinedConditionsWithImages, ...additionalConditions, { value: 'other', label: 'Other', color: 'bg-slate-500' }]);

const adultPermanent = {
  upperRight: [18, 17, 16, 15, 14, 13, 12, 11],
  upperLeft: [21, 22, 23, 24, 25, 26, 27, 28],
  lowerRight: [48, 47, 46, 45, 44, 43, 42, 41],
  lowerLeft: [31, 32, 33, 34, 35, 36, 37, 38],
};

const childrenPrimary = {
  upperRight: [55, 54, 53, 52, 51],
  upperLeft: [61, 62, 63, 64, 65],
  lowerRight: [85, 84, 83, 82, 81],
  lowerLeft: [71, 72, 73, 74, 75],
};

// --- COMPUTED PROPERTIES ---
// Tooth conditions from dental records (like DentalChart)
const toothConditions = computed(() => {
  const conditions = {};
  props.records.forEach(record => {
    if (record.tooth_number) {
      // Use the tooth_number from the record level, not treatment level
      const toothNumStr = String(record.tooth_number);
      conditions[toothNumStr] = {
        status: record.status,
        condition: record.condition,
      };
    }
  });
  return conditions;
});

// Search and filter functionality
const filteredPredefinedConditions = computed(() => {
  if (!searchQuery.value) return predefinedConditionsWithImages;
  const query = searchQuery.value.toLowerCase();
  return predefinedConditionsWithImages.filter(condition => 
    condition.label.toLowerCase().includes(query)
  );
});

const filteredAdditionalConditions = computed(() => {
  if (!searchQuery.value) return additionalConditions;
  const query = searchQuery.value.toLowerCase();
  return additionalConditions.filter(condition => 
    condition.label.toLowerCase().includes(query) ||
    (condition.shortDescription && condition.shortDescription.toLowerCase().includes(query))
  );
});

// Other condition suggestions
const otherConditionSuggestions = computed(() => {
  if (!otherConditionQuery.value || otherConditionQuery.value.length < 1) return [];
  
  const query = otherConditionQuery.value.toLowerCase().trim();
  const allKeywords = Array.isArray(keywordsData) ? keywordsData : [];
  
  // Filter keywords based on search query
  const filtered = allKeywords.filter(keyword => 
    keyword.toLowerCase().includes(query) || 
    keyword.toLowerCase().split(' ').some(word => word.startsWith(query))
  );
  
  return filtered.slice(0, 8).map(keyword => ({
    text: keyword,
    value: keyword,
    category: 'Medical Terms'
  }));
});

// Search dropdown suggestions (for main search)
const searchDropdownSuggestions = computed(() => {
  if (!searchQuery.value || searchQuery.value.length < 1) return [];
  
  const query = searchQuery.value.toLowerCase();
  const allConditions = [...predefinedConditionsWithImages, ...additionalConditions];
  
  return allConditions.filter(condition => 
    condition.label.toLowerCase().includes(query) ||
    (condition.shortDescription && condition.shortDescription.toLowerCase().includes(query))
  ).slice(0, 6).map(condition => ({
    text: condition.label,
    value: condition.value,
    description: condition.shortDescription || condition.label,
    category: 'Conditions'
  }));
});


// --- HELPER FUNCTIONS ---
const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';
const getConditionInfo = (val, prop) => {
  const allConditions = [...predefinedConditionsWithImages, ...additionalConditions, { value: 'other', label: 'Other', color: 'bg-slate-500' }];
  return allConditions.find(c => c.value === val)?.[prop] || (prop === 'color' ? 'bg-gray-200' : val);
};

const getConditionRingClass = (condition) => {
  const colorClass = getConditionInfo(condition, 'color');
  return colorClass ? colorClass.replace('bg-', 'ring-') : '';
};

const getToothImagePath = (t) => `/img/teeth/${t}.png`;

// Get current teeth array based on active tab

// --- METHODS ---
const initializeImageStates = () => {
  // Initialize for both adult and children teeth
  allTeeth.forEach(num => { toothImageExists[num] = true; });
  allChildrenTeeth.forEach(num => { toothImageExists[num] = true; });
};
const imageError = (toothNumber) => { toothImageExists[toothNumber] = false; };

// Tooth history methods
const getToothHistoryFromExaminations = (toothNumber) => {
  if (!examinations.value || examinations.value.length === 0) return [];
  
  return examinations.value
    .filter(exam => exam.condition_of_teeth && exam.condition_of_teeth[toothNumber])
    .map(exam => ({
      date: exam.exam_date,
      condition: exam.condition_of_teeth[toothNumber],
      examId: exam.id
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date, newest first
};

const getToothCurrentCondition = (toothNumber) => {
  const pendingCondition = newExaminationData.condition_of_teeth[toothNumber];
  if (mode.value === 'create' && pendingCondition) {
    return pendingCondition;
  }

  const recordCondition = toothConditions.value[String(toothNumber)]?.condition;
  if (recordCondition) {
    return recordCondition;
  }

  return null;
};

// Add methods similar to DentalChart for condition display
const getConditionDisplayLabel = (condition) => {
  if (!condition) return '';
  
  // Use the same condition mapping as DentalChart
  const conditionLabels = {
    'Healthy': 'Healthy',
    'Decayed': 'Decayed', 
    'Filled': 'Filled',
    'Missing': 'Missing',
    'Cracked': 'Cracked',
    'Wisdom': 'Wisdom',
    'Impacted': 'Impacted',
    'Fully Decayed': 'F.Decayed',
    'Root Canal Done': 'Root Canal',
    'Crown': 'Crown',
    'Bridge': 'Bridge',
    'Implant': 'Implant',
    'Removed': 'Removed',
    'Stained': 'Stained',
    'Worn': 'Worn',
    'Abrasion': 'Abrasion',
    'Erosion': 'Erosion',
    'Chipped': 'Chipped',
    'Fractured Cusp': 'F.Cusp',
    'Hypersensitive': 'Sensitive',
    'Periapical Abscess': 'Abscess',
    'Gingivitis': 'Gingivitis',
    'Periodontitis': 'Perio',
    'Pericoronitis': 'P.Corona'
  };
  
  const label = conditionLabels[condition] || condition;
  return label.length > 8 ? label.substring(0, 8) + '...' : label;
};

const getConditionDisplayClass = (condition) => {
  if (!condition) return '';

  const conditionColors = {
    'Healthy': 'bg-emerald-400 text-white',
    'Decayed': 'bg-rose-400 text-white',
    'Filled': 'bg-sky-400 text-white',
    'Missing': 'bg-slate-400 text-white',
    'Cracked': 'bg-orange-400 text-white',
    'Wisdom': 'bg-violet-400 text-white',
    'Impacted': 'bg-amber-500 text-white',
    'Fully Decayed': 'bg-rose-600 text-white',
    'Root Canal Done': 'bg-violet-600 text-white',
    'Removed': 'bg-slate-600 text-white',
    'Crown': 'bg-yellow-500 text-white',
    'Bridge': 'bg-teal-500 text-white',
    'Implant': 'bg-gray-600 text-white',
    'Stained': 'bg-yellow-400 text-white',
    'Worn': 'bg-orange-300 text-white',
    'Abrasion': 'bg-orange-500 text-white',
    'Erosion': 'bg-rose-300 text-white',
    'Chipped': 'bg-amber-400 text-white',
    'Fractured Cusp': 'bg-orange-600 text-white',
    'Hypersensitive': 'bg-pink-400 text-white',
    'Periapical Abscess': 'bg-rose-700 text-white',
    'Gingivitis': 'bg-pink-300 text-white',
    'Periodontitis': 'bg-rose-500 text-white',
    'Pericoronitis': 'bg-pink-500 text-white',
    'Supernumerary': 'bg-indigo-300 text-white',
    'Unerupted Primary': 'bg-slate-300 text-white',
    'Retained Primary': 'bg-slate-400 text-white',
    'Malocclusion': 'bg-indigo-500 text-white',
    'Enamel Hypoplasia': 'bg-yellow-400 text-white'
  };

  return conditionColors[condition] || 'bg-gray-400 text-white';
};

const getToothCardClasses = (toothNumber) => {
  const classes = [
    'bg-white',
    'dark:bg-slate-900',
    'transition-all',
    'duration-200'
  ];

  const recordCondition = toothConditions.value[String(toothNumber)]?.condition;
  const pendingCondition = newExaminationData.condition_of_teeth[toothNumber];
  const hasPendingHighlight =
    mode.value === 'create' && pendingCondition && pendingCondition !== recordCondition;

  if (hasPendingHighlight) {
    const ringClass = getConditionRingClass(pendingCondition) || 'ring-indigo-400';
    classes.push(
      'ring-2',
      ringClass,
      'ring-offset-2',
      'ring-offset-white',
      'dark:ring-offset-slate-900'
    );
  }

  return classes;
};

const handleToothHover = (toothNumber, event) => {
  clearTimeout(hoverTimeout);
  hoveredTooth.value = toothNumber;
  
  // Debug logging to help troubleshoot
  console.log('Hovering over tooth:', toothNumber);
  console.log('Records for this tooth:', getToothTreatments(toothNumber));
  console.log('Tooth status:', getToothStatus(toothNumber));
  console.log('All records:', props.records);
  
  hoverTimeout = setTimeout(() => {
    showHoverSummary.value = true;
  }, 300); // Small delay to prevent flashing
};

const handleToothLeave = () => {
  clearTimeout(hoverTimeout);
  showHoverSummary.value = false;
  hoverTimeout = setTimeout(() => {
    hoveredTooth.value = null;
  }, 200); // Small delay to allow for smooth transitions
};

// Handle right-click to show condition history
const handleToothRightClick = (toothNumber, event) => {
  event.preventDefault();
  showToothConditionHistory(toothNumber, event);
};

// Helper methods for tooth display like DentalChart
const getToothTreatments = (toothNumber) => {
  const toothRecords = props.records.filter(record =>
    String(record.tooth_number) === String(toothNumber)
  );

  const treatments = [];
  toothRecords.forEach(record => {
    if (record.treatments && Array.isArray(record.treatments)) {
      treatments.push(...record.treatments);
    }
  });

  return treatments;
};

const normalizeStatus = (status) => {
  if (!status) return null;
  const normalized = String(status).trim().toLowerCase().replace(/[\s-]+/g, '_');
  const mapping = {
    'in_treatment': 'intreatment',
    'in_progress': 'intreatment',
    'in-progress': 'intreatment',
    'inprogress': 'intreatment',
    'ongoing': 'intreatment',
    'active': 'intreatment',
    'started': 'intreatment',
    'planned': 'diagnosis_planned',
    'planning': 'diagnosis_planned',
    'pending': 'diagnosis_planned',
    'scheduled': 'diagnosis_planned',
    'waiting': 'diagnosis_planned',
    'not_started': 'initial',
    'not-started': 'initial',
    'notstarted': 'initial',
    'new_condition': 'new',
    'newcondition': 'new',
    'complete': 'completed',
    'completed': 'completed',
    'done': 'completed',
    'finished': 'completed'
  };
  return mapping[normalized] || normalized;
};

const getAggregateTreatmentStatus = (treatments) => {
  if (!treatments || treatments.length === 0) return null;

  const statuses = treatments.map(treatment =>
    normalizeStatus(treatment.status) || normalizeStatus(calculateTreatmentStatus(treatment))
  ).filter(Boolean);

  if (statuses.length === 0) return null;

  if (statuses.every(status => status === 'completed')) {
    return 'completed';
  }

  if (statuses.some(status => status === 'intreatment')) {
    return 'intreatment';
  }

  if (statuses.some(status => status === 'diagnosis_planned')) {
    return 'diagnosis_planned';
  }

  if (statuses.some(status => status === 'initial')) {
    return 'initial';
  }

  return statuses[0];
};

const getToothStatus = (toothNumber) => {
  const treatments = getToothTreatments(toothNumber);
  const treatmentStatus = getAggregateTreatmentStatus(treatments);
  if (treatmentStatus) {
    return treatmentStatus;
  }

  const recordStatus = normalizeStatus(toothConditions.value[String(toothNumber)]?.status);
  if (recordStatus) {
    return recordStatus;
  }

  if (mode.value === 'create' && newExaminationData.condition_of_teeth[toothNumber]) {
    return 'new';
  }

  return null;
};

const getStatusLabel = (status) => {
  const normalized = normalizeStatus(status);
  const statusLabels = {
    'initial': 'Initial',
    'diagnosis_planned': 'Planned',
    'intreatment': 'In Treatment',
    'completed': 'Complete',
    'new': 'New Condition'
  };
  if (normalized && statusLabels[normalized]) {
    return statusLabels[normalized];
  }

  if (!normalized) {
    return 'Unknown';
  }

  return normalized.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

const getStatusBadgeClass = (status) => {
  const normalized = normalizeStatus(status);
  const statusClasses = {
    'initial': 'bg-sky-50 text-sky-700 border border-sky-200 shadow-sm',
    'diagnosis_planned': 'bg-purple-50 text-purple-700 border border-purple-200 shadow-sm',
    'intreatment': 'bg-amber-50 text-amber-700 border border-amber-200 shadow-sm',
    'completed': 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm',
    'new': 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm'
  };
  return statusClasses[normalized] || 'bg-gray-50 text-gray-700 border border-gray-200 shadow-sm';
};

const getStatusHeaderBadgeClass = (status) => {
  const normalized = normalizeStatus(status);
  const headerClasses = {
    'initial': 'bg-sky-100 text-sky-800 border border-sky-200 shadow-sm',
    'diagnosis_planned': 'bg-purple-100 text-purple-800 border border-purple-200 shadow-sm',
    'intreatment': 'bg-amber-100 text-amber-800 border border-amber-200 shadow-sm',
    'completed': 'bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm',
    'new': 'bg-indigo-100 text-indigo-800 border border-indigo-200 shadow-sm'
  };
  return headerClasses[normalized] || 'bg-gray-100 text-gray-800 border border-gray-200 shadow-sm';
};

const getQuadrantName = (toothNumber) => {
  const num = Number(toothNumber);
  if (num >= 11 && num <= 18) return 'Upper Right';
  if (num >= 21 && num <= 28) return 'Upper Left';
  if (num >= 31 && num <= 38) return 'Lower Left';
  if (num >= 41 && num <= 48) return 'Lower Right';
  if (num >= 51 && num <= 55) return 'Upper Right Primary';
  if (num >= 61 && num <= 65) return 'Upper Left Primary';
  if (num >= 71 && num <= 75) return 'Lower Left Primary';
  if (num >= 81 && num <= 85) return 'Lower Right Primary';
  return 'Unknown';
};

const getTreatmentTitle = (treatmentType, index, treatment) => {
  if (treatment.treatment_name) return treatment.treatment_name;
  
  const typeLabels = {
    'extraction': 'Tooth Extraction',
    'filling': 'Dental Filling',
    'root_canal': 'Root Canal',
    'crown': 'Crown Placement',
    'cleaning': 'Dental Cleaning',
    'other_treatment': treatment.other_treatment_text || 'Other Treatment'
  };
  
  return typeLabels[treatmentType] || `Treatment ${index + 1}`;
};

const calculateTreatmentStatus = (treatment) => {
  if (treatment.status) return treatment.status;
  
  const totalCost = Number(treatment.cost) || 0;
  const totalPaid = treatment.payments?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;
  
  if (treatment.steps && treatment.steps.length > 0) {
    const allStepsDone = treatment.steps.every(step => step.status === 'done');
    const anyStepInProgress = treatment.steps.some(step => step.status === 'in_progress');
    
    if (allStepsDone) return 'completed';
    if (anyStepInProgress) return 'intreatment';
    return 'diagnosis_planned';
  } else {
    if (totalPaid >= totalCost && totalCost > 0) return 'completed';
    if (totalPaid > 0) return 'intreatment';
    return 'initial';
  }
};

const getFormattedCondition = (conditionValue) => {
  if (!conditionValue) return 'No condition recorded';
  
  const conditionLabels = {
    'Healthy': 'Healthy',
    'Decayed': 'Decayed',
    'Filled': 'Filled',
    'Missing': 'Missing',
    'Cracked': 'Cracked',
    'Wisdom': 'Wisdom Tooth',
    'Impacted': 'Impacted',
    'Fully Decayed': 'Fully Decayed',
    'Root Canal Done': 'Root Canal Done',
    'Removed': 'Removed',
    'other': 'Other Condition'
  };
  
  return conditionLabels[conditionValue] || conditionValue;
};

const handleToothClickForHistory = (toothNumber) => {
  // Open RecordDetailView in a new tab with tooth information
  const url = `/record-detail?tooth=${toothNumber}&patient=${props.patientId}`;
  window.open(url, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
};

const handleToothDoubleClick = (toothNumber) => {
  // For compatibility, also handle double click the same way
  handleToothClickForHistory(toothNumber);
};

const handleToothSingleClick = (toothNumber) => {
  clickCount.value++;
  
  if (clickCount.value === 1) {
    clickTimer.value = setTimeout(() => {
      // Single click action
      if (mode.value === 'create') {
        // Apply condition in create mode
        let conditionToApply = selectedCondition.value;
        
        if (selectedCondition.value === 'other' && otherConditionText.value.trim()) {
          conditionToApply = otherConditionText.value.trim();
        } else if (selectedCondition.value === 'other' && !otherConditionText.value.trim()) {
          clickCount.value = 0;
          return;
        }

        if (newExaminationData.condition_of_teeth[toothNumber] === conditionToApply) {
          delete newExaminationData.condition_of_teeth[toothNumber];
        } else {
          newExaminationData.condition_of_teeth[toothNumber] = conditionToApply;
        }
      }
      // In view mode, single click does nothing
      clickCount.value = 0;
    }, 300); // Wait 300ms to detect double-click
  } else if (clickCount.value === 2) {
    // Double click detected
    clearTimeout(clickTimer.value);
    clickCount.value = 0;
    
    // Open popup for detailed view in both modes
    openRecordDetailPopup(toothNumber);
  }
};

const addCustomCondition = () => {
  if (newCustomCondition.value.trim()) {
    newExaminationData.custom_conditions.push({
      id: Date.now(),
      name: newCustomCondition.value.trim(),
      checked: false
    });
    newCustomCondition.value = '';
  }
};

const removeCustomCondition = (index) => {
  newExaminationData.custom_conditions.splice(index, 1);
};

// Search functionality methods
const onSearchInput = () => {
  showSearchDropdown.value = searchQuery.value.length > 0;
  searchFocusedIndex.value = -1;
};

const onSearchFocus = () => {
  if (searchQuery.value.length > 0) {
    showSearchDropdown.value = true;
  }
};

const onSearchBlur = () => {
  setTimeout(() => {
    showSearchDropdown.value = false;
  }, 150);
};

const onSearchKeydown = (event) => {
  if (!showSearchDropdown.value || searchDropdownSuggestions.value.length === 0) return;
  
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    searchFocusedIndex.value = Math.min(searchFocusedIndex.value + 1, searchDropdownSuggestions.value.length - 1);
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    searchFocusedIndex.value = Math.max(searchFocusedIndex.value - 1, -1);
  } else if (event.key === 'Enter' && searchFocusedIndex.value >= 0) {
    event.preventDefault();
    selectSearchSuggestion(searchDropdownSuggestions.value[searchFocusedIndex.value]);
  } else if (event.key === 'Escape') {
    showSearchDropdown.value = false;
    searchFocusedIndex.value = -1;
  }
};

const selectSearchSuggestion = (suggestion) => {
  selectedCondition.value = suggestion.value;
  searchQuery.value = ''; // Clear search after selection
  showSearchDropdown.value = false;
  searchFocusedIndex.value = -1;
};

// Other condition search methods
const onOtherConditionInput = () => {
  otherConditionText.value = otherConditionQuery.value;
  showOtherConditionDropdown.value = otherConditionQuery.value.length > 0;
  otherConditionFocusedIndex.value = -1;
};

const onOtherConditionFocus = () => {
  if (otherConditionQuery.value.length > 0) {
    showOtherConditionDropdown.value = true;
  }
};

const onOtherConditionBlur = () => {
  setTimeout(() => {
    showOtherConditionDropdown.value = false;
  }, 150);
};

const onOtherConditionKeydown = (event) => {
  if (!showOtherConditionDropdown.value || otherConditionSuggestions.value.length === 0) return;
  
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    otherConditionFocusedIndex.value = Math.min(otherConditionFocusedIndex.value + 1, otherConditionSuggestions.value.length - 1);
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    otherConditionFocusedIndex.value = Math.max(otherConditionFocusedIndex.value - 1, -1);
  } else if (event.key === 'Enter' && otherConditionFocusedIndex.value >= 0) {
    event.preventDefault();
    selectOtherConditionSuggestion(otherConditionSuggestions.value[otherConditionFocusedIndex.value]);
  } else if (event.key === 'Escape') {
    showOtherConditionDropdown.value = false;
    otherConditionFocusedIndex.value = -1;
  }
};

const selectOtherConditionSuggestion = (suggestion) => {
  otherConditionQuery.value = suggestion.text;
  otherConditionText.value = suggestion.text;
  showOtherConditionDropdown.value = false;
  otherConditionFocusedIndex.value = -1;
};

// Watch for condition changes to clear search
watch(selectedCondition, () => {
  if (selectedCondition.value !== 'other') {
    searchQuery.value = '';
    showSearchDropdown.value = false;
  }
});

const handleToothClick = (toothNumber) => {
  // Use single click logic for both create and view modes
  // Single click: condition application (create mode) or nothing (view mode)  
  // Double click: open popup in both modes
  handleToothSingleClick(toothNumber);
};

// Function to open RecordDetailNew as popup
const openRecordDetailPopup = (toothNumber) => {
  selectedToothForRecord.value = toothNumber;
  
  // Find existing record for this tooth or create new one
  const existingRecord = props.records.find(record => 
    String(record.tooth_number) === String(toothNumber)
  );
  
  if (existingRecord) {
    recordDetailData.value = existingRecord;
  } else {
    // Create new record structure for new tooth
    recordDetailData.value = {
      tooth_number: toothNumber,
      patient_id: props.patientId,
      condition: newExaminationData.condition_of_teeth[toothNumber] || 'Healthy',
      status: 'initial',
      treatments: [],
      notes: '',
      diagnosis_notes: ''
    };
  }
  
  showRecordDetailPopup.value = true;
};

// Function to close the popup
const closeRecordDetailPopup = () => {
  showRecordDetailPopup.value = false;
  selectedToothForRecord.value = null;
  recordDetailData.value = null;
};

// Handle ESC key to close popup
const handleEscKey = (event) => {
  if (event.key === 'Escape' && showRecordDetailPopup.value) {
    closeRecordDetailPopup();
  } else if (event.key === 'Escape' && showConditionHistory.value) {
    hideConditionHistory();
  }
};

// Handle record saved from popup
const handleRecordSaved = (savedRecord) => {
  // Update the local records if needed
  emit('record-saved', savedRecord);
  
  // Refresh examination data to show updated conditions
  fetchOralExaminations();
  
  closeRecordDetailPopup();
};

// Handle popup errors
const handlePopupError = (error) => {
  emit('error', error);
};

// Condition history handlers
const showToothConditionHistory = (toothNumber, event) => {
  selectedToothForHistory.value = toothNumber;
  
  // Position the popover near the tooth
  const rect = event.target.getBoundingClientRect();
  historyPopoverPosition.value = {
    x: rect.left + rect.width / 2,
    y: rect.top - 10
  };
  
  showConditionHistory.value = true;
};

const hideConditionHistory = () => {
  showConditionHistory.value = false;
  selectedToothForHistory.value = null;
};

const formatPayload = (data) => {
  const cleanPocketDepths = Object.fromEntries(
    Object.entries(data.pocket_depths).filter(([, value]) => value !== undefined && value !== null)
  );

  const cleanImpactionInfo = Object.fromEntries(
    Object.entries(data.impaction_info).filter(([, value]) => value !== undefined && value !== null)
  );

  const payload = {
    patient_id: props.patientId,
    exam_date: data.exam_date,
    condition_of_teeth: data.condition_of_teeth, // Send as object for API
    extra_oral_findings: data.extra_oral_findings.trim(),
    malocclusion: data.malocclusion,
    // Keep as objects for the API (not arrays) - cleaned of undefined values
    pocket_depths: cleanPocketDepths,
    impaction_info: cleanImpactionInfo,
    // Derive missing teeth from conditions
    missing_teeth: Object.entries(data.condition_of_teeth)
      .filter(([, cond]) => cond === 'missing')
      .map(([tooth]) => tooth),
    // Derive caries from conditions  
    caries_chart: Object.entries(data.condition_of_teeth)
        .filter(([, cond]) => cond === 'caries')
        .reduce((acc, [tooth]) => {
          acc[tooth] = { surfaces: [] }; // Return as object, not array
          return acc;
        }, {}),
    // Add global conditions
    custom_conditions: data.custom_conditions || [],
    global_conditions_notes: data.global_conditions_notes || ''
  };

  // Add all global boolean fields
  globalConditionFields.forEach(field => {
    payload[field] = Boolean(data[field]);
  });

  return payload;
};

const saveNewExamination = async () => {
  saving.value = true;
  error.value = null;
  const payload = formatPayload(newExaminationData);

  try {
    const token = Cookies.get('dental_access_token');
    if (!token) throw new Error('Authentication token not found');

    // Step 1: Save to oral_examinations API
    console.log("Saving to oral_examinations with payload:", payload);
    const oralExamResponse = await axios.post(`${getApiBaseUrl()}/oral-examinations`, payload, { 
      headers: { 'Authorization': `Bearer ${token}` } 
    });

    if (!oralExamResponse.data || !oralExamResponse.data.examination_id) {
      throw new Error('Invalid response from oral examinations API');
    }

    // Step 2: Update dental records with tooth conditions (if any conditions are set)
    if (payload.condition_of_teeth && Object.keys(payload.condition_of_teeth).length > 0) {
      console.log("Updating dental records with tooth conditions:", payload.condition_of_teeth);
      
      // Create dental records payload for each tooth condition
      const dentalRecordPromises = Object.entries(payload.condition_of_teeth).map(async ([toothNumber, condition]) => {
        const dentalRecordPayload = {
          patient_id: props.patientId,
          tooth_number: parseInt(toothNumber),
          condition: condition,
          date: payload.exam_date,
          reason: 'Oral examination findings',
          treatments: [],
          notes: `Condition updated from oral examination on ${payload.exam_date}`,
          attachments: []
        };

        // Save individual dental record
        const dentalRecordUrl = `${getApiBaseUrl()}/patients/${props.patientId}/dental-records`;
        return axios.post(dentalRecordUrl, dentalRecordPayload, { 
          headers: { 'Authorization': `Bearer ${token}` } 
        });
      });

      // Wait for all dental record updates to complete
      await Promise.all(dentalRecordPromises);
      console.log("All dental records updated successfully");
    }

    // Step 3: Create a new record for the UI with the returned ID
    const newRecord = { 
      id: oralExamResponse.data.examination_id, 
      ...payload,
      created_at: new Date().toISOString(),
      patient: {
        first_name: '', // Will be populated when we fetch
        last_name: ''
      }
    };

    // Add to examinations list and select it
    examinations.value.unshift(newRecord);
    selectedExamination.value = newRecord;
    
    // Emit success events
    emit('save', newRecord);
    emit('save-success', 'Oral examination and dental records saved successfully');
    
    // Switch back to view mode
    mode.value = 'view';
    
    console.log("Oral examination and dental records saved successfully");

  } catch (err) {
    console.error("Error saving examination:", err);
    const errorMessage = err.response?.data?.error || err.message || "Failed to save the new examination. Please try again.";
    error.value = errorMessage;
    emit('error', errorMessage);
  } finally {
    saving.value = false;
  }
};

const fetchOralExaminations = async () => {
  if (!props.patientId) return;
  loading.value = true;
  error.value = null;
  try {
    const token = Cookies.get('dental_access_token');
    if (!token) {
      error.value = "Authentication token not found";
      return;
    }

    // Fetch oral examinations for this patient using the GET API
    const response = await axios.get(`${getApiBaseUrl()}/oral-examinations?patient_id=${props.patientId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.data && response.data.examinations && Array.isArray(response.data.examinations)) {
      // Use the examinations array from the response
      examinations.value = response.data.examinations.sort((a, b) => new Date(b.exam_date) - new Date(a.exam_date));
      selectedExamination.value = examinations.value[0] || null;
      console.log("Fetched oral examinations:", examinations.value);
    } else if (response.data && Array.isArray(response.data)) {
      // Fallback for older API response format
      examinations.value = response.data.sort((a, b) => new Date(b.exam_date) - new Date(a.exam_date));
      selectedExamination.value = examinations.value[0] || null;
    } else {
      examinations.value = [];
      selectedExamination.value = null;
    }
  } catch (err) {
    console.error("Error fetching examinations:", err);
    if (err.response?.status === 404) {
      // No examinations found - this is normal for new patients
      examinations.value = [];
      selectedExamination.value = null;
    } else {
      error.value = err.response?.data?.error || "Failed to load examinations.";
    }
  } finally {
    loading.value = false;
  }
};

watch(() => props.patientId, fetchOralExaminations, { immediate: true });
onMounted(() => {
  console.log('OralExaminationForm mounted with patientId:', props.patientId);
  console.log('Props records:', props.records);
  initializeImageStates();
  
  // Add ESC key listener for popup
  document.addEventListener('keydown', handleEscKey);
  
  // Auto-hide instructions after 5 seconds
  setTimeout(() => {
    showInstructions.value = false;
  }, 5000);
});

// Clean up event listener on unmount
onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleEscKey);
});

// Add a method to handle close events with debugging
const handleClose = () => {
  console.log('OralExaminationForm: Close event triggered');
  emit('close');
};
</script>

<template>
  <!-- Modal Overlay -->
  <div class="fixed inset-0 z-50 overflow-hidden">
    <!-- Background Overlay -->
    <div class="absolute inset-0 bg-black bg-opacity-50" @click="handleClose"></div>
    
    <!-- Modal Container -->
    <div class="relative h-full w-full">
      <div class="bg-white dark:bg-gray-900 w-full h-full flex flex-col">
        <!-- Header -->
        <header class="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
              <Stethoscope class="h-6 w-6 mr-3 text-blue-600" />
              Oral Health Examination
            </h2>
            <div class="flex items-center gap-4">
              <button @click="handleClose" class="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                 <X class="h-5 w-5"/>
              </button>
            </div>
          </div>
        </header>

        <!-- Main Content -->
        <main class="flex-grow overflow-hidden">
          <div v-if="loading" class="flex justify-center items-center h-full"><LoaderCircle class="h-8 w-8 animate-spin text-blue-500" /></div>
          <div v-else-if="error" class="p-6 bg-red-50 text-red-700 rounded-md m-4"><CircleAlert class="h-5 w-5 mr-2" />{{ error }}</div>

          <!-- CREATE MODE -->
          <!-- CREATE MODE -->
          <div class="h-full flex flex-col overflow-hidden">
            <!-- Top Section: Condition Selector and Chart -->
            <div class="flex-grow overflow-hidden grid grid-cols-12 gap-0">
              <!-- Left Panel: Controls & Forms (Reduced width) -->
              <div class="col-span-12 lg:col-span-3 bg-white dark:bg-gray-800/50 p-4 overflow-y-auto">
                <div class="space-y-6">
                  <!-- Examination Date -->
                  <div>
                    <h4 class="font-semibold mb-2 flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                      <Calendar class="h-5 w-5 text-emerald-600"/>
                      Examination Date
                    </h4>
                    <input 
                      type="date" 
                      v-model="newExaminationData.exam_date" 
                      class="w-full p-3 border-2 rounded-lg bg-white dark:bg-gray-700 border-emerald-300 dark:border-emerald-600 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-colors"
                    />
                  </div>

                  <!-- Condition Selector -->
                  <div>
                    <h4 class="font-semibold mb-3 flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                      <span class="flex items-center justify-center w-6 h-6 bg-indigo-100 dark:bg-indigo-900 rounded-full text-sm font-bold text-indigo-600 dark:text-indigo-300">1</span>
                      Select Condition
                    </h4>
                    
                    <!-- Search Box -->
                    <div class="mb-4 relative">
                      <div class="search-input-wrapper">
                        <input 
                          ref="searchInput"
                          type="text" 
                          v-model="searchQuery"
                          @input="onSearchInput"
                          @keydown="onSearchKeydown"
                          @focus="onSearchFocus"
                          @blur="onSearchBlur"
                          class="condition-search-input w-full" 
                          placeholder="Search conditions..."
                          autocomplete="off"
                        />
                        <Search class="search-icon" :size="18" />
                      </div>
                      
                      <!-- Search Dropdown -->
                      <div v-if="showSearchDropdown && searchDropdownSuggestions.length > 0" class="search-dropdown">
                        <div
                          v-for="(suggestion, index) in searchDropdownSuggestions"
                          :key="suggestion.value + index"
                          :class="['search-dropdown-item', { 'focused': index === searchFocusedIndex }]"
                          @mousedown.prevent="selectSearchSuggestion(suggestion)"
                          @mouseenter="searchFocusedIndex = index"
                        >
                          <div class="dropdown-condition-info">
                            <div class="dropdown-condition-name">{{ suggestion.text }}</div>
                            <div class="dropdown-condition-description">{{ suggestion.description }}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Conditions with Images -->
                    <div class="grid grid-cols-3 gap-2 mb-4">
                      <button
                        v-for="cond in filteredPredefinedConditions"
                        :key="cond.value"
                        @click="selectedCondition = cond.value"
                        :class="['rounded-2xl border-2 flex items-center justify-center h-28 transition-all duration-200 overflow-hidden', selectedCondition === cond.value ? `${cond.color} border-transparent shadow-lg` : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 hover:scale-102']"
                      >
                        <img :src="cond.image" :alt="cond.label" class="w-full h-full object-contain rounded-2xl" @error="(e) => e.target.style.display = 'none'" />
                      </button>
                    </div>

                    <!-- Additional Conditions with Images (same layout as predefined) -->
                    <div class="grid grid-cols-3 gap-2 mb-4">
                      <button
                        v-for="cond in filteredAdditionalConditions"
                        :key="cond.value"
                        @click="selectedCondition = cond.value"
                        :class="['rounded-2xl border-2 flex items-center justify-center h-28 transition-all duration-200 overflow-hidden', selectedCondition === cond.value ? `${cond.color} border-transparent shadow-lg` : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 hover:scale-102']"
                        :title="cond.shortDescription"
                      >
                        <img
                          v-if="cond.image"
                          :src="cond.image"
                          :alt="cond.label"
                          class="w-full h-full object-contain rounded-2xl"
                          @error="(e) => e.target.style.display = 'none'"
                        />
                        <div
                          v-else
                          class="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-2xl flex items-center justify-center text-2xl"
                        >
                          🦷
                        </div>
                      </button>
                    </div>

                    <!-- Other Condition -->
                    <div class="space-y-2">
                      <button
                        @click="selectedCondition = 'other'"
                        :class="['w-full p-2 text-sm font-medium rounded-lg border-2', selectedCondition === 'other' ? 'bg-slate-500 text-white border-transparent shadow' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300']"
                      >
                        Other Condition
                      </button>
                      <div v-if="selectedCondition === 'other'" class="mt-2 relative">
                        <div class="other-condition-search-container">
                          <div class="search-input-wrapper">
                            <input 
                              ref="otherConditionInput"
                              type="text" 
                              v-model="otherConditionQuery"
                              @input="onOtherConditionInput"
                              @keydown="onOtherConditionKeydown"
                              @focus="onOtherConditionFocus"
                              @blur="onOtherConditionBlur"
                              placeholder="Search medical terms and describe condition..." 
                              class="condition-search-input w-full"
                              autocomplete="off"
                            />
                            <Search class="search-icon" :size="16" />
                          </div>
                          
                          <!-- Other Condition Search Dropdown -->
                          <div v-if="showOtherConditionDropdown && otherConditionSuggestions.length > 0" class="search-dropdown">
                            <div
                              v-for="(suggestion, index) in otherConditionSuggestions"
                              :key="suggestion.value + index"
                              :class="['search-dropdown-item', { 'focused': index === otherConditionFocusedIndex }]"
                              @mousedown.prevent="selectOtherConditionSuggestion(suggestion)"
                              @mouseenter="otherConditionFocusedIndex = index"
                            >
                              <div class="dropdown-condition-info">
                                <div class="dropdown-condition-name">{{ suggestion.text }}</div>
                                <div class="dropdown-condition-description">{{ suggestion.category }}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right Panel: Dental Chart (Increased width) -->
              <div class="col-span-12 lg:col-span-9 p-4 overflow-y-auto relative">
                
                <div class="flex flex-col items-center space-y-6">
                  
                  <!-- Dental Chart with full width -->
                  <div class="bg-white dark:bg-gray-800 rounded-xl p-0 shadow-lg border border-gray-200 dark:border-gray-700 w-full">
                      
                      <!-- Header with Title and Instructions -->
                      <div class="flex justify-between items-center mb-3">
 
                        <!-- Instructions that auto-hide after 5 seconds -->
                        <div v-if="showInstructions" class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 transition-all duration-500">
                          <div class="flex items-center justify-center gap-6 text-sm text-blue-700 dark:text-blue-300">
                            <span>👆 <strong>Click:</strong> Apply condition</span>
                            <span>🖱️ <strong>Double-click:</strong> Open record detail</span>
                            <span>� <strong>Hover:</strong> Show treatment summary</span>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Chart view toggle -->
                      <div class="flex justify-center mb-6">
                        <div class="inline-flex rounded-full border border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-800/60 p-1 shadow-sm">
                          <button
                            type="button"
                            @click="activeChartTab = 'adult'"
                            :class="[
                              'px-5 py-2 text-sm font-semibold rounded-full transition-colors duration-200',
                              activeChartTab === 'adult'
                                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow'
                                : 'text-slate-600 dark:text-slate-300'
                            ]"
                          >
                            Adult Teeth
                          </button>
                          <button
                            type="button"
                            @click="activeChartTab = 'children'"
                            :class="[
                              'px-5 py-2 text-sm font-semibold rounded-full transition-colors duration-200',
                              activeChartTab === 'children'
                                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow'
                                : 'text-slate-600 dark:text-slate-300'
                            ]"
                          >
                            Children Teeth
                          </button>
                        </div>
                      </div>

                      <div v-if="activeChartTab === 'adult'" class="space-y-10">
                        <!-- Adult Upper Jaw -->
                        <section>
                          <div class="text-center mb-4">
                            <span class="font-semibold text-lg text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2">
                              <span class="w-2 h-2 bg-slate-600 rounded-full"></span>
                              Upper Jaw
                              <span class="w-2 h-2 bg-slate-600 rounded-full"></span>
                            </span>
                          </div>
                          <div class="relative max-w-7xl mx-auto px-2 sm:px-4">
                            <div class="pointer-events-none absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 border-l-2 border-dashed border-gray-400 dark:border-gray-500 z-30"></div>
                            <div class="pointer-events-none absolute top-2 left-2 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900 px-3 py-1.5 rounded-lg shadow-sm">Q2</div>
                            <div class="pointer-events-none absolute top-2 right-2 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900 px-3 py-1.5 rounded-lg shadow-sm">Q1</div>
                            <div class="relative flex justify-center gap-14 py-8 z-10">
                              <div class="flex gap-5">
                                <div
                                  v-for="tooth in adultPermanent.upperRight"
                                  :key="`chart-${tooth}`"
                                  @click="handleToothClick(tooth)"
                                  @dblclick="openRecordDetailPopup(tooth)"
                                  @mouseenter="handleToothHover(tooth, $event)"
                                  @mouseleave="handleToothLeave"
                                  @contextmenu="handleToothRightClick(tooth, $event)"
                                  class="cursor-pointer text-center relative group transition-all duration-200 hover:-translate-y-1 hover:z-10"
                                >
                                  <div class="relative flex flex-col items-center">
                                    <div
                                      class="relative w-20 h-24 mx-auto flex items-center justify-center rounded-xl transition-all duration-200"
                                      :class="getToothCardClasses(tooth)"
                                    >
                                      <img
                                        v-if="toothImageExists[tooth]"
                                        :src="getToothImagePath(tooth)"
                                        @error="imageError(tooth)"
                                        class="w-full h-full object-contain transition-all duration-200 group-hover:scale-105"
                                      />
                                      <div v-else class="flex items-center justify-center w-full h-full text-3xl text-gray-400 dark:text-gray-500">
                                        🦷
                                      </div>
                                    </div>
                                  </div>
                                  <div class="mt-2 text-center">
                                    <span class="block text-xs text-gray-700 dark:text-gray-300 font-semibold transition-colors duration-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">{{ tooth }}</span>
                                  </div>
                                  <div class="mt-1 min-h-[18px]">
                                    <div
                                      v-if="getToothCurrentCondition(tooth)"
                                      class="text-xs font-medium px-2 py-0.5 rounded"
                                      :class="getConditionDisplayClass(getToothCurrentCondition(tooth))"
                                    >
                                      {{ getConditionDisplayLabel(getToothCurrentCondition(tooth)) }}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div class="flex gap-5">
                                <div
                                  v-for="tooth in adultPermanent.upperLeft"
                                  :key="`chart-${tooth}`"
                                  @click="handleToothClick(tooth)"
                                  @dblclick="openRecordDetailPopup(tooth)"
                                  @mouseenter="handleToothHover(tooth, $event)"
                                  @mouseleave="handleToothLeave"
                                  @contextmenu="handleToothRightClick(tooth, $event)"
                                  class="cursor-pointer text-center relative group transition-all duration-200 hover:-translate-y-1 hover:z-10"
                                >
                                  <div class="relative flex flex-col items-center">
                                    <div
                                      class="relative w-20 h-24 mx-auto flex items-center justify-center rounded-xl transition-all duration-200"
                                      :class="getToothCardClasses(tooth)"
                                    >
                                      <img
                                        v-if="toothImageExists[tooth]"
                                        :src="getToothImagePath(tooth)"
                                        @error="imageError(tooth)"
                                        class="w-full h-full object-contain transition-all duration-200 group-hover:scale-105"
                                      />
                                      <div v-else class="flex items-center justify-center w-full h-full text-3xl text-gray-400 dark:text-gray-500">
                                        🦷
                                      </div>
                                    </div>
                                  </div>
                                  <div class="mt-2 text-center">
                                    <span class="block text-xs text-gray-700 dark:text-gray-300 font-semibold transition-colors duration-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">{{ tooth }}</span>
                                  </div>
                                  <div class="mt-1 min-h-[18px]">
                                    <div
                                      v-if="getToothCurrentCondition(tooth)"
                                      class="text-xs font-medium px-2 py-0.5 rounded"
                                      :class="getConditionDisplayClass(getToothCurrentCondition(tooth))"
                                    >
                                      {{ getConditionDisplayLabel(getToothCurrentCondition(tooth)) }}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </section>

                        <div class="relative my-3 max-w-7xl mx-auto h-5 px-2 sm:px-4">
                          <div class="pointer-events-none absolute inset-x-2 sm:inset-x-4 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-gray-400 dark:border-gray-500 z-30"></div>
                          <div class="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 border-l-2 border-dashed border-gray-400 dark:border-gray-500 z-30"></div>
                        </div>

                        <!-- Adult Lower Jaw -->
                        <section>
                          <div class="text-center mb-4">
                            <span class="font-semibold text-lg text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2">
                              <span class="w-2 h-2 bg-slate-600 rounded-full"></span>
                              Lower Jaw
                              <span class="w-2 h-2 bg-slate-600 rounded-full"></span>
                            </span>
                          </div>
                          <div class="relative max-w-7xl mx-auto px-2 sm:px-4">
                            <div class="pointer-events-none absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 border-l-2 border-dashed border-gray-400 dark:border-gray-500 z-30"></div>
                            <div class="pointer-events-none absolute bottom-2 left-2 text-xs font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 px-3 py-1.5 rounded-lg shadow-sm">Q3</div>
                            <div class="pointer-events-none absolute bottom-2 right-2 text-xs font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 px-3 py-1.5 rounded-lg shadow-sm">Q4</div>
                            <div class="relative flex justify-center gap-14 py-8 z-10">
                              <div class="flex gap-5">
                                <div
                                  v-for="tooth in adultPermanent.lowerRight.slice().reverse()"
                                  :key="`chart-${tooth}`"
                                  @click="handleToothClick(tooth)"
                                  @dblclick="openRecordDetailPopup(tooth)"
                                  @mouseenter="handleToothHover(tooth, $event)"
                                  @mouseleave="handleToothLeave"
                                  @contextmenu="handleToothRightClick(tooth, $event)"
                                  class="cursor-pointer text-center relative group transition-all duration-200 hover:-translate-y-1 hover:z-10"
                                >
                                  <div class="relative flex flex-col items-center">
                                    <div
                                      class="relative w-20 h-24 mx-auto flex items-center justify-center rounded-xl transition-all duration-200"
                                      :class="getToothCardClasses(tooth)"
                                    >
                                      <img
                                        v-if="toothImageExists[tooth]"
                                        :src="getToothImagePath(tooth)"
                                        @error="imageError(tooth)"
                                        :alt="'Tooth ' + tooth"
                                        class="w-full h-full object-contain transition-all duration-200 group-hover:scale-105"
                                      />
                                      <div v-else class="flex items-center justify-center w-full h-full text-3xl text-gray-400 dark:text-gray-500">🦷</div>
                                    </div>
                                  </div>
                                  <div class="mt-2 text-center">
                                    <span class="block text-xs text-gray-700 dark:text-gray-300 font-semibold transition-colors duration-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">{{ tooth }}</span>
                                  </div>
                                  <div class="mt-1 min-h-[18px]">
                                    <div
                                      v-if="getToothCurrentCondition(tooth)"
                                      class="text-xs font-medium px-2 py-0.5 rounded"
                                      :class="getConditionDisplayClass(getToothCurrentCondition(tooth))"
                                    >
                                      {{ getConditionDisplayLabel(getToothCurrentCondition(tooth)) }}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div class="flex gap-5">
                                <div
                                  v-for="tooth in adultPermanent.lowerLeft.slice().reverse()"
                                  :key="`chart-${tooth}`"
                                  @click="handleToothClick(tooth)"
                                  @dblclick="openRecordDetailPopup(tooth)"
                                  @mouseenter="handleToothHover(tooth, $event)"
                                  @mouseleave="handleToothLeave"
                                  @contextmenu="handleToothRightClick(tooth, $event)"
                                  class="cursor-pointer text-center relative group transition-all duration-200 hover:-translate-y-1 hover:z-10"
                                >
                                  <div class="relative flex flex-col items-center">
                                    <div
                                      class="relative w-20 h-24 mx-auto flex items-center justify-center rounded-xl transition-all duration-200"
                                      :class="getToothCardClasses(tooth)"
                                    >
                                      <img
                                        v-if="toothImageExists[tooth]"
                                        :src="getToothImagePath(tooth)"
                                        @error="imageError(tooth)"
                                        :alt="'Tooth ' + tooth"
                                        class="w-full h-full object-contain transition-all duration-200 group-hover:scale-105"
                                      />
                                      <div v-else class="flex items-center justify-center w-full h-full text-3xl text-gray-400 dark:text-gray-500">🦷</div>
                                    </div>
                                  </div>
                                  <div class="mt-2 text-center">
                                    <span class="block text-xs text-gray-700 dark:text-gray-300 font-semibold transition-colors duration-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">{{ tooth }}</span>
                                  </div>
                                  <div class="mt-1 min-h-[18px]">
                                    <div
                                      v-if="getToothCurrentCondition(tooth)"
                                      class="text-xs font-medium px-2 py-0.5 rounded"
                                      :class="getConditionDisplayClass(getToothCurrentCondition(tooth))"
                                    >
                                      {{ getConditionDisplayLabel(getToothCurrentCondition(tooth)) }}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </section>
                      </div>

                      <div v-else class="space-y-10">
                        <!-- Children Upper Jaw -->
                        <section>
                          <div class="text-center mb-4">
                            <span class="font-semibold text-lg text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2">
                              <span class="w-2 h-2 bg-slate-600 rounded-full"></span>
                              Upper Jaw (Primary)
                              <span class="w-2 h-2 bg-slate-600 rounded-full"></span>
                            </span>
                          </div>
                          <div class="relative max-w-5xl mx-auto px-2 sm:px-4">
                            <div class="pointer-events-none absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 border-l-2 border-dashed border-gray-400 dark:border-gray-500 z-30"></div>
                            <div class="pointer-events-none absolute top-2 left-2 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900 px-3 py-1.5 rounded-lg shadow-sm">Q2</div>
                            <div class="pointer-events-none absolute top-2 right-2 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900 px-3 py-1.5 rounded-lg shadow-sm">Q1</div>
                            <div class="relative flex justify-center gap-12 py-8 z-10">
                              <div class="flex gap-5">
                                <div
                                  v-for="tooth in childrenPrimary.upperRight"
                                  :key="`chart-${tooth}`"
                                  @click="handleToothClick(tooth)"
                                  @dblclick="openRecordDetailPopup(tooth)"
                                  @mouseenter="handleToothHover(tooth, $event)"
                                  @mouseleave="handleToothLeave"
                                  @contextmenu="handleToothRightClick(tooth, $event)"
                                  class="cursor-pointer text-center relative group transition-all duration-200 hover:-translate-y-1 hover:z-10"
                                >
                                  <div class="relative flex flex-col items-center">
                                    <div
                                      class="relative w-20 h-24 mx-auto flex items-center justify-center rounded-xl transition-all duration-200"
                                      :class="getToothCardClasses(tooth)"
                                    >
                                      <img
                                        v-if="toothImageExists[tooth]"
                                        :src="getToothImagePath(tooth)"
                                        @error="imageError(tooth)"
                                        :alt="'Tooth ' + tooth"
                                        class="w-full h-full object-contain transition-all duration-200 group-hover:scale-105"
                                      />
                                      <div v-else class="flex items-center justify-center w-full h-full text-3xl text-gray-400 dark:text-gray-500">🦷</div>
                                    </div>
                                  </div>
                                  <div class="mt-2 text-center">
                                    <span class="block text-xs text-gray-700 dark:text-gray-300 font-semibold transition-colors duration-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">{{ tooth }}</span>
                                  </div>
                                  <div class="mt-1 min-h-[18px]">
                                    <div
                                      v-if="getToothCurrentCondition(tooth)"
                                      class="text-xs font-medium px-2 py-0.5 rounded"
                                      :class="getConditionDisplayClass(getToothCurrentCondition(tooth))"
                                    >
                                      {{ getConditionDisplayLabel(getToothCurrentCondition(tooth)) }}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div class="flex gap-5">
                                <div
                                  v-for="tooth in childrenPrimary.upperLeft"
                                  :key="`chart-${tooth}`"
                                  @click="handleToothClick(tooth)"
                                  @dblclick="openRecordDetailPopup(tooth)"
                                  @mouseenter="handleToothHover(tooth, $event)"
                                  @mouseleave="handleToothLeave"
                                  @contextmenu="handleToothRightClick(tooth, $event)"
                                  class="cursor-pointer text-center relative group transition-all duration-200 hover:-translate-y-1 hover:z-10"
                                >
                                  <div class="relative flex flex-col items-center">
                                    <div
                                      class="relative w-20 h-24 mx-auto flex items-center justify-center rounded-xl transition-all duration-200"
                                      :class="getToothCardClasses(tooth)"
                                    >
                                      <img
                                        v-if="toothImageExists[tooth]"
                                        :src="getToothImagePath(tooth)"
                                        @error="imageError(tooth)"
                                        :alt="'Tooth ' + tooth"
                                        class="w-full h-full object-contain transition-all duration-200 group-hover:scale-105"
                                      />
                                      <div v-else class="flex items-center justify-center w-full h-full text-3xl text-gray-400 dark:text-gray-500">🦷</div>
                                    </div>
                                  </div>
                                  <div class="mt-2 text-center">
                                    <span class="block text-xs text-gray-700 dark:text-gray-300 font-semibold transition-colors duration-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">{{ tooth }}</span>
                                  </div>
                                  <div class="mt-1 min-h-[18px]">
                                    <div
                                      v-if="getToothCurrentCondition(tooth)"
                                      class="text-xs font-medium px-2 py-0.5 rounded"
                                      :class="getConditionDisplayClass(getToothCurrentCondition(tooth))"
                                    >
                                      {{ getConditionDisplayLabel(getToothCurrentCondition(tooth)) }}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </section>

                        <div class="relative my-3 max-w-5xl mx-auto h-5 px-2 sm:px-4">
                          <div class="pointer-events-none absolute inset-x-2 sm:inset-x-4 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-gray-400 dark:border-gray-500 z-30"></div>
                          <div class="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 border-l-2 border-dashed border-gray-400 dark:border-gray-500 z-30"></div>
                        </div>

                        <!-- Children Lower Jaw -->
                        <section>
                          <div class="text-center mb-4">
                            <span class="font-semibold text-lg text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2">
                              <span class="w-2 h-2 bg-slate-600 rounded-full"></span>
                              Lower Jaw (Primary)
                              <span class="w-2 h-2 bg-slate-600 rounded-full"></span>
                            </span>
                          </div>
                          <div class="relative max-w-5xl mx-auto px-2 sm:px-4">
                            <div class="pointer-events-none absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 border-l-2 border-dashed border-gray-400 dark:border-gray-500 z-30"></div>
                            <div class="pointer-events-none absolute bottom-2 left-2 text-xs font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 px-3 py-1.5 rounded-lg shadow-sm">Q3</div>
                            <div class="pointer-events-none absolute bottom-2 right-2 text-xs font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 px-3 py-1.5 rounded-lg shadow-sm">Q4</div>
                            <div class="relative flex justify-center gap-12 py-8 z-10">
                              <div class="flex gap-5">
                                <div
                                  v-for="tooth in childrenPrimary.lowerRight.slice().reverse()"
                                  :key="`chart-${tooth}`"
                                  @click="handleToothClick(tooth)"
                                  @dblclick="openRecordDetailPopup(tooth)"
                                  @mouseenter="handleToothHover(tooth, $event)"
                                  @mouseleave="handleToothLeave"
                                  @contextmenu="handleToothRightClick(tooth, $event)"
                                  class="cursor-pointer text-center relative group transition-all duration-200 hover:-translate-y-1 hover:z-10"
                                >
                                  <div class="relative flex flex-col items-center">
                                    <div
                                      class="relative w-20 h-24 mx-auto flex items-center justify-center rounded-xl transition-all duration-200"
                                      :class="getToothCardClasses(tooth)"
                                    >
                                      <img
                                        v-if="toothImageExists[tooth]"
                                        :src="getToothImagePath(tooth)"
                                        @error="imageError(tooth)"
                                        :alt="'Tooth ' + tooth"
                                        class="w-full h-full object-contain transition-all duration-200 group-hover:scale-105"
                                      />
                                      <div v-else class="flex items-center justify-center w-full h-full text-3xl text-gray-400 dark:text-gray-500">🦷</div>
                                    </div>
                                  </div>
                                  <div class="mt-2 text-center">
                                    <span class="block text-xs text-gray-700 dark:text-gray-300 font-semibold transition-colors duration-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">{{ tooth }}</span>
                                  </div>
                                  <div class="mt-1 min-h-[18px]">
                                    <div
                                      v-if="getToothCurrentCondition(tooth)"
                                      class="text-xs font-medium px-2 py-0.5 rounded"
                                      :class="getConditionDisplayClass(getToothCurrentCondition(tooth))"
                                    >
                                      {{ getConditionDisplayLabel(getToothCurrentCondition(tooth)) }}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div class="flex gap-5">
                                <div
                                  v-for="tooth in childrenPrimary.lowerLeft.slice().reverse()"
                                  :key="`chart-${tooth}`"
                                  @click="handleToothClick(tooth)"
                                  @dblclick="openRecordDetailPopup(tooth)"
                                  @mouseenter="handleToothHover(tooth, $event)"
                                  @mouseleave="handleToothLeave"
                                  @contextmenu="handleToothRightClick(tooth, $event)"
                                  class="cursor-pointer text-center relative group transition-all duration-200 hover:-translate-y-1 hover:z-10"
                                >
                                  <div class="relative flex flex-col items-center">
                                    <div
                                      class="relative w-20 h-24 mx-auto flex items-center justify-center rounded-xl transition-all duration-200"
                                      :class="getToothCardClasses(tooth)"
                                    >
                                      <img
                                        v-if="toothImageExists[tooth]"
                                        :src="getToothImagePath(tooth)"
                                        @error="imageError(tooth)"
                                        :alt="'Tooth ' + tooth"
                                        class="w-full h-full object-contain transition-all duration-200 group-hover:scale-105"
                                      />
                                      <div v-else class="flex items-center justify-center w-full h-full text-3xl text-gray-400 dark:text-gray-500">🦷</div>
                                    </div>
                                  </div>
                                  <div class="mt-2 text-center">
                                    <span class="block text-xs text-gray-700 dark:text-gray-300 font-semibold transition-colors duration-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">{{ tooth }}</span>
                                  </div>
                                  <div class="mt-1 min-h-[18px]">
                                    <div
                                      v-if="getToothCurrentCondition(tooth)"
                                      class="text-xs font-medium px-2 py-0.5 rounded"
                                      :class="getConditionDisplayClass(getToothCurrentCondition(tooth))"
                                    >
                                      {{ getConditionDisplayLabel(getToothCurrentCondition(tooth)) }}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </section>
                      </div>
                  <!-- Spacer below dental chart -->
                  <div class="h-4"></div>

                  <!-- Improved Layout for Better Organization -->
                  <div class="w-full">
                    <div class="space-y-4">
                      
                      <!-- First Row: Malocclusion and General Oral Conditions -->
                      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <!-- Malocclusion Assessment (Left) -->
                        <div class="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-6 shadow-lg">
                          <h4 class="font-semibold mb-4 flex items-center gap-3 text-orange-800 dark:text-orange-300 border-b-2 border-orange-200 dark:border-orange-700 pb-3">
                            <div class="flex items-center justify-center w-10 h-10 bg-orange-200 dark:bg-orange-800 rounded-full">
                              <Activity class="h-5 w-5 text-orange-600 dark:text-orange-400"/>
                            </div>
                            <span class="text-lg">Malocclusion Assessment</span>
                          </h4>
                          <div class="grid grid-cols-2 gap-3">
                            <label v-for="(value, key) in newExaminationData.malocclusion" :key="key" class="flex items-center space-x-3 p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer hover:border-orange-300 dark:hover:border-orange-600 border border-transparent">
                              <input type="checkbox" v-model="newExaminationData.malocclusion[key]" class="rounded-md text-orange-500 focus:ring-orange-500 focus:ring-2 border-0 focus:border-0 cursor-pointer w-4 h-4"/>
                              <span class="text-sm font-medium capitalize text-gray-700 dark:text-gray-300 cursor-pointer">{{ key.replace(/_/g, ' ') }}</span>
                            </label>
                          </div>
                        </div>

                        <!-- General Oral Conditions (Right) -->
                        <div class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 shadow-lg">
                          <h4 class="font-semibold mb-4 flex items-center gap-3 text-blue-800 dark:text-blue-300 border-b-2 border-blue-200 dark:border-blue-700 pb-3">
                            <div class="flex items-center justify-center w-10 h-10 bg-blue-200 dark:bg-blue-800 rounded-full">
                              <AlertTriangle class="h-5 w-5 text-blue-600 dark:text-blue-400"/>
                            </div>
                            <span class="text-lg">General Oral Conditions</span>
                          </h4>
                          <div class="grid grid-cols-2 gap-3">
                            <label v-for="field in globalConditionFields" :key="field" class="flex items-center space-x-3 p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer border border-transparent hover:border-blue-300 dark:hover:border-blue-600">
                              <input type="checkbox" v-model="newExaminationData[field]" class="rounded-md text-blue-500 focus:ring-blue-500 focus:ring-2 border-0 focus:border-0 cursor-pointer w-4 h-4"/>
                              <span class="text-sm font-medium capitalize text-gray-700 dark:text-gray-300 cursor-pointer">{{ field.replace(/_/g, ' ') }}</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      <!-- Custom Conditions and Clinical Notes -->
                      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <!-- Custom Conditions -->
                        <div class="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6 shadow-lg">
                          <h4 class="font-semibold mb-4 flex items-center gap-3 text-purple-800 dark:text-purple-300 border-b-2 border-purple-200 dark:border-purple-700 pb-3">
                            <div class="flex items-center justify-center w-10 h-10 bg-purple-200 dark:bg-purple-800 rounded-full">
                              <Plus class="h-5 w-5 text-purple-600 dark:text-purple-400"/>
                            </div>
                            <span class="text-lg">Custom Conditions</span>
                          </h4>
                          <div class="flex gap-2 mb-4">
                            <input 
                              type="text" 
                              v-model="newCustomCondition" 
                              placeholder="Add custom condition..." 
                              @keypress.enter="addCustomCondition"
                              class="flex-1 text-sm p-3 border border-purple-300 dark:border-purple-600 rounded-lg bg-white/80 dark:bg-gray-800/80 focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                            />
                            <button 
                              @click="addCustomCondition" 
                              class="px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium shadow-sm"
                            >
                              Add
                            </button>
                          </div>
                          <div class="space-y-2 max-h-48 overflow-y-auto">
                            <div v-for="(condition, index) in newExaminationData.custom_conditions" :key="condition.id" class="flex items-center justify-between p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg border border-transparent hover:border-purple-300 dark:hover:border-purple-600 transition-all">
                              <label class="flex items-center space-x-3 cursor-pointer flex-1">
                                <input type="checkbox" v-model="condition.checked" class="rounded-md text-purple-500 focus:ring-purple-500 w-4 h-4"/>
                                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ condition.name }}</span>
                              </label>
                              <button @click="removeCustomCondition(index)" class="text-red-500 hover:text-red-700 p-1 rounded transition-colors">
                                <Trash2 class="h-4 w-4"/>
                              </button>
                            </div>
                          </div>
                        </div>

                        <!-- Clinical Notes & Findings -->
                        <div class="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl p-6 shadow-lg">
                          <h4 class="font-semibold mb-4 flex items-center gap-3 text-emerald-800 dark:text-emerald-300 border-b-2 border-emerald-200 dark:border-emerald-700 pb-3">
                            <div class="flex items-center justify-center w-10 h-10 bg-emerald-200 dark:bg-emerald-800 rounded-full">
                              <FileText class="h-5 w-5 text-emerald-600 dark:text-emerald-400"/>
                            </div>
                            <span class="text-lg">Clinical Notes & Findings</span>
                          </h4>
                          <div class="space-y-4">
                            <div>
                              <label class="block text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-2">Clinical Findings</label>
                              <textarea 
                                v-model="newExaminationData.extra_oral_findings" 
                                rows="4" 
                                class="w-full p-3 rounded-lg bg-white/80 dark:bg-gray-800/80 focus:ring-2 focus:ring-emerald-400 border border-emerald-200 dark:border-emerald-600 resize-none transition-all duration-200" 
                                placeholder="Enter any additional findings, observations, or clinical notes..."
                              ></textarea>
                            </div>
                            <div>
                              <label class="block text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-2">Global Conditions Notes</label>
                              <textarea 
                                v-model="newExaminationData.global_conditions_notes" 
                                rows="4" 
                                class="w-full p-3 rounded-lg bg-white/80 dark:bg-gray-800/80 focus:ring-2 focus:ring-emerald-400 border border-emerald-200 dark:border-emerald-600 resize-none transition-all duration-200" 
                                placeholder="Additional notes about global conditions..."
                              ></textarea>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
            
            <!-- Footer for Create Mode -->
            <div class="fixed bottom-6 right-6 z-50 flex items-center gap-3">
              <button @click="mode = 'view'" class="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full shadow-lg border border-gray-300 dark:border-gray-600 transition-all duration-200 hover:scale-105">
                Cancel
              </button>
              <button @click="saveNewExamination" :disabled="saving" class="inline-flex items-center px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full hover:from-blue-700 hover:to-indigo-700 shadow-lg disabled:from-blue-400 disabled:to-indigo-400 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 hover:shadow-xl">
                <LoaderCircle v-if="saving" class="animate-spin h-4 w-4 mr-2" />
                <Save v-else class="h-4 w-4 mr-2" />
                {{ saving ? 'Saving...' : 'Save Examination' }}
              </button>
            </div>
          </div>
          <!-- END CREATE MODE -->
        </main>

        <!-- DentalChart-style Floating Tooth Treatment Summary -->
        <Teleport to="body">
          <div v-if="hoveredTooth && showHoverSummary"
               class="fixed bottom-4 right-4 z-50 pointer-events-auto">
            <div class="w-[360px] rounded-2xl border border-slate-200 dark:border-slate-700/70 bg-white/95 dark:bg-slate-900/95 shadow-2xl backdrop-blur-xl overflow-hidden transition-transform duration-200">
              <div class="px-5 py-4 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-800/80 dark:via-slate-900/80 border-b border-slate-200 dark:border-slate-700/70">
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <p class="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Tooth Summary</p>
                    <div class="mt-1 flex items-baseline gap-3">
                      <h4 class="text-xl font-semibold leading-tight text-slate-900 dark:text-white">Tooth {{ hoveredTooth }}</h4>
                      <span class="text-sm text-slate-500 dark:text-slate-300">{{ getQuadrantName(hoveredTooth) }}</span>
                    </div>
                  </div>
                  <span
                    v-if="getToothStatus(hoveredTooth)"
                    :class="['inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide px-3 py-1.5 rounded-full', getStatusHeaderBadgeClass(getToothStatus(hoveredTooth))]"
                  >
                    {{ getStatusLabel(getToothStatus(hoveredTooth)) }}
                  </span>
                </div>

                <div class="mt-4 flex items-center justify-between rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 px-3 py-2 shadow-sm">
                  <span class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Condition</span>
                  <div class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm"
                       :class="getConditionDisplayClass(getToothCurrentCondition(hoveredTooth))">
                    {{ getFormattedCondition(getToothCurrentCondition(hoveredTooth)) }}
                  </div>
                </div>
              </div>

              <div class="max-h-80 overflow-y-auto custom-scrollbar">
                <div class="p-4 space-y-3">
                  <div
                    v-if="getToothTreatments(hoveredTooth).length === 0"
                    class="rounded-xl border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50/90 dark:bg-slate-800/60 p-5 text-center"
                  >
                    <svg class="w-8 h-8 text-slate-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-200">No recorded treatments yet</h3>
                    <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">Add a treatment from the records panel to see its progress here.</p>
                  </div>

                  <div v-if="getToothTreatments(hoveredTooth).length > 0" class="space-y-3">
                    <div
                      v-for="(treatment, index) in getToothTreatments(hoveredTooth)"
                      :key="index"
                      class="rounded-xl border border-slate-200 dark:border-slate-700/70 bg-white dark:bg-slate-900/60 p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                      <div class="flex items-start justify-between gap-3">
                        <div>
                          <p class="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <span class="inline-flex h-2 w-2 rounded-full bg-sky-400"></span>
                            {{ getTreatmentTitle(treatment.treatment_type, index, treatment) }}
                          </p>
                          <p v-if="treatment.treatment_type" class="mt-1 text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-400">{{ treatment.treatment_type.replace(/_/g, ' ') }}</p>
                        </div>
                        <span
                          :class="['inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full', getStatusBadgeClass(calculateTreatmentStatus(treatment))]"
                        >
                          {{ getStatusLabel(calculateTreatmentStatus(treatment)) }}
                        </span>
                      </div>

                      <div v-if="treatment.notes" class="mt-3 rounded-lg border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/50 p-3">
                        <div class="flex items-start gap-2">
                          <svg class="w-4 h-4 text-slate-500 dark:text-slate-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
                          </svg>
                          <p class="text-xs leading-relaxed text-slate-600 dark:text-slate-300">{{ treatment.notes }}</p>
                        </div>
                      </div>

                      <div
                        v-if="treatment.steps && treatment.steps.length"
                        class="mt-3 border-t border-slate-200 dark:border-slate-700/60 pt-3"
                      >
                        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300 mb-2">Treatment Steps</p>
                        <div class="space-y-1.5">
                          <div
                            v-for="(step, stepIndex) in treatment.steps"
                            :key="stepIndex"
                            class="flex items-center justify-between gap-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 px-3 py-2"
                          >
                            <span class="text-xs font-medium text-slate-700 dark:text-slate-200">{{ step.description || `Step ${stepIndex + 1}` }}</span>
                            <span
                              :class="['inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full', getStatusBadgeClass(step.status)]"
                            >
                              {{ getStatusLabel(step.status) }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Teleport>
      </div>
    </div>
  </div>

  <!-- Condition History Popover -->
  <Teleport to="body">
    <div v-if="showConditionHistory && selectedToothForHistory" 
         class="fixed z-[70] pointer-events-none"
         :style="{ 
           left: `${historyPopoverPosition.x - 150}px`, 
           top: `${historyPopoverPosition.y - 200}px` 
         }">
      <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl w-[300px] pointer-events-auto">
        <div class="p-4">
          <div class="flex items-center justify-between mb-3">
            <h4 class="font-semibold text-gray-900 dark:text-white">
              Tooth {{ selectedToothForHistory }} History
            </h4>
            <button @click="hideConditionHistory" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X class="h-4 w-4" />
            </button>
          </div>
          
          <div class="space-y-2 max-h-48 overflow-y-auto">
            <div v-for="(history, index) in getToothHistoryFromExaminations(selectedToothForHistory)" 
                 :key="index"
                 class="p-2 bg-gray-50 dark:bg-gray-700 rounded border-l-4"
                 :class="getConditionDisplayClass(history.condition)">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ getConditionDisplayLabel(history.condition) }}
                </span>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  {{ formatDate(history.date) }}
                </span>
              </div>
            </div>
            
            <div v-if="getToothHistoryFromExaminations(selectedToothForHistory).length === 0" 
                 class="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              No condition history available
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- RecordDetailNew Popup Modal - Full Page -->
  <Teleport to="body">
    <div v-if="showRecordDetailPopup" 
         class="fixed inset-0 z-[60] bg-white dark:bg-gray-900">
      <!-- Full Page Modal Container -->
      <div class="h-full w-full flex flex-col relative">
        <!-- Floating Close Button - Top Right -->
        <button @click="closeRecordDetailPopup" 
                class="fixed top-4 right-4 z-[70] p-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-200 shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        <!-- Modal Content - Full height and scrollable -->
        <div class="flex-grow overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <RecordDetailNew 
            v-if="recordDetailData"
            :record-data-prop="recordDetailData"
            :patient-id="patientId"
            :initial-tooth-number-prop="selectedToothForRecord"
            @close="closeRecordDetailPopup"
            @record-saved="handleRecordSaved"
            @error="handlePopupError"
            @back-to-list="closeRecordDetailPopup"
            class="min-h-full w-full"
          />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* Custom grid for dental chart - updated for larger teeth */
.grid-cols-16 {
  grid-template-columns: repeat(16, minmax(0, 1fr));
  gap: 0.75rem; /* Increase spacing for larger teeth */
}

/* Custom grid for children's dental chart - updated for larger teeth */
.grid-cols-10 {
  grid-template-columns: repeat(10, minmax(0, 1fr));
  gap: 0.75rem; /* Increase spacing for larger teeth */
}

/* Enhanced dental chart layout */
.adult-chart, .children-chart {
  position: relative;
  padding: 2rem;
}

.adult-chart .grid-cols-16,
.children-chart .grid-cols-10 {
  min-height: 180px; /* Ensure adequate height for larger teeth */
}

/* Ensure proper tooth container sizing */
.tooth-chart-item {
  min-width: 80px; /* Accommodate larger teeth */
  min-height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5px;
}

/* Custom hover scale effects */
.hover\:scale-102:hover {
  transform: scale(1.02);
}

.hover\:scale-105:hover {
  transform: scale(1.05);
}

/* Custom ring width for selection */
.ring-3 {
  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(3px + var(--tw-ring-offset-width)) var(--tw-ring-color);
  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
}

/* Smooth transitions for all interactive elements */
button, input, select, textarea {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Enhanced floating notification animation */
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.fixed.top-20.right-6 {
  animation: slideInRight 0.3s ease-out;
}

/* Custom scrollbar for panels */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}
.dark ::-webkit-scrollbar-thumb {
  background: #4b5563;
}

/* Gradient text effect for headings */
.gradient-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Enhanced shadow for floating elements */
.floating-shadow {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Condition tooltip styles */
.condition-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 8px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  text-align: center;
  border-radius: 8px;
  font-size: 0.75rem;
  line-height: 1.3;
  white-space: nowrap;
  z-index: 50;
  max-width: 200px;
  white-space: normal;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease-in-out;
}

.condition-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: rgba(0, 0, 0, 0.9);
}

.group:hover .condition-tooltip {
  opacity: 1;
}

/* Enhanced condition card hover effects */
.condition-card {
  transition: all 0.2s ease-in-out;
}

.condition-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.dark .condition-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* Image loading state */
.condition-image-loading {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.dark .condition-image-loading {
  background: linear-gradient(90deg, #374151 25%, #4b5563 50%, #374151 75%);
  background-size: 200% 100%;
}

/* Search functionality styles */
.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.condition-search-input {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
  background-color: white;
  transition: all 0.2s ease-in-out;
}

.condition-search-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.dark .condition-search-input {
  background-color: #374151;
  border-color: #4b5563;
  color: #f9fafb;
}

.dark .condition-search-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.search-icon {
  position: absolute;
  right: 12px;
  color: #6b7280;
  pointer-events: none;
}

.dark .search-icon {
  color: #9ca3af;
}

.search-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  z-index: 50;
  max-height: 200px;
  overflow-y: auto;
  margin-top: 4px;
}

.dark .search-dropdown {
  background: #374151;
  border-color: #4b5563;
}

.search-dropdown-item {
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.15s ease-in-out;
}

.search-dropdown-item:last-child {
  border-bottom: none;
}

.search-dropdown-item:hover,
.search-dropdown-item.focused {
  background-color: #f9fafb;
}

.dark .search-dropdown-item {
  border-bottom-color: #4b5563;
}

.dark .search-dropdown-item:hover,
.dark .search-dropdown-item.focused {
  background-color: #4b5563;
}

.dropdown-condition-info {
  display: flex;
  flex-direction: column;
}

.dropdown-condition-name {
  font-weight: 500;
  font-size: 14px;
  color: #1f2937;
  margin-bottom: 2px;
}

.dark .dropdown-condition-name {
  color: #f9fafb;
}

.dropdown-condition-description {
  font-size: 12px;
  color: #6b7280;
}

.dark .dropdown-condition-description {
  color: #9ca3af;
}

/* Other condition search specific styles */
.other-condition-search-container {
  position: relative;
}

.other-condition-search-container .condition-search-input {
  padding: 10px 36px 10px 12px;
  font-size: 13px;
}

.other-condition-search-container .search-icon {
  right: 10px;
}

.other-condition-search-container .search-dropdown {
  font-size: 13px;
}

.other-condition-search-container .search-dropdown-item {
  padding: 10px 12px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .search-dropdown {
    max-height: 150px;
  }
  
  .condition-search-input {
    font-size: 16px; /* Prevent zoom on iOS */
  }
}

/* Tooth history tooltip styles */
.tooth-history-tooltip {
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Enhanced tooth hover effects for history */
.tooth-chart-item {
  transition: all 0.2s ease-in-out;
}

.tooth-chart-item:hover {
  transform: translateY(-2px);
  filter: brightness(1.1);
}

/* Record detail popup animations */
.record-detail-popup {
  animation: fadeInScale 0.3s ease-out;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Custom scrollbar for hover tooltip */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #4b5563;
}
</style>
