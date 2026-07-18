import { useState } from 'react'

const inputClass = 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200'

function Field({ label, name, children, required = false }) {
  return <div><label htmlFor={name} className="text-sm font-semibold text-slate-700">{label}{required && <span className="ml-1 text-red-600">*</span>}</label>{children}</div>
}

function Registration() {
  const [submitted, setSubmitted] = useState(false)
  const submit = (event) => { event.preventDefault(); setSubmitted(true) }

  return (
    <main className="min-h-screen bg-violet-100 px-4 py-10 sm:px-6">
      <form onSubmit={submit} className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-white shadow-xl">
        <header className="bg-amber-800 px-6 py-8 text-white sm:px-10"><p className="text-sm font-semibold uppercase tracking-widest text-amber-200">Admissions</p><h1 className="mt-2 text-3xl font-bold sm:text-4xl">Student Registration Form</h1><p className="mt-2 text-amber-50">Fields marked with * are required.</p></header>
        <div className="space-y-8 p-6 sm:p-10">
          {submitted && <div role="status" className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800">Registration details received. We will contact you after they have been reviewed.</div>}
          <section aria-labelledby="student-details"><h2 id="student-details" className="border-b border-amber-200 pb-2 text-xl font-bold text-amber-900">Student details</h2><div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <Field label="Surname" name="surname" required><input id="surname" name="surname" type="text" autoComplete="family-name" required className={inputClass} /></Field>
            <Field label="First name" name="firstName" required><input id="firstName" name="firstName" type="text" autoComplete="given-name" required className={inputClass} /></Field>
            <Field label="Middle name" name="middleName"><input id="middleName" name="middleName" type="text" className={inputClass} /></Field>
            <Field label="Date of birth" name="dateOfBirth" required><input id="dateOfBirth" name="dateOfBirth" type="date" required className={inputClass} /></Field>
            <Field label="Gender" name="gender" required><select id="gender" name="gender" required defaultValue="" className={inputClass}><option value="" disabled>Select gender</option><option>Female</option><option>Male</option><option>Prefer not to say</option></select></Field>
            <Field label="Marital status" name="maritalStatus" required><select id="maritalStatus" name="maritalStatus" required defaultValue="" className={inputClass}><option value="" disabled>Select marital status</option><option>Single</option><option>Married</option><option>Other</option></select></Field>
            <Field label="Nationality" name="nationality" required><input id="nationality" name="nationality" type="text" defaultValue="Nigerian" required className={inputClass} /></Field>
            <Field label="State of origin" name="stateOfOrigin" required><input id="stateOfOrigin" name="stateOfOrigin" type="text" required className={inputClass} /></Field>
            <Field label="Local government area" name="lga" required><input id="lga" name="lga" type="text" required className={inputClass} /></Field>
            <Field label="City" name="city" required><input id="city" name="city" type="text" required className={inputClass} /></Field>
            <Field label="Religion" name="religion"><select id="religion" name="religion" defaultValue="" className={inputClass}><option value="">Select religion (optional)</option><option>Christianity</option><option>Islam</option><option>Traditional religion</option><option>Other</option><option>Prefer not to say</option></select></Field>
            <Field label="Passport photograph" name="passport"><input id="passport" name="passport" type="file" accept="image/*" className={inputClass} /></Field>
          </div></section>
          <section aria-labelledby="academic-details"><h2 id="academic-details" className="border-b border-amber-200 pb-2 text-xl font-bold text-amber-900">Academic details</h2><div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <Field label="Applying for" name="applicationType" required><select id="applicationType" name="applicationType" required defaultValue="" className={inputClass}><option value="" disabled>Select application type</option><option>New admission</option><option>Transfer admission</option><option>Returning student</option></select></Field>
            <Field label="Class / programme" name="programme" required><input id="programme" name="programme" type="text" placeholder="e.g. JSS 1 or Computer Science" required className={inputClass} /></Field>
            <Field label="Academic session" name="session" required><input id="session" name="session" type="text" placeholder="e.g. 2026/2027" required className={inputClass} /></Field>
            <Field label="Previous school" name="previousSchool"><input id="previousSchool" name="previousSchool" type="text" className={inputClass} /></Field>
            <Field label="Last class attended" name="lastClass"><input id="lastClass" name="lastClass" type="text" className={inputClass} /></Field>
            <Field label="Preferred start date" name="startDate"><input id="startDate" name="startDate" type="date" className={inputClass} /></Field>
          </div></section>
          <section aria-labelledby="contact-details"><h2 id="contact-details" className="border-b border-amber-200 pb-2 text-xl font-bold text-amber-900">Contact and guardian details</h2><div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <Field label="Student email" name="email" required><input id="email" name="email" type="email" autoComplete="email" required className={inputClass} /></Field>
            <Field label="Student phone number" name="phone" required><input id="phone" name="phone" type="tel" autoComplete="tel" required className={inputClass} /></Field>
            <Field label="Home address" name="address" required><input id="address" name="address" type="text" autoComplete="street-address" required className={inputClass} /></Field>
            <Field label="Parent / guardian name" name="guardianName" required><input id="guardianName" name="guardianName" type="text" autoComplete="name" required className={inputClass} /></Field>
            <Field label="Relationship to student" name="relationship" required><select id="relationship" name="relationship" required defaultValue="" className={inputClass}><option value="" disabled>Select relationship</option><option>Parent</option><option>Guardian</option><option>Sibling</option><option>Other</option></select></Field>
            <Field label="Parent / guardian phone" name="guardianPhone" required><input id="guardianPhone" name="guardianPhone" type="tel" required className={inputClass} /></Field>
            <Field label="Parent / guardian email" name="guardianEmail"><input id="guardianEmail" name="guardianEmail" type="email" className={inputClass} /></Field>
            <Field label="Emergency contact name" name="emergencyName" required><input id="emergencyName" name="emergencyName" type="text" required className={inputClass} /></Field>
            <Field label="Emergency contact phone" name="emergencyPhone" required><input id="emergencyPhone" name="emergencyPhone" type="tel" required className={inputClass} /></Field>
          </div></section>
          <section aria-labelledby="health-details"><h2 id="health-details" className="border-b border-amber-200 pb-2 text-xl font-bold text-amber-900">Health information</h2><div className="mt-5 grid gap-5 md:grid-cols-2"><Field label="Blood group" name="bloodGroup"><select id="bloodGroup" name="bloodGroup" defaultValue="" className={inputClass}><option value="">Select blood group (optional)</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O+</option><option>O-</option></select></Field><Field label="Medical conditions, allergies, or medications" name="medicalInformation"><textarea id="medicalInformation" name="medicalInformation" rows="3" placeholder="Provide relevant information, or write None" className={inputClass} /></Field></div></section>
          <label className="flex items-start gap-3 rounded-lg bg-slate-50 p-4 text-sm text-slate-700"><input name="declaration" type="checkbox" required className="mt-1 h-4 w-4 accent-amber-700" /><span>I confirm that the information supplied is accurate and I consent to its use for admission and student-record purposes.</span></label>
          <div className="flex justify-end"><button type="submit" className="rounded-lg bg-amber-700 px-7 py-3 font-bold text-white transition hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2">Submit registration</button></div>
        </div>
      </form>
    </main>
  )
}

export default Registration
