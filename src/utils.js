export const collectValidationErrors = (err) => {
  const errors = [];
  if (Object.keys(err?.errors ?? {}).length > 0) {
    errors.push(...Object.values(err.errors).map((e) => e.message));
  }
  return errors;
};
