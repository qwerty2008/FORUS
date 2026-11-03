export type HcmusEventCategory =
  | "seminar-conference"
  | "academic-contest"
  | "student-affairs-scholarship";

export type HcmusRegistrationStatus =
  | "urgent-today"
  | "open"
  | "upcoming"
  | "ongoing"
  | "closed";

export interface HcmusDocumentEvent {
  id: string;
  stt: number;
  title: string;
  organizer: string;
  category: HcmusEventCategory;
  categoryLabel: string;
  eventTimeText: string;
  deadlineText: string;
  statusText: string;
  statusType: HcmusRegistrationStatus;
  location: string;
  targetTimestamp: string; // Local ISO string used for real-time countdown to nearest event/deadline
  eventStartTimestamp: string;
  eventEndTimestamp?: string;
  summary: string;
  details: string[];
  contactOrLinkNote?: string;
  drlOrBenefitTag: string;
}

export interface OfficialChannelInfo {
  id: string;
  platform: string;
  name: string;
  handleOrSub: string;
  description: string;
  url: string;
}

export const HCMUS_OFFICIAL_CHANNELS: OfficialChannelInfo[] = [
  {
    id: "ch-fb",
    platform: "Facebook Fanpage",
    name: "VNUHCM - University of Science",
    handleOrSub: "Kênh thông tin chính thức toàn Trường",
    description:
      "Cập nhật nhanh các thông báo học vụ, sự kiện toàn trường, hội nghị khoa học và hoạt động sinh viên.",
    url: "https://www.facebook.com/VNUHCM.US",
  },
  {
    id: "ch-yt",
    platform: "YouTube",
    name: "VNUHCM-University of Science",
    handleOrSub: "@vnuhcmus",
    description:
      "Phát trực tiếp lễ khai giảng, tốt nghiệp, hội thảo khoa học và chuỗi video giới thiệu các khoa/ngành.",
    url: "https://www.youtube.com/@vnuhcmus",
  },
  {
    id: "ch-tiktok",
    platform: "TikTok",
    name: "Tư vấn Tuyển sinh & Truyền thông",
    handleOrSub: "@tvts.hcmus",
    description:
      "Video ngắn về đời sống sinh viên Tự Nhiên, bí kíp học đại cương, review phòng lab và sự kiện CLB.",
    url: "https://www.tiktok.com/@tvts.hcmus",
  },
  {
    id: "ch-ig",
    platform: "Instagram",
    name: "Trường ĐH Khoa học Tự nhiên",
    handleOrSub: "@truongdhkhoahoctunhien_hcmus",
    description:
      "Hình ảnh góc sân trường Cơ sở 1 (227 NVC) & Cơ sở 2 (Linh Trung), khoảnh khắc sự kiện sinh viên.",
    url: "https://www.instagram.com/truongdhkhoahoctunhien_hcmus",
  },
  {
    id: "ch-portal",
    platform: "Cổng Thông Tin Điện Tử",
    name: "HCMUS · Phòng CTSV · Đoàn - Hội",
    handleOrSub: "hcmus.edu.vn",
    description:
      "Trang chủ HCMUS, Phòng Công tác Sinh viên (CTSV) và Cổng Đoàn Thanh niên – Hội Sinh viên HCMUS.",
    url: "https://www.hcmus.edu.vn",
  },
];

// Local helper to construct local date ISO so real-time countdowns match the user's clock in November 2026 - January 2027
const localIso = (
  year: number,
  month: number,
  day: number,
  hour = 8,
  minute = 0
): string => {
  const d = new Date(year, month - 1, day, hour, minute, 0);
  return d.toISOString();
};

