import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  Plus,
  Trash2,
  FileSearch,
  Calculator,
  Files,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Download,
  ClipboardCheck,
  RotateCcw,
} from 'lucide-react'
import mouzaData from '../data/mouzas.json'
import {
    saveVerificationCase,
    generateCaseId,
    updateStoredCase,
  } from '../utils/caseStorage'
import {
  analyzeCase,
  parseNumber as numberValue,
  formatBn as formatNumber,
  DOCUMENT_OPTIONS as documentOptions,
  SAMPLE_CASE,
} from '../utils/verificationEngine'


const initialRecords = [
  { id: 1, survey: 'CS', dag: '১০৫', khatian: '৫০', area: '৬০', owner: 'নমুনা মালিক' },
  { id: 2, survey: 'SA', dag: '১০৫', khatian: '৬২', area: '৬০', owner: 'নমুনা মালিক' },
  { id: 3, survey: 'RS', dag: '২০৫, ২০৬', khatian: '৮১', area: '৫৮', owner: 'নমুনা মালিক' },
  { id: 4, survey: 'BS', dag: '', khatian: '', area: '', owner: '' },
]

const initialDocuments = {
  deed: true,
  khatian: true,
  mutation: false,
  tax: true,
  map: false,
}

function createReportText(data) {
  const lines = [
    'JomiReady — প্রাথমিক ভূমি তথ্য যাচাই প্রতিবেদন',
    '================================================',
    
     `কেস আইডি: ${data.caseId}`,
         `বিভাগ: ${data.division || 'উল্লেখ করা হয়নি'}`,
        `জেলা: ${data.district || 'উল্লেখ করা হয়নি'}`,
         `উপজেলা: ${data.upazila || 'উল্লেখ করা হয়নি'}`,
           `মৌজা: ${data.mouza || 'উল্লেখ করা হয়নি'}`,
           `খতিয়ান: ${data.khatian || 'উল্লেখ করা হয়নি'}`,

    `প্রধান দাগ: ${data.dag || 'উল্লেখ করা হয়নি'}`,
    '',
    'জরিপের রেকর্ড:',
    ...data.records.map(
      (r) =>
        `${r.survey}: দাগ ${r.dag || 'নেই'}, খতিয়ান ${r.khatian || 'নেই'}, জমি ${r.area || 'নেই'} শতক, নাম ${r.owner || 'নেই'}`,
    ),
    '',
    `মালিকের প্রদত্ত অংশ: ${data.ownedArea} শতক`,
    `প্রস্তাবিত বিক্রি: ${data.saleArea} শতক`,
    `বিক্রির পর হিসাবি অবশিষ্ট: ${data.remainingArea} শতক`,
    '',
    'পর্যালোচনার বিষয়:',
  ]

  data.checks.forEach((check) => {
    lines.push(`- ${check.title}: ${check.explanation}`)
    check.evidence.forEach((line) => lines.push(`    প্রমাণ: ${line}`))
    if (check.action) lines.push(`    করণীয়: ${check.action}`)
  })

  lines.push(
    '',
    `নথির checklist: ${data.checkedDocs} / ${data.totalDocs} সম্পন্ন`,
    `প্রোটোটাইপ risk indicator: ${data.riskLabel}`,
    `Risk score: ${data.risk ?? 'হিসাব করা যায়নি'} / 100 (শুধু প্রাথমিক পর্যালোচনার সংকেত; আইনি সিদ্ধান্ত নয়)`,
    '',
    'সতর্কতা: এটি কাল্পনিক/ব্যবহারকারীর দেওয়া তথ্যের ভিত্তিতে তৈরি প্রাথমিক প্রতিবেদন।',
    'এটি সরকারি যাচাই, মালিকানার প্রমাণ, জালিয়াতির সিদ্ধান্ত বা আইনি মতামত নয়।',
  )

  return lines.join('\n')
}

