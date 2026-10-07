export function legacyCopy(text:string):boolean {
 const previous=document.activeElement as HTMLElement|null;
 const field=document.createElement('textarea');
 field.value=text;field.readOnly=true;
 field.style.cssText='position:fixed;top:0;left:0;opacity:0;font-size:16px';
 document.body.appendChild(field);
 try{field.focus();field.select();field.setSelectionRange(0,text.length);return document.execCommand('copy')}
 catch{return false}
 finally{field.remove();previous?.focus({preventScroll:true})}
}
export async function copyInvite(text:string,clipboard:Pick<Clipboard,'writeText'>|undefined,fallback:(text:string)=>boolean=legacyCopy):Promise<boolean>{
 try{if(clipboard){await clipboard.writeText(text);return true}}catch{}
 return fallback(text);
}
