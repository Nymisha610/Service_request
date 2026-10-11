import { useState } from "react";
import { createServiceRequest } from "../api/serviceRequests";
import { LIMITS, validateForm } from "../utils/validation";

const EMPTY = { name: "", email: "", subject: "", description: "" };

function Field({ id, label, error, hint, children }) {
  return (
    <div className={`field${error ? " field--invalid" : ""}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && !error && <p className="field__hint">{hint}</p>}
      {error && (
        <p className="field__error" id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default function RequestForm({ onCreated }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState(null); // { type: "success" | "error", text }

  const update = (field) => (event) => {
    setForm((f) => ({ ...f, [field]: event.target.value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  async function handleSubmit(event) {
    event.preventDefault();
    setNotice(null);

    const clientErrors = validateForm(form);
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      setNotice({ type: "error", text: "Please fix the highlighted fields and try again." });
      return;
    }

    setSubmitting(true);
    try {
      await createServiceRequest(form);
      setForm(EMPTY);
      setErrors({});
      setNotice({ type: "success", text: "Thanks! Your service request was submitted." });
      onCreated();
    } catch (err) {
      setErrors(err.fields ?? {});
      setNotice({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  const props = (id) => ({
    id,
    value: form[id],
    onChange: update(id),
    "aria-invalid": errors[id] ? "true" : "false",
    "aria-describedby": errors[id] ? `${id}-error` : undefined,
    disabled: submitting,
  });

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {notice && (
        <div className={`notice notice--${notice.type}`} role={notice.type === "error" ? "alert" : "status"}>
          {notice.text}
        </div>
      )}

      <Field id="name" label="Name" error={errors.name}>
        <input type="text" autoComplete="name" maxLength={LIMITS.name.max + 20} {...props("name")} />
      </Field>
      <Field id="email" label="Email" error={errors.email}>
        <input type="email" autoComplete="email" {...props("email")} />
      </Field>
      <Field id="subject" label="Subject" error={errors.subject}>
        <input type="text" {...props("subject")} />
      </Field>
      <Field
        id="description"
        label="Description"
        error={errors.description}
        hint={`${form.description.trim().length}/${LIMITS.description.max} characters`}
      >
        <textarea rows={5} {...props("description")} />
      </Field>

      <button type="submit" className="btn" disabled={submitting}>
        {submitting ? "Submitting…" : "Submit request"}
      </button>
    </form>
  );
}
