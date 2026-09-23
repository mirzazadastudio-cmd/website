'use client';
import {useSiteContent} from './content-provider';
import {animationVideos} from '@/lib/animation-playlist';
import {AnimationPlayer} from './animation-player';
export function AnimationBanner(){return <AnimationPlayer videos={animationVideos(useSiteContent())}/>;}
