"use client";

import { useState } from "react";

import { consult, links, sectionIds } from "@/lib/site-content";
import { inquiriesTable, supabase } from "@/lib/supabase";

import { SectionTitle } from "./shared";

type Fields = { name: string; email: string; message: string };
type Errors = Partial<Record<keyof Fields, string>>;
type Status = "idle" | "sending" | "done" | "failed";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 글자 수 제한은 supabase/01-inquiries.sql 의 표 규칙과 같게 둔다.
function validate(fields: Fields): Errors {
  const errors: Errors = {};
  const name = fields.name.trim();
  const email = fields.email.trim();
  const message = fields.message.trim();

  if (!name) errors.name = "이름을 입력해 주세요.";
  else if (name.length > 50) errors.name = "이름은 50자까지 넣을 수 있습니다.";

  if (!email) errors.email = "이메일을 입력해 주세요.";
  else if (!emailPattern.test(email)) errors.email = "이메일 형식을 확인해 주세요.";
  else if (email.length > 254) errors.email = "이메일이 너무 깁니다.";

  // 최소 글자 수 제한은 두지 않는다 (2026-09-20 대표 결정). 비어 있는 것만 막는다.
  if (!message) errors.message = "상담 내용을 입력해 주세요.";
  else if (message.length > 1000) errors.message = "상담 내용은 1000자까지 넣을 수 있습니다.";

  return errors;
}

const inputClass =
  "mt-2 w-full rounded-[6px] border border-[#d1d5db] bg-white px-4 py-3 text-[15px] text-[#191919] outline-none focus-visible:border-[#fd715b] focus-visible:ring-2 focus-visible:ring-[#fd715b]/40 aria-invalid:border-[#c9412f]";

const fieldDefs: { key: keyof Fields; label: string; type?: string; autoComplete?: string; multiline?: boolean }[] = [
  { key: "name", label: "이름", autoComplete: "name" },
  { key: "email", label: "이메일", type: "email", autoComplete: "email" },
  { key: "message", label: "상담 내용", multiline: true },
];

export function ConsultSection() {
  const [fields, setFields] = useState<Fields>({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [reason, setReason] = useState("");

  function update(key: keyof Fields, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
    setStatus("idle");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(fields);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setStatus("idle");
      return;
    }

    setStatus("sending");
    // Supabase 표(cab_inquiries)에 한 줄 추가한다. 방문자는 추가만 할 수 있어 다시 읽어 오지 않는다.
    const { error } = await supabase.from(inquiriesTable).insert({
      name: fields.name.trim(),
      email: fields.email.trim(),
      message: fields.message.trim(),
    });

    if (error) {
      // 무엇 때문에 실패했는지 화면에도 짧게 남긴다. 원인을 묻고 답하느라 시간을 버리지 않기 위해서다.
      console.error("상담 신청 저장 실패", error);
      setReason(error.message || "알 수 없는 오류");
      setStatus("failed");
      return;
    }

    setFields({ name: "", email: "", message: "" });
    setStatus("done");
  }

  return (
    <section id={sectionIds.consult} className="bg-[#f9fafb] px-5 pt-14 pb-[88px] min-[992px]:pt-[88px] min-[992px]:pb-[132px]">
      <div className="mx-auto max-w-[640px]">
        <SectionTitle title={consult.title} subtitle={consult.description} />

        <form noValidate onSubmit={handleSubmit} className="rounded-[10px] bg-white p-5 shadow-[0_1px_14px_1px_rgba(0,0,0,0.11)] min-[992px]:p-8">
          <div className="space-y-5">
            {fieldDefs.map((field) => {
              const id = `consult-${field.key}`;
              const error = errors[field.key];
              const common = {
                id,
                name: field.key,
                value: fields[field.key],
                "aria-invalid": Boolean(error),
                "aria-describedby": error ? `${id}-error` : undefined,
              };
              return (
                <div key={field.key}>
                  <label htmlFor={id} className="text-[14px] font-semibold text-[#191919]">
                    {field.label}
                  </label>
                  {field.multiline ? (
                    <textarea {...common} rows={5} onChange={(e) => update(field.key, e.target.value)} className={`${inputClass} resize-y`} />
                  ) : (
                    <input
                      {...common}
                      type={field.type ?? "text"}
                      autoComplete={field.autoComplete}
                      onChange={(e) => update(field.key, e.target.value)}
                      className={inputClass}
                    />
                  )}
                  {error && (
                    <p id={`${id}-error`} className="mt-1.5 text-[13px] font-medium text-[#c9412f]">
                      {error}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <p className="mt-5 text-[12px] leading-[19px] text-[#5f6368]">{consult.consent}</p>

          <button
            type="submit"
            disabled={status === "sending"}
            className="mt-4 h-[50px] w-full rounded-[4px] bg-[#fd715b] text-[16px] font-bold text-black transition-transform duration-200 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
          >
            {status === "sending" ? "보내는 중…" : consult.submit}
          </button>

          <p
            role="status"
            aria-live="polite"
            className={`mt-3 text-center text-[14px] font-semibold ${status === "failed" ? "text-[#c9412f]" : "text-[#191919]"}`}
          >
            {status === "done" && "상담 신청이 접수되었습니다. 확인 후 이메일로 연락드리겠습니다."}
            {status === "failed" && "신청을 보내지 못했습니다. 잠시 후 다시 시도하시거나 카카오톡으로 문의해 주세요."}
          </p>

          {status === "failed" && reason && (
            <p className="mt-1 text-center text-[12px] break-all text-[#5f6368]">사유: {reason}</p>
          )}
        </form>

        <p className="mt-6 text-center">
          <a
            href={links.kakaoChannel}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[15px] font-semibold text-[#191919] underline decoration-[#fd715b] decoration-2 underline-offset-4"
          >
            {consult.kakao}
            <span className="sr-only">(새 탭에서 열림)</span>
          </a>
        </p>
      </div>
    </section>
  );
}
