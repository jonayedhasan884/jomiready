
import { useEffect, useMemo, useState } from 'react'

import {
    LayoutDashboard,
    FileSearch,
    Clock3,
    CheckCircle2,
    LogOut,
    ArrowUpRight,
    Search,
    Trash2,
    Save,
    RefreshCw,
    X,
    AlertCircle,
    AlertTriangle,
    ClipboardList,
  } from 'lucide-react'
  import {
    getEvidenceForCase,
    subscribeToEvidenceUpdates,
  } from '../utils/evidenceStorage'

  
  import CaseDetails from '../components/CaseDetails'




import {
  getStoredCases,
  updateStoredCase,
  deleteStoredCase,
  CASE_STATUSES,
} from '../utils/caseStorage'

const demoCases = [
  {
    id: 'JR-1001',
    mouza: 'ডেমো মৌজা — ০১',
    dag: '১২৫',
    khatian: '৫০',
    status: 'পর্যালোচনাধীন',
    type: 'warning',
    riskLabel: 'ডেমো কেস',
    recordCount: 2,
    findings: ['এটি একটি নমুনা কেস।'],
    isDemo: true,
  },
  {
    id: 'JR-1002',
    mouza: 'ডেমো মৌজা — ০২',
    dag: '২৪৮',
    khatian: '৬২',
    status: 'যাচাই সম্পন্ন',
    type: 'success',
    riskLabel: 'ডেমো কেস',
    recordCount: 3,
    findings: ['এটি একটি নমুনা কেস।'],
    isDemo: true,
  },
  {
    id: 'JR-1003',
    mouza: 'ডেমো মৌজা — ০৩',
    dag: '৩১০',
    khatian: '৮১',
    status: 'তথ্য অসম্পূর্ণ',
    type: 'danger',
    riskLabel: 'ডেমো কেস',
    recordCount: 1,
    findings: ['এটি একটি নমুনা কেস।'],
    isDemo: true,
  },
]

function readCasesSafely() {
  try {
    return { cases: getStoredCases(), error: '' }
  } catch (error) {
    return {
      cases: [],
      error: error?.message || 'সংরক্ষিত কেস পড়া যায়নি।',
    }
  }
}

function formatBn(value) {
  if (value === null || value === undefined || value === '') {
    return 'তথ্য নেই'
  }

  return String(value).replace(/[0-9]/g, (digit) => '০১২৩৪৫৬৭৮৯'[Number(digit)])
}

function getStatusType(status) {
  if (status === 'যাচাই সম্পন্ন') return 'success'
  if (status === 'তথ্য অসম্পূর্ণ') return 'danger'
  return 'warning'
}

function getEvidenceSummary(item) {
    const caseId = item.caseId || item.id
    const evidence = item.isDemo ? [] : getEvidenceForCase(caseId)
  
    return {
      total: evidence.length,
      pending: evidence.filter(
        (item) => item.status === 'পর্যালোচনাধীন',
      ).length,
      incomplete: evidence.filter(
        (item) => item.status === 'তথ্য অসম্পূর্ণ',
      ).length,
      reviewed: evidence.filter(
        (item) => item.status === 'পর্যালোচিত',
      ).length,
    }
  }
  
  function getReviewPriority(item, summary) {
    if (
      item.status === 'তথ্য অসম্পূর্ণ' ||
      summary.incomplete > 0
    ) {
      return {
        label: 'উচ্চ অগ্রাধিকার',
        className: 'bg-red-100 text-red-700',
      }
    }
  
    if (
      item.status === 'পর্যালোচনাধীন' ||
      summary.pending > 0 ||
      summary.total === 0
    ) {
      return {
        label: 'মাঝারি অগ্রাধিকার',
        className: 'bg-amber-100 text-amber-800',
      }
    }
  
    return {
      label: 'কম অগ্রাধিকার',
      className: 'bg-green-100 text-green-700',
    }
  }
