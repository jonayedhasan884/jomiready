const BN_DIGITS = '০১২৩৪৫৬৭৮৯'

export const SURVEY_ORDER = ['CS', 'SA', 'RS', 'BS']

export const DOCUMENT_OPTIONS = [
  { id: 'deed', label: 'দলিল / রেজিস্ট্রিকৃত দলিলের কপি', weight: 6,
    why: 'বিক্রেতার প্রদত্ত অংশ ও হস্তান্তরের ধারাবাহিকতা দেখার জন্য।' },
  { id: 'khatian', label: 'সংশ্লিষ্ট খতিয়ানের কপি', weight: 5,
    why: 'রেকর্ডে মালিক ও জমির পরিমাণ মিলিয়ে দেখার জন্য।' },
  { id: 'mutation', label: 'নামজারি / মিউটেশন সংক্রান্ত নথি', weight: 8,
    why: 'মালিকানা পরিবর্তন বা দাগ বিভাজনের বৈধ সূত্র দেখার জন্য।' },
  { id: 'tax', label: 'ভূমি উন্নয়ন করের রসিদ', weight: 3,
    why: 'জমির বর্তমান দখল ও কর পরিশোধের ধারাবাহিকতা দেখার জন্য।' },
  { id: 'map', label: 'মৌজা ম্যাপ / দাগের নকশা', weight: 6,
    why: 'পুরোনো ও নতুন দাগের ভৌগোলিক সম্পর্ক দেখার জন্য।' },
]

const TYPE_LABEL = {
  same: 'দাগ নম্বর একই',
  split: 'একটি দাগ একাধিক দাগে বিভক্ত হওয়ার সম্ভাবনা',
  merge: 'একাধিক দাগ একত্রিত হওয়ার সম্ভাবনা',
  partial: 'দাগের আংশিক মিল আছে',
  renumber: 'দাগ নম্বর পরিবর্তিত হয়েছে',
  regroup: 'দাগ পুনর্বিন্যাসের সম্ভাবনা',
}

const MINOR_DIFF_PERCENT = 5

/* ---------- ছোট সহায়ক ফাংশন ---------- */

export function toEnglishDigits(value) {
  return String(value ?? '').replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)))
}

export function parseNumber(value) {
  const text = toEnglishDigits(value).replace(/,/g, '').trim()
  if (!text) return NaN
  return Number(text)
}

export function formatBn(value, max = 3) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString('bn-BD', { maximumFractionDigits: max })
}

