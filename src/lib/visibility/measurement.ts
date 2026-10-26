// 측정 이벤트 이름. supabase/08-visibility-events.sql 의 check 목록과 같아야 한다(테스트가 확인).
// diagnosis_click 은 래피드 결제 페이지로 가는 클릭, diagnosis_page_click 은 사이트 안 진단 상세(/diagnosis)로 가는 클릭이다.
export const eventNames = [
  'page_view','diagnosis_click','challenge_click','agency_click','contact_start','kakao_click','contact_success',
  'diagnosis_page_click','letter_click','workbook_click','finder_start','finder_result',
] as const;
export const campaigns = ['none','youtube_a','youtube_b','youtube_c'] as const;
// 경로 목록은 supabase/10-visibility-blog-paths.sql 의 check 와 같아야 한다(테스트가 확인).
export const measuredPaths = ['/','/blog','/blog/[slug]','/agency','/letter','/diagnosis','/about'] as const;
// 게시판을 /notes 에서 /blog 로 옮기기 전(2026-10-26)에 쌓인 기록의 경로. 표에는 남기고 새로 세지는 않는다.
export const retiredPaths = ['/notes','/notes/[slug]'] as const;
// 링크에 data-visibility-event 로 붙여 다른 이름으로 셀 수 있는 이벤트. 같은 /letter 라도 워크북 버튼만 따로 센다.
const linkOverrides = ['workbook_click'] as const;
// 링크가 아닌 화면 안 신호(window 의 danee-measure 이벤트)로 받는 것.
const signals = ['finder_start','finder_result','contact_success'] as const;
export type EventRow = {event: string; path: string; campaign: string};

export function publicPath(path: string): string | null {
  if ((measuredPaths as readonly string[]).includes(path)) return path;
  return /^\/blog\/[^/]+$/.test(path) ? '/blog/[slug]' : null;
}
export function campaignFrom(search: string): string {
  const p=new URLSearchParams(search);
  if(p.get('utm_source')!=='youtube'||p.get('utm_campaign')!=='innercircle_20261106') return 'none';
  const content=p.get('utm_content');
  return content==='video_a'?'youtube_a':content==='video_b'?'youtube_b':content==='video_c'?'youtube_c':'none';
}
// base 는 지금 페이지 주소다. 같은 페이지 안 구역으로 가는 링크는 이동으로 세지 않는다(홈의 /#consult 는 상담 시작으로 센다).
export function classifyLink(href: string, base: string): string | null {
  let u:URL; let here:URL;
  try {u=new URL(href,base); here=new URL(base);} catch {return null;}
  if(u.protocol!=='https:' && u.protocol!=='http:') return null;
  if(u.hostname==='www.latpeed.com') {
    if(u.pathname==='/products/bxdTq') return 'diagnosis_click';
    if(u.pathname==='/products/RjkkI') return 'challenge_click';
  }
  if(u.origin===here.origin) {
    if(u.pathname==='/' && u.hash==='#consult') return 'contact_start';
    if(u.pathname===here.pathname) return null;
    if(u.pathname==='/agency') return 'agency_click';
    if(u.pathname==='/diagnosis') return 'diagnosis_page_click';
    if(u.pathname==='/letter') return 'letter_click';
  }
  if(u.hostname==='pf.kakao.com' && u.pathname==='/_bYIBn') return 'kakao_click';
  return null;
}
export function pickLinkEvent(mark: string | null, href: string, base: string): string | null {
  if(mark && (linkOverrides as readonly string[]).includes(mark)) return mark;
  return classifyLink(href,base);
}
export function signalEvent(value: unknown): string | null {
  return typeof value==='string' && (signals as readonly string[]).includes(value) ? value : null;
}
export function sanitizeEvent(value: unknown): EventRow | null {
  if(!value||typeof value!=='object'||Array.isArray(value)) return null;
  const v=value as Record<string,unknown>;
  if(typeof v.event!=='string'||!(eventNames as readonly string[]).includes(v.event)) return null;
  if(typeof v.path!=='string'||!(measuredPaths as readonly string[]).includes(v.path)) return null;
  if(typeof v.campaign!=='string'||!(campaigns as readonly string[]).includes(v.campaign)) return null;
  return {event:v.event,path:v.path,campaign:v.campaign};
}

export function excludeMeasurement(search:string,alreadyExcluded:boolean):boolean { return alreadyExcluded || new URLSearchParams(search).get('visibility_test')==='1'; }

// 화면 안 신호를 보낸다. 측정이 꺼져 있으면 아무도 듣지 않으므로 아무 일도 일어나지 않는다.
export function sendSignal(event: (typeof signals)[number]) {
  if(typeof window!=='undefined') window.dispatchEvent(new CustomEvent('danee-measure',{detail:event}));
}
