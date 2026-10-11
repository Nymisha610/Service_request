const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export const LIMITS = {
  name: { min: 2, max: 80 },
  subject: { min: 3, max: 120 },
  description: { min: 10, max: 1000 },
};

/** Returns an object of { field: message } – empty when the form is valid. */
export function validateForm(form) {
  const errors = {};
  const name = form.name.trim();
  const email = form.email.trim();
  const subject = form.subject.trim();
  const description = form.description.trim();

  if (!name) errors.name = "Please enter your name";
  else if (name.length < LIMITS.name.min) errors.name = `Name must be at least ${LIMITS.name.min} characters`;
  else if (name.length > LIMITS.name.max) errors.name = `Name must be at most ${LIMITS.name.max} characters`;

  if (!email) errors.email = "Please enter your email address";
  else if (!EMAIL.test(email)) errors.email = "Enter a valid email address";

  if (!subject) errors.subject = "Please enter a subject";
  else if (subject.length < LIMITS.subject.min) errors.subject = `Subject must be at least ${LIMITS.subject.min} characters`;
  else if (subject.length > LIMITS.subject.max) errors.subject = `Subject must be at most ${LIMITS.subject.max} characters`;

  if (!description) errors.description = "Please describe the problem";
  else if (description.length < LIMITS.description.min)
    errors.description = `Description must be at least ${LIMITS.description.min} characters`;
  else if (description.length > LIMITS.description.max)
    errors.description = `Description must be at most ${LIMITS.description.max} characters`;

  return errors;
}
