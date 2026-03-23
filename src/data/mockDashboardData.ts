export interface QRScan {
  id: string;
  timestamp: string;
  device: string;
  browser: string;
  os: string;
  ip: string;
  city: string;
  country: string;
  resultedInReview: boolean;
  rating?: number;
}

export interface ReviewEntry {
  id: string;
  type: "positive" | "negative";
  rating: number;
  review?: string;
  whatWentWrong?: string;
  howToImprove?: string;
  timestamp: string;
  device: string;
  browser: string;
  os: string;
  submittedToGoogle: boolean;
}

export const mockScans: QRScan[] = [
  {
    id: "s1",
    timestamp: "2026-03-14T09:12:00",
    device: "iPhone 15 Pro",
    browser: "Safari 18",
    os: "iOS 19",
    ip: "192.168.1.10",
    city: "New York",
    country: "US",
    resultedInReview: true,
    rating: 5,
  },
  {
    id: "s2",
    timestamp: "2026-03-14T08:45:00",
    device: "Samsung Galaxy S25",
    browser: "Chrome 122",
    os: "Android 16",
    ip: "192.168.1.11",
    city: "Los Angeles",
    country: "US",
    resultedInReview: true,
    rating: 4,
  },
  {
    id: "s3",
    timestamp: "2026-03-13T17:30:00",
    device: "Google Pixel 9",
    browser: "Chrome 122",
    os: "Android 16",
    ip: "10.0.0.5",
    city: "Chicago",
    country: "US",
    resultedInReview: false,
  },
  {
    id: "s4",
    timestamp: "2026-03-13T14:20:00",
    device: "iPhone 14",
    browser: "Safari 18",
    os: "iOS 18",
    ip: "10.0.0.6",
    city: "Houston",
    country: "US",
    resultedInReview: true,
    rating: 1,
  },
  {
    id: "s5",
    timestamp: "2026-03-13T11:05:00",
    device: "OnePlus 12",
    browser: "Chrome 122",
    os: "Android 15",
    ip: "172.16.0.2",
    city: "Dallas",
    country: "US",
    resultedInReview: true,
    rating: 5,
  },
  {
    id: "s6",
    timestamp: "2026-03-12T19:50:00",
    device: "iPad Pro",
    browser: "Safari 18",
    os: "iPadOS 19",
    ip: "172.16.0.3",
    city: "Miami",
    country: "US",
    resultedInReview: false,
  },
  {
    id: "s7",
    timestamp: "2026-03-12T16:15:00",
    device: "Samsung Galaxy A55",
    browser: "Samsung Internet",
    os: "Android 15",
    ip: "192.168.2.1",
    city: "Phoenix",
    country: "US",
    resultedInReview: true,
    rating: 3,
  },
  {
    id: "s8",
    timestamp: "2026-03-12T10:00:00",
    device: "iPhone 15",
    browser: "Safari 18",
    os: "iOS 19",
    ip: "192.168.2.2",
    city: "Seattle",
    country: "US",
    resultedInReview: true,
    rating: 2,
  },
  {
    id: "s9",
    timestamp: "2026-03-11T15:30:00",
    device: "Google Pixel 8a",
    browser: "Chrome 121",
    os: "Android 15",
    ip: "10.1.1.1",
    city: "Denver",
    country: "US",
    resultedInReview: true,
    rating: 5,
  },
  {
    id: "s10",
    timestamp: "2026-03-11T12:10:00",
    device: "iPhone 13",
    browser: "Safari 17",
    os: "iOS 18",
    ip: "10.1.1.2",
    city: "Boston",
    country: "US",
    resultedInReview: false,
  },
  {
    id: "s11",
    timestamp: "2026-03-10T20:45:00",
    device: "Samsung Galaxy S24",
    browser: "Chrome 121",
    os: "Android 15",
    ip: "192.168.3.1",
    city: "Atlanta",
    country: "US",
    resultedInReview: true,
    rating: 4,
  },
  {
    id: "s12",
    timestamp: "2026-03-10T09:30:00",
    device: "iPhone 15 Pro Max",
    browser: "Safari 18",
    os: "iOS 19",
    ip: "192.168.3.2",
    city: "San Francisco",
    country: "US",
    resultedInReview: true,
    rating: 5,
  },
  {
    id: "s13",
    timestamp: "2026-03-09T14:00:00",
    device: "Xiaomi 14",
    browser: "Chrome 121",
    os: "Android 14",
    ip: "172.20.0.1",
    city: "Portland",
    country: "US",
    resultedInReview: false,
  },
  {
    id: "s14",
    timestamp: "2026-03-09T11:20:00",
    device: "iPhone 14 Pro",
    browser: "Safari 17",
    os: "iOS 18",
    ip: "172.20.0.2",
    city: "Austin",
    country: "US",
    resultedInReview: true,
    rating: 4,
  },
  {
    id: "s15",
    timestamp: "2026-03-08T18:00:00",
    device: "Samsung Galaxy Z Flip 6",
    browser: "Samsung Internet",
    os: "Android 15",
    ip: "10.2.0.1",
    city: "Nashville",
    country: "US",
    resultedInReview: true,
    rating: 2,
  },
];