export default function Verification({ onBack }) {
    const [caseId] = useState(() => generateCaseId())
    const [hasSavedCase, setHasSavedCase] = useState(false)
  
const [division, setDivision] = useState('')
const [district, setDistrict] = useState('')
const [upazila, setUpazila] = useState('')
const [mouza, setMouza] = useState('')

  const [khatian, setKhatian] = useState('৫০')
  const [dag, setDag] = useState('১০৫')
  const [records, setRecords] = useState(initialRecords)
  const [nextId, setNextId] = useState(5)
  const [ownedArea, setOwnedArea] = useState('২৫')
  const [saleArea, setSaleArea] = useState('২০')
  const [documents, setDocuments] = useState(initialDocuments)
  const [result, setResult] = useState(null)
  
const divisions = useMemo(
    () => [...new Set(mouzaData.map((item) => item.division))].sort(),
    [],
  )
  
  const districts = useMemo(
    () => [
      ...new Set(
        mouzaData
          .filter((item) => item.division === division)
          .map((item) => item.district),
      ),
    ].sort(),
    [division],
  )
  
  const upazilas = useMemo(
    () => [
      ...new Set(
        mouzaData
          .filter(
            (item) =>
              item.division === division &&
              item.district === district,
          )
          .map((item) => item.upazila),
      ),
    ].sort(),
    [division, district],
  )
  
  const mouzaOptions = useMemo(
    () =>
      mouzaData.filter(
        (item) =>
          item.division === division &&
          item.district === district &&
          item.upazila === upazila,
      ),
    [division, district, upazila],
  )
  
  const completeRecords = useMemo(
    () =>
      records.filter(
        (record) =>
          record.dag.trim() !== '' &&
          Number.isFinite(numberValue(record.area)) &&
          numberValue(record.area) > 0,
      ),
    [records],
  )

  const updateRecord = (id, field, value) => {
    setRecords((previous) =>
      previous.map((record) =>
        record.id === id ? { ...record, [field]: value } : record,
      ),
    )
    setResult(null)
  }

  const addRecord = () => {
    setRecords((previous) => [
      ...previous,
      { id: nextId, survey: 'CS', dag: '', khatian: '', area: '', owner: '' },
    ])
    setNextId((value) => value + 1)
    setResult(null)
  }

  const removeRecord = (id) => {
    setRecords((previous) => previous.filter((record) => record.id !== id))
    setResult(null)
  }

  const toggleDocument = (id) => {
    setDocuments((previous) => ({ ...previous, [id]: !previous[id] }))
    setResult(null)
  }

  
const analyze = (event) => {
    event.preventDefault()
  
    if (!division || !district || !upazila || !mouza) {
      window.alert('বিভাগ, জেলা, উপজেলা ও মৌজা নির্বাচন করুন।')
      return
    }
  
    if (!String(khatian).trim()) {
      window.alert('খতিয়ান নম্বর লিখুন।')
      return
    }
  
    if (!String(dag).trim()) {
      window.alert('দাগ নম্বর লিখুন।')
      return
    }
    const owned = Number(ownedArea)
const sale = Number(saleArea)

if (ownedArea === '' || saleArea === '') {
  window.alert('মোট মালিকানাধীন জমি ও বিক্রির জমির পরিমাণ লিখুন।')
  return
}

if (!Number.isFinite(owned) || !Number.isFinite(sale) || owned <= 0 || sale < 0) {
  window.alert('জমির পরিমাণ সঠিকভাবে লিখুন।')
  return
}
if (!Number.isFinite(owned) || !Number.isFinite(sale)) {
    window.alert('জমির পরিমাণ অবশ্যই সঠিক সংখ্যা হতে হবে।')
    return
  }

if (sale > owned) {
  window.alert('বিক্রির জমির পরিমাণ মোট মালিকানাধীন জমির চেয়ে বেশি হতে পারে না।')
  return
}
  
    const analysis = analyzeCase({
      mouza,
      khatian,
      records,
      ownedArea,
      saleArea,
      documents,
    })
  
    const reportData = {
      ...analysis,
      caseId,
      division,
      district,
      upazila,
      mouza,
      khatian,
      dag,
      ownedArea,
      saleArea,
      documents,
    }
  
    try {
      if (hasSavedCase) {
        updateStoredCase(caseId, reportData)
      } else {
        saveVerificationCase(reportData)
        setHasSavedCase(true)
      }
  
      setResult(reportData)
    } catch (error) {
      window.alert(error.message)
    }
  }
  
  const downloadReport = () => {
    if (!result) return

    const content = createReportText(result)
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = `${result.caseId}-report.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  
const resetDemo = () => {
    setDivision('')
    setDistrict('')
    setUpazila('')
    setMouza('')
    setKhatian('')
    setDag('')
    setRecords(initialRecords)
    setNextId(5)
    setOwnedArea('')
    setSaleArea('')
    setDocuments({
      deed: false,
      khatian: false,
      mutation: false,
      tax: false,
      map: false,
    })
    setResult(null)
  }
  

 
const loadSampleCase = () => {
    setDivision('')
    setDistrict('')
    setUpazila('')
    setMouza('')
    setKhatian(SAMPLE_CASE.khatian)
    setDag(SAMPLE_CASE.dag)
    setRecords(SAMPLE_CASE.records)
    setNextId(SAMPLE_CASE.records.length + 1)
    setOwnedArea(SAMPLE_CASE.ownedArea)
    setSaleArea(SAMPLE_CASE.saleArea)
    setDocuments(SAMPLE_CASE.documents)
    setResult(null)
  }
  

  return (
    <main className="verification-page">
      <header className="verification-header">
        <button className="verification-back" onClick={onBack}>
          <ArrowLeft size={18} /> আগের পেজে ফিরুন
        </button>
        <div className="verification-brand">
          <span className="verification-brand-icon"><ShieldCheck size={23} /></span>
          <div>
            <strong>JomiReady</strong>
            <small>Advanced Verification Workspace</small>
          </div>
        </div>
        <span className="verification-case-id">{caseId}</span>
      </header>

      <div className="verification-layout">
        <section className="verification-intro">
          <span className="verification-eyebrow">LAND RECORD PRE-CHECK</span>
          <h1>জমির তথ্য <span>যাচাই workspace</span></h1>
          <p>
            বিভিন্ন জরিপের রেকর্ড তুলনা করুন, জমির অংশের হিসাব করুন,
            প্রাসঙ্গিক নথি চিহ্নিত করুন এবং ব্যাখ্যাসহ প্রাথমিক প্রতিবেদন তৈরি করুন।
          </p>
          <div className="verification-notice">
            <AlertTriangle size={18} />
            <span>
              শুধু কাল্পনিক বা অনুমোদিত তথ্য ব্যবহার করুন। এটি সরকারি রেকর্ড
              যাচাই বা মালিকানার চূড়ান্ত প্রমাণ নয়।
            </span>
          </div>
        </section>

        <form className="verification-form" onSubmit={analyze}>
          <section className="verification-panel">
            <div className="verification-panel-title">
              <span className="verification-section-icon"><FileSearch size={21} /></span>
              <div>
                <h2>১. জমির পরিচিতি</h2>
                <p>কেসের প্রাথমিক তথ্য দিন</p>
              </div>
            </div>

            <div className="verification-fields">
              
<label>
  বিভাগ (Division)
  <select
    value={division}
    onChange={(e) => {
      setDivision(e.target.value)
      setDistrict('')
      setUpazila('')
      setMouza('')
      setResult(null)
    }}
    required
  >
    <option value="">বিভাগ নির্বাচন করুন</option>
    {divisions.map((item) => (
      <option key={item} value={item}>{item}</option>
    ))}
  </select>
</label>

<label>
  জেলা (District)
  <select
    value={district}
    onChange={(e) => {
      setDistrict(e.target.value)
      setUpazila('')
      setMouza('')
      setResult(null)
    }}
    disabled={!division}
    required
  >
    <option value="">জেলা নির্বাচন করুন</option>
    {districts.map((item) => (
      <option key={item} value={item}>{item}</option>
    ))}
  </select>
</label>

<label>
  উপজেলা (Upazila)
  <select
    value={upazila}
    onChange={(e) => {
      setUpazila(e.target.value)
      setMouza('')
      setResult(null)
    }}
    disabled={!district}
    required
  >
    <option value="">উপজেলা নির্বাচন করুন</option>
    {upazilas.map((item) => (
      <option key={item} value={item}>{item}</option>
    ))}
  </select>
</label>

<label>
  মৌজার নাম (Mouza)
  <select
    value={mouza}
    onChange={(e) => {
      setMouza(e.target.value)
      setResult(null)
    }}
    disabled={!upazila}
    required
  >
    <option value="">মৌজা নির্বাচন করুন</option>
    {mouzaOptions.map((item) => (
      <option key={item.sl} value={item.mouza_name}>
        {item.mouza_name} — JL: {item.jl_number}
      </option>
    ))}
  </select>
</label>

              <label>
                প্রধান খতিয়ান নম্বর
                <input value={khatian} onChange={(e) => { setKhatian(e.target.value); setResult(null) }} placeholder="খতিয়ান নম্বর" />
              </label>
              <label>
                প্রধান / বর্তমান দাগ নম্বর
                <input value={dag} onChange={(e) => { setDag(e.target.value); setResult(null) }} placeholder="দাগ নম্বর" />
              </label>
            </div>
          </section>

          <section className="verification-panel">
            <div className="verification-panel-title">
              <span className="verification-section-icon"><Files size={21} /></span>
              <div>
                <h2>২. জরিপের রেকর্ড মিল</h2>
                <p>যতগুলো রেকর্ড আছে যোগ করুন; অসম্পূর্ণ রেকর্ড ফাঁকা রাখতে পারেন</p>
              </div>
            </div>

            <div className="record-table-wrap">
              <table className="record-table">
                <thead>
                  <tr>
                    <th>জরিপ</th>
                    <th>দাগ নম্বর</th>
                    <th>খতিয়ান</th>
                    <th>জমি (শতক)</th>
                    <th>রেকর্ডে মালিকের নাম</th>
                    <th>মুছুন</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record.id}>
                      <td>
                        <select
                          value={record.survey}
                          onChange={(e) => updateRecord(record.id, 'survey', e.target.value)}
                          aria-label="জরিপ নির্বাচন"
                        >
                          {['CS', 'SA', 'RS', 'BS', 'অন্যান্য'].map((survey) => (
                            <option key={survey} value={survey}>{survey}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input value={record.dag} onChange={(e) => updateRecord(record.id, 'dag', e.target.value)} placeholder="দাগ" aria-label="দাগ নম্বর" />
                      </td>
                      <td>
                        <input value={record.khatian} onChange={(e) => updateRecord(record.id, 'khatian', e.target.value)} placeholder="খতিয়ান" aria-label="খতিয়ান নম্বর" />
                      </td>
                      <td>
                        <input value={record.area} onChange={(e) => updateRecord(record.id, 'area', e.target.value)} placeholder="শতক" inputMode="decimal" aria-label="জমির পরিমাণ শতক" />
                      </td>
                      <td>
                        <input value={record.owner} onChange={(e) => updateRecord(record.id, 'owner', e.target.value)} placeholder="নাম (ঐচ্ছিক)" aria-label="রেকর্ডে মালিকের নাম" />
                      </td>
                      <td>
                        <button type="button" className="record-delete" onClick={() => removeRecord(record.id)} aria-label="রেকর্ড মুছুন">
                          <Trash2 size={17} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="record-table-footer">
              <span>{completeRecords.length}টি রেকর্ড বিশ্লেষণের জন্য প্রস্তুত</span>
              <button type="button" className="verification-add-button" onClick={addRecord}>
                <Plus size={17} /> রেকর্ড যোগ করুন
              </button>
            </div>
          </section>

          <section className="verification-panel">
            <div className="verification-panel-title">
              <span className="verification-section-icon"><Calculator size={21} /></span>
              <div>
                <h2>৩. মালিকানা অংশ ও বিক্রির হিসাব</h2>
                <p>ব্যবহারকারীর দেওয়া পরিমাণের ভিত্তিতে গাণিতিক হিসাব</p>
              </div>
            </div>

            <div className="verification-fields">
              <label>
                মালিকের প্রদত্ত অংশ (শতক)
                <input type="number" min="0" step="0.001" value={ownedArea} onChange={(e) => { setOwnedArea(e.target.value); setResult(null) }} />
              </label>
              <label>
                প্রস্তাবিত বিক্রির পরিমাণ (শতক)
                <input type="number" min="0" step="0.001" value={saleArea} onChange={(e) => { setSaleArea(e.target.value); setResult(null) }} />
              </label>
              <div className="area-calculation-preview">
                <small>হিসাবি অবশিষ্ট জমি</small>
                <strong>
                  {Number.isFinite(numberValue(ownedArea)) && Number.isFinite(numberValue(saleArea))
                    ? `${formatNumber(numberValue(ownedArea) - numberValue(saleArea))} শতক`
                    : 'হিসাব সম্ভব নয়'}
                </strong>
                <span>নেতিবাচক ফল হলে প্রদত্ত বিক্রির পরিমাণ অংশের চেয়ে বেশি।</span>
              </div>
            </div>
          </section>

          <section className="verification-panel">
            <div className="verification-panel-title">
              <span className="verification-section-icon"><ClipboardCheck size={21} /></span>
              <div>
                <h2>৪. নথিপত্রের checklist</h2>
                <p>কোন নথি হাতে আছে তা চিহ্নিত করুন; এখানে নথির সত্যতা যাচাই হয় না</p>
              </div>
            </div>

            <div className="document-checklist">
              {documentOptions.map((doc) => (
                <label className="document-check-item" key={doc.id}>
                  <input
                    type="checkbox"
                    checked={!!documents[doc.id]}
                    onChange={() => toggleDocument(doc.id)}
                  />
                  <span className="custom-check"><CheckCircle2 size={18} /></span>
                  <span>{doc.label}</span>
                  <small>{documents[doc.id] ? 'আছে' : 'বাকি'}</small>
                </label>
              ))}
            </div>
          </section>

          <div className="verification-actions">
            <button className="verification-analyze-button" type="submit">
              <FileSearch size={19} /> বিশ্লেষণ চালান
            </button>
            <button className="verification-reset-button" type="button" onClick={loadSampleCase}>
              <FileSearch size={17} /> নমুনা কেস (CS ১০৫ → RS ২০৫, ২০৬)
            </button>
            <button className="verification-reset-button" type="button" onClick={resetDemo}>
              <RotateCcw size={17} /> নমুনা তথ্য ফিরিয়ে আনুন
            </button>
          </div>
        </form>

        {result && (
          <section className="verification-results" aria-live="polite">
            <div className="results-heading">
              <div>
                <span className="verification-eyebrow">ANALYSIS COMPLETE</span>
                <h2>প্রাথমিক যাচাই প্রতিবেদন</h2>
                <p>কেস আইডি: {result.caseId}</p>
              </div>
              <button className="verification-download-button" onClick={downloadReport}>
                <Download size={17} /> রিপোর্ট ডাউনলোড
              </button>
            </div>

            <div className="result-summary-grid">
              <article className="result-summary-card">
                <span>বিশ্লেষিত রেকর্ড</span>
                <strong>{formatNumber(result.recordCount)}</strong>
                <small>অসম্পূর্ণ রেকর্ড বাদ</small>
              </article>
              <article className="result-summary-card">
                <span>জমির পরিমাণের পার্থক্য</span>
                <strong>{formatNumber(result.areaDifference)} শতক</strong>
                <small>সর্বোচ্চ ও সর্বনিম্ন প্রদত্ত মানের পার্থক্য</small>
              </article>
              <article className="result-summary-card">
                <span>নথির checklist</span>
                <strong>{formatNumber(result.checkedDocs)} / {formatNumber(result.totalDocs)}</strong>
                <small>ব্যবহারকারীর চিহ্নিত অবস্থা</small>
              </article>
            </div>

            <div className="risk-panel">
              <div className="risk-panel-icon"><AlertTriangle size={23} /></div>
              <div className="risk-panel-copy">
                <strong>{result.riskLabel}</strong>
                <p>
                  এই indicator নির্দিষ্ট কিছু তথ্যগত নিয়মের ওপর ভিত্তি করে।
                  এটি জালিয়াতির সম্ভাবনা বা আইনি ঝুঁকির বৈজ্ঞানিকভাবে যাচাইকৃত স্কোর নয়।
                </p>
              </div>
              <div className="risk-meter">
                <strong>{formatNumber(result.risk)} / ১০০</strong>
                <div className="risk-track">
                  <span style={{ width: `${result.risk}%` }} />
                </div>
              </div>
            </div>

            <div className="findings-panel">
              <h3>ব্যাখ্যা ও পরবর্তী করণীয়</h3>
              {result.checks.map((check) => (
                <div className="finding-item" key={check.id}>
                  <span><AlertTriangle size={17} /></span>
                  <div>
                    <strong>{check.title}</strong>
                    <p>{check.explanation}</p>
                    {check.evidence.length > 0 && (
                      <ul>
                        {check.evidence.map((line, i) => (
                          <li key={i}>{line}</li>
                        ))}
                      </ul>
                    )}
                    {check.action && <p><b>করণীয়:</b> {check.action}</p>}
                  </div>
                </div>
              ))}
            </div>

            <div className="report-disclaimer">
              <ShieldCheck size={19} />
              <p>
                <strong>প্রোটোটাইপ সীমাবদ্ধতা:</strong> ফলাফল শুধু দেওয়া নমুনা
                তথ্যের গাণিতিক ও নিয়মভিত্তিক পর্যালোচনা। সরকারি রেকর্ড, দলিলের
                সত্যতা, প্রকৃত মালিকানা, উত্তরাধিকার বা বিক্রির আইনগত অধিকার
                নিশ্চিত করা হয়নি। মূল নথি ও সংশ্লিষ্ট কর্তৃপক্ষের মাধ্যমে যাচাই করুন।
              </p>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}