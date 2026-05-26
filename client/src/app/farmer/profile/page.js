"use client";

import { BadgeCheck, FileText } from "lucide-react";
import {
  FarmerButton,
  FarmerEmptyState,
  FarmerHeader,
  FarmerPage,
  FarmerPanel,
  FarmerStatusBadge,
  farmerDisplayName,
  farmerInitials,
} from "@/components/farmer/FarmerDesignSystem";
import { Input } from "@/components/ui/input";
import useAuth from "@/hooks/useAuth";
import { useDashboardData } from "@/hooks/useDashboardData";
import { EditableProfilePanel } from "@/components/account/EditableProfilePanel";
import { ProfilePhotoEditor } from "@/components/account/ProfilePhotoEditor";

const valueOrEmpty = (value) => value || "";

function ReadOnlyField({ label, value, className }) {
  return (
    <label className={className || "space-y-2"}>
      <span className="text-[15px] font-semibold text-ink-700">{label}</span>
      <Input value={valueOrEmpty(value)} readOnly placeholder="Not saved yet" className="h-14 rounded-lg text-[16px]" />
    </label>
  );
}

export default function FarmerProfilePage() {
  const { user } = useAuth();
  const { data, isLoading, error } = useDashboardData("farmer");
  const profile = data?.profile || {};
  const listings = data?.listings || [];
  const orders = data?.orders || [];
  const verified = user?.status === "active";

  if (isLoading) {
    return <FarmerEmptyState title="Loading farmer profile" description="Fetching your live farmer account details." />;
  }

  if (error) {
    return <FarmerEmptyState title="Profile unavailable" description="The live farmer profile could not be loaded right now." />;
  }

  return (
    <FarmerPage>
      <FarmerHeader title="My Profile" action={<FarmerButton href="/find-farmers" variant="outline">View Public Profile</FarmerButton>} />

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-6">
          <FarmerPanel>
            <div className="text-center">
              <ProfilePhotoEditor
                user={user}
                initials={farmerInitials(user)}
                displayName={farmerDisplayName(user)}
                size="xl"
                avatarClassName="mx-auto h-32 w-32 border-8 border-green-50 text-[44px]"
                buttonClassName="mt-5 inline-flex items-center justify-center gap-2 text-[16px] font-bold text-green-800 underline-offset-4 hover:underline"
              />
              <h2 className="mt-6 text-[30px] font-medium text-ink-950">{farmerDisplayName(user)}</h2>
              <p className="mt-2 text-[17px] text-ink-500">{[profile.city || user?.city, profile.region || user?.region].filter(Boolean).join(", ") || "Location pending"}</p>
              <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4">
                <p className="inline-flex items-center gap-2 text-[18px] font-bold text-green-800">
                  <BadgeCheck className="h-5 w-5" />
                  {verified ? "Verified Farmer" : "Verification Pending"}
                </p>
                <p className="mt-2 text-[14px] text-ink-500">Current account status: {user?.status || "unknown"}</p>
              </div>
              <div className="mt-6 grid grid-cols-3 border-t border-ink-100 pt-6 text-center">
                <div>
                  <p className="text-[22px] font-bold text-ink-950">{listings.length}</p>
                  <p className="text-[12px] font-bold uppercase text-ink-400">Listings</p>
                </div>
                <div>
                  <p className="text-[22px] font-bold text-ink-950">{orders.length}</p>
                  <p className="text-[12px] font-bold uppercase text-ink-400">Sales</p>
                </div>
                <div>
                  <p className="text-[22px] font-bold text-ink-950">{profile.rating || "0"}</p>
                  <p className="text-[12px] font-bold uppercase text-ink-400">Rating</p>
                </div>
              </div>
            </div>
          </FarmerPanel>

          <FarmerPanel title="Documents">
            <div className="space-y-3">
              {["National ID Card", "Farm Ownership", "Cooperative Reference"].map((label) => (
                <div key={label} className="flex items-center justify-between gap-3 rounded-lg border border-ink-100 px-4 py-3">
                  <span className="inline-flex items-center gap-3 text-[15px] font-bold text-ink-950">
                    <FileText className="h-5 w-5 text-ink-300" />
                    {label}
                  </span>
                  <FarmerStatusBadge status={verified ? "verified" : "pending"}>{verified ? "Verified" : "Pending"}</FarmerStatusBadge>
                </div>
              ))}
            </div>
          </FarmerPanel>
        </div>

        <FarmerPanel title="Farm & Personal Details">
          <div className="space-y-8">
            <div>
              <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-ink-400">Personal Information</p>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <ReadOnlyField label="First Name" value={user?.first_name} />
                <ReadOnlyField label="Last Name" value={user?.last_name} />
                <ReadOnlyField label="Phone Number" value={user?.phone} className="space-y-2 md:col-span-2" />
                <ReadOnlyField label="Email" value={user?.email} className="space-y-2 md:col-span-2" />
              </div>
            </div>

            <div>
              <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-ink-400">Farm Details</p>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <ReadOnlyField label="Farm / Cooperative Name" value={profile.farm_name || profile.cooperative_name} className="space-y-2 md:col-span-2" />
                <ReadOnlyField label="Region" value={profile.region || user?.region} />
                <ReadOnlyField label="City" value={profile.city || user?.city} />
                <ReadOnlyField label="Primary Crop" value={profile.primary_crop} />
                <ReadOnlyField label="Harvest Volume" value={profile.harvest_volume} />
              </div>
            </div>

            <div>
              <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-ink-400">Settlement</p>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <ReadOnlyField label="Payout Method" value={profile.payout_method} />
                <ReadOnlyField label="Payout Account Name" value={profile.payout_account_name} />
              </div>
            </div>
          </div>
        </FarmerPanel>
      </div>

      <EditableProfilePanel title="Edit farmer profile, photo, and security" profile={profile} />
    </FarmerPage>
  );
}
