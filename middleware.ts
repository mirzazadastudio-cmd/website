import {NextResponse,type NextRequest} from 'next/server';
export function middleware(request:NextRequest){
 if(request.nextUrl.hostname==='www.mirzazadastudio.com'){
  const url=request.nextUrl.clone();url.hostname='mirzazadastudio.com';url.protocol='https:';url.port='';
  return NextResponse.redirect(url,308);
 }
 return NextResponse.next();
}
