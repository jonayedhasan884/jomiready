
const STORAGE_KEY = 'jomiready_evidence_v1'
const UPDATE_EVENT = 'jomiready-evidence-updated'

function readAllEvidence() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed
      : {}
  } catch {
    return {}
  }
}

function writeAllEvidence(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  window.dispatchEvent(new Event(UPDATE_EVENT))
}

function makeEvidenceId() {
  return `EV-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function getEvidenceForCase(caseId) {
  if (!caseId) return []
  const allEvidence = readAllEvidence()
  return Array.isArray(allEvidence[caseId]) ? allEvidence[caseId] : []
}

export function addEvidence(caseId, evidenceData) {
  if (!caseId) throw new Error('Case ID is required.')

  const item = {
    id: makeEvidenceId(),
    category: evidenceData.category || 'অন্যান্য',
    title: String(evidenceData.title || '').trim(),
    fileName: String(evidenceData.fileName || '').trim(),
    referenceNo: String(evidenceData.referenceNo || '').trim(),
    status: evidenceData.status || 'পর্যালোচনাধীন',
    note: String(evidenceData.note || '').trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  if (!item.title) {
    throw new Error('Evidence title is required.')
  }

  const allEvidence = readAllEvidence()
  const existing = Array.isArray(allEvidence[caseId])
    ? allEvidence[caseId]
    : []

  allEvidence[caseId] = [item, ...existing]
  writeAllEvidence(allEvidence)

  return item
}

export function updateEvidence(caseId, evidenceId, updates) {
  const allEvidence = readAllEvidence()
  const existing = allEvidence[caseId]

  if (!Array.isArray(existing)) return null

  let updatedItem = null

  allEvidence[caseId] = existing.map((item) => {
    if (item.id !== evidenceId) return item

    updatedItem = {
      ...item,
      ...updates,
      id: item.id,
      updatedAt: new Date().toISOString(),
    }

    return updatedItem
  })

  if (updatedItem) writeAllEvidence(allEvidence)
  return updatedItem
}


export function deleteEvidence(caseId, evidenceId) {
    if (!caseId || !evidenceId) return false
  
    const allEvidence = readAllEvidence()
    const existing = allEvidence[caseId]
  
    if (!Array.isArray(existing)) return false
  
    const nextEvidence = existing.filter((item) => item.id !== evidenceId)
  
    // কোনো evidence delete না হলে false ফেরত দেবে
    if (nextEvidence.length === existing.length) return false
  
    allEvidence[caseId] = nextEvidence
    writeAllEvidence(allEvidence)
  
    return true
  }
  

export function subscribeToEvidenceUpdates(callback) {
  const handler = () => callback()

  window.addEventListener(UPDATE_EVENT, handler)
  window.addEventListener('storage', handler)

  return () => {
    window.removeEventListener(UPDATE_EVENT, handler)
    window.removeEventListener('storage', handler)
  }
}
