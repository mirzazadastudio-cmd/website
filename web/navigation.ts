let pathname='/';
export function setPathname(value:string){pathname=value;}
export function usePathname(){return typeof window==='undefined'?pathname:window.location.pathname;}
export function notFound():never {throw new Error('NOT_FOUND');}
export function permanentRedirect(url:string):never {throw new Error('REDIRECT:'+url);}
