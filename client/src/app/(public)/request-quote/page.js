"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { VerificationBadge } from "../../../components/farmers/VerificationBadge";
import { useListings } from "../../../hooks/useListings";
import { useCreateQuote } from "../../../hooks/useQuotes";
import useAuth from "../../../hooks/useAuth";
import { buildQuoteRequestMessage } from "../../../lib/quoteRequest";

const UNVERIFIED_WARNING = "This seller account is not yet verified. Please proceed carefully because this profile has not completed National ID verification.";
const steps = ["Supply", "Contact", "Commercial", "Review"];
const inputClass = "mt-2 min-h-14 w-full rounded-[10px] border border-transparent bg-[#F2F8F3] px-4 text-[15px] text-ink-800 outline-none transition focus:border-green-700 focus:bg-white focus:ring-4 focus:ring-green-800/10";

function Field({ label, required, children, className = "" }) {
  return (
    <label className={className}>
      <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-500">
        {label}{required ? " *" : ""}
      </span>
      {children}
    </label>
  );
}
function StepHeading({ number, children }) {
  return (
    <div className="flex items-center gap-4 border-b border-ink-100 pb-5">
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#1E5E27] text-[15px] font-bold text-white">{number}</span>
      <h2 className="text-[20px] font-bold text-[#174E2D]">{children}</h2>
    </div>
  );
}

