import {sanitizeEvent, type EventRow} from './measurement.ts';

export async function receiveEvent(request: Request, enabled:boolean, save:(row:EventRow)=>Promise<boolean>, origin:string): Promise<Response> {
  const reply=(status:number)=>new Response(null,{status,headers:{'Cache-Control':'no-store'}});
  if(!enabled) return reply(404);
  if(request.headers.get('origin')!==origin) return reply(403);
  if(!request.headers.get('content-type')?.startsWith('application/json')) return reply(415);
  if(Number(request.headers.get('content-length'))>2048) return reply(413);
  const reader=request.body?.getReader();if(!reader) return reply(400);
  const decoder=new TextDecoder();let text='';let bytes=0;
  try {
    while(true) {
      const {done,value}=await reader.read();if(done) break;
      bytes+=value.byteLength;if(bytes>2048){await reader.cancel();return reply(413);}
      text+=decoder.decode(value,{stream:true});
    }
    text+=decoder.decode();
    const row=sanitizeEvent(JSON.parse(text));if(!row) return reply(400);
    try {return reply(await save(row)?204:503);} catch {return reply(503);}
  } catch {return reply(400);}
}
