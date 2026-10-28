'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { campaignFrom, isCampaign, pickLinkEvent, publicPath, excludeMeasurement, signalEvent } from '@/lib/visibility/measurement';

// 쿠키·고객 입력·전체 URL·방문자 식별자를 저장하지 않는다. 세션에 허용된 캠페인 이름만 둔다.
let excludedTab=false;

export function SiteMeasurement() {
  const pathname=usePathname();
  useEffect(()=>{
    if(process.env.NEXT_PUBLIC_VISIBILITY_MEASUREMENT!=='true') return;
    const path=publicPath(pathname);
    const privacyNavigator=navigator as Navigator & {globalPrivacyControl?:boolean};
    if(!path || navigator.doNotTrack==='1'||privacyNavigator.globalPrivacyControl) return;
    // 운영 점검은 실측에 섞지 않는다. 새 탭에서 이 값을 넣고 점검한다.
    try { excludedTab ||= sessionStorage.getItem('visibility-excluded')==='1'; } catch {}
    excludedTab=excludeMeasurement(location.search,excludedTab);
    if(excludedTab) {
      try {sessionStorage.setItem('visibility-excluded','1');} catch {}
      return;
    }
    let campaign=campaignFrom(location.search);
    try {
      if(campaign!=='none') sessionStorage.setItem('visibility-campaign',campaign);
      else {const stored=sessionStorage.getItem('visibility-campaign');if(stored && isCampaign(stored)) campaign=stored;}
    } catch { /* 저장이 차단되어도 페이지와 링크는 정상 동작한다. */ }
    const send=(event:string)=>{
      void fetch('/api/visibility/event',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({event,path,campaign}),keepalive:true}).catch(()=>{});
    };
    // 개발 모드 effect 재실행을 피한다. 운영에서는 실제 경로 이동마다 한 번 실행한다.
    const timer=window.setTimeout(()=>send('page_view'),0);
    const onClick=(e:MouseEvent)=>{
      if(!e.isTrusted) return;
      const a=e.target instanceof Element ? e.target.closest('a[href]') : null;
      if(!(a instanceof HTMLAnchorElement)) return;
      // 워크북 버튼처럼 data-visibility-event 표시가 있으면 그 이름으로 센다(허용된 이름만).
      const event=pickLinkEvent(a.getAttribute('data-visibility-event'),a.href,location.href); if(event) send(event);
    };
    // 고민 찾기 시작·결과, 상담 저장 성공은 화면이 보내는 신호(sendSignal)로 받는다.
    const onSignal=(e:Event)=>{const event=signalEvent((e as CustomEvent).detail); if(event) send(event);};
    document.addEventListener('click',onClick);
    window.addEventListener('danee-measure',onSignal);
    return ()=>{window.clearTimeout(timer);document.removeEventListener('click',onClick);window.removeEventListener('danee-measure',onSignal);};
  },[pathname]);
  return null;
}
