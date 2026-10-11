/** Converts the form state into the JSON body the API expects. */
export function toApiPayload(form) {
  return {
    name: form.name.trim(),
    email: form.email.trim(),
    subject: form.subject.trim(),
    message: form.description.trim(),
  };
}
