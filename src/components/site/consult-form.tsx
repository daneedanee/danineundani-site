"use client";

import { TriangleAlert } from "lucide-react";
import { useState } from "react";

import { consult, links, sectionIds } from "@/lib/site-content";

type Fields = { name: string; email: string; message: string };
type Errors = Partial<Record<keyof Fields, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(fields: Fields): Errors {
  const errors: Errors = {};
  if (!fields.name.trim()) errors.name = "이름을 입력해 주세요.";
  if (!fields.email.trim()) errors.email = "이메일을 입력해 주세요.";
  else if (!emailPattern.test(fields.email.trim())) errors.email = "이메일 형식을 확인해 주세요.";
  if (!fields.message.trim()) errors.message = "상담 내용을 입력해 주세요.";
  return errors;
}

const inputClass =
  "mt-2 w-full rounded-xl border-2 border-ink bg-white px-4 py-3 text-base text-ink outline-none placeholder:text-muted-ink/70 focus-visible:ring-3 focus-visible:ring-coral aria-invalid:border-coral-deep";

export function ConsultForm() {
  const [fields, setFields] = useState<Fields>({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

  function update(key: keyof Fields, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
    setSubmitted(false);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(fields);
    setErrors(nextErrors);
    // 저장 연결 전: 입력값을 어디에도 보내거나 저장하지 않는다.
    setSubmitted(Object.keys(nextErrors).length === 0);
  }

  return (
    <section id={sectionIds.consult} aria-labelledby="consult-heading" className="bg-paper px-5 pt-12 pb-16 md:pt-16 md:pb-24">
      <div className="mx-auto max-w-[640px]">
        <div className="text-center">
          <h2 id="consult-heading" className="text-[22px] leading-snug font-extrabold text-ink md:text-[28px]">
            {consult.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-ink md:text-[15px]">{consult.description}</p>
        </div>

        <div
          role="note"
          className="mt-8 flex items-start gap-2 rounded-xl border-2 border-dashed border-ink bg-ivory px-4 py-3 text-sm font-bold text-ink"
        >
          <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
          <p>저장 연결 전입니다. 지금은 신청 내용이 저장되거나 전송되지 않습니다.</p>
        </div>

        <form noValidate onSubmit={handleSubmit} className="mt-6 rounded-2xl border-2 border-ink bg-white p-6 md:p-8">
          <div className="space-y-5">
            <div>
              <label htmlFor="consult-name" className="text-sm font-bold text-ink">
                이름
              </label>
              <input
                id="consult-name"
                name="name"
                autoComplete="name"
                value={fields.name}
                onChange={(e) => update("name", e.target.value)}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "consult-name-error" : undefined}
                className={inputClass}
              />
              {errors.name && (
                <p id="consult-name-error" className="mt-1.5 text-sm font-medium text-coral-deep">
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="consult-email" className="text-sm font-bold text-ink">
                이메일
              </label>
              <input
                id="consult-email"
                name="email"
                type="email"
                autoComplete="email"
                value={fields.email}
                onChange={(e) => update("email", e.target.value)}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "consult-email-error" : undefined}
                className={inputClass}
              />
              {errors.email && (
                <p id="consult-email-error" className="mt-1.5 text-sm font-medium text-coral-deep">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="consult-message" className="text-sm font-bold text-ink">
                상담 내용
              </label>
              <textarea
                id="consult-message"
                name="message"
                rows={5}
                value={fields.message}
                onChange={(e) => update("message", e.target.value)}
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? "consult-message-error" : undefined}
                className={`${inputClass} resize-y`}
              />
              {errors.message && (
                <p id="consult-message-error" className="mt-1.5 text-sm font-medium text-coral-deep">
                  {errors.message}
                </p>
              )}
            </div>
          </div>

          <p className="mt-5 text-[13px] leading-relaxed text-muted-ink">{consult.consent}</p>

          <button
            type="submit"
            className="mt-5 inline-flex h-14 w-full items-center justify-center rounded-full border-2 border-ink bg-coral text-base font-bold text-ink transition-transform hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            {consult.submit}
          </button>

          <p role="status" aria-live="polite" className="mt-4 text-center text-sm font-bold text-ink">
            {submitted ? "입력 확인이 끝났습니다. 저장 연결 전이라 신청 내용은 저장되거나 전송되지 않았습니다." : ""}
          </p>
        </form>

        <p className="mt-6 text-center">
          <a
            href={links.kakaoChannel}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[15px] font-bold text-ink underline decoration-coral decoration-2 underline-offset-4"
          >
            {consult.kakao}
            <span className="sr-only">(새 탭에서 열림)</span>
          </a>
        </p>
      </div>
    </section>
  );
}