export const mockReviews: ReviewEntry[] = [
  {
    id: "r1",
    type: "positive",
    rating: 5,
    review: "Great service and very friendly staff. Highly recommended!",
    timestamp: "2026-03-14T09:15:00",
    device: "iPhone 15 Pro",
    browser: "Safari 18",
    os: "iOS 19",
    submittedToGoogle: true,
  },
  {
    id: "r2",
    type: "positive",
    rating: 4,
    review: "Amazing experience. The team was professional and helpful.",
    timestamp: "2026-03-14T08:50:00",
    device: "Samsung Galaxy S25",
    browser: "Chrome 122",
    os: "Android 16",
    submittedToGoogle: true,
  },
  {
    id: "r3",
    type: "negative",
    rating: 1,
    whatWentWrong: "Long wait time and cold food",
    howToImprove: "Better time management and food quality checks",
    timestamp: "2026-03-13T14:25:00",
    device: "iPhone 14",
    browser: "Safari 18",
    os: "iOS 18",
    submittedToGoogle: false,
  },
  {
    id: "r4",
    type: "positive",
    rating: 5,
    review: "Loved the service! Will definitely visit again.",
    timestamp: "2026-03-13T11:10:00",
    device: "OnePlus 12",
    browser: "Chrome 122",
    os: "Android 15",
    submittedToGoogle: true,
  },
  {
    id: "r5",
    type: "positive",
    rating: 3,
    review: "Decent experience overall. Room for improvement in ambiance.",
    timestamp: "2026-03-12T16:20:00",
    device: "Samsung Galaxy A55",
    browser: "Samsung Internet",
    os: "Android 15",
    submittedToGoogle: false,
  },
  {
    id: "r6",
    type: "negative",
    rating: 2,
    whatWentWrong: "Staff was rude and inattentive",
    howToImprove: "Customer service training would help",
    timestamp: "2026-03-12T10:05:00",
    device: "iPhone 15",
    browser: "Safari 18",
    os: "iOS 19",
    submittedToGoogle: false,
  },
  {
    id: "r7",
    type: "positive",
    rating: 5,
    review:
      "Outstanding quality and fantastic atmosphere. Would recommend to everyone!",
    timestamp: "2026-03-11T15:35:00",
    device: "Google Pixel 8a",
    browser: "Chrome 121",
    os: "Android 15",
    submittedToGoogle: true,
  },
  {
    id: "r8",
    type: "positive",
    rating: 4,
    review:
      "Wonderful place with excellent attention to detail. A truly great experience!",
    timestamp: "2026-03-10T20:50:00",
    device: "Samsung Galaxy S24",
    browser: "Chrome 121",
    os: "Android 15",
    submittedToGoogle: true,
  },
  {
    id: "r9",
    type: "positive",
    rating: 5,
    review:
      "Best cafe in town! The coffee is amazing and staff is super friendly.",
    timestamp: "2026-03-10T09:35:00",
    device: "iPhone 15 Pro Max",
    browser: "Safari 18",
    os: "iOS 19",
    submittedToGoogle: true,
  },
  {
    id: "r10",
    type: "positive",
    rating: 4,
    review: "Great ambiance and quality food. Will come back soon!",
    timestamp: "2026-03-09T11:25:00",
    device: "iPhone 14 Pro",
    browser: "Safari 17",
    os: "iOS 18",
    submittedToGoogle: false,
  },
  {
    id: "r11",
    type: "negative",
    rating: 2,
    whatWentWrong: "Order was wrong twice",
    howToImprove: "Double-check orders before serving",
    timestamp: "2026-03-08T18:05:00",
    device: "Samsung Galaxy Z Flip 6",
    browser: "Samsung Internet",
    os: "Android 15",
    submittedToGoogle: false,
  },
];

// Analytics helpers
export function getScansPerDay() {
  const map: Record<string, number> = {};
  mockScans.forEach((s) => {
    const day = s.timestamp.split("T")[0];
    map[day] = (map[day] || 0) + 1;
  });
  return Object.entries(map)
    .map(([date, count]) => ({ date, scans: count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getRatingDistribution() {
  const dist = [0, 0, 0, 0, 0];
  mockReviews.forEach((r) => {
    dist[r.rating - 1]++;
  });
  return dist.map((count, i) => ({ rating: `${i + 1} Star`, count }));
}

export function getDeviceBreakdown() {
  const map: Record<string, number> = {};
  mockScans.forEach((s) => {
    const brand =
      s.os.startsWith("iOS") || s.os.startsWith("iPad")
        ? "Apple"
        : s.device.split(" ")[0];
    map[brand] = (map[brand] || 0) + 1;
  });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

export function getBrowserBreakdown() {
  const map: Record<string, number> = {};
  mockScans.forEach((s) => {
    const browser = s.browser.split(" ")[0];
    map[browser] = (map[browser] || 0) + 1;
  });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

export const stats = {
  totalScans: mockScans.length,
  totalReviews: mockReviews.length,
  conversionRate: Math.round((mockReviews.length / mockScans.length) * 100),
  averageRating: +(
    mockReviews.reduce((sum, r) => sum + r.rating, 0) / mockReviews.length
  ).toFixed(1),
  googleSubmissions: mockReviews.filter((r) => r.submittedToGoogle).length,
  negativeFeedbacks: mockReviews.filter((r) => r.type === "negative").length,
};
