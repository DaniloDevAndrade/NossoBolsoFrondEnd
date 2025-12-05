export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");

  if (digits.length === 11) {
    // DDD + número
    return `55${digits}`;
  }

  if (digits.length === 13 && digits.startsWith("55")) {
    return digits;
  }

  throw new Error("Telefone inválido. Use o formato (11) 99999-9999.");
}

export function formatPhoneInput(value: string): string {
  const cleaned = value.replace(/\D/g, "");
  let formatted = "";

  if (cleaned.length > 0) {
    formatted = "(" + cleaned.substring(0, 2);
    if (cleaned.length >= 3) {
      formatted += ") " + cleaned.substring(2, 7);
    }
    if (cleaned.length >= 8) {
      formatted += "-" + cleaned.substring(7, 11);
    }
  }

  return formatted;
}

export function formatPhoneForDisplay(raw: string | null): string {
  if (!raw) return "(+55) 11 99999-9999";

  const digits = raw.replace(/\D/g, "");

  if (digits.length === 13 && digits.startsWith("55")) {
    const country = digits.slice(0, 2); // 55
    const ddd = digits.slice(2, 4); // 11
    const prefix = digits.slice(4, 9); // 99999
    const suffix = digits.slice(9, 13); // 9999
    return `(+${country}) ${ddd} ${prefix}-${suffix}`;
  }

  if (digits.length === 11) {
    const ddd = digits.slice(0, 2);
    const prefix = digits.slice(2, 7);
    const suffix = digits.slice(7, 11);
    return `(+55) ${ddd} ${prefix}-${suffix}`;
  }

  return "(+55) 11 99999-9999";
}