export function parseDags(text) {
  return toEnglishDigits(text)
    .split(/[,;،]+|\s+ও\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function surveyRank(survey) {
  const index = SURVEY_ORDER.indexOf(survey)
  return index === -1 ? 99 : index
}

function classifyDagChange(oldDags, newDags) {
  const oldSet = new Set(oldDags)
  const newSet = new Set(newDags)
  const overlap = [...oldSet].filter((d) => newSet.has(d)).length

  if (overlap === oldSet.size && oldSet.size === newSet.size) return 'same'
  if (oldSet.size === 1 && newSet.size > 1) return 'split'
  if (oldSet.size > 1 && newSet.size === 1) return 'merge'
  if (overlap > 0) return 'partial'
  if (oldSet.size === 1 && newSet.size === 1) return 'renumber'
  return 'regroup'
}

/* ---------- মূল বিশ্লেষণ ---------- */

export function analyzeCase({
  mouza,
  khatian,
  records,
  ownedArea,
  saleArea,
  documents,
}) {
  const checks = []
  const addCheck = (check) =>
    checks.push({ weight: 0, evidence: [], action: '', ...check })

  // শুধু সম্পূর্ণ রেকর্ড, জরিপের ক্রম অনুযায়ী সাজানো
  
  // শুধু সম্পূর্ণ রেকর্ড, জরিপের ক্রম অনুযায়ী সাজানো
const valid = records
.filter(
  (r) =>
    SURVEY_ORDER.includes(r.survey) &&
    parseDags(r.dag).length > 0 &&
    Number.isFinite(parseNumber(r.area)) &&
    parseNumber(r.area) > 0,
)
.sort((a, b) => surveyRank(a.survey) - surveyRank(b.survey))

// যেসব রেকর্ড যাচাইয়ের শর্ত পূরণ করেনি
const excludedRecords = records.filter(
(r) =>
  !SURVEY_ORDER.includes(r.survey) ||
  parseDags(r.dag).length === 0 ||
  !Number.isFinite(parseNumber(r.area)) ||
  parseNumber(r.area) <= 0,
)

if (excludedRecords.length > 0) {
addCheck({
  id: 'invalid-records',
  title: 'অসম্পূর্ণ বা অবৈধ রেকর্ড',
  status: 'missing',
  weight: 10,
  explanation: `${formatBn(excludedRecords.length)}টি রেকর্ডের তথ্য যাচাইয়ের শর্ত পূরণ করেনি। তাই সেগুলো মূল comparison-এ অন্তর্ভুক্ত করা হয়নি।`,
  evidence: excludedRecords.map(
    (r) =>
      `${r.survey || 'জরিপ উল্লেখ নেই'}: দাগ ${r.dag || 'উল্লেখ নেই'}, জমি ${r.area || 'উল্লেখ নেই'} শতক`,
  ),
  action:
    'মূল নথি দেখে জরিপের নাম, দাগ নম্বর এবং জমির পরিমাণ সংশোধন করুন।',
})
}

// রেকর্ডের তথ্য দেখানোর জন্য
const recordLine = (r) =>
`${r.survey}: দাগ ${r.dag}, ${formatBn(parseNumber(r.area))} শতক`

  /* ১. পরিচিতি */
  if (!String(mouza ?? '').trim() || !String(khatian ?? '').trim()) {
    addCheck({
      id: 'identity',
      title: 'কেসের পরিচিতি',
      status: 'missing',
      weight: 10,
      explanation: 'মৌজা বা প্রধান খতিয়ান নম্বর দেওয়া হয়নি।',
      action: 'সঠিক মৌজা ও খতিয়ান নম্বর যোগ করুন।',
    })
  } else {
    addCheck({
      id: 'identity',
      title: 'কেসের পরিচিতি',
      status: 'ok',
      explanation: `মৌজা ও খতিয়ান নম্বর দেওয়া হয়েছে (${mouza}, খতিয়ান ${khatian}); সঠিকতা এখানে যাচাই হয়নি।`,
    })
  }

  /* ২. রেকর্ডের পর্যাপ্ততা */
  const surveys = new Set(valid.map((r) => r.survey))
  if (valid.length < 2 || surveys.size < 2) {
    addCheck({
      id: 'records',
      title: 'জরিপের রেকর্ড',
      status: 'missing',
      weight: 25,
      explanation: 'তুলনার জন্য অন্তত দুই ধরনের পৃথক জরিপের (যেমন CS ও RS) সম্পূর্ণ রেকর্ড দরকার।',
      evidence: valid.map(recordLine),
      action: 'আরও জরিপের রেকর্ড (CS/SA/RS/BS) যোগ করুন।',
    })
  } else {
    addCheck({
      id: 'records',
      title: 'জরিপের রেকর্ড',
      status: 'ok',
      explanation: `${formatBn(valid.length)}টি রেকর্ড ${formatBn(surveys.size)} ধরনের জরিপ থেকে পাওয়া গেছে।`,
      evidence: valid.map(recordLine),
    })
  }

  /* ৩. ঐতিহাসিক মিল ও দাগ রূপান্তর */
  const transformations = []
  const surveyRecordCounts = valid.reduce((counts, record) => {
    counts[record.survey] = (counts[record.survey] || 0) + 1
    return counts
  }, {})

  for (let i = 0; i < valid.length - 1; i += 1) {
    const older = valid[i]
    const newer = valid[i + 1]

    if (older.survey === newer.survey) {
      addCheck({
        id: `pair-${older.id}-${newer.id}`,
        title: `${older.survey} জরিপের একাধিক রেকর্ড`,
        status: 'info',
        explanation: 'একই জরিপের দুইটি রেকর্ড আছে; এগুলো আলাদা অংশ বা খতিয়ান হতে পারে।',
        evidence: [recordLine(older), recordLine(newer)],
      })
      continue
    }
    if (
        surveyRecordCounts[older.survey] > 1 ||
        surveyRecordCounts[newer.survey] > 1
      ) {
        addCheck({
          id: `comparison-limited-${older.id}-${newer.id}`,
          title: `${older.survey} → ${newer.survey} তুলনা সীমিত`,
          status: 'info',
          explanation:
            'একটি বা উভয় জরিপে একাধিক রেকর্ড আছে। ভুলভাবে আলাদা খতিয়ানের জমির পরিমাণ তুলনা এড়াতে স্বয়ংক্রিয় তুলনা করা হয়নি।',
          evidence: [recordLine(older), recordLine(newer)],
          action:
            'দাগের ধারাবাহিকতা, খতিয়ান এবং জমির অংশের নথি দেখে রেকর্ডগুলো আলাদাভাবে যাচাই করুন।',
        })
        continue
      }

    const oldDags = parseDags(older.dag)
    const newDags = parseDags(newer.dag)
    const type = classifyDagChange(oldDags, newDags)

    const oldArea = parseNumber(older.area)
    const newArea = parseNumber(newer.area)
    const diff = newArea - oldArea
    const percent = (Math.abs(diff) / oldArea) * 100

    const areaLevel =
      Math.abs(diff) < 0.001 ? 'exact' : percent <= MINOR_DIFF_PERCENT ? 'minor' : 'major'

    const weight =
      (type === 'same' ? 0 : 5) +
      (areaLevel === 'exact' ? 0 : areaLevel === 'minor' ? 10 : 25)

    const status = weight === 0 ? 'ok' : weight <= 5 ? 'info' : 'review'

    const areaText =
      areaLevel === 'exact'
        ? 'জমির মোট পরিমাণ মিলেছে।'
        : `জমির পরিমাণে ${formatBn(Math.abs(diff))} শতক (${formatBn(percent, 1)}%) ${diff < 0 ? 'কম' : 'বেশি'}।`

    transformations.push({
      from: older.survey,
      to: newer.survey,
      oldDags,
      newDags,
      type,
      oldArea,
      newArea,
      diff,
      percent,
      areaLevel,
    })

    addCheck({
      id: `pair-${older.id}-${newer.id}`,
      title: `${older.survey} → ${newer.survey} মিল`,
      status,
      weight,
      explanation:
        `${TYPE_LABEL[type]}। ${areaText}` +
        (areaLevel !== 'exact'
          ? ' এটি জরিপের পার্থক্য, সংশোধন বা অন্য বৈধ কারণেও হতে পারে; একা পার্থক্য জালিয়াতি প্রমাণ করে না।'
          : ''),
      evidence: [recordLine(older), recordLine(newer)],
      action:
        type === 'same' && areaLevel === 'exact'
          ? ''
          : 'মৌজা ম্যাপ ও নামজারি/বিভাজনের নথি দিয়ে দাগের সম্পর্ক নিশ্চিত করুন।',
    })
  }
   
  /* ৩.৫. খতিয়ান নম্বরের পরিবর্তন */
  const khatianRecords = valid.filter(
    (r) => String(r.khatian ?? '').trim() !== ''
  )

  const distinctKhatians = [
    ...new Set(khatianRecords.map((r) =>
      toEnglishDigits(String(r.khatian).trim())
    )),
  ]

  if (distinctKhatians.length > 1) {
    addCheck({
      id: 'khatian-change',
      title: 'খতিয়ান নম্বরের পরিবর্তন',
      status: 'review',
      weight: 10,
      explanation:
        'বিভিন্ন জরিপের রেকর্ডে একাধিক খতিয়ান নম্বর দেওয়া হয়েছে। জরিপ পরিবর্তন, মালিকানা হস্তান্তর বা রেকর্ড বিভাজনের কারণে এমন হতে পারে; শুধু নম্বরের পার্থক্য অনিয়ম প্রমাণ করে না।',
      evidence: khatianRecords.map(
        (r) => `${r.survey}: খতিয়ান ${r.khatian}, দাগ ${r.dag}`
      ),
      action:
        'সংশ্লিষ্ট খতিয়ান, দলিল, নামজারি এবং জরিপের রেকর্ড মিলিয়ে ধারাবাহিকতা যাচাই করুন।',
    })
  }

  /* ৩.৬. মালিকের নাম অসম্পূর্ণ */
  const missingOwnerRecords = valid.filter(
    (r) => !String(r.owner ?? '').trim()
  )

  if (missingOwnerRecords.length > 0) {
    addCheck({
      id: 'owner-missing',
      title: 'মালিকের নাম অসম্পূর্ণ',
      status: 'missing',
      weight: 10,
      explanation:
        `${formatBn(missingOwnerRecords.length)}টি রেকর্ডে মালিকের নাম দেওয়া হয়নি।`,
      evidence: missingOwnerRecords.map(
        (r) => `${r.survey}: দাগ ${r.dag}, খতিয়ান ${r.khatian || 'উল্লেখ নেই'}`
      ),
      action:
        'মূল রেকর্ড দেখে মালিকের নাম পূরণ করুন। নাম না পাওয়া গেলে সেটিকে অসম্পূর্ণ তথ্য হিসেবে রাখুন।',
    })
  }

  /* ৪. মালিকের নাম */
  const ownerNames = [
    ...new Set(valid.map((r) => String(r.owner ?? '').trim()).filter(Boolean)),
  ]
  if (ownerNames.length > 1) {
    addCheck({
      id: 'owners',
      title: 'রেকর্ডে মালিকের নাম',
      status: 'review',
      weight: 10,
      explanation:
        'রেকর্ডভেদে মালিকের নাম আলাদা। উত্তরাধিকার বা হস্তান্তরের কারণে এটি স্বাভাবিক হতে পারে, তবে ধারাবাহিকতা দেখানো দরকার।',
      evidence: valid.filter((r) => r.owner).map((r) => `${r.survey}: ${r.owner}`),
      action: 'মালিকানা হস্তান্তরের নথি (দলিল, ওয়ারিশ সনদ, নামজারি) যাচাই করুন।',
    })
  } else if (ownerNames.length === 1) {
    addCheck({
      id: 'owners',
      title: 'রেকর্ডে মালিকের নাম',
      status: 'ok',
      explanation: 'দেওয়া রেকর্ডগুলোতে মালিকের নাম একই। এটি একা মালিকানা নিশ্চিত করে না।',
    })
  }

  /* ৫. অংশ ও বিক্রির হিসাব */
  const owned = parseNumber(ownedArea)
  const sale = parseNumber(saleArea)
  let remaining = NaN

  if (!Number.isFinite(owned) || owned < 0 || !Number.isFinite(sale) || sale < 0) {
    addCheck({
      id: 'sale',
      title: 'অংশ ও বিক্রির হিসাব',
      status: 'missing',
      weight: 20,
      explanation: 'মালিকের অংশ বা বিক্রির পরিমাণ বৈধ সংখ্যা হিসেবে দেওয়া হয়নি।',
      action: 'শূন্য বা ধনাত্মক সংখ্যা দিন।',
    })
  } else {
    remaining = sale <= owned ? owned - sale : NaN
    const latest = valid[valid.length - 1]
    const latestArea = latest ? parseNumber(latest.area) : NaN

    if (sale > owned) {
      addCheck({
        id: 'sale',
        title: 'অংশ ও বিক্রির হিসাব',
        status: 'review',
        weight: 35,
        explanation: `প্রস্তাবিত বিক্রি (${formatBn(sale)} শতক) প্রদত্ত অংশের (${formatBn(owned)} শতক) চেয়ে ${formatBn(sale - owned)} শতক বেশি।`,
        action: 'অংশের হিসাব ও বিক্রির পরিমাণ মূল দলিল/খতিয়ানের সাথে মিলিয়ে দেখুন।',
      })
    } else if (Number.isFinite(latestArea) && owned > latestArea) {
      addCheck({
        id: 'sale',
        title: 'অংশ ও বিক্রির হিসাব',
        status: 'review',
        weight: 20,
        explanation: `দাবিকৃত অংশ (${formatBn(owned)} শতক) সর্বশেষ রেকর্ডের (${latest.survey}) মোট জমির (${formatBn(latestArea)} শতক) চেয়ে বেশি।`,
        evidence: [recordLine(latest)],
        action: 'অংশ কোন খতিয়ান/দলিল থেকে এসেছে তা যাচাই করুন।',
      })
    } else {
      addCheck({
        id: 'sale',
        title: 'অংশ ও বিক্রির হিসাব',
        status: 'info',
        explanation: `গাণিতিকভাবে বিক্রির পর অবশিষ্ট ${formatBn(remaining)} শতক। বিক্রির আইনগত অধিকার এখানে যাচাই হয়নি।`,
        action: 'বিক্রেতার বিক্রয়ের অধিকার প্রাসঙ্গিক মালিকানা ও অংশের নথি দিয়ে যাচাই করুন।',
      })
    }
  }

  /* ৬. নথির checklist */
  const missingDocs = DOCUMENT_OPTIONS.filter((doc) => !documents?.[doc.id])
  const checkedDocs = DOCUMENT_OPTIONS.length - missingDocs.length

  if (missingDocs.length) {
    addCheck({
      id: 'documents',
      title: 'নথির checklist',
      status: 'missing',
      weight: Math.min(25, missingDocs.reduce((sum, d) => sum + d.weight, 0)),
      explanation: `${formatBn(missingDocs.length)}টি নথি অনুপস্থিত।`,
      evidence: missingDocs.map((d) => `${d.label} — ${d.why}`),
      action: 'অনুপস্থিত নথি সংগ্রহ করুন।',
    })
  } else {
    addCheck({
      id: 'documents',
      title: 'নথির checklist',
      status: 'info',
      explanation: 'সব নথি উপস্থিত হিসেবে চিহ্নিত; নথির সত্যতা যাচাই করা হয়নি।',
    })
  }

  /* ফলাফল */
  const risk = Math.min(100, checks.reduce((sum, c) => sum + c.weight, 0))
  const riskLabel =
  risk >= 60
    ? 'বেশি পর্যালোচনা প্রয়োজন'
    : risk >= 30
      ? 'আরও যাচাই প্রয়োজন'
      : 'কম পর্যালোচনা সংকেত'

  const areas = valid.map((r) => parseNumber(r.area))
  const areaDifference = areas.length >= 2 ? Math.max(...areas) - Math.min(...areas) : 0

  return {
    risk,
    riskLabel,
    checks,
    transformations,
    findings: checks.map((c) => `${c.title}: ${c.explanation}`),
    missingDocs,
    checkedDocs,
    totalDocs: DOCUMENT_OPTIONS.length,
    records: valid,
    recordCount: valid.length,
    areaDifference,
    remainingArea: Number.isFinite(remaining) ? formatBn(remaining) : 'হিসাব সম্ভব হয়নি',
  }
}

/* ধাপ ৩-এ ব্যবহার হবে: ChatGPT-এর নমুনা কেস */
export const SAMPLE_CASE = {
  mouza: 'ডেমো মৌজা–০১',
  khatian: '৫০',
  dag: '১০৫',
  records: [
    { id: 1, survey: 'CS', dag: '১০৫', khatian: '৫০', area: '৬০', owner: 'নমুনা মালিক' },
    { id: 2, survey: 'RS', dag: '২০৫, ২০৬', khatian: '৮১', area: '৫৮', owner: 'নমুনা মালিক' },
  ],
  ownedArea: '২৫',
  saleArea: '২০',
  documents: { deed: true, khatian: true, mutation: false, tax: true, map: false },
}