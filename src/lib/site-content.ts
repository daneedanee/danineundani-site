// 공개 문구·링크는 docs/홈페이지-기획.md 5장에서 대표가 확인한 초안(2026-09-13)만 쓴다.
// 문구를 바꾸려면 기획 문서를 먼저 고치고 대표 확인을 받는다.

export const links = {
  diagnosis: "https://www.latpeed.com/products/bxdTq",
  challengePreRegister:
    "https://docs.google.com/forms/d/e/1FAIpQLScndQ2oAWyhw5F3fw5g-pu33s6VvgbL4FibeTZlkhRyR7EDRg/viewform?usp=header",
  // 「매출로 이어지는 블로그」 래피드 판매 페이지. 2기 정식 모집 (대표가 준 주소, 2026-10-16).
  // 상단 메뉴·서비스 카드·시작 순서가 여기로 간다. 비우면 상단 메뉴는 홈의 소개 구역으로 간다.
  challengeSales: "https://www.latpeed.com/products/RjkkI",
  // 블로그 대행 문의 양식 (네이버 폼). 대표가 준 주소 (2026-10-11).
  agencyForm: "https://naver.me/5AgoKebv",
  // 위 짧은 주소가 가리키는 네이버 폼의 실제 주소. /agency 페이지에 끼워 넣을 때 쓴다 (짧은 주소는 거쳐 가는 주소라 끼워 넣기에 맞지 않는다).
  agencyFormDirect: "https://form.naver.com/response/QkP-rfH77PD5gSf93n3cNA",
  // 뉴스레터 구독 신청 페이지(스티비). 상단 메뉴 「다니레터」가 여기로 간다 (이름은 대표 결정).
  // 지난 호를 보여 주는 공유 주소(stibee.com/api/.../emails/share/...)는 넣지 않는다. 구독자용 자료 링크가 들어 있다.
  newsletter: "https://page.stibee.com/subscriptions/512971",
  kakaoChannel: "https://pf.kakao.com/_bYIBn",
  youtubeChannel: "https://www.youtube.com/@다니는다니",
  threads: "https://www.threads.net/@danee_marktive",
  blog: "https://blog.naver.com/marktive",
} as const;

// 유튜브 채널 @다니는다니 의 ID. 홈의 영상 띠가 최근 영상을 읽는 데 쓴다.
export const youtube = {
  channelId: "UCHswvf6WXV6ftP8WqpHNUnA",
} as const;

export const sectionIds = {
  finder: "finder",
  diagnosis: "service-diagnosis",
  challenge: "service-challenge",
  agency: "service-agency",
  consult: "consult",
} as const;

// 해결 방법의 공개 상태. 상태와 주소를 여기서만 바꾸면 고민 찾기 결과·서비스 카드·상단 메뉴가 같이 바뀐다.
//   available: 지금 신청·구매 가능 / waitlist: 다음 모집 전 / upcoming: 준비 중, 판매하지 않음
//   consult: 상담으로 범위 확인 / content: 무료로 읽거나 구독
// 모집 전·준비 중인 것은 결제 페이지로 보내지 않는다 (finder.test.ts 가 막는다).
// 아래 문구 가운데 "초안" 표시는 2026-10-24 퍼널 인수인계서를 바탕으로 쓴 것이고 대표 확인 전이다.
export type OfferStatus = "available" | "waitlist" | "upcoming" | "consult" | "content";

export const offerStatusLabels: Record<OfferStatus, string> = {
  available: "지금 신청 가능",
  waitlist: "다음 기수 준비 중",
  upcoming: "준비 중",
  consult: "상담 후 진행",
  content: "무료",
};

// 초안. 모집 전·준비 중인 해결 방법 카드 아래에 붙는 안내.
export const offerStatusNotes: Partial<Record<OfferStatus, string>> = {
  waitlist: "지금은 모집하지 않습니다.",
  upcoming: "아직 판매하지 않는 서비스입니다.",
};

type Offer = { name: string; status: OfferStatus; summary: string; price: string; cta: string; href: string };

