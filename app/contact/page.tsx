import {t} from '@/lib/i18n';
import {Header,Footer} from '@/components/studio-chrome';
import {InquiryForm} from '@/components/inquiry-form';
import {Contact} from '@/components/contact';
import {pageMetadata} from '@/lib/seo';
export const metadata=pageMetadata('Contact','Discuss an architectural visualization, interior, product or outdoor-system project with Mirzazada Studio in Baku, serving international clients.','/contact');
export default function ContactPage(){return <><Header/><main id="main"><section className="section inquiry-section"><div><p className="eyebrow">{t("START A CONVERSATION")}</p><h1>{t("A new project.")}<br/><span>{t("A shared perspective.")}</span></h1><p>{t("Share the context, the spaces and the images you need. We’ll use your brief to discuss the right scope for the project.")}</p><a href="mailto:hello@mirzazadastudio.com" className="text-link">{t("hello@mirzazadastudio.com ↗")}</a></div><InquiryForm/></section><Contact/></main><Footer/></>;}
