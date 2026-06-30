/** Map a country name to its emoji flag for use in tables/lists. */
const FLAG_MAP: Record<string, string> = {
  UAE: "🇦🇪",
  "United Arab Emirates": "🇦🇪",
  KSA: "🇸🇦",
  "Saudi Arabia": "🇸🇦",
  Kuwait: "🇰🇼",
  Oman: "🇴🇲",
  Qatar: "🇶🇦",
  Bahrain: "🇧🇭",
  India: "🇮🇳",
};

export function countryFlag(country: string): string {
  return FLAG_MAP[country] ?? "🏳️";
}