export const offers = {
  // 이름·설명·가격·버튼은 서비스 카드의 대표 확인 문구 그대로다.
  diagnosis: {
    name: "블로그 진단",
    status: "available",
    summary: "지금 블로그에서 어디가 막혔는지 먼저 확인합니다. 진단 결과는 리포트로 전달드립니다.",
    price: "59,000원",
    cta: "진단 신청하기",
    href: links.diagnosis,
  },
  // 2기 판매는 래피드에서 2026-10-18 마감, 2기 사전대기 구글폼도 응답 마감 (2026-10-24 확인).
  // 다음 기수 대기 명단이 따로 없어 다니레터로 보낸다(초안). 모집을 열면 status 를 available, href 를 links.challengeSales 로 바꾼다.
  challenge: {
    name: "매출로 이어지는 블로그",
    status: "waitlist",
    summary:
      "블로그는 쓰고 있는데 문의가 끊긴 사업자를 위한 4주 과정입니다. 세팅, 키워드, 구조화된 글, 문의 받는 공지글까지 직접 발행하며 익힙니다.",
    price: "",
    cta: "다음 기수 소식 받기",
    href: "/letter",
  },
  // 초안. 범위·가격·출시 시기 미정 (인수인계서 2장 [기획]). 구매 버튼을 달지 않는다.
  feedback: {
    name: "글 피드백",
    status: "upcoming",
    summary: "이미 쓰고 있는 글을 봐 드리는 피드백 서비스를 준비하고 있습니다.",
    price: "",
    cta: "출시 소식 받기",
    href: "/letter",
  },
  // 초안. 2027년 출시 검토 (인수인계서 2장 [기획]). 구매 버튼을 달지 않는다.
  vod: {
    name: "블로그 입문 강의 (VOD)",
    status: "upcoming",
    summary: "블로그 설정부터 첫 글까지, 처음 시작하는 분을 위한 강의를 준비하고 있습니다.",
    price: "",
    cta: "출시 소식 받기",
    href: "/letter",
  },
  // 이름·버튼은 서비스 카드의 대표 확인 문구 그대로다. 가격은 홈에 적지 않는다 (기획 5장 「문의」, 2026-10-24 대표 재확인).
  // 업체 수는 적지 않는다 (2026-10-24 대표 결정). 「소수 업체만 밀착」은 서비스 카드 안내 문구에서 가져왔다.
  agency: {
    name: "블로그 관리 대행 (마켓티브)",
    status: "consult",
    summary: "블로그 운영을 맡기고 싶은 분을 위한 관리 대행입니다. 퀄리티 유지를 위해 소수 업체만 밀착해서 관리합니다.",
    price: "",
    cta: "대행 문의하기",
    href: "/agency",
  },
  // 설명·버튼은 상담 신청 구역의 대표 확인 문구 그대로다.
  consult: {
    name: "상담 신청",
    status: "consult",
    summary: "지금 상황을 적어 주시면 확인 후 이메일로 연락드리겠습니다.",
    price: "",
    cta: "상담 신청하기",
    href: `/#${sectionIds.consult}`,
  },
  // 초안.
  notes: {
    name: "칼럼",
    status: "content",
    summary: "블로그로 문의를 만드는 방법을 칼럼으로 먼저 읽어 보세요.",
    price: "",
    cta: "칼럼 읽기",
    href: "/notes",
  },
  // 초안.
  newsletter: {
    name: "다니레터",
    status: "content",
    summary: "다니의 블로그 마케팅 이야기를 메일로 받아 보세요.",
    price: "",
    cta: "다니레터 구독하기",
    href: "/letter",
  },
  // 무료 실행 자료(인수인계서 5-2, 제목 미정). 자료가 생기면 이름·설명·주소를 넣는다. 주소가 비어 있으면 고민 찾기 결과에 나오지 않는다.
  freeTemplate: {
    name: "무료 글 설계 템플릿",
    status: "upcoming",
    summary: "",
    price: "",
    cta: "",
    href: "",
  },
} satisfies Record<string, Offer>;

export type OfferId = keyof typeof offers;

// 지금 신청·구매할 수 있는지. 상태 값을 바꿔 가며 쓰므로 함수로 둔다.
export function isOpen(status: OfferStatus): boolean {
  return status === "available";
}

