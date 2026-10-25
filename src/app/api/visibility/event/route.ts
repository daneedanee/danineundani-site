import { createClient } from '@supabase/supabase-js';
import { receiveEvent } from '@/lib/visibility/handler';
import { siteUrl } from '@/lib/seo';

export async function POST(request:Request) {
  return receiveEvent(request,process.env.NEXT_PUBLIC_VISIBILITY_MEASUREMENT==='true',async row=>{
    const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
    if(!url||!key) return false;
    const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
    const {error}=await client.from('cab_visibility_events').insert(row);
    return !error;
  },new URL(siteUrl).origin);
}
