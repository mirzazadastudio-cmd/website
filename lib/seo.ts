export const canonicalOrigin='https://mirzazadastudio.com';
export const canonical=(path='/')=>new URL(path,canonicalOrigin).href;
export function pageMetadata(title:string,description:string,path:string){return {title,description,alternates:{canonical:canonical(path)},openGraph:{title,description,url:canonical(path),siteName:'Mirzazada Studio',type:'website' as const},twitter:{card:'summary' as const,title,description}};}
