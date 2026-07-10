import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getStudentProfile,
  upsertStudentProfile,
  uploadProfileImage,
} from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { isLoggedIn } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    course: "",
    semester: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) {
      nav("/login");
      return;
    }

    getStudentProfile()
      .then((res) => {
        setForm((p) => ({ ...p, ...res.data }));
        setPreview(res.data.image_url || null);
      })
      .catch((err) =>
        setMsg(err.response?.data?.error || "Failed to load profile"),
      )
      .finally(() => setLoading(false));
  }, [isLoggedIn, nav]);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      await upsertStudentProfile(form);
      setMsg("Profile saved");
    } catch (err) {
      setMsg(err.response?.data?.error || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];

    if (!f) {
      setFile(null);
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(f.type)) {
      setMsg("Only JPG, PNG and WEBP images are allowed.");
      e.target.value = "";
      return;
    }

    const maxSize = 2 * 1024 * 1024; // 2 MB

    if (f.size > maxSize) {
      setMsg("Image size must be less than 2 MB.");
      e.target.value = "";
      return;
    }

    setMsg("");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleUpload = async () => {
    if (!file) {
      setMsg("Select an image first");
      return;
    }
    setSaving(true);
    setMsg("");
    try {
      const fd = new FormData();
      fd.append("image", file);
      const { data } = await uploadProfileImage(fd);
      setForm((p) => ({ ...p, image_url: data.image_url }));
      setPreview(data.image_url);
      setMsg("Image uploaded");
    } catch (err) {
      setMsg(err.response?.data?.error || "Upload failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Loading profile…</div>;

  return (
    <div style={{ maxWidth: 680, margin: "2rem auto", padding: "1rem 1.5rem" }}>
      <h2
        style={{
          fontFamily: "'Space Grotesk',sans-serif",
          fontSize: "clamp(1.3rem,4vw,1.7rem)",
          fontWeight: 700,
          color: "var(--text-primary)",
          marginBottom: "1.25rem",
        }}
      >
        My Profile
      </h2>
      {msg && (
        <div
          style={{
            marginBottom: 12,
            color: msg === "Profile saved" ? "#10b981" : "#ef4444",
          }}
        >
          {msg}
        </div>
      )}
      <form onSubmit={handleSave} style={{ display: "grid", gap: 12 }}>
        <div
          style={{
            display: "flex",
            gap: 16,
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 12,
              overflow: "hidden",
              background: "#0f1724",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {preview ? (
              <img
                src={preview}
                alt="avatar"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2rem",
                  fontWeight: "700",
                  color: "#ffffff",
                  background: "linear-gradient(135deg,#4f6ef7,#7c3aed)",
                }}
              >
                {(form.name || "U").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={handleUpload}
                disabled={saving || !file}
                style={{
                  padding: "0.4rem 0.8rem",
                  borderRadius: 8,
                  background: saving ? "#94a3b8" : "var(--accent-color)",
                  color: "#fff",
                  border: "none",
                  cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? "Uploading..." : "Upload Image"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPreview(form.image_url || null);
                }}
                style={{
                  padding: "0.4rem 0.8rem",
                  borderRadius: 8,
                  border: "1px solid var(--border-color)",
                  background: "transparent",
                }}
              >
                Cancel
              </button>
            </div>
            <div style={{ color: "#94a3b8", fontSize: 12 }}>
              Recommended: 300x300px JPG/PNG
            </div>
          </div>
        </div>
        <label>
          Name
          <input
            name="name"
            value={form.name || ""}
            onChange={handleChange}
            style={{ width: "100%", padding: 8 }}
          />
        </label>
        <label>
          Email
          <input
            name="email"
            value={form.email || ""}
            onChange={handleChange}
            style={{ width: "100%", padding: 8 }}
          />
        </label>
        <label>
          Course
          <input
            name="course"
            value={form.course || ""}
            onChange={handleChange}
            style={{ width: "100%", padding: 8 }}
          />
        </label>
        <label>
          Semester
          <input
            name="semester"
            value={form.semester || ""}
            onChange={handleChange}
            style={{ width: "100%", padding: 8 }}
          />
        </label>

        <div>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "0.6rem 1rem",
              borderRadius: 8,
              border: "none",
              background: saving ? "#94a3b8" : "var(--accent-color)",
              color: "#fff",
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
