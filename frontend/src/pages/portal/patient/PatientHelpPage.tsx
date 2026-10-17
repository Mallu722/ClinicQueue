import { Phone, MapPin, Clock, HelpCircle, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react'

export default function PatientHelpPage() {
  const faqs = [
    {
      q: 'How does the sequential queue number work?',
      a: 'Tokens are issued in strict sequential order (101, 102, 103...) for each doctor. When the receptionist calls the next token, the patient immediately following receives an automated next-in-line alert to proceed to the doctor cabin door.',
    },
    {
      q: 'What happens if I step out and miss my token call?',
      a: 'If you miss your call, the doctor or receptionist marks the token as skipped and proceeds to the next patient. Once you return, notify the front desk with your token number and you will be prioritized for the next available slot.',
    },
    {
      q: 'Can I view tablets prescribed during my past visits?',
      a: 'Yes! Visit the "Past Visits & Prescriptions" tab in your dashboard to view a complete history of every past appointment, doctor diagnoses, vitals recorded, and full tablet dosages with morning/afternoon/night intake instructions.',
    },
    {
      q: 'How do I download or print my official prescription?',
      a: 'On the "Past Visits & Prescriptions" tab, click the "Print Official Rx Slip" button next to any completed consultation to view and print the doctor-signed medical slip.',
    },
  ]

  return (
    <div className="space-y-8">
      {/* SOS Emergency Helpline Banner */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-rose-900 via-rose-800 to-slate-900 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 border-2 border-rose-500/30">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-14 h-14 rounded-2xl bg-white/20 text-white flex items-center justify-center font-black text-2xl shrink-0">
            <ShieldAlert size={30} />
          </div>
          <div>
            <span className="badge bg-white text-rose-900 font-extrabold text-[10px] uppercase">
              24/7 Emergency SOS
            </span>
            <h3 className="text-xl sm:text-2xl font-black mt-1">
              Need Immediate Emergency Assistance?
            </h3>
            <p className="text-xs text-rose-100 max-w-xl">
              If you or a family member are experiencing acute chest pain, shortness of breath, or trauma, contact our emergency casualty desk immediately.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <a
            href="tel:+919845012345"
            className="btn bg-white hover:bg-rose-50 text-rose-900 font-black px-5 py-3 text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg"
          >
            <Phone size={16} />
            <span>Call Casualty Desk (+91 98450 12345)</span>
          </a>
        </div>
      </div>

      {/* Grid: Clinic Guide & Timings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center">
            <Clock size={20} />
          </div>
          <h4 className="font-extrabold text-base text-slate-900 dark:text-white">OPD Operating Timings</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            <strong>Morning OPD:</strong> 09:00 AM - 01:30 PM<br />
            <strong>Evening OPD:</strong> 04:30 PM - 09:00 PM<br />
            <strong>Sunday:</strong> 09:30 AM - 01:00 PM (Emergency only)
          </p>
        </div>

        <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center">
            <MapPin size={20} />
          </div>
          <h4 className="font-extrabold text-base text-slate-900 dark:text-white">Clinic Location & Parking</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Shanti Ayush Health Clinic<br />
            Plot #42, Main Road, Vidyanagar, Hubli, Karnataka 580021.<br />
            Free basement two-wheeler and four-wheeler parking available.
          </p>
        </div>

        <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center">
            <FileText size={20} />
          </div>
          <h4 className="font-extrabold text-base text-slate-900 dark:text-white">In-House Pharmacy & Lab</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            <strong>Pharmacy Counter:</strong> Open 24 Hours<br />
            <strong>Blood Sample Collection:</strong> 07:30 AM - 06:00 PM<br />
            Reports delivered on WhatsApp within 3 hours.
          </p>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="card p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-5">
        <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
          <HelpCircle size={20} className="text-teal-600" />
          <span>Frequently Asked Questions</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5"
            >
              <h5 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 size={15} className="text-teal-600 shrink-0" />
                <span>{faq.q}</span>
              </h5>
              <p className="text-xs text-slate-600 dark:text-slate-400 pl-6 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
