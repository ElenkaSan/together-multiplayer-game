export type ShareGame='tiny'|'signal'|null;
const origin='https://together-multiplayer-game.onrender.com';
export function shareMetadata(game:ShareGame=null){
 const title=game==='signal'?'TOGETHER! — Signal Lost':game==='tiny'?'TOGETHER! — Tiny Heroes':'TOGETHER! — Adventures with friends';
 const description=game==='signal'?'You have part of the truth. Your crew has the rest. A cooperative space mission for 2–6 players.':game==='tiny'?'Ten adventures. One team. Little clues, kind hearts — play together from your own devices.':'Different devices. Same adventure. Choose Tiny Heroes or Signal Lost and play together with friends. No account needed.';
 return{title,description,image:`${origin}/art/share/${game||'together'}-v2.png`,url:origin+(game?`/?game=${game}`:'/'),alt:game==='signal'?'TOGETHER! Signal Lost — a cooperative space mission':game==='tiny'?'TOGETHER! Tiny Heroes — original animal adventurers':'TOGETHER! — Tiny Heroes and Signal Lost, two cooperative worlds'};
}
export function withShareMetadata(html:string,game:ShareGame){
 const meta=shareMetadata(game);
 html=html.replace(/<title>[^<]*<\/title>/,`<title>${meta.title}</title>`);
 for(const [key,value] of Object.entries({'description':meta.description,'og:title':meta.title,'og:description':meta.description,'og:image':meta.image,'og:image:secure_url':meta.image,'og:image:alt':meta.alt,'og:url':meta.url,'twitter:title':meta.title,'twitter:description':meta.description,'twitter:image':meta.image,'twitter:image:alt':meta.alt})){
  const attr=key.startsWith('og:')?'property':'name';
  html=html.replace(new RegExp(`<meta ${attr}="${key}" content="[^"]*"\\s*/?>`),`<meta ${attr}="${key}" content="${value}"/>`);
 }
 return html;
}
