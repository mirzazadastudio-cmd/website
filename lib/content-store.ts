import type {ContentRecord} from './content-types';
import {publicContent} from './editorial-validation';
let current:ContentRecord;
export function setContent(record:ContentRecord){current=record;}
export function getContent(){return current;}
export function getPublicContent(){return {...current,data:publicContent(current.data)};}
