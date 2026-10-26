"use client";

import { useEffect } from "react";

import { letterPage } from "@/lib/site-content";

const form = letterPage.form;

// 스티비 구독 폼 (구독 화면 → 코드로 설치하기 의 공식 코드). 아이디·이름·클래스는 스티비 스크립트가 찾는 그대로 둔다.
// 스타일은 스티비 CSS 대신 globals.css 의 #stb_subscribe 묶음으로 입힌다. 스크립트는 읽히는 순간 폼을 찾아 붙으므로, 화면에 그린 뒤 매번 새로 넣는다.
export function StibeeForm() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://resource.stibee.com/subscribe/stb_subscribe_form.js";
    script.async = true;
    document.body.appendChild(script);
    return () => script.remove();
  }, []);

  return (
    <div id="stb_subscribe">
      <form action={form.action} method="POST" target="_blank" acceptCharset="utf-8" className="stb_form" name="stb_subscribe_form" id="stb_subscribe_form" data-lang="" noValidate>
        <fieldset className="stb_form_set">
          <label htmlFor="stb_email" className="stb_form_set_label">
            {form.emailLabel}
            <span className="stb_asterisk">*</span>
          </label>
          <input type="text" className="stb_form_set_input" id="stb_email" name="email" required autoComplete="email" inputMode="email" />
          <div className="stb_form_msg_error" id="stb_email_error" />
        </fieldset>
        <div className="stb_form_policy">
          <label>
            <input type="checkbox" id="stb_policy" value="stb_policy_true" />
            <span>(필수)</span>
            <button id="stb_form_modal_open" data-modal="stb_form_policy_modal" className="stb_form_modal_open_btn" type="button">
              {form.policy.label}
            </button>
            {form.agree}
          </label>
          <div className="stb_form_msg_error" id="stb_policy_error" />
          <div className="stb_form_modal stb_form_policy_text blind" id="stb_form_policy_modal">
            <div className="stb_form_modal_body">
              <h1 className="stb_form_modal_title">{form.policy.modalTitle}</h1>
              <div className="stb_form_modal_text">{form.policy.modalText}</div>
              <div className="stb_form_modal_btn">
                <button id="stb_form_modal_close" className="stb_form_modal_close_btn" data-modal="stb_form_policy_modal" type="button">
                  {form.close}
                </button>
              </div>
            </div>
            <div className="stb_form_modal_bg" id="stb_form_modal_bg" />
          </div>
        </div>
        <div className="stb_form_policy">
          <label>
            <input type="checkbox" id="stb_ad_agreement" value="stb_ad_agreement_true" />
            <span>(선택)</span>
            <button id="stb_form_ad_modal_open" data-modal="stb_form_ad_agreemnet_modal" className="stb_form_modal_open_btn" type="button">
              {form.ad.label}
            </button>
            {form.agree}
          </label>
          <div className="stb_form_msg_error" id="stb_ad_agreement_error" />
          <div className="stb_form_modal stb_form_policy_text blind" id="stb_form_ad_agreemnet_modal">
            <div className="stb_form_modal_body">
              <h1 className="stb_form_modal_title">{form.ad.modalTitle}</h1>
              <div className="stb_form_modal_text">{form.ad.modalText}</div>
              <div className="stb_form_modal_btn">
                <button id="stb_form_ad_modal_close" className="stb_form_modal_close_btn" data-modal="stb_form_ad_agreemnet_modal" type="button">
                  {form.close}
                </button>
              </div>
            </div>
            <div className="stb_form_ad_modal_bg" id="stb_form_ad_modal_bg" />
          </div>
        </div>
        <div className="stb_form_result" id="stb_form_result" />
        <fieldset className="stb_form_set_submit">
          <button type="submit" className="stb_form_submit_button" id="stb_form_submit_button">
            {form.submit}
          </button>
        </fieldset>
      </form>
    </div>
  );
}
