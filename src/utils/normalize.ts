export const normalizeEmail = (email?: string | null) => {
  if (!email) return null;
  return email.trim().toLowerCase();
};

export const normalizePhone = (phone?: string | null) => {
  if (!phone) return null;
  return phone.trim();
};