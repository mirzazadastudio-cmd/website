import {Check} from 'lucide-react';
import {languages,setLanguage,t,useLanguage} from '@/lib/i18n';
import {DropdownMenu,DropdownMenuTrigger,DropdownMenuContent,DropdownMenuItem} from './ui/dropdown-menu';
export function LanguageSwitcher(){
 const locale=useLanguage();
 return <DropdownMenu><DropdownMenuTrigger className="language-trigger" aria-label={t('Choose language')}><span>{locale.toUpperCase()}</span></DropdownMenuTrigger><DropdownMenuContent className="language-menu" align="end" sideOffset={10} aria-label={t('Choose language')}>{languages.map(language=><DropdownMenuItem key={language.code} className="language-option" onClick={()=>setLanguage(language.code)} lang={language.code} aria-label={language.name}><span className="language-code">{language.code.toUpperCase()}</span><span>{language.name}</span>{locale===language.code&&<Check size={16} aria-label={t('Selected language')}/>}</DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu>;
}