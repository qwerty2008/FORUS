export type ThemeMode = "light" | "dark";

export type ActiveTab =
  | "home"
  | "gear"
  | "food"
  | "print"
  | "tutor"
  | "vip"
  | "about";

export interface PricingVariant {
  id: string;
  label: string;
  price: number;
  unitLabel: string;
  type: "buy" | "rent" | "service";
}

export interface ProductReview {
  id: string;
  studentName: string;
  studentIdMasked: string;
  faculty: string;
  rating: number;
  comment: string;
  date: string;
}

export interface ProductItem {
  id: string;
  code: string;
  name: string;
  subtitle: string;
  category: "tech-gear" | "study-aid" | "rental" | "food" | "drink";
  description: string;
  highlights: string[];
  imageUrl?: string;
  fallbackIcon: string;
  fallbackGradient: string;
  variants: PricingVariant[];
  pointsReward: number;
  inStock: number;
  deliveryInfo: string;
  reviews: ProductReview[];
}

export interface CartItem {
  cartItemId: string;
  productId: string;
  name: string;
  variantLabel: string;
  price: number;
  quantity: number;
  pointsReward: number;
  categoryLabel: string;
  customMeta?: string;
  imageUrl?: string;
}

export interface StudentProfile {
  isLoggedIn: boolean;
  email: string;
  studentId: string;
  fullName: string;
  faculty: string;
  points: number;
  pointHistory: {
    id: string;
    action: string;
    points: number;
    timestamp: string;
  }[];
  remindedEventIds: string[];
  eventPersonalNotes: Record<string, string>;
}

export interface PrintOrderConfig {
  fileName: string;
  paperSize: "A1" | "A2" | "A3" | "A4" | "A5";
  colorMode: "bw" | "color";
  sides: "1-side" | "2-side";
  pageCount: number;
  copies: number;
  binding: "none" | "staple" | "spiral-plastic" | "poster-tube";
  pickupLocation: string;
  note: string;
}

export interface TutorListing {
  id: string;
  type: "parent-seeking" | "student-profile";
  title: string;
  subject: string;
  gradeLevel: string;
  district: string;
  schedule: string;
  feePerSession: string;
  tutorOrStudentInfo: string;
  facultyOrSchool: string;
  verified: boolean;
  requirements: string[];
  pointsReward: number;
}

export interface TrainingPointEvent {
  id: string;
  title: string;
  organizer: string;
  category: string;
  drlSection: string;
  drlPoints: number;
  location: string;
  registrationDeadline: string; // ISO string
  eventEndTime: string; // ISO string
  maxSlots: number;
  registeredCount: number;
  importantNotes: string[];
  registrationRequirements: string;
}

export interface OrderReceipt {
  orderId: string;
  createdAt: string;
  studentName: string;
  studentEmail: string;
  deliveryLocation: string;
  paymentMethod: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  earnedPoints: number;
}