export default function RequestQuotePage() {
  const searchParams = useSearchParams();
  const selectedListingId = searchParams.get("listingId") || "";
  const { user, isBuyer } = useAuth();
  const { listings, isLoading } = useListings();
  const createQuote = useCreateQuote();
  const [step, setStep] = useState(1);
  const [listingId, setListingId] = useState(selectedListingId);
  const [form, setForm] = useState({
    variety: "",
    quantity: "",
    grade: "",
    destination: "",
    incoterm: "FOB (Free on Board)",
    deliveryTiming: "",
    contactName: "",
    company: "",
    email: "",
    phone: "",
    requestedPrice: "",
    packaging: "",
    notes: "",
  });
  const [submittedQuote, setSubmittedQuote] = useState(null);

  useEffect(() => {
    if (selectedListingId) setListingId(selectedListingId);
  }, [selectedListingId]);

  useEffect(() => {
    if (!user) return;
    setForm((current) => ({
      ...current,
      contactName: current.contactName || user.full_name || user.name || "",
      email: current.email || user.email || "",
      phone: current.phone || user.phone || "",
    }));
  }, [user]);

  const listing = useMemo(
    () => listings.find((item) => item.id === listingId),
    [listings, listingId],
  );

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  function continueStep() {
    if (step === 1 && (!listingId || !form.quantity || !form.grade || !form.destination)) {
      toast.error("Complete the required supply fields before continuing.");
      return;
    }
    if (step === 2 && (!form.contactName || (!form.email && !form.phone) || !form.deliveryTiming)) {
      toast.error("Add a contact, email or phone, and delivery timing.");
      return;
    }
    setStep((current) => Math.min(4, current + 1));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (step < 4) {
      continueStep();
      return;
    }
    if (!user) {
      toast.error("Please sign in as a buyer to submit a quote request.");
      return;
    }
    if (!isBuyer) {
      toast.error("Only buyer accounts can request quotes.");
      return;
    }
    if (listing?.farmerVerificationStatus !== "verified") toast(UNVERIFIED_WARNING);

    try {
      const result = await createQuote.mutateAsync({
        listingId,
        quantity: Number(form.quantity),
        requestedPrice: form.requestedPrice ? Number(form.requestedPrice) : null,
        currency: listing?.currency || "XAF",
        message: buildQuoteRequestMessage(form).slice(0, 2000),
      });
      setSubmittedQuote(result.quote);
      if (result.farmerWarning) toast(result.farmerWarning);
      toast.success("Quote request saved.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Quote request failed.");
    }
  }

  if (submittedQuote) {
    return (
      <section className="mx-auto max-w-[760px] py-16 text-center">
        <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-800">
          <Check className="h-8 w-8" />
        </span>
        <h1 className="mt-7 font-display text-[42px] font-semibold text-[#0E4F2A]">Quote request submitted</h1>
        <p className="mx-auto mt-4 max-w-xl text-[16px] leading-7 text-ink-600">
          Your request is saved with status {submittedQuote.status}. The seller can review it from their dashboard.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/buyer/quotes" className="rounded-[10px] bg-[#1E5E27] px-6 py-3 font-bold text-white">View my quotes</Link>
          <Link href="/browse" className="rounded-[10px] border border-ink-200 bg-white px-6 py-3 font-bold text-ink-700">Browse more crops</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="-my-8 pb-20 lg:-my-10">
      <div className="flex justify-end border-b border-ink-200 py-5">
        <div className="flex items-center gap-4 text-[13px] font-semibold text-ink-500">
          <span>Step {step} of 4</span>
          <span className="h-2 w-36 overflow-hidden rounded-full bg-green-50">
            <span className="block h-full rounded-full bg-[#1E5E27] transition-all" style={{ width: `${step * 25}%` }} />
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-[900px] py-14">
        <div className="text-center">
          <h1 className="font-display text-[42px] font-semibold text-[#0E4F2A] sm:text-[48px]">Request a Quote</h1>
          <p className="mx-auto mt-4 max-w-2xl text-[17px] leading-7 text-ink-600">
            Provide your sourcing requirements so the selected producer can review a complete request.
          </p>
        </div>

        <ol className="mx-auto mt-9 flex max-w-2xl justify-between gap-2" aria-label="Quote request progress">
          {steps.map((label, index) => (
            <li key={label} className={`text-center text-[11px] font-bold uppercase tracking-wide ${index + 1 <= step ? "text-green-800" : "text-ink-300"}`} aria-current={index + 1 === step ? "step" : undefined}>
              {label}
            </li>
          ))}
        </ol>

        <form onSubmit={handleSubmit} className="mt-8 rounded-[28px] border border-ink-200 bg-white p-6 shadow-[0_18px_50px_rgba(20,39,29,0.06)] sm:p-10 lg:p-12">
          {!user ? (
            <div className="mb-7 rounded-[12px] bg-amber-50 px-4 py-3 text-[13px] text-amber-900">
              Sign in as a buyer before final submission. You can complete and review the request first.
            </div>
          ) : null}

          {step === 1 ? (
            <div className="space-y-10">
              <div>
                <StepHeading number="1">Supply needed</StepHeading>
                <div className="mt-7 grid gap-6 md:grid-cols-2">
                  <Field label="Crop listing" required>
                    <select value={listingId} onChange={(event) => setListingId(event.target.value)} className={inputClass}>
                      <option value="">{isLoading ? "Loading listings..." : "Select an active listing"}</option>
                      {listings.map((item) => (
                        <option key={item.id} value={item.id}>{item.crop} — {item.location}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Specific variety (optional)">
                    <input value={form.variety} onChange={update("variety")} placeholder="e.g. Arabica, Trinitario" className={inputClass} />
                  </Field>
                </div>
              </div>

              <div>
                <StepHeading number="2">Quantity & quality</StepHeading>
                <div className="mt-7 grid gap-6 md:grid-cols-2">
                  <Field label="Target quantity" required>
                    <div className="mt-2 flex gap-3">
                      <input type="number" min="0.01" step="0.01" value={form.quantity} onChange={update("quantity")} placeholder="0.00" className={inputClass.replace("mt-2 ", "")} />
                      <span className="inline-flex min-h-14 min-w-24 items-center justify-center rounded-[10px] bg-[#F2F8F3] px-4 text-[14px] font-bold text-ink-600">units</span>
                    </div>
                  </Field>
                  <Field label="Required grade" required>
                    <select value={form.grade} onChange={update("grade")} className={inputClass}>
                      <option value="">Select grade</option>
                      <option value="Standard">Standard</option>
                      <option value="Premium">Premium</option>
                      <option value="Export specification">Export specification</option>
                      <option value="To be agreed">To be agreed</option>
                    </select>
                  </Field>
                </div>
              </div>

              <div>
                <StepHeading number="3">Destination & shipment</StepHeading>
                <div className="mt-7 grid gap-6 md:grid-cols-2">
                  <Field label="Destination" required>
                    <input value={form.destination} onChange={update("destination")} placeholder="City and country" className={inputClass} />
                  </Field>
                  <Field label="Shipment term">
                    <select value={form.incoterm} onChange={update("incoterm")} className={inputClass}>
                      <option>FOB (Free on Board)</option>
                      <option>EXW (Ex Works)</option>
                      <option>CIF (Cost, Insurance & Freight)</option>
                      <option>Buyer and seller to agree</option>
                    </select>
                  </Field>
                </div>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div>
              <StepHeading number="2">Contact & timing</StepHeading>
              <div className="mt-7 grid gap-6 md:grid-cols-2">
                <Field label="Contact name" required>
                  <input value={form.contactName} onChange={update("contactName")} className={inputClass} />
                </Field>
                <Field label="Company (optional)">
                  <input value={form.company} onChange={update("company")} className={inputClass} />
                </Field>
                <Field label="Email">
                  <input type="email" value={form.email} onChange={update("email")} className={inputClass} />
                </Field>
                <Field label="Phone">
                  <input type="tel" value={form.phone} onChange={update("phone")} className={inputClass} />
                </Field>
                <Field label="Required delivery timing" required className="md:col-span-2">
                  <input value={form.deliveryTiming} onChange={update("deliveryTiming")} placeholder="e.g. Within 30 days" className={inputClass} />
                </Field>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div>
              <StepHeading number="3">Commercial requirements</StepHeading>
              <div className="mt-7 grid gap-6 md:grid-cols-2">
                <Field label="Requested price per unit (optional)">
                  <input type="number" min="0" step="0.01" value={form.requestedPrice} onChange={update("requestedPrice")} placeholder={listing?.currency || "XAF"} className={inputClass} />
                </Field>
                <Field label="Packaging (optional)">
                  <input value={form.packaging} onChange={update("packaging")} placeholder="e.g. 50 kg bags" className={inputClass} />
                </Field>
                <Field label="Additional requirements (optional)" className="md:col-span-2">
                  <textarea value={form.notes} onChange={update("notes")} rows={5} placeholder="Quality documents, inspection, logistics, or other requirements." className={`${inputClass} py-4`} />
                </Field>
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <div>
              <StepHeading number="4">Review your request</StepHeading>
              <dl className="mt-7 grid gap-4 rounded-[18px] bg-[#F7FAF8] p-6 md:grid-cols-2">
                {[
                  ["Listing", listing?.crop || "Not selected"],
                  ["Quantity", form.quantity],
                  ["Grade", form.grade],
                  ["Destination", form.destination],
                  ["Shipment", form.incoterm],
                  ["Delivery", form.deliveryTiming],
                  ["Contact", form.contactName],
                  ["Requested price", form.requestedPrice || "Seller to quote"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-[11px] font-bold uppercase tracking-wide text-ink-400">{label}</dt>
                    <dd className="mt-1 text-[15px] font-semibold text-ink-800">{value || "Not provided"}</dd>
                  </div>
                ))}
              </dl>
              {listing ? (
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-ink-200 px-5 py-4">
                  <div>
                    <p className="font-bold text-ink-900">{listing.crop}</p>
                    <p className="mt-1 text-[13px] text-ink-500">{listing.price} from {listing.farmer?.name || "seller"}</p>
                  </div>
                  <VerificationBadge status={listing.farmerVerificationStatus} />
                  {listing.farmerVerificationStatus !== "verified" ? (
                    <p className="flex w-full gap-2 text-[12px] leading-5 text-amber-900">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      {UNVERIFIED_WARNING}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="mt-10 flex flex-col-reverse gap-4 border-t border-ink-100 pt-7 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {step > 1 ? (
                <button type="button" onClick={() => setStep((current) => current - 1)} className="inline-flex min-h-12 items-center gap-2 px-2 text-[14px] font-bold text-ink-600 hover:text-green-800">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
              ) : (
                <p className="max-w-md text-[12px] leading-5 text-ink-500">Your requirements are shared with the seller attached to the selected listing.</p>
              )}
            </div>

            {step < 4 ? (
              <button type="submit" className="inline-flex min-h-14 items-center justify-center gap-3 rounded-[12px] bg-[#1E5E27] px-8 text-[15px] font-bold text-white shadow-[0_12px_24px_rgba(30,94,39,0.2)] hover:bg-green-900">
                Continue to {steps[step]}
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : user ? (
              <button type="submit" disabled={!isBuyer || createQuote.isPending} className="inline-flex min-h-14 items-center justify-center gap-3 rounded-[12px] bg-[#1E5E27] px-8 text-[15px] font-bold text-white shadow-[0_12px_24px_rgba(30,94,39,0.2)] hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-50">
                {createQuote.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Submit quote request
              </button>
            ) : (
              <Link href="/auth/login?next=%2Frequest-quote" className="inline-flex min-h-14 items-center justify-center rounded-[12px] bg-[#1E5E27] px-8 text-[15px] font-bold text-white">
                Sign in to submit
              </Link>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