export const HCMUS_DOCUMENT_EVENTS: HcmusDocumentEvent[] = [
  {
    id: "hcmus-evt-01",
    stt: 1,
    title: "Khám sức khỏe định kỳ cho sinh viên đợt 2 năm 2026",
    organizer: "Phòng Công tác Sinh viên (CTSV)",
    category: "student-affairs-scholarship",
    categoryLabel: "Hoạt động SV & Khám sức khỏe",
    eventTimeText:
      "02/11 – 07/11/2026 (Sáng: 07g30–11g00; Chiều: 13g00–16g00)",
    deadlineText:
      "Đăng ký lịch khám: 24/10 – 11g30 ngày 29/10/2026; Khai báo kết quả khám ngoài: mở xuyên suốt qua Microsoft Forms",
    statusText: "Đang diễn ra đợt khám; mở form khai báo kết quả",
    statusType: "ongoing",
    location: "Cơ sở 1 (227 Nguyễn Văn Cừ, Phường Chợ Quán, TP.HCM)",
    targetTimestamp: localIso(2026, 11, 2, 13, 0),
    eventStartTimestamp: localIso(2026, 11, 2, 7, 30),
    eventEndTimestamp: localIso(2026, 11, 7, 16, 0),
    summary:
      "Đợt khám sức khỏe định kỳ tập trung đợt 2 năm 2026 tại Cơ sở 1 theo 3 khung giờ mỗi buổi sáng/chiều.",
    details: [
      "Thời gian khám tập trung: 02/11/2026 đến 07/11/2026 (Sáng: 07g30–11g00; Chiều: 13g00–16g00).",
      "Đối với sinh viên tự khám tại địa phương/bệnh viện công lập theo Chương trình khám sức khỏe toàn dân của TP.HCM: tiếp tục gửi kết quả khám trực tuyến qua Biểu mẫu Microsoft Forms.",
      "Mang theo Thẻ sinh viên / CCCD khi đến khám tại Cơ sở 1.",
    ],
    contactOrLinkNote: "Khai báo kết quả trực tuyến qua Microsoft Forms Phòng CTSV",
    drlOrBenefitTag: "Bắt buộc · Hồ sơ Sức khỏe SV",
  },
  {
    id: "hcmus-evt-02",
    stt: 2,
    title:
      "Hội nghị Quốc tế lần thứ 7 về Kỹ thuật, Vật lý, MEMS – Cảm biến Y sinh (ICEBA 2026)",
    organizer: "Trường ĐH Khoa học Tự nhiên (HCMUS)",
    category: "seminar-conference",
    categoryLabel: "Hội nghị Quốc tế",
    eventTimeText: "Khai mạc 02/11/2026",
    deadlineText: "Đã đóng nhận bài trước hội nghị",
    statusText: "Đang diễn ra",
    statusType: "ongoing",
    location: "Cơ sở 1 (227 Nguyễn Văn Cừ, TP.HCM)",
    targetTimestamp: localIso(2026, 11, 2, 14, 0),
    eventStartTimestamp: localIso(2026, 11, 2, 8, 0),
    eventEndTimestamp: localIso(2026, 11, 3, 17, 0),
    summary:
      "Hội nghị Quốc tế chuyên sâu về Vật lý Kỹ thuật, hệ thống vi cơ điện tử (MEMS) và Cảm biến Y sinh hiện đại.",
    details: [
      "Quy tụ các nhà nghiên cứu, giảng viên và học viên sau đại học trong lĩnh vực Vật lý kỹ thuật & Y sinh.",
      "Sinh viên quan tâm có thể theo dõi các phiên báo cáo học thuật chuyên đề tại trường.",
    ],
    drlOrBenefitTag: "Hội nghị Quốc tế · Học thuật",
  },
  {
    id: "hcmus-evt-03",
    stt: 3,
    title: "Xét trao Học bổng Cựu sinh viên Khóa 1997 – Khoa Hóa học Năm 2026",
    organizer: "Khoa Hóa học — HCMUS",
    category: "student-affairs-scholarship",
    categoryLabel: "Học bổng Sinh viên",
    eventTimeText: "Lễ trao: 07/11/2026 (Thứ Bảy)",
    deadlineText: "Hạn chót nộp hồ sơ: 18g00 ngày 02/11/2026 (Thứ Hai)",
    statusText: "Sắp hết hạn (Hôm nay 18g00)",
    statusType: "urgent-today",
    location: "Khoa Hóa học — Cơ sở 1 (227 Nguyễn Văn Cừ, TP.HCM)",
    targetTimestamp: localIso(2026, 11, 2, 18, 0),
    eventStartTimestamp: localIso(2026, 11, 7, 8, 30),
    summary:
      "Tối đa 10 suất học bổng (5.000.000 VNĐ/suất) dành cho sinh viên Khoa Hóa học vượt khó học tốt.",
    details: [
      "Giá trị học bổng: Tối đa 10 suất, mỗi suất 5.000.000 VNĐ.",
      "Hạn chót nộp hồ sơ xét tuyển: 18g00 Thứ Hai, ngày 02/11/2026.",
      "Thời gian Lễ trao học bổng: Thứ Bảy, ngày 07/11/2026.",
      "Liên hệ hỗ trợ hồ sơ: Cô Phương Uyên (dnpuyen@hcmus.edu.vn).",
    ],
    contactOrLinkNote: "Liên hệ Cô Phương Uyên: dnpuyen@hcmus.edu.vn",
    drlOrBenefitTag: "Học bổng 5.000.000đ / suất",
  },
  {
    id: "hcmus-evt-04",
    stt: 4,
    title:
      "Seminar học thuật và Giới thiệu Đại học Quốc gia Chonnam, Hàn Quốc",
    organizer: "Khoa Sinh học – Công nghệ Sinh học (FBB) & ĐH Quốc gia Chonnam",
    category: "seminar-conference",
    categoryLabel: "Seminar Học thuật & Du học",
    eventTimeText: "14g00 – 17g00, Thứ Ba, ngày 03/11/2026",
    deadlineText: "Hết ngày 02/11/2026 (Thứ Hai) tại Google Form",
    statusText: "Đang mở đăng ký (Hạn cuối hôm nay)",
    statusType: "urgent-today",
    location: "Phòng F.203, Cơ sở 1 (227 Nguyễn Văn Cừ, Phường Chợ Quán, TP.HCM)",
    targetTimestamp: localIso(2026, 11, 3, 14, 0),
    eventStartTimestamp: localIso(2026, 11, 3, 14, 0),
    eventEndTimestamp: localIso(2026, 11, 3, 17, 0),
    summary:
      "Báo cáo chuyên đề Y sinh trị liệu ung thư & Quang âm học tích hợp Deep Learning, kết hợp giới thiệu học bổng sau đại học Hàn Quốc.",
    details: [
      'Báo cáo 1: "Smart (Synthetic) Anticancer Microbe (SAM) for precision cancer immunotherapy" — TS.BS. Jung-Joon Min.',
      'Báo cáo 2: "In Vivo Multiscale Photoacoustic Imaging & Deep Learning Applications" — GS. Changho Lee.',
      "Giới thiệu chương trình học bổng Sau đại học tại Đại học Quốc gia Chonnam (Hàn Quốc).",
      "Hạn đăng ký: Đến hết ngày 02/11/2026 qua Biểu mẫu Google Form.",
    ],
    contactOrLinkNote: "Đăng ký qua Google Form của Khoa Sinh học – CNSH",
    drlOrBenefitTag: "Tích lũy Chuyên đề B · ĐRL",
  },
  {
    id: "hcmus-evt-05",
    stt: 5,
    title:
      "Seminar Khoa học tháng 11/2026: Conversion of Biomass-Derived Compounds into Valuable Polycyclic Nitrogen Heterocycles",
    organizer: "Khoa Hóa học (Báo cáo viên: TS. Kumar Paulvannan – Michigan State University)",
    category: "seminar-conference",
    categoryLabel: "Seminar Khoa học",
    eventTimeText: "14g00 ngày 03/11/2026 (Thứ Ba)",
    deadlineText: "Đã chốt form lúc 17g00 ngày 01/11/2026 (Chủ Nhật)",
    statusText: "Đã đóng form đăng ký",
    statusType: "closed",
    location: "Cơ sở 1 (227 Nguyễn Văn Cừ, TP.HCM – phòng cụ thể gửi qua email)",
    targetTimestamp: localIso(2026, 11, 3, 14, 0),
    eventStartTimestamp: localIso(2026, 11, 3, 14, 0),
    summary:
      "Chuyên đề chuyển hóa hợp chất có nguồn gốc sinh khối thành dị vòng nitơ đa vòng có giá trị cao qua phản ứng nối tiếp.",
    details: [
      "Báo cáo viên: TS. Kumar Paulvannan (Michigan State University, Hoa Kỳ).",
      "Lưu ý quan trọng: Những sinh viên đã đăng ký cần tham dự đúng giờ để không bị hạn chế quyền đăng ký các hội thảo sau.",
    ],
    drlOrBenefitTag: "Seminar Quốc tế · Khoa Hóa",
  },
  {
    id: "hcmus-evt-06",
    stt: 6,
    title:
      'Hội thảo "Đăng ký sáng chế quốc tế và thương mại hóa tài sản trí tuệ trong cơ sở giáo dục đại học"',
    organizer: "Phòng KHCN HCMUS, Cục SHTT, Sở KH&CN TP.HCM & Trường ĐH Kinh tế – Luật (UEL)",
    category: "seminar-conference",
    categoryLabel: "Hội thảo Khoa học & SHTT",
    eventTimeText: "08g00 – 11g30, Thứ Tư, ngày 04/11/2026",
    deadlineText: "Đăng ký trực tuyến trước giờ diễn ra qua Google Form",
    statusText: "Đang mở đăng ký",
    statusType: "open",
    location: "Phòng F.102, Cơ sở 1 (227 Nguyễn Văn Cừ, Phường Chợ Quán, TP.HCM)",
    targetTimestamp: localIso(2026, 11, 4, 8, 0),
    eventStartTimestamp: localIso(2026, 11, 4, 8, 0),
    eventEndTimestamp: localIso(2026, 11, 4, 11, 30),
    summary:
      "Hướng dẫn quy trình bảo hộ sáng chế quốc tế, bản quyền nghiên cứu và thương mại hóa sản phẩm khoa học công nghệ tại đại học.",
    details: [
      "Đối tượng: Giảng viên, nhà khoa học, học viên sau đại học và sinh viên quan tâm nghiên cứu/khởi nghiệp.",
      "Địa điểm: Phòng F.102, Cơ sở 1 (227 Nguyễn Văn Cừ).",
      "Liên hệ chuyên viên Tống Thị Tuyết Trinh: ttttrinh@hcmus.edu.vn.",
    ],
    contactOrLinkNote: "Liên hệ: ttttrinh@hcmus.edu.vn · Đăng ký qua Google Form",
    drlOrBenefitTag: "Tích lũy Chuyên đề B · ĐRL",
  },
  {
    id: "hcmus-evt-07",
    stt: 7,
    title: "Học bổng Mitsubishi UFJ năm học 2026–2027 (Khóa 2023, 2024)",
    organizer: "Phòng Công tác Sinh viên (CTSV)",
    category: "student-affairs-scholarship",
    categoryLabel: "Học bổng Quốc tế",
    eventTimeText: "Đợt xét học kỳ 1 năm học 2026–2027",
    deadlineText:
      "16g00 ngày 04/11/2026 (Nộp hồ sơ giấy tại Phòng CTSV & khai báo online)",
    statusText: "Đang mở nhận hồ sơ",
    statusType: "open",
    location:
      "Phòng A02 Cơ sở 1 (227 NVC) hoặc Phòng 2.8 Nhà điều hành Cơ sở 2",
    targetTimestamp: localIso(2026, 11, 4, 16, 0),
    eventStartTimestamp: localIso(2026, 11, 4, 16, 0),
    summary:
      "Học bổng Mitsubishi UFJ trị giá 1.200 USD/suất dành cho sinh viên chính quy Khóa 2023, 2024 có thành tích học tập và nghiên cứu xuất sắc.",
    details: [
      "Giá trị học bổng: 1.200 USD / suất.",
      "Điều kiện: Sinh viên chính quy Khóa 2023, 2024 có ĐTB năm học 2025–2026 từ 8.5 trở lên, ĐRL từ 90 trở lên và có công bố khoa học.",
      "Hạn chót: Khai báo trực tuyến và nộp hồ sơ giấy tại Phòng CTSV trước 16g00 Thứ Tư, ngày 04/11/2026.",
    ],
    contactOrLinkNote: "Nộp tại Phòng A02 (CS1) hoặc Phòng 2.8 NĐH (CS2)",
    drlOrBenefitTag: "Học bổng 1.200 USD / suất",
  },
  {
    id: "hcmus-evt-08",
    stt: 8,
    title:
      'Seminar "Bioinformatics with AI: what changes, what doesn\'t – a metabolic-disease multi-omics story"',
    organizer:
      "Khoa Sinh học – CNSH (FBB) · TS. Trần Thượng Vân Du (SIB Swiss Institute of Bioinformatics, Thụy Sĩ)",
    category: "seminar-conference",
    categoryLabel: "Seminar AI & Tin Sinh Học",
    eventTimeText: "09g00 Thứ Năm, ngày 05/11/2026",
    deadlineText: "Đăng ký trực tuyến trước sự kiện qua Google Form",
    statusText: "Đang mở đăng ký",
    statusType: "open",
    location: "Giảng đường 1, Cơ sở 1 (227 Nguyễn Văn Cừ, Phường Chợ Quán, TP.HCM)",
    targetTimestamp: localIso(2026, 11, 5, 9, 0),
    eventStartTimestamp: localIso(2026, 11, 5, 9, 0),
    eventEndTimestamp: localIso(2026, 11, 5, 11, 30),
    summary:
      "Giao thoa giữa Trí tuệ nhân tạo (AI) và Tin sinh học qua câu chuyện phân tích dữ liệu đa tầng (multi-omics) bệnh chuyển hóa.",
    details: [
      "Khách mời: TS. Trần Thượng Vân Du — Chuyên gia Sinh học tính toán cấp cao tại Vital-IT, SIB Swiss Institute of Bioinformatics (Thụy Sĩ).",
      "Rất phù hợp cho sinh viên Khoa Sinh học – CNSH, Khoa CNTT và Khoa Toán – Tin học quan tâm AI trong Y sinh.",
      "Địa điểm: Giảng đường 1, Cơ sở 1 (227 Nguyễn Văn Cừ).",
    ],
    contactOrLinkNote: "Đăng ký trực tuyến trước giờ diễn ra qua Google Form FBB",
    drlOrBenefitTag: "Tích lũy Chuyên đề B · AI & Bio",
  },
  {
    id: "hcmus-evt-09",
    stt: 9,
    title: 'Seminar học thuật "Growing wheat in vertical farms"',
    organizer:
      "Khoa Sinh học – CNSH (FBB) & Đại học Công nghệ Munich (TUM – Đức)",
    category: "seminar-conference",
    categoryLabel: "Seminar Học thuật Quốc tế",
    eventTimeText: "14g00 – 16g00, Thứ Năm, ngày 05/11/2026",
    deadlineText: "Hạn đăng ký theo thông báo: hết ngày 31/10/2026 qua Google Form",
    statusText: "Đã qua hạn đăng ký chính thức",
    statusType: "closed",
    location: "Phòng TTTH.30, Cơ sở 1 (227 Nguyễn Văn Cừ, Phường Chợ Quán, TP.HCM)",
    targetTimestamp: localIso(2026, 11, 5, 14, 0),
    eventStartTimestamp: localIso(2026, 11, 5, 14, 0),
    eventEndTimestamp: localIso(2026, 11, 5, 16, 0),
    summary:
      "Chuyên đề công nghệ nông nghiệp thẳng đứng (Vertical Farming) và tối ưu hóa sinh trưởng lúa mì cùng chuyên gia ĐH Công nghệ Munich (Đức).",
    details: [
      "Đơn vị phối hợp: Khoa Sinh học – CNSH & Technical University of Munich (TUM, Đức).",
      "Liên hệ hỗ trợ thông tin: khcn-dn.fbb@hcmus.edu.vn.",
    ],
    contactOrLinkNote: "Liên hệ hỗ trợ: khcn-dn.fbb@hcmus.edu.vn",
    drlOrBenefitTag: "Seminar Quốc tế · TUM Đức",
  },
  {
    id: "hcmus-evt-10",
    stt: 10,
    title:
      'Khóa học thực hành tin sinh học "Microbiome – từ thu mẫu đến phân tích dữ liệu"',
    organizer: "Khoa Sinh học – CNSH, Khoa Toán – Tin học & Công ty KTEST",
    category: "seminar-conference",
    categoryLabel: "Khóa học Thực hành",
    eventTimeText: "08g00 – 17g00, Thứ Sáu, ngày 06/11/2026",
    deadlineText: "Hết ngày 15/10/2026 qua Google Form",
    statusText: "Đã đóng đăng ký",
    statusType: "closed",
    location: "Cơ sở 2 (Khu đô thị ĐHQG-HCM, Phường Đông Hòa, TP.HCM)",
    targetTimestamp: localIso(2026, 11, 6, 8, 0),
    eventStartTimestamp: localIso(2026, 11, 6, 8, 0),
    eventEndTimestamp: localIso(2026, 11, 6, 17, 0),
    summary:
      "Khóa học thực hành chuyên sâu thuộc khuôn khổ hội nghị quốc tế SLSB 2026 về quy trình phân tích hệ vi sinh vật (Microbiome).",
    details: [
      "Phối hợp giảng dạy bởi Khoa Sinh học – CNSH, Khoa Toán – Tin học và Công ty TNHH Khoa học KTEST.",
      "Diễn ra nguyên ngày Thứ Sáu 06/11/2026 tại Cơ sở 2.",
    ],
    drlOrBenefitTag: "Tiền hội nghị SLSB 2026",
  },
  {
    id: "hcmus-evt-11",
    stt: 11,
    title:
      "Buổi giới thiệu và Phỏng vấn với Đại học Quốc gia Thanh Hoa (NTHU), Đài Loan",
    organizer:
      "Khoa Sinh học – CNSH (FBB) & College of Life Science and Medicine, NTHU (Đài Loan)",
    category: "seminar-conference",
    categoryLabel: "Học bổng & Phỏng vấn Du học",
    eventTimeText: "13g00 – 16g00, Thứ Sáu, ngày 06/11/2026",
    deadlineText: "Hết ngày 03/11/2026 (Thứ Ba) qua Google Form",
    statusText: "Đang mở đăng ký",
    statusType: "open",
    location: "Phòng NĐH7.6, Cơ sở 2 (Khu đô thị ĐHQG-HCM, Phường Đông Hòa, TP.HCM)",
    targetTimestamp: localIso(2026, 11, 6, 13, 0),
    eventStartTimestamp: localIso(2026, 11, 6, 13, 0),
    eventEndTimestamp: localIso(2026, 11, 6, 16, 0),
    summary:
      "Giới thiệu chương trình Sau đại học, thực tập ngắn hạn mùa hè và phỏng vấn trực tiếp ứng viên Thạc sĩ/Tiến sĩ kỳ nhập học 01/2027 & 09/2027.",
    details: [
      "Cơ hội phỏng vấn trực tiếp với các Giáo sư từ Đại học Quốc gia Thanh Hoa (NTHU), Đài Loan.",
      "Giới thiệu chương trình thực tập hè quốc tế và học bổng Thạc sĩ/Tiến sĩ kỳ tháng 01/2027 & 09/2027.",
      "Hạn đăng ký: Đến hết ngày 03/11/2026 (Thứ Ba) qua Biểu mẫu Google Form.",
    ],
    contactOrLinkNote: "Hạn đăng ký form: 03/11/2026",
    drlOrBenefitTag: "Phỏng vấn Học bổng Đài Loan",
  },
  {
    id: "hcmus-evt-12",
    stt: 12,
    title:
      "Hội nghị Quốc tế về Khoa học Sự sống và Công nghệ Sinh học Bền vững (SLSB 2026)",
    organizer: "Khoa Sinh học – CNSH (HCMUS), AFOB-VN & HABB",
    category: "seminar-conference",
    categoryLabel: "Hội nghị Quốc tế",
    eventTimeText:
      "06/11 – 08/11/2026 (Khai mạc: 08g30 Thứ Bảy, ngày 07/11/2026)",
    deadlineText:
      "Hạn nộp abstract: 01/09/2026; Tham dự tự do/đăng ký theo hướng dẫn Thông báo số 1",
    statusText: "Sắp diễn ra",
    statusType: "upcoming",
    location: "Hội trường B, Cơ sở 2 (Khu đô thị ĐHQG-HCM, Phường Đông Hòa, TP.HCM)",
    targetTimestamp: localIso(2026, 11, 7, 8, 30),
    eventStartTimestamp: localIso(2026, 11, 7, 8, 30),
    eventEndTimestamp: localIso(2026, 11, 8, 17, 0),
    summary:
      "Hội nghị Quốc tế lần thứ 1 về Khoa học Sự sống và Công nghệ Sinh học Bền vững (SLSB 2026) tổ chức tại Hội trường B, Cơ sở 2.",
    details: [
      "Lễ Khai mạc bắt đầu lúc 08g30 Thứ Bảy, ngày 07/11/2026 tại Hội trường B, Cơ sở 2.",
      "Quy tụ các báo cáo viên quốc tế và trong nước thuộc lĩnh vực Khoa học Sự sống & Công nghệ Sinh học.",
    ],
    drlOrBenefitTag: "Hội nghị Quốc tế SLSB 2026",
  },
  {
    id: "hcmus-evt-13",
    stt: 13,
    title:
      "Kỳ thi Lập trình ICPC Việt Nam Vòng Quốc gia 2026 (ICPC Vietnam National)",
    organizer: "Khoa Công nghệ Thông tin (FIT-HCMUS) / Hội Tin học Việt Nam",
    category: "academic-contest",
    categoryLabel: "Kỳ thi Lập trình Thuật toán",
    eventTimeText: "07/11 – 08/11/2026 (Thứ Bảy – Chủ Nhật)",
    deadlineText: "Đã chốt danh sách từ Vòng Khu vực miền Nam (18/10/2026)",
    statusText: "Sắp diễn ra",
    statusType: "upcoming",
    location: "Điểm thi Quốc gia — Khoa CNTT (FIT-HCMUS) đồng hành",
    targetTimestamp: localIso(2026, 11, 7, 8, 0),
    eventStartTimestamp: localIso(2026, 11, 7, 8, 0),
    eventEndTimestamp: localIso(2026, 11, 8, 17, 0),
    summary:
      "Vòng Quốc gia kỳ thi lập trình sinh viên quốc tế ICPC Vietnam National 2026 dành cho các đội tuyển xuất sắc vượt qua vòng khu vực.",
    details: [
      "Dành cho các đội tuyển đã vượt qua Vòng Khu vực miền Nam (tổ chức ngày 18/10/2026 tại điểm thi HCMUS).",
      "Theo dõi bảng xếp hạng trực tiếp (Live Scoreboard) trên hệ thống cổng thông tin Olympic Tin học & FIT-HCMUS.",
      "Tiếp nối bởi Kỳ thi ICPC World Finals 2026 (Kỳ thứ 50 – Dubai) vào ngày 15/11/2026.",
    ],
    drlOrBenefitTag: "Cuộc thi Học thuật · FIT-HCMUS",
  },
  {
    id: "hcmus-evt-14",
    stt: 14,
    title:
      "Hội nghị Khoa học lần thứ 15 – Trường ĐH Khoa học Tự nhiên, ĐHQG-HCM (VNUHCM-US-Conf26)",
    organizer: "Toàn Trường & 11 Tiểu ban chuyên môn các Khoa/Viện/Trung tâm",
    category: "seminar-conference",
    categoryLabel: "Hội nghị Khoa học Cấp Trường",
    eventTimeText:
      "09/11 – 16/11/2026 (Nộp bài toàn văn đăng tạp chí: từ 01/12/2026)",
    deadlineText:
      "Tham dự tự do (miễn phí tham dự); Hạn nộp bài toàn văn (Full-text): từ 01/12/2026",
    statusText: "Mở tham dự tự do; chuẩn bị nhận Full-text (01/12/2026)",
    statusType: "open",
    location: "Cơ sở 1 (227 Nguyễn Văn Cừ, Phường Chợ Quán, TP.HCM)",
    targetTimestamp: localIso(2026, 11, 9, 8, 0),
    eventStartTimestamp: localIso(2026, 11, 9, 8, 0),
    eventEndTimestamp: localIso(2026, 11, 16, 17, 30),
    summary:
      "Sự kiện khoa học lớn nhất của Trường ĐH Khoa học Tự nhiên với Phiên toàn thể cấp Trường và 11 Tiểu ban chuyên môn.",
    details: [
      "Miễn phí tham dự cho các đại biểu, giảng viên và sinh viên quan tâm tại Cơ sở 1 (227 Nguyễn Văn Cừ).",
      "Thời gian nhận bài báo toàn văn (Full-text Article Submission) để phản biện đăng tạp chí Scopus/Quốc tế bắt đầu từ ngày 01/12/2026 trên hệ thống CMT.",
      "Cơ hội tuyệt vời để sinh viên tích lũy hoạt động học thuật (Chuyên đề B) và học hỏi kinh nghiệm công bố khoa học.",
    ],
    contactOrLinkNote: "Tham dự tự do miễn phí tại Cơ sở 1 (227 Nguyễn Văn Cừ)",
    drlOrBenefitTag: "Sự kiện lớn nhất Trường · Miễn phí tham dự",
  },
  {
    id: "hcmus-evt-15",
    stt: 15,
    title:
      'Tiểu ban Toán – Tin học & Hội thảo "Xác suất và Thống kê trong kỷ nguyên số" (HNKH lần thứ 15)',
    organizer: "Khoa Toán – Tin học — HCMUS",
    category: "seminar-conference",
    categoryLabel: "Tiểu ban HNKH Lần 15",
    eventTimeText:
      "09/11 – 16/11/2026 (Các phiên chính: 09/11, 12/11, 15/11/2026)",
    deadlineText:
      "Hạn nộp bản hoàn chỉnh: 30/10/2026; Nộp toàn văn đăng tạp chí: từ 01/12/2026",
    statusText: "Sắp diễn ra (Mở tham dự tự do)",
    statusType: "upcoming",
    location: "Cơ sở 1 (227 Nguyễn Văn Cừ, Phường Chợ Quán, TP.HCM)",
    targetTimestamp: localIso(2026, 11, 9, 8, 30),
    eventStartTimestamp: localIso(2026, 11, 9, 8, 30),
    eventEndTimestamp: localIso(2026, 11, 15, 17, 30),
    summary:
      "Chuỗi phiên báo cáo Giáo dục Toán học, Giải tích, Đại số, Tối ưu, Toán tính toán và Hội thảo Xác suất Thống kê trong kỷ nguyên số.",
    details: [
      "Phiên Giáo dục Toán học: 09/11/2026 (08g30–17g30).",
      "Các phân ban Phương trình đạo hàm riêng, Giải tích toán học, Đại số, Tối ưu: 12/11/2026 (08g00–17g30).",
      'Phân ban Toán học tính toán và Hội thảo "Xác suất và Thống kê trong kỷ nguyên số": 15/11/2026 (08g00–17g30).',
    ],
    drlOrBenefitTag: "Khoa Toán – Tin học · HNKH 15",
  },
  {
    id: "hcmus-evt-16",
    stt: 16,
    title: "Hội thảo Khoa học Trái đất và Phát triển bền vững 2026 (CESD 2026)",
    organizer: "Khoa Môi trường, Khoa Địa chất, Khoa Vật lý – Vật lý Kỹ thuật",
    category: "seminar-conference",
    categoryLabel: "Hội thảo Liên Khoa (HNKH 15)",
    eventTimeText: "12/11 – 13/11/2026 (Thứ Năm – Thứ Sáu)",
    deadlineText: "Hạn hoàn tất đăng ký trình bày: 30/10/2026",
    statusText: "Sắp diễn ra",
    statusType: "upcoming",
    location: "Cơ sở 1 (227 Nguyễn Văn Cừ, Phường Chợ Quán, TP.HCM)",
    targetTimestamp: localIso(2026, 11, 12, 8, 0),
    eventStartTimestamp: localIso(2026, 11, 12, 8, 0),
    eventEndTimestamp: localIso(2026, 11, 13, 17, 0),
    summary:
      "Hội thảo liên ngành về Khoa học Trái đất, biến đổi khí hậu, năng lượng tái tạo và phát triển bền vững (CESD 2026).",
    details: [
      "Đồng tổ chức bởi 3 Khoa: Khoa Môi trường, Khoa Địa chất và Khoa Vật lý – Vật lý Kỹ thuật.",
      "Diễn ra trong 2 ngày 12/11 – 13/11/2026 thuộc khuôn khổ Hội nghị Khoa học lần thứ 15.",
    ],
    drlOrBenefitTag: "Liên Khoa · Phát triển bền vững",
  },
  {
    id: "hcmus-evt-17",
    stt: 17,
    title: "Tiểu ban Công nghệ Giáo dục & Khoa học Tích hợp (HNKH lần thứ 15)",
    organizer: "Khoa Khoa học Liên ngành (FIS)",
    category: "seminar-conference",
    categoryLabel: "Tiểu ban HNKH Lần 15",
    eventTimeText: "13/11 – 14/11/2026 (Thứ Sáu – Thứ Bảy)",
    deadlineText: "Hạn nộp tóm tắt: 20/10/2026; Công bố kết quả: 30/10/2026",
    statusText: "Sắp diễn ra",
    statusType: "upcoming",
    location: "Cơ sở 1 (227 Nguyễn Văn Cừ, Phường Chợ Quán, TP.HCM)",
    targetTimestamp: localIso(2026, 11, 13, 8, 0),
    eventStartTimestamp: localIso(2026, 11, 13, 8, 0),
    eventEndTimestamp: localIso(2026, 11, 14, 17, 0),
    summary:
      "Diễn đàn học thuật về ứng dụng công nghệ trong giáo dục hiện đại (EdTech) và nghiên cứu khoa học tích hợp liên ngành.",
    details: [
      "Đơn vị tổ chức: Khoa Khoa học Liên ngành (FIS).",
      "Diễn ra trong 2 ngày 13/11 – 14/11/2026 tại Cơ sở 1.",
    ],
    drlOrBenefitTag: "EdTech & Khoa học Liên ngành",
  },
  {
    id: "hcmus-evt-18",
    stt: 18,
    title:
      "Bài thu hoạch & Khảo sát Sinh hoạt Công dân – Sinh viên đầu năm (Chuyên đề A) NH 2026–2027",
    organizer: "Phòng Công tác Sinh viên (CTSV)",
    category: "student-affairs-scholarship",
    categoryLabel: "Sinh hoạt Công dân (Bắt buộc)",
    eventTimeText: "23/11 – 30/11/2026 (Trực tuyến)",
    deadlineText:
      "Hạn cuối hoàn thành bài thu hoạch: 30/11/2026 (dành cho SV đã học Chuyên đề A)",
    statusText: "Sắp mở hệ thống (23/11/2026)",
    statusType: "upcoming",
    location: "Hệ thống trực tuyến Phòng CTSV HCMUS",
    targetTimestamp: localIso(2026, 11, 23, 8, 0),
    eventStartTimestamp: localIso(2026, 11, 23, 8, 0),
    eventEndTimestamp: localIso(2026, 11, 30, 23, 59),
    summary:
      "Làm bài thu hoạch & khảo sát trực tuyến bắt buộc đối với sinh viên Khóa 2024 và Khóa 2025 đã tham gia học Chuyên đề A.",
    details: [
      "Đối tượng: Tất cả sinh viên Khóa 2024 và Khóa 2025 hệ Đại học chính quy đã tham gia đầy đủ các buổi học Chuyên đề A (bao gồm cả đợt bổ sung ngày 31/10 – 01/11/2026).",
      "Thời gian mở hệ thống: Từ ngày 23/11/2026 đến hết ngày 30/11/2026.",
      "Yêu cầu: Đạt tối thiểu 70% nội dung bài thu hoạch để được công nhận hoàn thành Chuyên đề A.",
    ],
    contactOrLinkNote: "Làm trực tuyến trên cổng CTSV từ 23/11 đến 30/11/2026",
    drlOrBenefitTag: "Bắt buộc Khóa 2024 & 2025",
  },
  {
    id: "hcmus-evt-19",
    stt: 19,
    title:
      "Chuỗi cuộc thi Olympic Trí tuệ nhân tạo (OlpAI'26), Olympic Tin học SV VN lần thứ 35 (OLP'26), PROCON VN & ICPC Asia Danang Regional 2026",
    organizer: "Khoa CNTT (FIT-HCMUS) tham dự & đồng hành cùng Hội Tin học VN",
    category: "academic-contest",
    categoryLabel: "Olympic Tin học & AI Toàn quốc",
    eventTimeText:
      "OlpAI'26: 07/12/2026; OLP'26 & PROCON: 08/12/2026; ICPC Asia Danang: 10/12 – 11/12/2026",
    deadlineText: "Mở đăng ký từ 01/11/2026 theo thông báo của OLP Việt Nam",
    statusText: "Đang mở đăng ký cho các đội tuyển",
    statusType: "open",
    location: "Đà Nẵng & Hệ thống thi Olympic Tin học Sinh viên Việt Nam (OLP.vn)",
    targetTimestamp: localIso(2026, 12, 7, 8, 0),
    eventStartTimestamp: localIso(2026, 12, 7, 8, 0),
    eventEndTimestamp: localIso(2026, 12, 11, 17, 0),
    summary:
      "Chuỗi giải đấu học thuật công nghệ thông tin và trí tuệ nhân tạo lớn nhất năm dành cho sinh viên các trường đại học.",
    details: [
      "Chung kết Olympic Trí tuệ nhân tạo Sinh viên Việt Nam lần thứ 2 (OlpAI'26): 07/12/2026.",
      "Olympic Tin học Sinh viên Việt Nam lần thứ 35 (OLP'26) & Kỳ thi PROCON Việt Nam 2026: 08/12/2026.",
      "Kỳ thi Lập trình Quốc tế ICPC Asia Danang Regional Contest 2026: 10/12 – 11/12/2026 tại Đà Nẵng.",
      "Bên cạnh đó, Khoa Hóa học & Khoa Môi trường cũng đang triển khai tuyển chọn và ôn luyện Đội tuyển Olympic Hóa học Sinh viên Toàn quốc lần thứ XIII – Năm 2027.",
    ],
    contactOrLinkNote: "Theo dõi trên FIT-HCMUS Online Judge & OLP.vn",
    drlOrBenefitTag: "Đấu trường Quốc gia & Quốc tế",
  },
  {
    id: "hcmus-evt-20",
    stt: 20,
    title:
      "Tích lũy Hoạt động Chuyên đề B (Tự chọn) – Sinh hoạt Công dân Sinh viên NH 2026–2027",
    organizer: "Phòng Công tác Sinh viên (CTSV) & Các Khoa / Đoàn – Hội / CLB",
    category: "student-affairs-scholarship",
    categoryLabel: "Sinh hoạt Công dân (Chuyên đề B)",
    eventTimeText:
      "Xuyên suốt tháng 11/2026, tháng 12/2026 đến đầu tháng 01/2027",
    deadlineText: "Hạn cuối tích lũy đủ 02 hoạt động: 05/01/2027",
    statusText: "Đang diễn ra xuyên suốt",
    statusType: "ongoing",
    location: "Cơ sở 1 (227 Nguyễn Văn Cừ) & Cơ sở 2 (ĐHQG-HCM)",
    targetTimestamp: localIso(2027, 1, 5, 17, 0),
    eventStartTimestamp: localIso(2026, 11, 2, 8, 0),
    eventEndTimestamp: localIso(2027, 1, 5, 17, 0),
    summary:
      "Sinh viên đăng ký và tham gia tối thiểu 02 hoạt động tự chọn (seminar, hội thảo, workshop, talkshow hoặc cuộc thi học thuật) trước ngày 05/01/2027.",
    details: [
      "Yêu cầu bắt buộc: Sinh viên đăng ký và tham gia tối thiểu 02 hoạt động bất kỳ do Nhà trường/Khoa/Đoàn – Hội tổ chức.",
      "Mọi hội thảo, seminar học thuật và hội nghị khoa học trong danh sách trên đều là cơ hội tích lũy hoạt động Chuyên đề B và Điểm Rèn Luyện.",
      "Hạn chót hoàn thành tích lũy: Ngày 05/01/2027.",
    ],
    contactOrLinkNote: "Hạn cuối tích lũy đủ 02 hoạt động: 05/01/2027",
    drlOrBenefitTag: "Tối thiểu 02 hoạt động trước 05/01/2027",
  },
];