// 고민 찾기 (홈 첫 화면 바로 아래). 질문·선택지는 인수인계서 4장, 세 번째 질문은 2026-10-24 대표 인터뷰로 이유를 묻게 바꿨다.
// 제목은 대표 선택(인수인계서 히어로 문구). 추천 이유는 대표 요청으로 다니 말투(해요체), 결과 하나마다 두 줄.
// 추천 규칙은 src/lib/finder.ts.
export const finder = {
  title: "블로그 마케팅, 지금 어디서 막혀 계신가요?",
  description: "질문 두세 개에 답하면 지금 상황에 맞는 방법을 바로 보여 드립니다.",
  progress: "질문",
  q1: {
    question: "지금 가장 큰 고민은 무엇인가요?",
    options: {
      NO_RESULTS: "블로그를 운영하는데 성과가 없어요",
      NEW_BEGINNER: "블로그를 처음 시작하려고 해요",
      EXECUTION_BLOCK: "무엇을 해야 할지는 알지만 혼자 꾸준히 하기 어려워요",
      NEED_FEEDBACK: "글을 쓰고 있는데 제대로 쓰는지 모르겠어요",
      WANT_DELEGATION: "직접 관리할 시간이 없어서 맡기고 싶어요",
    },
  },
  q2: {
    NO_RESULTS: {
      question: "가장 필요한 것은 무엇인가요?",
      options: {
        WHAT_IS_WRONG: "무엇이 문제인지부터 알고 싶어요",
        KNOW_FIX_NEED_HELP: "방향은 아는데 실행할 도움이 필요해요",
        NO_TIME: "전부 맡기고 싶어요",
      },
    },
    NEW_BEGINNER: {
      question: "블로그 설정과 글쓰기를 직접 배워 볼 수 있나요?",
      options: {
        LEARN_SELF: "네, 직접 배워 볼게요",
        NO_TIME: "여력이 없어서 맡기고 싶어요",
      },
    },
    EXECUTION_BLOCK: {
      question: "기본 설정과 글 발행은 해 보셨나요?",
      options: {
        HAS_EXPERIENCE: "네, 해 봤어요",
        NEED_BASICS: "처음부터 안내가 필요해요",
      },
    },
    NEED_FEEDBACK: {
      question: "어떤 피드백이 필요하신가요?",
      options: {
        SPECIFIC_DRAFT: "내가 쓴 글 한 편을 봐 주세요",
        WHOLE_BLOG: "블로그 전체의 문제와 우선순위가 궁금해요",
      },
    },
    WANT_DELEGATION: {
      question: "어떤 사업을 운영하시나요?",
      options: {
        LOCAL_BUSINESS: "매장·현장 업종 (소상공인)",
        PROFESSIONAL: "전문직 (세무사·변호사 등)",
        OTHER: "기타",
      },
    },
  },
  // 챌린지 후보에게만 묻는다. 어렵다면 왜 어려운지에 따라 추천이 갈린다 (2026-10-24 대표 결정).
  q3: {
    question: "4주 동안 매주 글을 쓰고 과제를 낼 수 있나요?",
    options: {
      YES: "네, 할 수 있어요",
      BUSY: "매주 글 쓸 시간이 없어요",
      STUCK: "혼자 글 쓰기가 아직 막막해요",
      LATER: "지금은 일정이 안 맞아요",
    },
  },
  resultLead: "지금 상황이라면",
  resultTail: "부터 살펴보세요.",
  summaryLabel: "고르신 내용",
  alternativeLabel: "이런 방법도 있어요",
  back: "이전 질문",
  restart: "처음부터 다시 고르기",
  readNotes: "칼럼 먼저 읽기",
  // 챌린지를 권하는 이유(challengeKnowFix·challengeExecution·later)는 모집 전 기준이다. 모집을 열면 함께 고친다.
  reasons: {
    diagnose: [
      "글을 더 쓰기 전에 어디가 막혀 있는지부터 보셔야 해요.",
      "진단 리포트에 막힌 곳과 무엇부터 고칠지 담아서 보내 드려요.",
    ],
    challengeKnowFix: [
      "방향을 알고 계시면 이제는 직접 써 보면서 피드백을 받는 게 가장 빨라요.",
      "4주 동안 글을 발행하고 글마다 피드백을 받는 과정이에요. 지금은 다음 기수를 준비하고 있어요.",
    ],
    challengeExecution: [
      "혼자서는 꾸준히 하기 어렵다면 일정과 피드백이 있는 과정이 도움이 돼요.",
      "4주 동안 글을 발행하고 글마다 피드백을 받는 과정이에요. 지금은 다음 기수를 준비하고 있어요.",
    ],
    busy: [
      "매주 글 쓸 시간이 없다면 운영을 맡기시는 쪽이 현실적이에요.",
      "직접 쓰신 글만 봐 드리는 글 피드백도 준비하고 있어요.",
    ],
    stuck: [
      "혼자 쓰기가 막막하다면 블로그 기본부터 차근차근 잡는 게 먼저예요.",
      "입문 강의는 지금 준비하고 있어요.",
    ],
    later: [
      "지금 일정이 안 맞으면 무리하지 않으셔도 돼요.",
      "다음 기수 소식을 받아 두셨다가 일정이 맞을 때 함께해요.",
    ],
    delegateNoResults: [
      "직접 고칠 시간이 없다면 운영을 맡기시는 쪽이 현실적이에요.",
      "맡기기 전에 막힌 곳만 먼저 확인하고 싶다면 블로그 진단도 있어요.",
    ],
    beginnerSelf: [
      "처음이라면 블로그 설정과 첫 글부터 차근차근 배우는 게 먼저예요.",
      "입문 강의는 지금 준비하고 있어요.",
    ],
    beginnerDelegate: [
      "처음부터 직접 하기 어렵다면 운영을 맡기는 방법도 있어요.",
      "대행 문의에 업종과 지금 상황을 적어 주세요.",
    ],
    basics: [
      "기본 설정부터 다시 잡고 시작하는 게 먼저예요.",
      "입문 강의는 지금 준비하고 있어요.",
    ],
    draftFeedback: [
      "글 한 편이 고민이면 블로그 전체보다 그 글부터 보는 게 맞아요.",
      "피드백 서비스는 지금 준비하고 있어요.",
    ],
    wholeBlog: [
      "블로그 전체에서 무엇부터 고칠지 궁금하시면 진단이 맞아요.",
      "진단 리포트에 막힌 곳과 무엇부터 고칠지 담아서 보내 드려요.",
    ],
    delegateLocal: [
      "매장·현장 업종이라면 블로그 관리 대행을 상담해 보세요.",
      "대행 문의에 업종과 지금 상황을 적어 주세요.",
    ],
    delegatePro: [
      "전문직은 맡기실 범위에 따라 진행 방식이 달라서 상담으로 먼저 확인해요.",
      "대행 문의에 지금 상황과 맡기고 싶은 범위를 적어 주세요.",
    ],
    delegateOther: [
      "업종에 따라 맡을 수 있는지 상담에서 먼저 확인해요.",
      "지금 상황을 적어 주시면 확인하고 이메일로 연락드릴게요.",
    ],
  },
} as const;

