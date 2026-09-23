export function readSaved(key,fallback,storage){try{return JSON.parse((storage??globalThis.localStorage).getItem(key))??fallback;}catch{return fallback;}}
export function writeSaved(key,value,storage){try{(storage??globalThis.localStorage).setItem(key,JSON.stringify(value));return true;}catch{return false;}}
export function qualityProfile(choice,coarse=false){const mode=['low','balanced','high'].includes(choice)?choice:coarse?'low':'balanced';return {mode,ratio:{low:.75,balanced:1,high:1.5}[mode]};}
export function restoreDiscoveries(saved,count){return Array.isArray(saved)?[...new Set(saved.filter(i=>Number.isInteger(i)&&i>=0&&i<count))]:[];}
