
import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  FileText,
  Plus,
  Trash2,
  ShieldCheck,
  ClipboardList,
  Save,
} from 'lucide-react'
import {
  addEvidence,
  deleteEvidence,
  getEvidenceForCase,
  subscribeToEvidenceUpdates,
  updateEvidence,
} from '../utils/evidenceStorage'

const CATEGORIES = [
  'দলিল',
  'খতিয়ান',
  'নামজারি',
  'ভূমি উন্নয়ন করের রসিদ',
  'মৌজা ম্যাপ',
  'অন্যান্য',
]

const STATUSES = [
  'পর্যালোচনাধীন',
  'তথ্য অসম্পূর্ণ',
  'পর্যালোচিত',
]

const styles = {
  page: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '24px 16px 48px',
    color: '#172b25',
  },
  card: {
    background: '#fff',
    border: '1px solid #e1e9e4',
    borderRadius: 16,
    padding: 20,
    marginBottom: 18,
  },
  label: {
    display: 'block',
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 6,
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid #d5dfd9',
    borderRadius: 9,
    padding: '10px 12px',
    font: 'inherit',
    background: '#fff',
  },
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    border: '1px solid #d5dfd9',
    borderRadius: 9,
    padding: '10px 13px',
    background: '#fff',
    color: '#173d30',
    cursor: 'pointer',
    font: 'inherit',
    fontWeight: 600,
  },
  primary: {
    background: '#176b4d',
    color: '#fff',
    border: '1px solid #176b4d',
  },
}