// 상단 메뉴가 가는 곳 (대표 결정, 2026-10-11. 고민 찾기와 챌린지 조건은 2026-10-24 초안)
//   · 고민 찾기 → 홈의 고민 찾기 구역 (초안)
//   · 블로그 진단 → 래피드 상세페이지 (새 탭)
//   · 매출로 이어지는 블로그 → 모집 중(offers.challenge.status 가 available)일 때만 메뉴에 둔다 (초안)
//   · 블로그 대행 → /agency (네이버 폼을 메뉴 아래에 끼워 보여 준다)
//   · 다니레터 → /letter (스티비 구독 페이지를 메뉴 아래에 끼워 보여 준다)
// 주소 앞의 "/" : 홈이 아닌 페이지(/notes)에서도 홈의 해당 구역으로 가게 한다.
// external 이 true 면 바깥 사이트라 새 탭으로 연다.
export const navItems: { label: string; href: string; external: boolean }[] = [
  { label: "고민 찾기", href: `/#${sectionIds.finder}`, external: false },
  { label: "블로그 진단", href: links.diagnosis, external: true },
  ...(isOpen(offers.challenge.status)
    ? [{ label: "매출로 이어지는 블로그", href: offers.challenge.href, external: !offers.challenge.href.startsWith("/") }]
    : []),
  { label: "블로그 대행", href: "/agency", external: false },
  // 게시판(/notes). 메뉴 이름 "칼럼"은 대표 결정 (2026-10-08).
  { label: "칼럼", href: "/notes", external: false },
  ...(links.newsletter ? [{ label: "다니레터", href: "/letter", external: false }] : []),
  { label: "상담 신청", href: `/#${sectionIds.consult}`, external: false },
];

// 첫 화면 문구. 대표가 준 문구 그대로다 (2026-10-11). 줄 나눔도 대표가 준 대로 둔다.
export const hero = {
  eyebrow: "다니는다니 · 마켓티브",
  titleLines: ["광고를 끄면 문의도 끊기는 사업,", "이제 콘텐츠가 일하게 하세요."],
  descriptionLines: [
    "다니는다니와 마켓티브는 매출이 막힌 이유를 블로그에서 찾고,",
    "고객이 먼저 발견하고 문의하는 콘텐츠 구조를 만듭니다.",
  ],
  subDescription: "먼저 블로그 진단으로, 지금 막혀 있는 지점부터 확인해 보세요.",
  cta: "블로그 진단 신청",
  // 버튼 아래 고민 찾기로 내려가는 링크 (2026-10-24 대표 선택).
  finderLink: "내 상황에 맞는 방법 찾기",
  // 한 줄로 이은 것. 검색 결과 설명(layout.tsx)과 이전 버전 컴포넌트가 쓴다.
  title: "광고를 끄면 문의도 끊기는 사업, 이제 콘텐츠가 일하게 하세요.",
  description:
    "다니는다니와 마켓티브는 매출이 막힌 이유를 블로그에서 찾고, 고객이 먼저 발견하고 문의하는 콘텐츠 구조를 만듭니다.",
} as const;

