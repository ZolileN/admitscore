export const WHATSAPP_NUMBER = "27825319901";

/** Default WhatsApp opener — soft sales tone for student tech, via AdmitScore. */
export const DEFAULT_WHATSAPP_MESSAGE =
  "Hi MLK Computer Consulting! I found you through AdmitScore and I'd like to hear about your student laptop deals and pricing for university.";

export function buildWhatsAppContactUrl(message?: string): string {
  const text = message ?? DEFAULT_WHATSAPP_MESSAGE;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
