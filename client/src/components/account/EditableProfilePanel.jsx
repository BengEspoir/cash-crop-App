"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ProfilePhotoEditor } from "@/components/account/ProfilePhotoEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useAddRecoveryContact,
  useChangePassword,
  useDeleteRecoveryContact,
  useRecoveryContacts,
  useRequestContactChange,
  useUpdateProfile,
} from "@/hooks/useAccountProfile";
import useAuth from "@/hooks/useAuth";

const editableFields = ["first_name", "last_name", "city", "region", "country"];

export function EditableProfilePanel({ title = "Editable profile", profile = {}, className = "" }) {
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const requestContactChange = useRequestContactChange();
  const addRecoveryContact = useAddRecoveryContact();
  const deleteRecoveryContact = useDeleteRecoveryContact();
  const { data: recoveryData } = useRecoveryContacts();
  const [form, setForm] = useState({});
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [contactChange, setContactChange] = useState({ type: "email", value: "" });
  const [recoveryForm, setRecoveryForm] = useState({ type: "email", value: "" });

  useEffect(() => {
    setForm({
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      city: user?.city || profile.city || "",
      region: user?.region || profile.region || "",
      country: user?.country || "",
      profile_image_url: user?.profile_image_url || profile.profile_image_url || "",
    });
  }, [profile.city, profile.profile_image_url, profile.region, user]);

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const submitProfile = async (event) => {
    event.preventDefault();
    try {
      const payload = Object.fromEntries(editableFields.map((key) => [key, form[key] || null]));
      if (form.profile_image_url) payload.profile_image_url = form.profile_image_url;
      await updateProfile.mutateAsync(payload);
      toast.success("Profile updated.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Profile update failed.");
    }
  };

  const submitPassword = async (event) => {
    event.preventDefault();
    try {
      await changePassword.mutateAsync(passwordForm);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password changed. Other sessions were signed out.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Password change failed.");
    }
  };

  const submitContactChange = async (event) => {
    event.preventDefault();
    try {
      const result = await requestContactChange.mutateAsync(contactChange);
      toast.success(contactChange.type === "email" ? "Verification email sent." : "Verification code sent.");
      const params = new URLSearchParams({
        mode: "contact-change",
        type: contactChange.type,
        value: contactChange.value,
      });
      if (result?.contactChangeId) params.set("contactChangeId", result.contactChangeId);
      window.location.assign(contactChange.type === "email" ? `/verify-email?${params}` : `/verify-phone?${params}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Contact change request failed.");
    }
  };

  const submitRecovery = async (event) => {
    event.preventDefault();
    try {
      await addRecoveryContact.mutateAsync(recoveryForm);
      setRecoveryForm({ type: "email", value: "" });
      toast.success("Recovery contact saved. It must be verified before it can recover the account.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Recovery contact could not be saved.");
    }
  };

  const contacts = recoveryData?.items || [];

  return (
    <section className={`space-y-6 ${className}`}>
      <div className="rounded-2xl border border-ink-200 bg-white p-6">
        <h2 className="text-[22px] font-bold text-ink-950">{title}</h2>
        <form onSubmit={submitProfile} className="mt-5 grid gap-5">
          <ProfilePhotoEditor user={{ ...user, profile_image_url: form.profile_image_url }} displayName="Profile photo" />
          <p className="-mt-3 text-[13px] text-ink-500">The profile image editor updates the avatar immediately after saving.</p>
          <div className="grid gap-4 md:grid-cols-2">
            {editableFields.map((field) => (
              <label key={field} className="space-y-2">
                <span className="text-[13px] font-bold uppercase tracking-[0.12em] text-ink-400">{field.replace(/_/g, " ")}</span>
                <Input value={form[field] || ""} onChange={update(field)} className="h-12" />
              </label>
            ))}
          </div>
          <Button type="submit" variant="accent-gold" isLoading={updateProfile.isPending}>Save profile</Button>
        </form>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <form onSubmit={submitContactChange} className="rounded-2xl border border-ink-200 bg-white p-6">
          <h2 className="text-[20px] font-bold text-ink-950">Primary email or phone</h2>
          <p className="mt-2 text-[14px] text-ink-500">Primary contact changes require verification before they replace the current email or phone.</p>
          <div className="mt-5 grid gap-3">
            <select value={contactChange.type} onChange={(event) => setContactChange((current) => ({ ...current, type: event.target.value }))} className="h-12 rounded-lg border border-ink-200 px-3">
              <option value="email">Email</option>
              <option value="phone">Phone</option>
            </select>
            <Input value={contactChange.value} onChange={(event) => setContactChange((current) => ({ ...current, value: event.target.value }))} placeholder={contactChange.type === "email" ? "new@email.com" : "+237..."} />
            <Button type="submit" variant="outline" isLoading={requestContactChange.isPending}>Start verification</Button>
          </div>
        </form>

        <form onSubmit={submitPassword} className="rounded-2xl border border-ink-200 bg-white p-6">
          <h2 className="text-[20px] font-bold text-ink-950">Change password</h2>
          <div className="mt-5 grid gap-3">
            <Input type="password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))} placeholder="Current password" />
            <Input type="password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))} placeholder="New password" />
            <Input type="password" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))} placeholder="Confirm new password" />
            <Button type="submit" variant="accent-gold" isLoading={changePassword.isPending}>Change password</Button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-ink-200 bg-white p-6">
        <h2 className="text-[20px] font-bold text-ink-950">Recovery contacts</h2>
        <p className="mt-2 text-[14px] text-ink-500">Recovery contacts are stored as unverified aliases. The first recovery or login attempt with one must be verified before account access.</p>
        <form onSubmit={submitRecovery} className="mt-5 flex flex-col gap-3 md:flex-row">
          <select value={recoveryForm.type} onChange={(event) => setRecoveryForm((current) => ({ ...current, type: event.target.value }))} className="h-12 rounded-lg border border-ink-200 px-3">
            <option value="email">Email</option>
            <option value="phone">Phone</option>
          </select>
          <Input value={recoveryForm.value} onChange={(event) => setRecoveryForm((current) => ({ ...current, value: event.target.value }))} placeholder="Recovery email or phone" />
          <Button type="submit" variant="outline" isLoading={addRecoveryContact.isPending}>Add</Button>
        </form>
        <div className="mt-5 grid gap-3">
          {contacts.length ? contacts.map((contact) => (
            <div key={contact.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ink-100 px-4 py-3">
              <div>
                <p className="font-bold text-ink-900">{contact.value}</p>
                <p className="text-[13px] text-ink-500">{contact.type} - {contact.verifiedAt ? "verified" : "unverified"}</p>
              </div>
              <Button type="button" variant="ghost" onClick={() => deleteRecoveryContact.mutate(contact.id)}>Remove</Button>
            </div>
          )) : <p className="rounded-lg bg-ink-50 p-4 text-[14px] text-ink-500">No recovery contacts saved yet.</p>}
        </div>
      </div>
    </section>
  );
}
