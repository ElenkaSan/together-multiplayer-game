import test from 'node:test';
import assert from 'node:assert/strict';
import {adventureCardTouch} from '../src/components/ui/adventure-card-touch';
import {adventureCursorPosition} from '../src/components/ui/adventure-card-layout';
const point=(x:number,y:number,id=1,primary=true)=>({x,y,id,primary});
test('phone touch drives both tilt axes and resets on release',()=>{
 const start=adventureCardTouch(null,'down',point(180,300));
 assert.ok(start.track);
 const moved=adventureCardTouch(start.contact,'move',point(230,320));
 assert.ok(moved.track);
 const tilt=adventureCursorPosition({left:40,top:100,width:280,height:400},230,320);
 assert.ok(Math.abs(tilt.x-5/14)<1e-10);assert.ok(Math.abs(tilt.y-.1)<1e-10);
 const end=adventureCardTouch(moved.contact,'up',point(230,320));
 assert.equal(end.contact,null);assert.ok(end.reset);assert.ok(!end.track);
});
test('horizontal swipe keeps the touch stream available to the carousel',()=>{
 const start=adventureCardTouch(null,'down',point(240,300));
 const move=adventureCardTouch(start.contact,'move',point(120,305));
 assert.ok(move.track);assert.ok(!move.reset);
 assert.ok(adventureCardTouch(move.contact,'up',point(120,305)).reset);
});
test('vertical pan yields to page scrolling and cannot restart tilt mid-scroll',()=>{
 const start=adventureCardTouch(null,'down',point(180,300));
 const scroll=adventureCardTouch(start.contact,'move',point(185,350));
 assert.equal(scroll.contact,null);assert.ok(scroll.reset);assert.ok(!scroll.track);
 assert.ok(!adventureCardTouch(scroll.contact,'move',point(240,360)).track);
});
test('Safari pointer cancellation clears contact and a later touch can start again',()=>{
 const start=adventureCardTouch(null,'down',point(180,300));
 const cancel=adventureCardTouch(start.contact,'cancel',point(180,300));
 assert.ok(cancel.reset);assert.equal(cancel.contact,null);
 assert.ok(adventureCardTouch(cancel.contact,'down',point(200,300,2)).track);
});
test('secondary fingers cannot replace or release the active contact',()=>{
 const start=adventureCardTouch(null,'down',point(180,300));
 const second=adventureCardTouch(start.contact,'down',point(200,300,2,false));
 assert.equal(second.contact,start.contact);assert.ok(!second.track);
 const end=adventureCardTouch(second.contact,'up',point(200,300,2,false));
 assert.equal(end.contact,start.contact);assert.ok(!end.reset);
 assert.ok(!adventureCardTouch(null,'down',point(200,300,2,false)).track);
});

test('Explore finger tap never starts tilt or moves the native click target',()=>{
 const start=adventureCardTouch(null,'down',{...point(220,450),action:true});
 assert.equal(start.contact,null);assert.equal(start.track,false);assert.equal(start.reset,false);
 const move=adventureCardTouch(start.contact,'move',point(223,451));
 assert.equal(move.track,false);
 const end=adventureCardTouch(move.contact,'up',point(223,451));
 assert.equal(end.track,false);assert.equal(end.reset,false);
 assert.equal(adventureCardTouch(end.contact,'down',point(120,230)).track,true);
});
