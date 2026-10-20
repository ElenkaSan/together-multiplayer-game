import test from 'node:test';
import assert from 'node:assert/strict';
import {adventureCardLayout,adventurePreviewPosition} from '../src/components/ui/adventure-card-layout';
for(const width of [248,284,320,339,354,390,600,700,768,820,900,1000])test(`living arc fits ${width}px with large adjacent previews`,()=>{
 const l=adventureCardLayout(width);
 assert.ok(l.cardWidth<=width-24);assert.ok(l.cardHeight>=360);
 assert.ok(l.previewWidth>=l.cardWidth*.8);
 for(let i=1;i<=l.visibleNeighbors;i++)for(const sign of [-1,1]){
  const p=adventurePreviewPosition(width,i*sign);
  const projection=1400/(1400-p.z);
  const halfX=l.previewWidth*Math.cos(Math.abs(p.rotateY)*Math.PI/180)*p.scale*projection/2;
  assert.ok(Math.abs(p.x)+halfX<width/2,`preview ${i} remains inside stage`);
  assert.ok(Math.abs(p.x)+halfX>l.cardWidth/2,'adjacent artwork remains visible');
  assert.ok(p.z<0);
  assert.ok(l.previewHeight*p.scale/2+p.y<l.stageHeight/2,'previews stay clear of navigation');
 }
 assert.equal(adventurePreviewPosition(width,0).opacity,0);
 assert.equal(adventurePreviewPosition(width,4).opacity,0);
});