// 홈에서는 고민 찾기(finder)가 이 구역을 대신한다 (2026-10-24). 쓰지 않는 이전 버전 컴포넌트(src/components/site/)가 읽어서 남겨 둔다.
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
      // 「매월 10명까지」는 지금 조건이 아니라서 뺐다 (2026-10-24 대표 확인).
      note: "블로그 글을 대신 써 드리는 대행 상품은 아닙니다.",
      details: ["1회", "노션 또는 PDF 리포트", "사전 설문 후 영업일 3~5일"],
      price: "59,000원",
      priceNote: "",
      cta: "진단 신청하기",
      href: links.diagnosis,
    },
    {
      id: sectionIds.challenge,
      name: offers.challenge.name,
      // 배지·안내·버튼·주소는 모집 상태(offers.challenge)를 따른다. 2기 판매 마감(2026-10-18) 뒤로 「다음 기수 준비 중」.
      badge: offerStatusLabels[offers.challenge.status],
      description: offers.challenge.summary,
      includes: ["시작 전 개인 블로그 진단", "라이브 다시보기", "제출 글마다 1,000자 안팎 피드백", "주차별 워크시트·템플릿", "종료 후 30일 콘텐츠 계획"],
      note: offerStatusNotes[offers.challenge.status] ?? "",
      details: ["4주", "주 1회 라이브", "글 7편 발행"],
      // 2기 모집부터 가격은 홈에 적지 않는다 (대표 결정, 2026-10-16). 가격은 래피드 페이지에서 본다.
      price: "",
      priceNote: "",
      cta: offers.challenge.cta,
      href: offers.challenge.href,
    },
    {
      id: sectionIds.agency,
      name: "블로그 관리 대행 (마켓티브)",
      badge: "문의",
      // 업체 수 문장은 뺐다 (2026-10-24 대표 결정). 「소수 업체만 밀착」은 아래 안내 문구에 있다.
      description: "블로그 운영을 맡기고 싶은 분을 위한 관리 대행입니다.",
      includes: [],
      note: "퀄리티 유지를 위해 소수 업체만 밀착해서 관리합니다. 신규 대행은 바로 진행하기 어려운 경우가 있습니다.",
      details: [],
      price: "문의",
      priceNote: "",
      cta: "대행 문의하기",
      // 대행 문의는 네이버 폼으로 받는다 (대표, 2026-10-11 「우선은」). 상단 메뉴 「블로그 대행」과 같은 /agency 로 보낸다.
      href: "/agency",
    },
  ],
} as const;

// 홈에서는 고민 찾기(finder)가 이 구역을 대신한다 (2026-10-24). 진단 → 챌린지 → 대행을 한 줄 순서로 보이지 않게 뺐다.
// 쓰지 않는 이전 버전 컴포넌트(src/components/site/)가 읽어서 남겨 둔다.
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

// 게시판(/notes).
// 메뉴 이름 "칼럼"은 대표가 정했다 (2026-10-08). 나머지 문구는 대표가 맡겨서 "칼럼"에 맞췄다 (같은 날).
export const notes = {
  title: "칼럼",
  breadcrumbHome: "홈",
  breadcrumbList: "칼럼",
  empty: "아직 올라온 글이 없습니다.",
  backToList: "칼럼 목록으로",
} as const;

// 구조화 데이터(JSON-LD)에 넣는 글쓴이. 사람으로 적고 운영 채널을 잇는다.
export const author = {
  name: "다니",
  sameAs: [links.youtubeChannel, links.threads, links.blog],
} as const;

// 바깥 서비스의 페이지를 메뉴 아래에 끼워 보여 주는 화면(/letter, /agency)의 문구.
export const embeds = {
  fallbackHint: "화면이 보이지 않으면",
  openInNewTab: "새 창에서 열기",
  letter: { title: "다니레터", frameTitle: "다니레터 구독 신청 (스티비)" },
  agency: { title: "블로그 대행 문의", frameTitle: "블로그 대행 상담 신청서 (네이버 폼)" },
} as const;
