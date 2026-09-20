// 공개 문구·링크는 docs/홈페이지-기획.md 5장에서 대표가 확인한 초안(2026-09-13)만 쓴다.
// 문구를 바꾸려면 기획 문서를 먼저 고치고 대표 확인을 받는다.

export const links = {
  diagnosis: "https://www.latpeed.com/products/bxdTq",
  challengePreRegister:
    "https://docs.google.com/forms/d/e/1FAIpQLScndQ2oAWyhw5F3fw5g-pu33s6VvgbL4FibeTZlkhRyR7EDRg/viewform?usp=header",
  kakaoChannel: "https://pf.kakao.com/_bYIBn",
  youtubeChannel: "https://www.youtube.com/@다니는다니",
  threads: "https://www.threads.net/@danee_marktive",
  blog: "https://blog.naver.com/marktive",
} as const;

export const sectionIds = {
  diagnosis: "service-diagnosis",
  challenge: "service-challenge",
  agency: "service-agency",
  consult: "consult",
} as const;

export const navItems = [
  { label: "블로그 진단", href: `#${sectionIds.diagnosis}` },
  { label: "매출로 이어지는 블로그", href: `#${sectionIds.challenge}` },
  { label: "블로그 대행", href: `#${sectionIds.agency}` },
  { label: "상담 신청", href: `#${sectionIds.consult}` },
] as const;

export const hero = {
  title: "광고를 멈추면 문의도 멈추고 있지 않으신가요?",
  description:
    "다니는다니는 매출이 막힌 사업자가 스스로 복리형 콘텐츠를 쌓아 매출을 만들 수 있도록 돕습니다.",
  subDescription: "어디가 막혔는지부터 확인하는 블로그 진단으로 시작해 보세요.",
  cta: "블로그 진단 신청 · 59,000원",
} as const;

export const pains = {
  title: "이런 고민, 혼자 하고 계신가요?",
  items: [
    "광고비를 넣을 때만 문의가 들어옵니다.",
    "블로그는 쓰고 있는데 문의로 이어지지 않습니다.",
    "무엇부터 고쳐야 할지 막막합니다.",
  ],
} as const;

// 서비스 카드: 확인 문구(기획 5장) + 노션 상세페이지 내용(2026-09-14 대표 확인, 세 카드 모두)
// 노션 상세페이지의 실적·후기(원생 증가율, 방문자 수, 고객 후기 캡처 등)는 넣지 않는다.
export const services = {
  title: "지금 상황에 맞는 방법을 고르세요",
  items: [
    {
      id: sectionIds.diagnosis,
      name: "블로그 진단",
      badge: "상시 신청",
      description:
        "지금 블로그에서 어디가 막혔는지 먼저 확인합니다. 진단 결과는 리포트로 전달드립니다.",
      includes: ["블로그 첫인상 진단", "콘텐츠 방향 진단", "키워드 방향 진단", "플레이스·외부 채널 점검", "경쟁사와 시장 흐름 확인", "바로 적용할 개선 방향 제안"],
      note: "매월 10명까지만 먼저 진행합니다. 블로그 글을 대신 써 드리는 대행 상품은 아닙니다.",
      details: ["1회", "노션 또는 PDF 리포트", "사전 설문 후 영업일 3~5일"],
      price: "59,000원",
      priceNote: "",
      cta: "진단 신청하기",
      href: links.diagnosis,
    },
    {
      id: sectionIds.challenge,
      name: "매출로 이어지는 블로그",
      badge: "다음 기수 사전신청",
      description:
        "블로그는 쓰고 있는데 문의가 끊긴 사업자를 위한 4주 과정입니다. 세팅, 키워드, 구조화된 글, 문의 받는 공지글까지 직접 발행하며 익힙니다.",
      includes: ["시작 전 개인 블로그 진단", "라이브 다시보기", "제출 글마다 1,000자 안팎 피드백", "주차별 워크시트·템플릿", "종료 후 30일 콘텐츠 계획"],
      note: "",
      details: ["4주", "주 1회 라이브", "글 7편 발행"],
      price: "다음 기수 290,000원",
      priceNote: "블로그 진단 구매자는 진단 비용을 차감해 231,000원",
      cta: "사전신청하기",
      href: links.challengePreRegister,
    },
    {
      id: sectionIds.agency,
      name: "블로그 관리 대행 (마켓티브)",
      badge: "문의",
      description:
        "블로그 운영을 맡기고 싶은 분을 위한 관리 대행입니다. 현재 6개 업체의 블로그를 관리하고 있습니다.",
      includes: [],
      note: "퀄리티 유지를 위해 소수 업체만 밀착해서 관리합니다. 신규 대행은 바로 진행하기 어려운 경우가 있습니다.",
      details: [],
      price: "문의",
      priceNote: "",
      cta: "대행 문의하기",
      href: links.kakaoChannel,
    },
  ],
} as const;

export const steps = {
  title: "어디서부터 시작하면 좋을까요?",
  items: [
    { text: "블로그 진단으로 막힌 곳을 확인합니다.", target: sectionIds.diagnosis },
    { text: "직접 해 보고 싶다면 매출로 이어지는 블로그로 이어갑니다.", target: sectionIds.challenge },
    { text: "운영을 맡기고 싶다면 블로그 대행을 상담합니다.", target: sectionIds.agency },
  ],
} as const;

export const consult = {
  title: "블로그 마케팅 고민, 편하게 남겨 주세요",
  description: "지금 상황을 적어 주시면 확인 후 이메일로 연락드리겠습니다.",
  consent: "상담 연락을 위해 이름과 이메일을 수집합니다.",
  submit: "상담 신청하기",
  kakao: "카카오톡으로 바로 문의하기",
} as const;

export const footer = {
  brands: "다니는다니 · 마켓티브",
  kakao: "카카오톡 채널",
  // 사업자등록증명(2025-05-30 발급) 기준. 주민등록번호·발급번호는 공개하지 않는다.
  businessInfo: [
    { label: "상호", value: "마켓티브" },
    { label: "대표", value: "류수민" },
    { label: "사업자등록번호", value: "202-08-53531" },
    { label: "주소", value: "대구광역시 중구 명덕로 179, 2층 202-45A호(남산동)" },
  ],
  email: "marktive@naver.com",
  copyright: "© 2026 다니는다니",
} as const;