export default function Dashboard({ onLogout }) {
  const initialData = useMemo(() => readCasesSafely(), [])

  const [savedCases, setSavedCases] = useState(initialData.cases)
  const [selectedCase, setSelectedCase] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('সব')
  const [reviewNote, setReviewNote] = useState('')
  const [pageError, setPageError] = useState(initialData.error)
  const [actionMessage, setActionMessage] = useState('')
  const [showEvidenceManager, setShowEvidenceManager] = useState(false)
  const [, setEvidenceVersion] = useState(0)

useEffect(() => {
  return subscribeToEvidenceUpdates(() => {
    setEvidenceVersion((version) => version + 1)
  })
}, [])
  const refreshCases = () => {
    const result = readCasesSafely()

    setSavedCases(result.cases)
    setPageError(result.error)

    if (selectedCase) {
      const updated = result.cases.find(
        (item) => item.id === selectedCase.id
      )

      if (updated) {
        setSelectedCase(updated)
        setReviewNote(updated.reviewNote || '')
      } else if (selectedCase.isDemo) {
        setSelectedCase(selectedCase)
      } else {
        setSelectedCase(null)
        setReviewNote('')
      }
    }
  }

  useEffect(() => {
    const handleStorageChange = () => {
      const result = readCasesSafely()
      setSavedCases(result.cases)
      setPageError(result.error)

      setSelectedCase((current) => {
        if (!current) return null

        const updated = result.cases.find(
          (item) => item.id === current.id
        )

        if (updated) return updated
        return current.isDemo ? current : null
      })
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener(
      'jomiready-cases-updated',
      handleStorageChange
    )

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener(
        'jomiready-cases-updated',
        handleStorageChange
      )
    }
  }, [])

  const cases = useMemo(() => {
    const savedIds = new Set(savedCases.map((item) => item.id))

    return [
      ...savedCases.map((item) => ({
        ...item,
        isDemo: false,
      })),
      ...demoCases.filter((item) => !savedIds.has(item.id)),
    ]
  }, [savedCases])

  const filteredCases = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return cases.filter((item) => {
      
const matchesSearch = [
    item.id,
    item.division,
    item.district,
    item.upazila,
    item.mouza,
    item.khatian,
    item.dag,
  ].some((value) =>
    String(value ?? '').toLowerCase().includes(query)
  )
  
      const matchesStatus =
        statusFilter === 'সব' || item.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [cases, searchTerm, statusFilter])

  const totalCases = cases.length

  const pendingCases = cases.filter(
    (item) => item.status === 'পর্যালোচনাধীন'
  ).length

  const completedCases = cases.filter(
    (item) => item.status === 'যাচাই সম্পন্ন'
  ).length

  const incompleteCases = cases.filter(
    (item) => item.status === 'তথ্য অসম্পূর্ণ'
  ).length

  const selectCase = (item) => {
    setSelectedCase(item)
    setReviewNote(item.reviewNote || '')
    setActionMessage('')
  }

  
const handleStatusChange = (caseId, status) => {
    try {
      const summary = getEvidenceSummary(caseId)
  
      if (status === 'যাচাই সম্পন্ন') {
        if (summary.total === 0) {
          setActionMessage(
            'যাচাই সম্পন্ন করা যাচ্ছে না: আগে অন্তত একটি Evidence যোগ করুন।'
          )
          return
        }
  
        if (summary.pending > 0 || summary.incomplete > 0) {
          setActionMessage(
            'যাচাই সম্পন্ন করা যাচ্ছে না: সব Evidence পর্যালোচনা করুন এবং অসম্পূর্ণ তথ্য পূরণ করুন।'
          )
          return
        }
      }
  
      const updated = updateStoredCase(caseId, { status })
  
      setSavedCases(getStoredCases())
      setSelectedCase(updated)
      setReviewNote(updated.reviewNote || '')
      setPageError('')
      setActionMessage('কেসের status সফলভাবে আপডেট হয়েছে।')
    } catch (error) {
      setActionMessage(
        error?.message || 'Status আপডেট করা যায়নি।'
      )
    }
  }
  

  const handleSaveReview = () => {
    if (!selectedCase || selectedCase.isDemo) return

    try {
      const updated = updateStoredCase(selectedCase.id, {
        reviewNote: reviewNote.trim(),
      })

      setSavedCases(getStoredCases())
      setSelectedCase(updated)
      setPageError('')
      setActionMessage('Reviewer note সংরক্ষণ করা হয়েছে।')
    } catch (error) {
      setActionMessage(
        error?.message || 'Reviewer note সংরক্ষণ করা যায়নি।'
      )
    }
  }

  const handleDeleteCase = (item) => {
    if (!item || item.isDemo) return

    const confirmed = window.confirm(
      `আপনি কি ${item.id} কেসটি মুছে ফেলতে চান? এই কাজটি ফিরিয়ে নেওয়া যাবে না।`
    )

    if (!confirmed) return

    try {
      deleteStoredCase(item.id)
      setSavedCases(getStoredCases())

      if (selectedCase?.id === item.id) {
        setSelectedCase(null)
        setReviewNote('')
      }

      setPageError('')
      setActionMessage('কেসটি মুছে ফেলা হয়েছে।')
    } catch (error) {
      setActionMessage(
        error?.message || 'কেসটি মুছে ফেলা যায়নি।'
      )
    }
  }

  const displayValue = (value) =>
    value === null || value === undefined || value === ''
      ? 'তথ্য নেই'
      : value
    
      if (showEvidenceManager && selectedCase) {
        return (
          <CaseDetails
            caseData={selectedCase}
            onBack={() => setShowEvidenceManager(false)}
          />
        )
      }




  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        
<div className="brand-mark">
  <span className="brand-symbol" aria-label="JomiReady logo">
    <svg
      viewBox="0 0 48 48"
      width="38"
      height="38"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M11 5h17l9 9v29H11z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M28 5v10h9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M17 22h14M17 27h9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="32" cy="34" r="9" fill="#E6C46A" />
      <path
        d="m28 34 2.5 2.5 5-5"
        stroke="#145C43"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
  <div className="brand-copy">
    <strong>JomiReady</strong>
    <small>স্টাফ ড্যাশবোর্ড</small>
  </div>
</div>


        <button
          type="button"
          className="logout-button"
          onClick={onLogout}
        >
          <LogOut size={17} />
          লগআউট
        </button>
      </header>

      <section className="dashboard-content">
        <div className="dashboard-welcome">
          <div>
            <span className="eyebrow">STAFF WORKSPACE</span>
            <h1>স্বাগতম, যাচাই কর্মকর্তা</h1>
            <p>
              জমির রেকর্ড যাচাইয়ের ডেমো কার্যক্রম এখানে পরিচালনা করুন।
            </p>
          </div>
          <div className="dashboard-avatar">ক</div>
        </div>

        {pageError && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <div>
              <strong>Storage সমস্যা</strong>
              <p>{pageError}</p>
            </div>
          </div>
        )}

        <div className="dashboard-stats">
          <article className="stat-card">
            <span className="stat-icon">
              <LayoutDashboard />
            </span>
            <p>মোট কেস</p>
            <h2>{formatBn(totalCases)}</h2>
            <small>সংরক্ষিত ও ডেমো কেস</small>
          </article>

          <article className="stat-card">
            <span className="stat-icon amber">
              <Clock3 />
            </span>
            <p>পর্যালোচনাধীন</p>
            <h2>{formatBn(pendingCases)}</h2>
            <small>পরবর্তী পর্যালোচনা প্রয়োজন</small>
          </article>

          <article className="stat-card">
            <span className="stat-icon green">
              <CheckCircle2 />
            </span>
            <p>যাচাই সম্পন্ন</p>
            <h2>{formatBn(completedCases)}</h2>
            <small>সম্পন্ন হিসেবে চিহ্নিত কেস</small>
          </article>

          <article className="stat-card">
            <span className="stat-icon">
              <FileSearch />
            </span>
            <p>তথ্য অসম্পূর্ণ</p>
            <h2>{formatBn(incompleteCases)}</h2>
            <small>আরও তথ্য সংগ্রহ করতে হবে</small>
          </article>
        </div>

        <section className="cases-panel">
          <div className="cases-heading">
            <div>
              <h2>যাচাই কেস</h2>
              <p>কেস খুঁজুন, status দেখুন এবং পর্যালোচনা পরিচালনা করুন।</p>
            </div>

            <button
              type="button"
              onClick={refreshCases}
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-2"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
          <div className="case-filter-grid mb-5">
          
            <label className="relative block">
              <Search
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Case ID, বিভাগ, জেলা, উপজেলা, মৌজা, খতিয়ান বা দাগ দিয়ে খুঁজুন"
                aria-label="কেস খুঁজুন"
                className="w-full rounded-lg border py-3 pl-10 pr-3"
              />
            </label>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Status filter"
              className="w-full rounded-lg border p-3"
            >
              <option value="সব">সব status</option>
              {CASE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          
          <div className="cases-heading">
                <div>
                   <h3>কেস তালিকা</h3>
                       <p>
      {formatBn(filteredCases.length)}টি কেস পাওয়া গেছে
               </p>
                            </div>
</div>

<div className="case-list">
  {filteredCases.map((item) => {
    const summary = getEvidenceSummary(item)
    const priority = getReviewPriority(item, summary)

    const hasStatusMismatch =
      item.status === 'যাচাই সম্পন্ন' &&
      (summary.pending > 0 || summary.incomplete > 0)

    const hasNoEvidence =
      item.status === 'যাচাই সম্পন্ন' &&
      summary.total === 0

    return (
      
<article
  className={`case-row case-row-responsive ${
    selectedCase?.id === item.id ? 'selected' : ''
  }`}
  key={item.id}
  onClick={() => selectCase(item)}
  role="button"
  tabIndex={0}
  aria-label={`${item.id} কেসের বিস্তারিত দেখুন`}
  onKeyDown={(event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      selectCase(item)
    }
  }}
>
  <div className="case-card-header">
    <div className="case-id">
      <span className="case-file-icon">
        <FileSearch size={20} />
      </span>

      <div className="case-id-text">
        <strong>{item.id}</strong>
        <small>
          {[
            item.district,
            item.upazila,
            item.mouza,
          ].filter(Boolean).join(' · ') || 'জমির অবস্থানের তথ্য নেই'}
          {item.isDemo ? ' · ডেমো' : ''}
        </small>
      </div>
    </div>

    <span
      className={`case-status ${
        item.type || getStatusType(item.status)
      }`}
    >
      {item.status || 'পর্যালোচনাধীন'}
    </span>
  </div>

  <div className="case-card-dag">
    <span>দাগ নম্বর</span>
    <strong>{item.dag || 'তথ্য নেই'}</strong>
  </div>

  <div className="case-metrics-grid">
    <div className="case-metric">
      <span>Evidence</span>
      <strong>{formatBn(summary.total)}</strong>
    </div>

    <div className="case-metric">
      <span>Pending</span>
      <strong>{formatBn(summary.pending)}</strong>
    </div>

    <div className="case-metric">
      <span>অসম্পূর্ণ</span>
      <strong>{formatBn(summary.incomplete)}</strong>
    </div>

    <div className="case-metric">
      <span>Reviewed</span>
      <strong>{formatBn(summary.reviewed)}</strong>
    </div>
  </div>

  <div className="case-card-footer">
    <span className={`case-priority ${priority.className}`}>
      {priority.label}
    </span>

    {hasStatusMismatch && (
      <span className="case-warning case-warning-danger">
        <AlertTriangle size={14} />
        Evidence review বাকি
      </span>
    )}

    {hasNoEvidence && (
      <span className="case-warning case-warning-amber">
        <AlertTriangle size={14} />
        Evidence যোগ করা হয়নি
      </span>
    )}

    <ArrowUpRight className="case-arrow" size={19} />
  </div>
</article>

    )
  })}
</div>


            {filteredCases.length === 0 && (
              <div className="py-10 text-center">
                <FileSearch
                  size={30}
                  className="mx-auto mb-3 text-gray-400"
                />
                <h3>কোনো কেস পাওয়া যায়নি</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Search বা status filter পরিবর্তন করে দেখুন।
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('')
                    setStatusFilter('সব')
                  }}
                  className="mt-3 rounded-lg border px-4 py-2"
                >
                  Filter reset
                </button>
              </div>
            )}
          

          {selectedCase && (
            <section className="selected-case-details">
              <div className="cases-heading">
                <div>
                  <h2>কেসের বিস্তারিত তথ্য</h2>
                  <p>Case ID: {selectedCase.id}</p>
                  {selectedCase.isDemo && (
                    <p className="mt-1 text-sm text-amber-700">
                      এটি নমুনা ডেটা; পরিবর্তন ও delete করা যাবে না।
                    </p>
                  )}
                </div>
                <button
                   type="button"
                    onClick={() => setShowEvidenceManager(true)}
                      className="inline-flex items-center gap-2 rounded-lg border px-3 py-2"
                       >
                      <ClipboardList size={16} />
                            Evidence Manager
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCase(null)
                    setReviewNote('')
                    setActionMessage('')
                  }}
                  aria-label="বিস্তারিত বন্ধ করুন"
                  className="inline-flex items-center gap-1 rounded-lg border px-3 py-2"
                >
                  <X size={16} />
                  বন্ধ করুন
                </button>
              </div>

              <div className="case-details-grid">

