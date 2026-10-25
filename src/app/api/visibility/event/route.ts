// 방문·클릭 측정 한 줄을 받는 주소. NEXT_PUBLIC_VISIBILITY_MEASUREMENT=true 일 때만 연다(꺼져 있으면 404).
// 저장은 방문자용 공개 키로 데이터베이스 함수 cab_record_visibility_event 하나만 부른다
// (supabase/09-visibility-record-function.sql). 데이터베이스 전체 권한을 가진 서버 키는 쓰지 않는다 (2026-10-26).
import { createClient } from '@supabase/supabase-js';
import { receiveEvent } from '@/lib/visibility/handler';
import { storeEvent } from '@/lib/visibility/store';
import { siteUrl } from '@/lib/seo';

export async function POST(request:Request) {
  return receiveEvent(request,process.env.NEXT_PUBLIC_VISIBILITY_MEASUREMENT==='true',async row=>{
    const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if(!url||!key) return false;
    const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
    return storeEvent(row,(fn,args)=>client.rpc(fn,args));
  },new URL(siteUrl).origin);
}
