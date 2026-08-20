export const WHATSAPP_NUMBER = "27825319901";

export function buildWhatsAppContactUrl(message?: string): string {
  const text =
    message ??
    "Hi MLK Computer Consulting, I found AdmitScore and would like help with my university admission options.";
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
