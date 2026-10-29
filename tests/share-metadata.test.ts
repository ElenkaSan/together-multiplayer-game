import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {shareMetadata,withShareMetadata} from '../server/share-metadata';
const html=readFileSync('dist/index.html','utf8');
for(const game of [null,'tiny','signal'] as const)test(`server HTML exposes ${game||'home'} share title and image without running JavaScript`,()=>{
 const meta=shareMetadata(game),result=withShareMetadata(html,game);assert.ok(result.includes(`<title>${meta.title}</title>`));assert.ok(result.includes(`property="og:title" content="${meta.title}"`));assert.ok(result.includes(`property="og:image" content="${meta.image}"`));assert.ok(result.includes(`name="twitter:image" content="${meta.image}"`));assert.match(result,/og:image:width" content="1200/);assert.match(result,/og:image:height" content="630/);assert.match(result,/type="module"/);
});
test('favicon and Apple icon use the two-world palette and versioned URLs',()=>{
 const source=readFileSync('index.html','utf8'),icon=readFileSync('public/favicon-together-v2.svg','utf8');assert.match(source,/favicon-together-v2.svg/);assert.match(source,/apple-touch-icon-v2.png/);assert.doesNotMatch(source+icon,/#493ee8|#5145e5/);for(const color of ['#faf3df','#0c171d','#285e49','#adf66b'])assert.ok(icon.includes(color));
 for(const [path,width,height] of [['public/favicon-32-v2.png',32,32],['public/apple-touch-icon-v2.png',180,180],...['together','tiny','signal'].map(x=>[`public/art/share/${x}-v2.png`,1200,630])]){const data=readFileSync(path as string);assert.equal(data.readUInt32BE(16),width);assert.equal(data.readUInt32BE(20),height);}
});
