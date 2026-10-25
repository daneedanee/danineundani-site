export function brandGraph(base: string, info: {name:string; business:string; email:string; description:string; blog:string}) {
  const root=new URL('/',base).toString();
  return {
    '@context':'https://schema.org',
    '@graph':[
      {'@type':'WebSite','@id':root+'#website',url:root,name:info.name,description:info.description,inLanguage:'ko-KR',publisher:{'@id':root+'#organization'}},
      {'@type':'Organization','@id':root+'#organization',name:info.business,url:root,email:info.email,sameAs:[info.blog]},
    ],
  };
}
