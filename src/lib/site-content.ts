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
// 고민 찾기·해결 방법 문구는 2026-10-24 퍼널 인수인계서를 바탕으로 쓰고 같은 날 대표가 목록으로 확인했다.
// 말투: 해결 방법 카드와 안내는 서비스 카드와 같은 합니다체, 추천 이유(finder.reasons)만 다니 말투(해요체) (대표 결정).
export type OfferStatus = "available" | "waitlist" | "upcoming" | "consult" | "content";

export const offerStatusLabels: Record<OfferStatus, string> = {
  available: "지금 신청 가능",
  waitlist: "다음 기수 준비 중",
  upcoming: "준비 중",
  consult: "상담 후 진행",
  content: "무료",
};

// 모집 전·준비 중인 해결 방법 카드 아래에 붙는 안내.
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
  // 다음 기수 대기 명단이 따로 없어 다니레터로 보낸다 (대표 결정). 모집을 열면 status 를 available, href 를 links.challengeSales 로 바꾼다.
  challenge: {
    name: "매출로 이어지는 블로그",
    status: "waitlist",
    summary:
      "블로그는 쓰고 있는데 문의가 끊긴 사업자를 위한 4주 과정입니다. 세팅, 키워드, 구조화된 글, 문의 받는 공지글까지 직접 발행하며 익힙니다.",
    price: "",
    cta: "다음 기수 소식 받기",
    href: "/letter",
  },
  // 범위·가격·출시 시기 미정 (인수인계서 2장 [기획]). 구매 버튼을 달지 않는다.
  // 출시 전까지 고민 찾기는 이 자리에 블로그 진단을 보여 준다 (finder.ts 의 feedbackForNow).
  feedback: {
    name: "글 피드백",
    status: "upcoming",
    summary: "이미 쓰고 있는 글을 봐 드리는 피드백 서비스를 준비하고 있습니다.",
    price: "",
    cta: "출시 소식 받기",
    href: "/letter",
  },
  // 2027년 출시 검토 (인수인계서 2장 [기획]). 구매 버튼을 달지 않는다.
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
  notes: {
    name: "칼럼",
    status: "content",
    summary: "블로그로 문의를 만드는 방법을 칼럼으로 먼저 읽어 보세요.",
    price: "",
    cta: "칼럼 읽기",
    href: "/notes",
  },
  newsletter: {
    name: "다니레터",
    status: "content",
    summary: "다니의 블로그 마케팅 이야기를 메일로 받아 보세요.",
    price: "",
    cta: "다니레터 구독하기",
    href: "/letter",
  },
  // 다니레터 구독 대가로 주는 무료 워크북 (2026-10-25 대표가 이름·설명 확정). 노션 공개 페이지는 구독 환영 메일로 보낸다.
  // 홈에서는 다니레터 구독 화면(/letter)으로 보낸다. 주소를 비우면 고민 찾기 결과와 홈 띠에서 빠진다.
  freeTemplate: {
    name: "문의로 이어지는 글쓰기 워크북",
    status: "content",
    summary: "고객의 질문에서부터 출발해서 문의 안내까지, 빈칸을 채우면 글 한 편의 뼈대가 나오는 워크북입니다.",
    price: "",
    cta: "무료로 받기",
    href: "/letter",
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
        // 「자영업자」는 2026-10-25 대표 결정 (예전: 매장·현장 업종 (소상공인)).
        LOCAL_BUSINESS: "자영업자",
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
      "맡기기 전에 막힌 곳만 먼저 확인하고 싶다면 블로그 진단도 있어요.",
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
    // 글 피드백 출시 전까지 진단을 권하는 이유 (2026-10-24 대표 결정).
    draftFeedback: [
      "글 한 편만 봐 드리는 피드백은 지금 준비하고 있어요.",
      "그동안은 블로그 진단에서 쓰신 글까지 함께 보고 무엇부터 고칠지 정리해 드려요.",
    ],
    wholeBlog: [
      "블로그 전체에서 무엇부터 고칠지 궁금하시면 진단이 맞아요.",
      "진단 리포트에 막힌 곳과 무엇부터 고칠지 담아서 보내 드려요.",
    ],
    delegateLocal: [
      "자영업자라면 블로그 관리 대행을 상담해 보세요.",
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

// 상단 메뉴가 가는 곳 (대표 결정, 2026-10-11. 고민 찾기와 챌린지 조건은 2026-10-24 대표 결정)
//   · 고민 찾기 → 홈의 고민 찾기 구역
//   · 블로그 진단 → 래피드 상세페이지 (새 탭)
//   · 매출로 이어지는 블로그 → 모집 중(offers.challenge.status 가 available)일 때만 메뉴에 둔다
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

// 첫 화면 문구. 제목·설명은 대표가 준 문구 그대로다 (2026-10-11). 줄 나눔도 대표가 준 대로 둔다.
export const hero = {
  eyebrow: "다니는다니 · 마켓티브",
  titleLines: ["광고를 끄면 문의도 끊기는 사업,", "이제 콘텐츠가 일하게 하세요."],
  descriptionLines: [
    "다니는다니와 마켓티브는 매출이 막힌 이유를 블로그에서 찾고,",
    "고객이 먼저 발견하고 문의하는 콘텐츠 구조를 만듭니다.",
  ],
  // 2026-10-25 대표 결정: 첫 화면의 주 버튼은 고민 찾기, 블로그 진단은 바로 가는 보조 링크로 내린다.
  // (예전: 보조 문구 "먼저 블로그 진단으로, 지금 막혀 있는 지점부터 확인해 보세요." · 버튼 "블로그 진단 신청" → 래피드)
  subDescription: "지금 어디서 막혀 있는지부터 찾아보세요.",
  // 주 버튼: 아래 고민 찾기로 내려간다.
  cta: "내 상황에 맞는 방법 찾기",
  // 보조 링크: 래피드 진단 페이지(새 탭). 진단 상세페이지(/diagnosis)를 만들면 그쪽으로 바꾼다.
  diagnosisLink: "바로 블로그 진단 신청하기",
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

// 상담 신청 위의 무료 워크북 띠 (2026-10-25 대표 확정). 버튼 주소는 offers.freeTemplate.href 를 따른다.
export const workbookBand = {
  title: "문의로 이어지는 글쓰기 워크북",
  description: "빈칸을 채우면 이번 주에 쓸 글 한 편의 뼈대가 나와요. 다니레터로 무료로 보내 드려요.",
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

// 블로그 진단 상세페이지(/diagnosis). 2026-10-25 초안, 대표 확인 전.
// 바탕: 노션 「다니의 블로그 진단 + 방향제안 리포트」(2026-08-17, 2026-09-14 대표 확인)와 2026-10-24 대표 인터뷰.
// 인터뷰로 바뀐 것: 첫 문장은 노출 하락과 문의 끊김을 함께(구매자 사전 설문 약 3분의 2), 초보자는 "글이 있는 분께 권함",
// 과정은 "분석 도구로 재고 다니가 판단", "질문 1회 답변"·"매월 10명"·성과 수치·대행 고객 캡처는 넣지 않음.
// 후기는 래피드 공개 구매 후기와 고객이 메일로 보낸 후기(2026-10-25 대표 요청으로 가려서 사용)에서 원문 그대로 일부만 옮긴다.
// 메일 후기는 이름·상호·지역을 빼고 업종을 넓게 바꿨다. 안쪽 큰따옴표만 작은따옴표로 바꿨다.
export const diagnosisPage = {
  metaTitle: "블로그 진단 + 방향 제안 리포트",
  metaDescription:
    "노출이 떨어지고 문의가 끊긴 블로그, 어디서 막혔는지와 무엇부터 고칠지 리포트로 정리해 드립니다. 59,000원, 노션 또는 PDF로 전달.",
  hero: {
    eyebrow: "블로그 진단 + 방향 제안 리포트",
    titleLines: ["노출이 떨어지고 문의가 끊겼다면,", "글을 더 쓰기 전에 막힌 곳부터 확인하세요."],
    description: "내 블로그가 고객에게 어떻게 보이는지, 어디서 문의가 끊기는지, 무엇부터 고칠지 리포트로 정리해 드립니다.",
    cta: "진단 신청하기",
    secondary: "리포트에 담기는 내용 보기",
  },
  checklist: {
    title: "혹시 지금, 이런 상태인가요?",
    items: [
      "잘 보이던 글이 어느 순간 검색에서 안 보인다",
      "글은 쌓이는데 문의가 거의 없다",
      "조회수는 가끔 나오는데 상담으로 이어지지 않는다",
      "어떤 키워드로 써야 할지 모르겠다",
      "대행을 맡기기엔 부담스럽고, 혼자 하자니 막막하다",
      "지금 방향이 맞는지 누군가 객관적으로 봐 줬으면 좋겠다",
    ],
    closing: "이런 상황이라면 글을 몇 개 더 쓰기 전에, 내 블로그가 고객이 문의하고 싶어지는 구조인지부터 확인해야 합니다.",
  },
  includes: {
    title: "리포트에는 이런 내용이 담깁니다",
    items: [
      { title: "블로그 첫인상", text: "처음 들어온 고객이 어떤 일을 하는 곳인지 바로 이해하고, 문의할 만한 곳으로 느끼는지 봅니다. 프로필, 블로그 이름, 소개, 카테고리, 문의 동선까지 함께 봅니다." },
      { title: "콘텐츠 방향", text: "지금까지 쓴 글이 고객의 고민과 이어지는지, 검색에 잡힐 수 있는 구조인지, 읽고 나서 문의하고 싶어지는 흐름인지 봅니다." },
      { title: "키워드 방향", text: "지금 잡고 있는 키워드가 고객이 실제로 검색하는 말과 맞는지 확인하고, 앞으로 어떤 키워드로 글을 쌓을지 제안드립니다." },
      { title: "플레이스와 외부 채널", text: "고객은 블로그만 보고 판단하지 않습니다. 플레이스, 인스타그램, 홈페이지가 블로그와 같은 방향으로 믿음을 주는지 함께 봅니다." },
      { title: "경쟁사와 시장 흐름", text: "같은 업종에서 잘하고 있는 곳과 비교해, 고객이 무엇을 보고 고르는지와 내 블로그에서 더 보여 줘야 할 점을 찾습니다." },
      { title: "바로 적용할 개선 방향", text: "\"여기가 문제예요\"로 끝내지 않고, 무엇부터 고칠지, 어떤 글부터 쓸지, 블로그 구조를 어떻게 정리할지 순서대로 정리해 드립니다." },
    ],
  },
  // 샘플: 2026-09-18에 보낸 청소 업종 리포트(노션 공개본)의 목차와 가린 캡처. 목차의 지역명은 일반화했다.
  // 캡처 파일은 public/images/diagnosis/ 에 둔다. images 가 비어 있으면 목차만 보인다.
  sample: {
    title: "리포트 실제 예시",
    description: "2026년 9월에 보낸 청소 업종 리포트의 일부입니다. 상호·지역·연락처와 검색 화면은 가렸습니다. 리포트는 업종과 블로그마다 새로 씁니다.",
    zoomHint: "누르면 크게 볼 수 있습니다",
    tocTitle: "이 리포트의 목차",
    toc: [
      "플레이스는 등록돼 있는데, 주력 지역에서는 보이지 않습니다",
      "업체 이름이 생각보다 겹칩니다",
      "업체명으로 검색하면 68위인데, 그 위에 좋은 소식이 있습니다",
      "지금 글은 아파트 이름을 아는 사람에게만 열려 있습니다",
      "글을 쓰기 전에 '쇼핑이 먼저 나오는지'를 보세요",
      "첫 세 문장에서 답을 먼저 주세요",
      "사진 110장의 역할을 바꿔 주세요",
      "글 마지막에 무엇을 보내면 되는지 알려 주세요",
      "공지글 두 편은 시간이 많이 지났습니다",
      "카테고리 220편이 한 칸에 들어 있습니다",
      "복사해서 쓰는 대표 글 구조",
      "먼저 발행하면 좋은 글",
      "한 달 발행 구성",
      "4주 실행 순서",
      "다음 글을 발행하기 전 체크리스트",
      "마무리",
    ],
    images: [
      { src: "/images/diagnosis/sample-1-opening.png", width: 1552, height: 1406, caption: "첫머리: 가장 궁금해하신 것에 먼저 답하고, 가장 먼저 할 일 세 가지를 정리합니다." },
      { src: "/images/diagnosis/sample-2-search.png", width: 1552, height: 2056, caption: "검색어마다 네이버 화면이 어떻게 다른지 직접 검색해 확인한 부분 (검색 화면은 가렸습니다)" },
      { src: "/images/diagnosis/sample-3-plan.png", width: 1552, height: 2186, caption: "4주 동안 할 일을 주차별 체크리스트로 정리한 부분" },
    ] as { src: string; width: number; height: number; caption: string }[],
  },
  process: {
    title: "이렇게 진행됩니다",
    steps: [
      { title: "신청과 결제", text: "래피드에서 결제합니다." },
      { title: "사전 설문", text: "블로그 주소, 업종, 지금 고민, 원하는 고객, 주력 상품, 외부 채널을 적어 주세요." },
      { title: "진단", text: "분석 도구로 실제 노출과 블로그 구조를 재고, 다니가 직접 판단해서 막힌 곳과 고칠 순서를 정합니다." },
      { title: "리포트 전달", text: "사전 설문을 받은 뒤 영업일 기준 3~5일 안에 노션 또는 PDF로 보내 드립니다." },
    ],
  },
  reviews: {
    title: "진단을 받은 분들의 이야기",
    note: "래피드 구매 후기, 메일과 카카오톡으로 보내 주신 후기를 원문 그대로 옮기고, 이름·상호·프로필은 가렸습니다. 개인의 경험이며, 결과는 블로그마다 다를 수 있습니다.",
    // 카카오톡 채널(마켓티브) 1:1 채팅 캡처. 고객 이름·프로필·시간·보낸 사진은 가렸고 날짜는 달까지만 둔다 (2026-10-25 대표 요청).
    captures: [
      { src: "/images/diagnosis/reviews/kakao-2026-09-reindex.png", width: 1200, height: 542, caption: "2026년 9월 · 차량 정비 매장 · 리포트대로 블로그 기본 세팅을 다시 한 뒤", quote: "다니님 말씀대로 단순하게 블로그기본셋팅부터 다시하니까 모든글들이 다시 리랭크??되고있는듯하네요 통검에도 나오고있고" },
      { src: "/images/diagnosis/reviews/kakao-2025-07-calls.png", width: 1200, height: 530, caption: "2025년 7월 · 현장 시공업 · 채팅으로 진단을 받은 분", quote: "문의 전화가 보통 월요일에 4,5건 있고 그 외 요일은 없는 편이었는데 작지만 매일 3건 정도는 꾸준히 문의 전화가 옵니다" },
      { src: "/images/diagnosis/reviews/kakao-2026-09-education.png", width: 1200, height: 940, caption: "2026년 9월 · 교육업 · 리포트를 받고", quote: "내용 너무 감사합니다. 아팠지만 너무 도움 됩니다. 그대로 적용해볼게요" },
      { src: "/images/diagnosis/reviews/kakao-2026-08-field.png", width: 1200, height: 768, caption: "2026년 8월 · 현장 시공업 · 리포트를 받고", quote: "지금 일하는중이라 잠깐봤는데도 너무 와닿는 내용인거같아요 퇴근하고 정독해서 적용해봐야겠아요!!" },
    ],
    items: [
      { text: "들어보면서 느낀것은 불안이 확신으로 바뀌었습니다. … '검색어는 검색어대로 잡고, 고객 언어는 제목과 도입부에 녹인다'는 부분은 제가 머릿속으로는 알고 있었는데, 이렇게 문장으로 정리해서 보니 훨씬 명확해졌습니다.", source: "메일로 보내 주신 후기 · 2026년 7월 · IT 서비스업" },
      { text: "꼼꼼하고 정성스러운 리포트 잘 받아보았습니다. … 혼자가 모든 걸 다 하다보니 버겁고 막막했는데 이렇게 가이드 해주셔서 뭔가 마음에 의지가 됩니다.", source: "메일로 보내 주신 후기 · 2026년 6월 · 상담 서비스업" },
      { text: "예고드린대로 공지사항 글 다 작성했고, … 이번주에 문의 하나 잡혀서 다음주에 미팅하기로 했거든요.", source: "메일로 보내 주신 후기 · 2026년 7월 · IT 서비스업" },
      { text: "블로그의 전체적인 방향성부터 글의 구성, 콘텐츠 전략, 노출을 위한 개선점, 앞으로 어떤 부분을 보완하면 좋을지까지 정말 세밀하게 분석해 주셨습니다.", source: "래피드 구매 후기 · 2026년 7월" },
      { text: "부족한 부분만 지적하는 것이 아니라, 왜 그런 문제가 생겼는지 그리고 앞으로 어떤 방향으로 개선하면 좋을지 구체적인 해결 방법까지 함께 제시해 주셨다는 점입니다.", source: "래피드 구매 후기 · 2026년 7월" },
      { text: "블로그 퍼널 설계 / 콘텐츠 기획 / 공지사항 글 작성 까지 많은 부분을 알고는 있는데 어떻게 하는지 잘 몰랐는데, 이런 점을 잘 짚어주셔서 감사합니다. 전혀 돈이 아깝지 않았습니다.", source: "래피드 구매 후기 · 2026년 7월" },
      { text: "상세한 분석과 맞춤 가이드전달, 업종의 이해도가 높고 실천하기 쉬운 리포트내용", source: "래피드 구매 후기 · 2026년 7월" },
      { text: "그동안 블로그를 나를 중심으로 작성했다는것 알았습니다 작성해준 방법대로 한번 해보겠습니다", source: "래피드 구매 후기 · 2026년 6월" },
    ],
  },
  terms: {
    title: "가격과 진행 조건",
    rows: [
      { label: "가격", value: "59,000원" },
      { label: "받는 것", value: "맞춤형 블로그 진단 리포트" },
      { label: "전달 방식", value: "노션 또는 PDF (신청서에서 고르기)" },
      { label: "기간", value: "결제와 사전 설문 뒤 영업일 기준 3~5일" },
      { label: "환불", value: "진단을 시작하기 전에는 환불할 수 있고, 시작한 뒤에는 어렵습니다" },
    ],
    note: "블로그 글을 대신 써 드리는 대행 상품은 아닙니다.",
  },
  fit: {
    title: "이런 분께 권합니다",
    good: "운영 중인 블로그가 있고, 어디서 막혔는지와 무엇부터 고칠지 알고 싶은 분",
    notYet: "아직 블로그를 시작하지 않았거나 글이 거의 없다면, 먼저 무료 워크북으로 글 한 편부터 써 보시길 권합니다.",
    notYetCta: "글쓰기 워크북 무료로 받기",
  },
  faq: {
    title: "자주 묻는 질문",
    items: [
      { q: "블로그를 막 시작했는데 신청해도 되나요?", a: "신청은 할 수 있습니다. 다만 글이 거의 없으면 볼 수 있는 것이 적어서, 운영 중인 블로그가 있는 분께 권합니다. 막 시작하셨다면 무료 워크북으로 글 한 편부터 써 보세요." },
      { q: "이미 글이 많은 블로그도 진단할 수 있나요?", a: "네. 글이 많으면 전체 방향, 카테고리 구조, 대표 콘텐츠, 검색 키워드, 문의로 이어지는 흐름을 중심으로 봅니다. 글이 많아도 문의가 없다면 문제는 글의 양이 아니라 구조일 수 있습니다." },
      { q: "어떤 업종이 신청하면 좋나요?", a: "블로그로 문의, 상담, 예약, 방문을 받고 싶은 업종에 맞습니다. 집수리·인테리어·청소 같은 현장 업종, 학원, 센터, 매장, 전문직, 1인 사업자가 많이 신청하십니다." },
      { q: "진단을 받으면 매출이나 문의가 보장되나요?", a: "매출과 문의를 보장해 드리지는 않습니다. 블로그 성과는 업종, 지역, 경쟁 상황, 기존 콘텐츠, 실행 여부에 따라 달라집니다. 다만 지금 어디서 막혀 있는지, 무엇부터 바꿔야 하는지는 훨씬 선명하게 확인하실 수 있습니다." },
      { q: "블로그 대행도 포함인가요?", a: "아니요. 글을 대신 쓰거나 올려 드리는 상품이 아니라, 지금 블로그 상태를 진단하고 앞으로의 방향과 실행 순서를 정리해 드리는 상품입니다." },
      { q: "전화나 줌 상담도 포함되어 있나요?", a: "기본 구성은 진단 리포트 전달입니다. 전화나 줌 상담은 포함되어 있지 않습니다." },
      { q: "준비해야 할 자료가 있나요?", a: "블로그 주소, 업종, 지금 고민, 원하는 고객, 주력 상품, 참고하고 싶은 경쟁사, 플레이스와 SNS 주소를 사전 설문에 적어 주시면 됩니다. 자세히 적어 주실수록 더 구체적으로 진단할 수 있습니다." },
      { q: "환불할 수 있나요?", a: "진단을 시작하기 전에는 취소와 환불이 가능합니다. 사전 설문을 확인하고 진단을 시작한 뒤에는 서비스 특성상 환불이 어렵습니다." },
    ],
  },
  closing: {
    title: "글을 더 쓰기 전에, 방향부터 확인하세요",
    cta: "진단 신청하기",
    kakao: "카카오톡으로 먼저 물어보기",
  },
} as const;