function formatDate(value) {
  if (!value) return 'তারিখ নেই'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'তারিখ নেই'

  return date.toLocaleDateString('bn-BD', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function CaseDetails({ caseData, onBack }) {
  const caseId = caseData?.caseId || caseData?.id || ''

  const [evidence, setEvidence] = useState(() =>
    getEvidenceForCase(caseId),
  )
  const [category, setCategory] = useState('দলিল')
  const [title, setTitle] = useState('')
  const [referenceNo, setReferenceNo] = useState('')
  const [fileName, setFileName] = useState('')
  const [note, setNote] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const refresh = () => setEvidence(getEvidenceForCase(caseId))
    refresh()
    return subscribeToEvidenceUpdates(refresh)
  }, [caseId])

  const handleAddEvidence = (event) => {
    event.preventDefault()
    setMessage('')
    setError('')

    if (!caseId) {
      setError('এই কেসের Case ID পাওয়া যায়নি।')
      return
    }

    if (!title.trim()) {
      setError('Evidence-এর নাম লিখুন।')
      return
    }

    try {
      addEvidence(caseId, {
        category,
        title,
        referenceNo,
        fileName,
        note,
        status: 'পর্যালোচনাধীন',
      })

      setTitle('')
      setReferenceNo('')
      setFileName('')
      setNote('')
      setMessage('Evidence-এর বিবরণ সংরক্ষণ হয়েছে।')
      setEvidence(getEvidenceForCase(caseId))
    } catch {
      setError('Evidence সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।')
    }
  }

  const handleStatusChange = (evidenceId, status) => {
    updateEvidence(caseId, evidenceId, { status })
    setEvidence(getEvidenceForCase(caseId))
  }

  const handleNoteChange = (evidenceId, noteValue) => {
    updateEvidence(caseId, evidenceId, { note: noteValue })
    setEvidence(getEvidenceForCase(caseId))
  }

  
  const handleDelete = (item) => {
    const confirmed = window.confirm(
      `“${item.title}” evidence-এর বিবরণ মুছে ফেলবেন?`,
    )

    if (!confirmed) return

    const deleted = deleteEvidence(caseId, item.id)

    if (!deleted) {
      setError('Evidence মুছে ফেলা যায়নি। আবার refresh করে চেষ্টা করুন।')
      setMessage('')
      return
    }

    setEvidence(getEvidenceForCase(caseId))
    setError('')
    setMessage('Evidence-এর বিবরণ মুছে ফেলা হয়েছে।')
  }
  const evidenceSummary = {
    total: evidence.length,
    pending: evidence.filter(
      (item) => item.status === 'পর্যালোচনাধীন'
    ).length,
    incomplete: evidence.filter(
      (item) => item.status === 'তথ্য অসম্পূর্ণ'
    ).length,
    reviewed: evidence.filter(
      (item) => item.status === 'পর্যালোচিত'
    ).length,
  }


  const recordCount = Array.isArray(caseData?.records)
    ? caseData.records.length
    : Number(caseData?.recordCount || 0)

  return (
    <main style={styles.page}>
      <button type="button" style={styles.button} onClick={onBack}>
        <ArrowLeft size={17} />
        Dashboard-এ ফিরুন
      </button>

      <header style={{ margin: '24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ShieldCheck size={28} color="#176b4d" />
          <div>
            <p style={{ margin: 0, color: '#547066', fontSize: 13 }}>
              JOMIREADY / CASE DETAILS
            </p>
            <h1 style={{ margin: '5px 0', fontSize: 28 }}>
              কেসের বিস্তারিত
            </h1>
          </div>
        </div>
        <p style={{ color: '#52675e', marginBottom: 0 }}>
          Case ID: <strong>{caseId || 'পাওয়া যায়নি'}</strong>
        </p>
      </header>

      <section style={styles.card}>
        <h2 style={{ marginTop: 0 }}>জমির সারসংক্ষেপ</h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16,
          }}
        >
          
<div>
  <small>বিভাগ</small>
  <p><strong>{caseData?.division || 'উল্লেখ নেই'}</strong></p>
</div>

<div>
  <small>জেলা</small>
  <p><strong>{caseData?.district || 'উল্লেখ নেই'}</strong></p>
</div>

<div>
  <small>উপজেলা</small>
  <p><strong>{caseData?.upazila || 'উল্লেখ নেই'}</strong></p>
</div>

<div>
  <small>মৌজা</small>
  <p><strong>{caseData?.mouza || 'উল্লেখ নেই'}</strong></p>
</div>

          <div>
            <small>খতিয়ান নম্বর</small>
            <p><strong>{caseData?.khatian || 'উল্লেখ নেই'}</strong></p>
          </div>
          <div>
            <small>প্রধান দাগ</small>
            <p><strong>{caseData?.dag || 'উল্লেখ নেই'}</strong></p>
          </div>
          <div>
            <small>বিশ্লেষিত রেকর্ড</small>
            <p><strong>{recordCount}</strong></p>
          </div>
          <div>
            <small>মালিকের প্রদত্ত অংশ</small>
            <p><strong>{caseData?.ownedArea ?? 'উল্লেখ নেই'} শতক</strong></p>
          </div>
          <div>
            <small>প্রস্তাবিত বিক্রি</small>
            <p><strong>{caseData?.saleArea ?? 'উল্লেখ নেই'} শতক</strong></p>
          </div>
          <div>
            <small>কেস স্ট্যাটাস</small>
            <p><strong>{caseData?.status || 'পর্যালোচনাধীন'}</strong></p>
          </div>
          <div>
            <small>তৈরির তারিখ</small>
            <p><strong>{formatDate(caseData?.createdAt)}</strong></p>
          </div>
        </div>

        <p style={{ color: '#64766e', fontSize: 13, marginBottom: 0 }}>
          এই সারসংক্ষেপ কেসে সংরক্ষিত তথ্যের ভিত্তিতে দেখানো হচ্ছে।
          এটি সরকারি রেকর্ডের সঙ্গে সরাসরি যাচাই নয়।
        </p>
      </section>

      <section style={styles.card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ClipboardList size={22} color="#176b4d" />
          <div>
            <h2 style={{ margin: 0 }}>Evidence Manager</h2>
            <p style={{ color: '#64766e', margin: '5px 0 0' }}>
              নথির বিবরণ যোগ করুন এবং প্রতিটির পর্যালোচনার অবস্থা রাখুন।
            </p>
          </div>
        </div>

        <form onSubmit={handleAddEvidence} style={{ marginTop: 22 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 16,
            }}
          >
            <label>
              <span style={styles.label}>নথির ধরন</span>
              <select
                style={styles.input}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>

            <label>
              <span style={styles.label}>Evidence-এর নাম *</span>
              <input
                style={styles.input}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="যেমন: RS খতিয়ানের কপি"
                required
              />
            </label>

            <label>
              <span style={styles.label}>রেফারেন্স / নথি নম্বর</span>
              <input
                style={styles.input}
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                placeholder="ঐচ্ছিক"
              />
            </label>

            <label>
              <span style={styles.label}>ফাইল নির্বাচন (ঐচ্ছিক)</span>
              <input
                style={styles.input}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) =>
                  setFileName(e.target.files?.[0]?.name || '')
                }
              />
            </label>
          </div>

          <label style={{ display: 'block', marginTop: 16 }}>
            <span style={styles.label}>নোট</span>
            <textarea
              style={{ ...styles.input, minHeight: 90, resize: 'vertical' }}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="কোন তথ্য পরীক্ষা করতে হবে বা কী অমিল পাওয়া গেছে?"
            />
          </label>

          <p style={{ color: '#7b5a20', fontSize: 13 }}>
            Prototype সীমাবদ্ধতা: এখানে নির্বাচিত ফাইলের নাম রাখা হয়, ফাইলের
            আসল কনটেন্ট সংরক্ষণ বা আপলোড হয় না। বাস্তব জমির নথি আপলোড করার আগে
            নিরাপদ backend ও access control যোগ করতে হবে।
          </p>

          {error && (
            <p role="alert" style={{ color: '#b42318' }}>{error}</p>
          )}
          {message && (
            <p role="status" style={{ color: '#176b4d' }}>{message}</p>
          )}

          <button
            type="submit"
            style={{ ...styles.button, ...styles.primary, marginTop: 8 }}
          >
            <Plus size={17} />
            Evidence যোগ করুন
          </button>
        </form>
      </section>

      <section style={styles.card}>
        <h2 style={{ marginTop: 0 }}>
          সংরক্ষিত Evidence ({evidence.length})
        </h2>
      
       
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: 12,
      marginBottom: 20,
    }}
  >
    {[
      {
        label: 'মোট Evidence',
        count: evidenceSummary.total,
        color: '#176b4d',
      },
      {
        label: 'পর্যালোচনাধীন',
        count: evidenceSummary.pending,
        color: '#9a6700',
      },
      {
        label: 'তথ্য অসম্পূর্ণ',
        count: evidenceSummary.incomplete,
        color: '#b42318',
      },
      {
        label: 'পর্যালোচিত',
        count: evidenceSummary.reviewed,
        color: '#175cd3',
      },
    ].map((item) => (
      <div
        key={item.label}
        style={{
          border: '1px solid #e1e9e4',
          borderRadius: 12,
          padding: 16,
          background: '#f8faf9',
        }}
      >
        <small style={{ color: '#52675e' }}>{item.label}</small>
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: item.color,
            marginTop: 8,
          }}
        >
          {item.count}
        </div>
      </div>
    ))}
  </div>

        {evidence.length === 0 ? (
          <div
            style={{
              padding: 24,
              textAlign: 'center',
              background: '#f6f9f7',
              borderRadius: 12,
              color: '#64766e',
            }}
          >
            <FileText size={30} />
            <p>এখনো কোনো evidence যোগ করা হয়নি।</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 14 }}>
            {evidence.map((item) => (
              <article
                key={item.id}
                style={{
                  border: '1px solid #e1e9e4',
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  <div>
                    <small style={{ color: '#547066' }}>{item.category}</small>
                    <h3 style={{ margin: '5px 0' }}>{item.title}</h3>
                    {item.referenceNo && (
                      <p style={{ margin: '4px 0' }}>
                        রেফারেন্স: {item.referenceNo}
                      </p>
                    )}
                    {item.fileName && (
                      <p style={{ margin: '4px 0', color: '#52675e' }}>
                        ফাইলের নাম: {item.fileName}
                      </p>
                    )}
                    <small style={{ color: '#64766e' }}>
                      যোগ করা হয়েছে: {formatDate(item.createdAt)}
                    </small>
                  </div>

                  <button
                    type="button"
                    style={{ ...styles.button, color: '#b42318' }}
                    onClick={() => handleDelete(item)}
                  >
                    <Trash2 size={16} />
                    মুছুন
                  </button>
                </div>

                <label style={{ display: 'block', marginTop: 14 }}>
                  <span style={styles.label}>Review status</span>
                  <select
                    style={styles.input}
                    value={item.status}
                    onChange={(e) =>
                      handleStatusChange(item.id, e.target.value)
                    }
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </label>

                <label style={{ display: 'block', marginTop: 12 }}>
                  <span style={styles.label}>Reviewer note</span>
                  <textarea
                    key={`${item.id}-${item.updatedAt}`}
                    defaultValue={item.note}
                    onBlur={(e) => handleNoteChange(item.id, e.target.value)}
                    style={{
                      ...styles.input,
                      minHeight: 70,
                      resize: 'vertical',
                    }}
                    placeholder="পর্যালোচনার মন্তব্য লিখুন; বাইরে ক্লিক করলে Save হবে।"
                  />
                </label>

                <p
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    color: '#64766e',
                    fontSize: 12,
                    marginBottom: 0,
                  }}
                >
                  <Save size={14} />
                  Reviewer note: field থেকে বাইরে ক্লিক করলে সংরক্ষিত হবে।
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
