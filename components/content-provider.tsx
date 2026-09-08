'use client';
import {createContext,useContext,type ReactNode} from 'react';
import type {SiteContent} from '@/lib/content-types';
const Context=createContext<SiteContent|null>(null);
const MediaActionsContext=createContext(false);
export function ContentProvider({data,children,allowMediaActions=false}:{data:SiteContent;children:ReactNode;allowMediaActions?:boolean}){
 return <Context.Provider value={data}><MediaActionsContext.Provider value={allowMediaActions}>{children}</MediaActionsContext.Provider></Context.Provider>;
}
export function useSiteContent(){const value=useContext(Context);if(!value)throw Error('Content provider missing');return value;}
export function useMediaActions(){return useContext(MediaActionsContext);}
