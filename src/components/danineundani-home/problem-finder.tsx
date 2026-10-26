"use client";

import { ArrowLeft, ChevronRight, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { nextQuestion, recommend, totalSteps, type Answers, type Q1, type Q2, type Q3, type QuestionId } from "@/lib/finder";
import { finder, offerStatusLabels, offerStatusNotes, offers, sectionIds, type OfferId } from "@/lib/site-content";
import { cn } from "@/lib/utils";
import { sendSignal } from "@/lib/visibility/measurement";

import { Container, ExternalButton, SectionTitle, Sentences } from "./shared";

type Choice = { code: string; label: string };

// 지금 질문의 문장과 선택지. 두 번째 질문은 첫 답에 따라 달라진다.
function questionFor(step: QuestionId, answers: Answers): { text: string; choices: Choice[] } {
  const set = step === "q1" ? finder.q1 : step === "q3" ? finder.q3 : finder.q2[answers.q1 as Q1];
  return { text: set.question, choices: Object.entries(set.options).map(([code, label]) => ({ code, label })) };
}

// 결과 화면 위의 「고르신 내용」.
function chosenLabels(answers: Answers): string[] {
  if (!answers.q1) return [];
  const q2Options: Record<string, string> = finder.q2[answers.q1].options;
  const q3Options: Record<string, string> = finder.q3.options;
  return [finder.q1.options[answers.q1], answers.q2 && q2Options[answers.q2], answers.q3 && q3Options[answers.q3]].filter(
    (label): label is string => Boolean(label),
  );
}

function OfferCard({ id, main }: { id: OfferId; main?: boolean }) {
  const offer = offers[id];
  const note = offerStatusNotes[offer.status];
  return (
    <div className={cn("flex flex-col items-start gap-2 rounded-[10px] p-4 min-[992px]:p-5", main ? "bg-[#2b2421] text-white" : "border border-[#eaded4] bg-white text-[#333]")}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[16px] leading-6 font-semibold break-keep">{offer.name}</span>
        <span className="rounded-[4px] bg-[#ffe5e1] px-2 py-1 text-[11px] leading-[15px] font-semibold text-[#c9412f]">{offerStatusLabels[offer.status]}</span>
      </div>
      <p className={cn("text-[14px] leading-[21px] break-keep", main ? "text-white/85" : "text-[#5f6368]")}><Sentences text={offer.summary} /></p>
      {offer.price && <p className="text-[18px] leading-[26px] font-extrabold">{offer.price}</p>}
      {note && <p className={cn("text-[12px] leading-[18px] break-keep", main ? "text-white/60" : "text-[#5f6368]")}>{note}</p>}
      <ExternalButton
        href={offer.href}
        tone={main ? "coral" : "dark"}
        measure={id === "freeTemplate" ? "workbook_click" : undefined}
        className={cn("mt-1 rounded-[5px] text-[14px]", main ? "px-5 py-3" : "px-4 py-2.5")}
      >
        {offer.cta}
      </ExternalButton>
    </div>
  );
}

const textButton =
  "inline-flex items-center gap-1 text-[13px] leading-5 text-[#5c514b] underline-offset-4 hover:text-[#c9412f] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fd715b]";

// 홈 구역: 고민 찾기. 질문 2개(챌린지 후보는 3개)에 답하면 해결 방법 하나와 대안 하나를 보여 준다.
// 이메일을 받지 않고, 고른 답은 주소에 남기지 않는다(새로 고치면 처음부터).
export function ProblemFinder() {
  const [answers, setAnswers] = useState<Answers>({});
  const headingRef = useRef<HTMLHeadingElement>(null);
  // 처음 화면을 열 때는 포커스를 옮기지 않는다. 고른 뒤에만 새 질문·결과 제목으로 옮긴다.
  const moved = useRef(false);

  const step = nextQuestion(answers);
  const result = step === null ? recommend(answers) : null;

  useEffect(() => {
    if (moved.current) headingRef.current?.focus();
  }, [step, result?.key]);

  // 측정: 결과를 본 횟수. 고른 답은 보내지 않는다.
  const resultKey = result?.key;
  useEffect(() => {
    if (moved.current && resultKey) sendSignal("finder_result");
  }, [resultKey]);

  function choose(questionId: QuestionId, code: string) {
    moved.current = true;
    // 측정: 첫 질문에 답한 횟수를 고민 찾기 시작으로 센다.
    if (questionId === "q1") sendSignal("finder_start");
    setAnswers((prev) =>
      questionId === "q1" ? { q1: code as Q1 } : questionId === "q2" ? { q1: prev.q1, q2: code as Q2 } : { ...prev, q3: code as Q3 },
    );
  }

  function back() {
    moved.current = true;
    setAnswers((prev) => (prev.q3 ? { q1: prev.q1, q2: prev.q2 } : prev.q2 ? { q1: prev.q1 } : {}));
  }

  function restart() {
    moved.current = true;
    setAnswers({});
  }

  const headingClass =
    "text-[18px] leading-[27px] font-bold tracking-[-0.3px] text-[#191919] break-keep outline-none min-[992px]:text-[20px] min-[992px]:leading-[30px]";

  let body: React.ReactNode;
  if (step) {
    const { text, choices } = questionFor(step, answers);
    const number = step === "q1" ? 1 : step === "q2" ? 2 : 3;
    const total = totalSteps(answers);
    body = (
      <div role="group" aria-labelledby="finder-question" className="flex flex-col gap-4">
        <p aria-hidden className="text-[12px] leading-4 font-bold tracking-[0.05em] text-[#c9412f]">
          {finder.progress} {number} / {total}
        </p>
        <h3 id="finder-question" ref={headingRef} tabIndex={-1} className={headingClass}>
          <span className="sr-only">
            {finder.progress} {number} / {total}.{" "}
          </span>
          {text}
        </h3>
        <ul className="flex flex-col gap-2.5">
          {choices.map((choice) => (
            <li key={choice.code}>
              <button
                type="button"
                onClick={() => choose(step, choice.code)}
                className="flex min-h-12 w-full items-center justify-between gap-3 rounded-[8px] border-[1.5px] border-[#eaded4] bg-white px-4 py-3 text-left text-[15px] leading-[22px] text-[#2b2421] break-keep transition-colors hover:border-[#fd715b] hover:bg-[#fff8f3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fd715b]"
              >
                {choice.label}
                <ChevronRight aria-hidden className="size-4 shrink-0 text-[#c9412f]" />
              </button>
            </li>
          ))}
        </ul>
        {step !== "q1" && (
          <button type="button" onClick={back} className={cn(textButton, "self-start")}>
            <ArrowLeft aria-hidden className="size-3.5" />
            {finder.back}
          </button>
        )}
      </div>
    );
  } else if (result) {
    const primary = offers[result.primary];
    body = (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <p className="text-[12px] leading-4 font-bold tracking-[0.05em] text-[#c9412f]">{finder.summaryLabel}</p>
          <ul className="flex flex-wrap gap-1.5">
            {chosenLabels(answers).map((label) => (
              <li key={label} className="rounded-full bg-[#f4ebe3] px-3 py-1 text-[12px] leading-[18px] text-[#5c514b] break-keep">
                {label}
              </li>
            ))}
          </ul>
        </div>
        <h3 ref={headingRef} tabIndex={-1} className={headingClass}>
          {/* "블로그 관리 대행 (마켓티브)부터"처럼 괄호 뒤에 조사가 붙지 않게 제목에서만 괄호 부분을 뺀다. */}
          {finder.resultLead} <span className="text-[#c9412f]">{primary.name.replace(/\s*\(.*\)$/, "")}</span>
          {finder.resultTail}
        </h3>
        <div className="flex flex-col gap-1 text-[14px] leading-[22px] text-[#333] break-keep">
          {finder.reasons[result.key].map((line) => (
            <p key={line}><Sentences text={line} /></p>
          ))}
        </div>
        <OfferCard id={result.primary} main />
        {result.alternative && (
          <div className="flex flex-col gap-2">
            <p className="text-[13px] leading-5 font-semibold text-[#5c514b]">{finder.alternativeLabel}</p>
            <OfferCard id={result.alternative} />
          </div>
        )}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
          <button type="button" onClick={back} className={textButton}>
            <ArrowLeft aria-hidden className="size-3.5" />
            {finder.back}
          </button>
          <button type="button" onClick={restart} className={textButton}>
            <RotateCcw aria-hidden className="size-3.5" />
            {finder.restart}
          </button>
          {result.primary !== "notes" && result.alternative !== "notes" && (
            <Link href={offers.notes.href} className={textButton}>
              {finder.readNotes}
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <section id={sectionIds.finder} className="bg-[#fff4ea] px-5 pt-14 pb-[88px] min-[992px]:px-0 min-[992px]:pt-[88px] min-[992px]:pb-[132px]">
      <Container className="flex flex-col gap-2">
        <SectionTitle title={finder.title} subtitle={finder.description} />
        <div className="mx-auto w-full max-w-[600px] rounded-[12px] bg-[#fffdf9] p-5 shadow-[0_8px_20px_rgba(112,69,48,0.12)] min-[992px]:p-8">
          {body}
        </div>
      </Container>
    </section>
  );
}