<div>
  <small>বিভাগ</small>
  <strong>{displayValue(selectedCase.division)}</strong>
</div>

<div>
  <small>জেলা</small>
  <strong>{displayValue(selectedCase.district)}</strong>
</div>

<div>
  <small>উপজেলা</small>
  <strong>{displayValue(selectedCase.upazila)}</strong>
</div>

                <div>
                  <small>মৌজা</small>
                  <strong>{displayValue(selectedCase.mouza)}</strong>
                </div>

                <div>
                  <small>খতিয়ান নম্বর</small>
                  <strong>{displayValue(selectedCase.khatian)}</strong>
                </div>

                <div>
                  <small>দাগ নম্বর</small>
                  <strong>{displayValue(selectedCase.dag)}</strong>
                </div>

                <div>
                  <small>বর্তমান অবস্থা</small>
                  <strong>{displayValue(selectedCase.status)}</strong>
                </div>

                <div>
                  <small>ঝুঁকির লেবেল</small>
                  <strong>{displayValue(selectedCase.riskLabel)}</strong>
                </div>

                <div>
                  <small>Rule-based score</small>
                  <strong>
                    {selectedCase.risk === null ||
                    selectedCase.risk === undefined
                      ? 'তথ্য নেই'
                      : `${formatBn(selectedCase.risk)} / ১০০`}
                  </strong>
                </div>

                <div>
                  <small>রেকর্ডের সংখ্যা</small>
                  <strong>{displayValue(
                    selectedCase.recordCount === undefined
                      ? ''
                      : formatBn(selectedCase.recordCount)
                  )}</strong>
                </div>

                <div>
                  <small>মালিকানার উল্লেখিত জমি</small>
                  <strong>{formatBn(selectedCase.ownedArea)}</strong>
                </div>

                <div>
                  <small>বিক্রির উল্লেখিত জমি</small>
                  <strong>{formatBn(selectedCase.saleArea)}</strong>
                </div>

                <div>
                  <small>বিক্রির পর অবশিষ্ট জমি</small>
                  <strong>{displayValue(selectedCase.remainingArea)}</strong>
                </div>

                <div>
                  <small>নথির checklist</small>
                  <strong>
                    {selectedCase.checkedDocs === undefined
                      ? 'তথ্য নেই'
                      : `${formatBn(selectedCase.checkedDocs)} / ${formatBn(
                          selectedCase.totalDocs ?? 0
                        )}`}
                  </strong>
                </div>

                <div>
                  <small>জমির পরিমাণের পার্থক্য</small>
                  <strong>
                    {selectedCase.areaDifference === null ||
                    selectedCase.areaDifference === undefined
                      ? 'তথ্য নেই'
                      : `${formatBn(selectedCase.areaDifference)} শতক`}
                  </strong>
                </div>
              </div>

              <h3>জরিপের রেকর্ড</h3>

              {Array.isArray(selectedCase.records) &&
              selectedCase.records.length > 0 ? (
                <div className="mb-5 overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr>
                        <th className="border p-2">জরিপ</th>
                        <th className="border p-2">দাগ</th>
                        <th className="border p-2">খতিয়ান</th>
                        <th className="border p-2">জমি (শতক)</th>
                        <th className="border p-2">মালিকের নাম</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCase.records.map((record, index) => (
                        <tr key={record.id ?? index}>
                          <td className="border p-2">
                            {record.survey || '—'}
                          </td>
                          <td className="border p-2">
                            {record.dag || '—'}
                          </td>
                          <td className="border p-2">
                            {record.khatian || '—'}
                          </td>
                          <td className="border p-2">
                            {record.area || '—'}
                          </td>
                          <td className="border p-2">
                            {record.owner || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>এই কেসে সংরক্ষিত জরিপের রেকর্ড নেই।</p>
              )}

              <h3>ব্যাখ্যা ও পরবর্তী করণীয়</h3>

              {Array.isArray(selectedCase.checks) &&
              selectedCase.checks.length > 0 ? (
                <div className="mb-5 space-y-3">
                  {selectedCase.checks.map((check, index) => (
                    <article
                      key={check.id || index}
                      className="rounded-lg border p-3"
                    >
                      <strong>{check.title || 'পর্যবেক্ষণ'}</strong>
                      <p className="mt-1 text-sm">
                        {check.explanation || 'ব্যাখ্যা দেওয়া হয়নি।'}
                      </p>

                      {Array.isArray(check.evidence) &&
                        check.evidence.length > 0 && (
                          <ul className="mt-2 list-disc pl-5 text-sm">
                            {check.evidence.map((evidence, evidenceIndex) => (
                              <li key={evidenceIndex}>{evidence}</li>
                            ))}
                          </ul>
                        )}

                      {check.action && (
                        <p className="mt-2 text-sm">
                          <strong>করণীয়:</strong> {check.action}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              ) : Array.isArray(selectedCase.findings) &&
                selectedCase.findings.length > 0 ? (
                <ul className="mb-5 list-disc space-y-2 pl-5">
                  {selectedCase.findings.map((finding, index) => (
                    <li key={index}>
                      {typeof finding === 'string'
                        ? finding
                        : finding?.explanation ||
                          JSON.stringify(finding)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>এই কেসের জন্য আলাদা পর্যবেক্ষণ পাওয়া যায়নি।</p>
              )}

              <h3>নথির checklist</h3>

              {Array.isArray(selectedCase.missingDocs) &&
              selectedCase.missingDocs.length > 0 ? (
                <ul className="mb-5 list-disc pl-5">
                  {selectedCase.missingDocs.map((doc, index) => (
                    <li key={doc.id || index}>
                      {typeof doc === 'string'
                        ? doc
                        : doc.label || doc.id || 'অনুপস্থিত নথি'}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mb-5">
                  অনুপস্থিত নথির কোনো তালিকা সংরক্ষিত নেই। সব নথি সত্য
                  বা সরকারি ভাবে যাচাই হয়েছে—এমন অর্থ নয়।
                </p>
              )}

              <div className="mb-5 rounded-lg border p-4">
                <h3>Reviewer note</h3>

                <textarea
                  value={reviewNote}
                  onChange={(event) => setReviewNote(event.target.value)}
                  rows={4}
                  maxLength={2000}
                  disabled={selectedCase.isDemo}
                  placeholder="আরও যাচাই প্রয়োজন এমন তথ্য বা নথি লিখুন..."
                  className="mt-2 w-full rounded-lg border p-3 disabled:bg-gray-100"
                />

                <small>
                  {formatBn(reviewNote.length)} / ২০০০ অক্ষর
                </small>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleSaveReview}
                    disabled={selectedCase.isDemo}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Save size={16} />
                    Note save
                  </button>

                  {!selectedCase.isDemo && (
                    <button
                      type="button"
                      onClick={() => handleDeleteCase(selectedCase)}
                      className="inline-flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-red-600"
                    >
                      <Trash2 size={16} />
                      Delete case
                    </button>
                  )}
                </div>

                {selectedCase.reviewNote && (
                  <p className="mt-3 text-sm text-gray-600">
                    <strong>সর্বশেষ সংরক্ষিত নোট:</strong>{' '}
                    {selectedCase.reviewNote}
                  </p>
                )}
              </div>

              <div className="mb-5 rounded-lg border p-4">
                <h3>Review status</h3>
                <p className="mb-3 text-sm text-gray-600">
                  Status পরিবর্তন করলে এই browser-এর saved case update হবে।
                </p>

                <select
                  value={selectedCase.status || CASE_STATUSES[0]}
                  disabled={selectedCase.isDemo}
                  onChange={(event) =>
                    handleStatusChange(
                      selectedCase.id,
                      event.target.value
                    )
                  }
                  className="w-full rounded-lg border p-3 disabled:bg-gray-100"
                >
                  {CASE_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              {actionMessage && (
                <p
                  role="status"
                  className="mb-4 rounded-lg border p-3 text-sm"
                >
                  {actionMessage}
                </p>
              )}

              <p className="text-sm">
                <strong>গুরুত্বপূর্ণ:</strong> এই তথ্য prototype-এর
                rule-based review-এর ফলাফল। এটি সরকারি মালিকানা,
                দলিলের সত্যতা বা আইনি বৈধতার প্রমাণ নয়।
              </p>
            </section>
          )}

          <div className="demo-notice">
            <strong>গুরুত্বপূর্ণ:</strong> ডেমো রেকর্ড ও browser-এ
            সংরক্ষিত কেসগুলো সরকারি যাচাই বা মালিকানার প্রমাণ নয়।
            Browser storage-এর তথ্য অন্য ব্যবহারকারীর সঙ্গে share হয় না।
          </div>
        </section>
      </section>
    </main>
  )
}
