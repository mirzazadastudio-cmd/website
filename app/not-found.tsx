import {t} from '@/lib/i18n';
import Link from 'next/link';
export default function NotFound(){return <main id="main" className="section"><p className="eyebrow">{t("404 / MIRZAZADA STUDIO")}</p><h1 style={{margin:'40px 0'}}>{t("A different perspective.")}</h1><p>{t("This page could not be found.")}</p><Link className="text-link" href="/">{t("Return to the studio ↗")}</Link></main>}
