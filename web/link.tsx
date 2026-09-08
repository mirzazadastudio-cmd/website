import type {AnchorHTMLAttributes} from 'react';
export default function Link({href,children,...props}:AnchorHTMLAttributes<HTMLAnchorElement>&{href:string}){return <a href={href} {...props}>{children}</a>}
