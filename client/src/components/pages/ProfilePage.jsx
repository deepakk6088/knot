import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Save,
  LoaderCircle,
  UserRound,
  Upload,
  ImagePlus
} from "lucide-react";
import { profileApi } from "../../services/api";
import { getInitials } from "../../utils/formatters";

const MAX_AVATAR_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif"
];

export default function ProfilePage({
  currentUser,
  onProfileUpdated,
  onBack
}) {
  const [displayName, setDisplayName] = useState(
    currentUser?.displayName || ""
  );

  const [bio, setBio] = useState(currentUser?.bio || "");

  const [avatarUrl, setAvatarUrl] = useState(
    currentUser?.avatarUrl || ""
  );

  const [avatarPreviewError, setAvatarPreviewError] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setDisplayName(currentUser?.displayName || "");
    setBio(currentUser?.bio || "");
    setAvatarUrl(currentUser?.avatarUrl || "");
    setAvatarPreviewError(false);
  }, [currentUser?.id]);

  const initials = getInitials(
    displayName || currentUser?.username || "You"
  );

  const handleAvatarUrlChange = (event) => {
    setAvatarUrl(event.target.value);
    setAvatarPreviewError(false);
    setError("");
    setSuccess("");
  };

  const handleAvatarFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setSuccess("");

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError("Please select a JPEG, PNG, WebP, or GIF image.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_AVATAR_FILE_SIZE) {
      setError("Image size cannot exceed 5 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatarUrl(reader.result);
        setAvatarPreviewError(false);
      }
    };

    reader.onerror = () => {
      setError("Could not read the selected image. Please try again.");
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const profileData = {
      displayName: displayName.trim(),
      bio: bio.trim(),
      avatarUrl: avatarUrl.trim() || null
    };

    setIsSaving(true);

    try {
      const response = await profileApi.updateProfile(profileData);

      onProfileUpdated(response.user);
      setAvatarPreviewError(false);
      setSuccess("Your profile has been updated.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Could not update your profile. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const inputStyle = {
    backgroundColor: "var(--app-input)",
    borderColor: "var(--app-border)",
    color: "var(--app-text)"
  };

  const mutedFieldStyle = {
    backgroundColor: "var(--app-surface-alt)",
    borderColor: "var(--app-border)",
    color: "var(--app-muted)"
  };

  return (
    <main
      className="flex-1 min-w-0 h-full overflow-y-auto"
      style={{
        backgroundColor: "var(--app-bg)",
        color: "var(--app-text)"
      }}
    >
      <div className="max-w-3xl mx-auto px-6 py-8 md:px-10 md:py-10">

        {/* Page Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            type="button"
            onClick={onBack}
            className="p-2.5 rounded-xl transition-colors cursor-pointer hover:opacity-70"
            style={{
              color: "var(--app-muted)",
              backgroundColor: "var(--app-surface-alt)"
            }}
            aria-label="Back to chats"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1
              className="text-2xl font-bold"
              style={{ color: "var(--app-heading)" }}
            >
              Your Profile
            </h1>

            <p
              className="text-sm mt-1"
              style={{ color: "var(--app-muted)" }}
            >
              Manage your personal information.
            </p>
          </div>
        </div>

        {/* Profile Card */}
        <section
          className="border rounded-3xl shadow-sm overflow-hidden"
          style={{
            backgroundColor: "var(--app-surface)",
            borderColor: "var(--app-border)"
          }}
        >
          {/* Profile Banner */}
          <div
            className="h-28"
            style={{
              backgroundImage:
                "linear-gradient(90deg, var(--app-accent), var(--app-accent-hover))"
            }}
          />

          <div className="px-6 pb-7 md:px-8">

            {/* Avatar */}
            <div className="flex items-end justify-between -mt-12 mb-6">
              <div
                className="w-24 h-24 rounded-3xl border-4 flex items-center justify-center font-bold text-2xl shadow-md overflow-hidden"
                style={{
                  backgroundColor: "var(--app-accent)",
                  color: "#ffffff",
                  borderColor: "var(--app-surface)"
                }}
              >
                {avatarUrl.trim() && !avatarPreviewError ? (
                  <img
                    src={avatarUrl.trim()}
                    alt="Profile avatar"
                    className="w-full h-full object-cover"
                    onError={() => setAvatarPreviewError(true)}
                  />
                ) : (
                  initials
                )}
              </div>

              <span
                className="text-xs font-medium mb-2"
                style={{ color: "var(--app-muted)" }}
              >
                <UserRound size={13} className="inline mr-1" />
                Personal account
              </span>
            </div>

            <div className="mb-7">
              <h2
                className="text-lg font-bold"
                style={{ color: "var(--app-heading)" }}
              >
                {displayName.trim() || currentUser?.username || "Your name"}
              </h2>

              <p
                className="text-sm mt-1"
                style={{ color: "var(--app-muted)" }}
              >
                @{currentUser?.username || "username"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Account Information */}
              <div>
                <h3
                  className="text-sm font-bold mb-4"
                  style={{ color: "var(--app-heading)" }}
                >
                  Account information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  <div>
                    <label
                      className="block text-xs font-semibold mb-2"
                      style={{ color: "var(--app-muted)" }}
                    >
                      Email address
                    </label>

                    <div
                      className="px-4 py-3 rounded-xl border text-sm"
                      style={mutedFieldStyle}
                    >
                      {currentUser?.email || "Not available"}
                    </div>

                    <p
                      className="text-[10px] mt-1.5"
                      style={{ color: "var(--app-muted)" }}
                    >
                      Email cannot be changed here.
                    </p>
                  </div>

                  <div>
                    <label
                      className="block text-xs font-semibold mb-2"
                      style={{ color: "var(--app-muted)" }}
                    >
                      Username
                    </label>

                    <div
                      className="px-4 py-3 rounded-xl border text-sm"
                      style={mutedFieldStyle}
                    >
                      @{currentUser?.username || "username"}
                    </div>
                  </div>

                </div>
              </div>

              <div
                className="border-t"
                style={{ borderColor: "var(--app-border)" }}
              />

              {/* Editable Information */}
              <div>
                <h3
                  className="text-sm font-bold mb-4"
                  style={{ color: "var(--app-heading)" }}
                >
                  Personal details
                </h3>

                <div className="space-y-5">

                  {/* Display Name */}
                  <div>
                    <label
                      htmlFor="profile-display-name"
                      className="block text-xs font-semibold mb-2"
                      style={{ color: "var(--app-text)" }}
                    >
                      Display name
                    </label>

                    <input
                      id="profile-display-name"
                      type="text"
                      value={displayName}
                      onChange={(event) => setDisplayName(event.target.value)}
                      maxLength={60}
                      placeholder="Enter your display name"
                      disabled={isSaving}
                      style={inputStyle}
                      className="w-full px-4 py-3 rounded-xl border text-sm placeholder:opacity-60 focus:outline-none focus:ring-2 focus:ring-[var(--app-accent-soft)] disabled:opacity-60"
                    />

                    <p
                      className="text-[10px] text-right mt-1.5"
                      style={{ color: "var(--app-muted)" }}
                    >
                      {displayName.length}/60
                    </p>
                  </div>

                  {/* Bio */}
                  <div>
                    <label
                      htmlFor="profile-bio"
                      className="block text-xs font-semibold mb-2"
                      style={{ color: "var(--app-text)" }}
                    >
                      Bio
                    </label>

                    <textarea
                      id="profile-bio"
                      value={bio}
                      onChange={(event) => setBio(event.target.value)}
                      maxLength={160}
                      rows={4}
                      placeholder="Tell people a little about yourself..."
                      disabled={isSaving}
                      style={inputStyle}
                      className="w-full px-4 py-3 rounded-xl border text-sm placeholder:opacity-60 focus:outline-none focus:ring-2 focus:ring-[var(--app-accent-soft)] resize-none disabled:opacity-60"
                    />

                    <p
                      className="text-[10px] text-right mt-1.5"
                      style={{ color: "var(--app-muted)" }}
                    >
                      {bio.length}/160
                    </p>
                  </div>

                  {/* Avatar */}
                  <div>
                    <label
                      htmlFor="profile-avatar-url"
                      className="block text-xs font-semibold mb-2"
                      style={{ color: "var(--app-text)" }}
                    >
                      Avatar image URL
                    </label>

                    <input
                      id="profile-avatar-url"
                      type="text"
                      value={avatarUrl.startsWith("data:") ? "" : avatarUrl}
                      onChange={handleAvatarUrlChange}
                      placeholder="Paste a direct image URL (https://...)"
                      disabled={isSaving}
                      style={inputStyle}
                      className="w-full px-4 py-3 rounded-xl border text-sm placeholder:opacity-60 focus:outline-none focus:ring-2 focus:ring-[var(--app-accent-soft)] disabled:opacity-60"
                    />

                    <p
                      className="text-[10px] mt-1.5"
                      style={{ color: "var(--app-muted)" }}
                    >
                      Paste a direct image address copied from the web.
                    </p>

                    <div className="mt-4">
                      <label
                        htmlFor="profile-avatar-file"
                        className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold cursor-pointer transition-colors hover:opacity-80 ${
                          isSaving ? "opacity-50 pointer-events-none" : ""
                        }`}
                        style={{
                          color: "var(--app-accent)",
                          backgroundColor: "var(--app-accent-soft)",
                          borderColor: "var(--app-border)"
                        }}
                      >
                        <ImagePlus size={17} />
                        <Upload size={15} />
                        Choose image from device
                      </label>

                      <input
                        id="profile-avatar-file"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleAvatarFileChange}
                        disabled={isSaving}
                        className="hidden"
                      />

                      <p
                        className="text-[10px] mt-2"
                        style={{ color: "var(--app-muted)" }}
                      >
                        JPEG, PNG, WebP or GIF. Maximum file size: 5 MB.
                      </p>
                    </div>

                    {avatarUrl.startsWith("data:") && (
                      <p
                        className="text-xs mt-3"
                        style={{ color: "var(--app-accent)" }}
                      >
                        Image selected. Save changes to update your profile picture.
                      </p>
                    )}

                    {avatarPreviewError && avatarUrl.trim() && (
                      <p className="text-xs text-rose-500 mt-2">
                        This image could not be previewed. Check the image address or choose another image.
                      </p>
                    )}

                    {avatarUrl.trim() && (
                      <button
                        type="button"
                        onClick={() => {
                          setAvatarUrl("");
                          setAvatarPreviewError(false);
                          setError("");
                        }}
                        disabled={isSaving}
                        className="block text-xs mt-3 text-rose-500 hover:underline disabled:opacity-50"
                      >
                        Remove profile picture
                      </button>
                    )}
                  </div>

                </div>
              </div>

              {/* Feedback */}
              {error && (
                <div className="px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {error}
                </div>
              )}

              {success && (
                <div className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">
                  {success}
                </div>
              )}

              {/* Actions */}
              <div
                className="flex items-center justify-end gap-3 pt-5 border-t"
                style={{ borderColor: "var(--app-border)" }}
              >
                <button
                  type="button"
                  onClick={onBack}
                  disabled={isSaving}
                  className="px-5 py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50 hover:opacity-75"
                  style={{
                    color: "var(--app-text)",
                    backgroundColor: "var(--app-surface-alt)"
                  }}
                >
                  Back
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-md transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: "var(--app-accent)",
                    color: "#ffffff"
                  }}
                >
                  {isSaving ? (
                    <>
                      <LoaderCircle size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}