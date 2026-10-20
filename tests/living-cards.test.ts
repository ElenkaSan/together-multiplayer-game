import test from 'node:test';
import assert from 'node:assert/strict';
import {adventureCardLayout,adventurePreviewPosition} from '../src/components/ui/adventure-card-layout';
for(const width of [248,284,320,339,354,390,600,700,768,820,900])test(`living cards fit ${width}px stage without covering active controls`,()=>{
 const l=adventureCardLayout(width);
 assert.ok(l.cardWidth<=width-24);assert.ok(l.cardHeight>=360);
 for(let i=1;i<=l.visibleNeighbors;i++)for(const sign of [-1,1]){
  const p=adventurePreviewPosition(width,i*sign),radians=Math.abs(p.rotateZ)*Math.PI/180;
  const halfX=(l.previewWidth*Math.cos(radians)+l.previewHeight*Math.sin(radians))/2;
  assert.ok(Math.abs(p.x)+halfX<width/2,`preview ${i} remains inside stage`);
  if(l.compact){const bottom=52+(l.previewHeight*Math.cos(radians)+l.previewWidth*Math.sin(radians))/2;assert.ok(bottom<116,'previews stay above the main card')}
  else assert.ok(Math.abs(p.x)-halfX>l.cardWidth/2,'previews stay outside the main card');
 }
 assert.equal(adventurePreviewPosition(width,0).opacity,0);
 assert.equal(adventurePreviewPosition(width,4).opacity,0);
});
