
const STORAGE_KEY = 'jomiready_cases_v1'

export const CASE_STATUSES = [
  'পর্যালোচনাধীন',
  'যাচাই সম্পন্ন',
  'তথ্য অসম্পূর্ণ',
]

function notifyCasesUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('jomiready-cases-updated'))
  }
}

function readCases() {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    throw new Error('সংরক্ষিত case পড়া যায়নি। Browser storage পরীক্ষা করুন।')
  }
}

function writeCases(cases) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cases))
    notifyCasesUpdated()
  } catch {
    throw new Error(
      'Case সংরক্ষণ করা যায়নি। Browser storage full বা unavailable হতে পারে।',
    )
  }
}

export function getStoredCases() {
  return readCases()
}

export function generateCaseId() {
  const cases = readCases()
  const usedIds = new Set(cases.map((item) => item.id))

  let id
  do {
    id = `JR-${Date.now().toString().slice(-6)}-${Math.floor(
      100 + Math.random() * 900,
    )}`
  } while (usedIds.has(id))

  return id
}

export function saveVerificationCase(report) {
  if (!report || typeof report !== 'object') {
    throw new Error('সঠিক verification report পাওয়া যায়নি।')
  }

  const cases = readCases()
  const caseId = report.caseId || generateCaseId()

  if (cases.some((item) => item.id === caseId)) {
    throw new Error(`এই Case ID আগে থেকেই আছে: ${caseId}`)
  }

  const newCase = {
    ...report,
    id: caseId,
    caseId,
    status: report.status || 'পর্যালোচনাধীন',
    reviewNote: report.reviewNote || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDemo: false,
  }

  writeCases([newCase, ...cases])
  return newCase
}

export function updateStoredCase(caseId, updates) {
  const cases = readCases()
  const index = cases.findIndex(
    (item) => item.id === caseId || item.caseId === caseId,
  )

  if (index === -1) {
    throw new Error('Case পাওয়া যায়নি। Refresh করে আবার চেষ্টা করুন।')
  }

  const updated = {
    ...cases[index],
    ...updates,
    id: cases[index].id,
    caseId: cases[index].caseId || cases[index].id,
    updatedAt: new Date().toISOString(),
  }

  const nextCases = [...cases]
  nextCases[index] = updated
  writeCases(nextCases)

  return updated
}

export function updateCaseStatus(caseId, status) {
  if (!CASE_STATUSES.includes(status)) {
    throw new Error('নির্বাচিত status সঠিক নয়।')
  }

  return updateStoredCase(caseId, { status })
}

export function deleteStoredCase(caseId) {
  const cases = readCases()
  const nextCases = cases.filter(
    (item) => item.id !== caseId && item.caseId !== caseId,
  )

  if (nextCases.length === cases.length) {
    throw new Error('মুছে ফেলার জন্য Case পাওয়া যায়নি।')
  }

  writeCases(nextCases)
  return true
}
