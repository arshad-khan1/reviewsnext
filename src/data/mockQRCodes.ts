export interface QRCodeData {
  id: string;
  name: string;
  source: string;
  scans: number;
  conversions: number;
  createdAt: string;
  aiGuidingPrompt: string;
  generatedCommentStyle: string;
  googleMapsReviewLink: string;
}

export const mockQRCodes: QRCodeData[] = [
  {
    id: "qr-1",
    name: "Main Entrance",
    source: "entrance",
    scans: 124,
    conversions: 86,
    createdAt: "2026-03-01T10:00:00Z",
    aiGuidingPrompt: "Welcome the guest and ask about their dining experience at the entrance.",
    generatedCommentStyle: "Friendly & Casual",
    googleMapsReviewLink: "https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83VY24",
  },
  {
    id: "qr-2",
    name: "Table 5",
    source: "table5",
    scans: 45,
    conversions: 32,
    createdAt: "2026-03-05T14:30:00Z",
    aiGuidingPrompt: "Mention the specific table 5 and ask for feedback on service speed.",
    generatedCommentStyle: "Concise & Direct",
    googleMapsReviewLink: "https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83VY24",
  },
  {
    id: "qr-3",
    name: "Waitlist Counter",
    source: "counter",
    scans: 89,
    conversions: 64,
    createdAt: "2026-03-10T09:15:00Z",
    aiGuidingPrompt: "Thank the guest for their patience while waiting and ask for a review.",
    generatedCommentStyle: "Professional & Polite",
    googleMapsReviewLink: "https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83VY24",
  },
];

