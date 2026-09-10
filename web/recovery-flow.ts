import type {SupabaseClient} from '@supabase/supabase-js';
type Auth=SupabaseClient['auth'];
export function recoveryError(error:unknown){
 const e=error as {code?:string;status?:number;message?:string};
 if(e.code==='over_email_send_rate_limit'||e.message?.includes('email rate limit'))return 'E-poçt limiti dolub. Yeni kod istəməzdən əvvəl təxminən 1 saat gözləyin.';
 if(e.status===429)return 'Çox sorğu göndərilib. Bir qədər gözləyib yenidən cəhd edin.';
 if(e.code==='otp_expired'||e.code==='access_denied')return 'Kod səhvdir, istifadə edilib və ya vaxtı bitib. Son gələn kodu yoxlayın.';
 if(e.code==='same_password')return 'Əvvəlkindən fərqli yeni parol seçin.';
 return e.message||'Əməliyyat tamamlanmadı. Yenidən cəhd edin.';
}
export class RecoveryFlow {
 private userId:string|null=null;
 constructor(private auth:Pick<Auth,'resetPasswordForEmail'|'verifyOtp'|'getUser'|'updateUser'|'signOut'>){}
 async send(email:string,redirectTo:string){
  const {error}=await this.auth.resetPasswordForEmail(email.trim().toLowerCase(),{redirectTo});if(error)throw error;
 }
 async verify(email:string,token:string){
  this.userId=null;
  if(!/^\d{6,10}$/.test(token.trim()))throw Error('Məktubdakı rəqəmli kodu tam yazın.');
  const {data,error}=await this.auth.verifyOtp({email:email.trim().toLowerCase(),token:token.trim(),type:'recovery'});
  if(error)throw error;
  if(!data.session||!data.user||data.user.email?.toLowerCase()!==email.trim().toLowerCase())throw Error('Kod təsdiqlənmədi.');
  this.userId=data.user.id;
 }
 async acceptLink(){
  const {data,error}=await this.auth.getUser();if(error||!data.user)throw Error('Bərpa keçidinin vaxtı bitib. Yeni kod istəyin.');
  this.userId=data.user.id;
 }
 async save(password:string,confirmation:string){
  if(!this.userId)throw Error('Əvvəl e-poçt kodunu təsdiqləyin.');
  if(password.length<12||password.length>128)throw Error('Parol 12–128 simvol olmalıdır.');
  if(password!==confirmation)throw Error('Parollar eyni deyil.');
  const {data,error:sessionError}=await this.auth.getUser();
  if(sessionError||data.user?.id!==this.userId){this.userId=null;throw Error('Bərpa sessiyası bitib. Yeni kod istəyin.');}
  const {error}=await this.auth.updateUser({password});if(error)throw error;
  this.userId=null;
  const {error:logoutError}=await this.auth.signOut({scope:'global'});
  return {signedOut:!logoutError};
 }
}
