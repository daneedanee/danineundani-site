// 고민 찾기의 추천 규칙. 퍼널 인수인계서(2026-10-24) 4-3·4-4 결정표를 옮겼다.
// 문구는 site-content.ts 의 finder·offers 에 있다. 이 파일은 고른 답에서 다음 질문과 추천만 정한다.
import { finder, offers as siteOffers, type OfferId } from "./site-content.ts";

type Q2Sets = typeof finder.q2;
export type Q1 = keyof typeof finder.q1.options;
export type Q2 = { [K in Q1]: keyof Q2Sets[K]["options"] }[Q1];
export type Q3 = keyof typeof finder.q3.options;
export type Answers = { q1?: Q1; q2?: Q2; q3?: Q3 };
export type QuestionId = "q1" | "q2" | "q3";
export type ResultKey = keyof typeof finder.reasons;
export type Recommendation = { key: ResultKey; primary: OfferId; alternative: OfferId | null };

type Rule = { key: ResultKey; primary: OfferId; alternative: OfferId };

// 글 피드백은 아직 없는 상품이라, 그 자리에는 지금 파는 블로그 진단을 보여 준다 (2026-10-24 대표 결정).
// 글 피드백을 출시하면 "feedback" 으로 되돌리고, 이유 문구(site-content.ts 의 busy·draftFeedback)도 함께 고친다.
const feedbackForNow: OfferId = "diagnosis";

// 첫 질문에 딸린 두 번째 질문의 선택지인지 본다. 첫 답을 바꾸면 두 번째 답은 다시 받아야 한다.
function validQ2(answers: Answers): boolean {
  return Boolean(answers.q1 && answers.q2 && answers.q2 in finder.q2[answers.q1].options);
}

// 4주 과제를 물어야 하는 챌린지 후보. 문서가 Q3 를 챌린지 후보에게만 묻게 했다.
export function needsQ3(answers: Answers): boolean {
  if (!validQ2(answers)) return false;
  return (
    (answers.q1 === "NO_RESULTS" && answers.q2 === "KNOW_FIX_NEED_HELP") ||
    (answers.q1 === "EXECUTION_BLOCK" && answers.q2 === "HAS_EXPERIENCE")
  );
}

export function totalSteps(answers: Answers): 2 | 3 {
  return needsQ3(answers) ? 3 : 2;
}

// 다음에 보여 줄 질문. null 이면 결과를 보여 준다.
export function nextQuestion(answers: Answers): QuestionId | null {
  if (!answers.q1) return "q1";
  if (!validQ2(answers)) return "q2";
  if (needsQ3(answers) && !answers.q3) return "q3";
  return null;
}

// 챌린지 후보가 4주 과제를 지금 못 하는 이유별 추천 (2026-10-24 대표 인터뷰).
// 시간이 없으면 맡기기, 막막하면 기초부터, 일정만 안 맞으면 다음 기수를 기다리게 한다.
function notNow(q3: Q3 | undefined): Rule | null {
  if (q3 === "BUSY") return { key: "busy", primary: "agency", alternative: feedbackForNow };
  if (q3 === "STUCK") return { key: "stuck", primary: "vod", alternative: "newsletter" };
  if (q3 === "LATER") return { key: "later", primary: "challenge", alternative: feedbackForNow };
  return null;
}

function rule(answers: Answers): Rule | null {
  const { q1, q2, q3 } = answers;
  switch (q1) {
    case "NO_RESULTS":
      if (q2 === "WHAT_IS_WRONG") return { key: "diagnose", primary: "diagnosis", alternative: "freeTemplate" };
      if (q2 === "NO_TIME") return { key: "delegateNoResults", primary: "agency", alternative: "diagnosis" };
      return q3 === "YES" ? { key: "challengeKnowFix", primary: "challenge", alternative: feedbackForNow } : notNow(q3);
    case "NEW_BEGINNER":
      return q2 === "LEARN_SELF"
        ? { key: "beginnerSelf", primary: "vod", alternative: "freeTemplate" }
        : { key: "beginnerDelegate", primary: "agency", alternative: "freeTemplate" };
    case "EXECUTION_BLOCK":
      if (q2 === "NEED_BASICS") return { key: "basics", primary: "vod", alternative: "newsletter" };
      return q3 === "YES" ? { key: "challengeExecution", primary: "challenge", alternative: feedbackForNow } : notNow(q3);
    case "NEED_FEEDBACK":
      // 인수인계서는 글 한 편 교정을 원하는 사람을 진단으로 돌리지 말라고 했지만, 글 피드백이 나오기 전까지는
      // 그 사정을 이유 문구에 밝히고 진단을 보여 준다 (대표 결정). 대안은 글마다 피드백이 있는 챌린지.
      return q2 === "SPECIFIC_DRAFT"
        ? { key: "draftFeedback", primary: feedbackForNow, alternative: "challenge" }
        : { key: "wholeBlog", primary: "diagnosis", alternative: "freeTemplate" };
    case "WANT_DELEGATION":
      if (q2 === "LOCAL_BUSINESS") return { key: "delegateLocal", primary: "agency", alternative: "diagnosis" };
      if (q2 === "PROFESSIONAL") return { key: "delegatePro", primary: "agency", alternative: "notes" };
      return { key: "delegateOther", primary: "consult", alternative: "notes" };
    default:
      return null;
  }
}

// 다 답했을 때만 추천을 낸다. 주소가 없는 해결 방법(아직 없는 자료)은 대안에서 뺀다.
export function recommend(answers: Answers, offers: Record<OfferId, { href: string }> = siteOffers): Recommendation | null {
  if (nextQuestion(answers) !== null) return null;
  const found = rule(answers);
  if (!found) return null;
  return { key: found.key, primary: found.primary, alternative: offers[found.alternative].href ? found.alternative : null };
}
