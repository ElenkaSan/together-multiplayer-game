import test from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {HeroInstructions} from '../src/TinyHeroExperience';
import {AdventurePicker} from '../src/TinyWorld';

test('child guide exposes four keyboard-operable tiles and keeps detailed rules collapsed',()=>{
 const html=renderToStaticMarkup(createElement(HeroInstructions));
 assert.equal((html.match(/class="guide-tile"/g)||[]).length,4);
 assert.equal((html.match(/aria-pressed="false"/g)||[]).length,4);
 for(const label of ['See your clue','Pick a tool','Ready','Rescue together!'])assert.ok(html.includes(label));
 assert.match(html,/<details class="hero-full-rules">/);
 assert.ok(!html.includes('<details open'));
});
test('world cards retain independent accents, independent access and completion progress',()=>{
 const html=renderToStaticMarkup(createElement(AdventurePicker,{selected:'forest-rescue',onSelect:()=>{},completed:['forest-rescue']}));
 assert.ok(html.includes('data-world="forest"'));
 assert.ok(html.includes('data-world="ice"'));
 assert.ok(html.includes('data-world="jungle"'));
 assert.ok(html.includes('5/5 friends home'));
 assert.ok(html.includes('Explore →'));
 assert.ok(html.includes('Easy+'));
 assert.ok(html.includes('data-world="cloud"'));assert.ok(html.includes('data-world="meadow"'));assert.ok(!html.includes('coming soon')); 
 const locked=renderToStaticMarkup(createElement(AdventurePicker,{selected:'forest-rescue',onSelect:()=>{}}));
 assert.doesNotMatch(locked,/<button disabled="" data-world="ice"/);
});


test('each world exposes a native Explore button separate from the tilting artwork',()=>{
 const html=renderToStaticMarkup(createElement(AdventurePicker,{selected:'forest-rescue',onSelect:()=>{}}));
 assert.equal((html.match(/<article data-world=/g)||[]).length,10);
 assert.equal((html.match(/<button class="world-card-action" type="button" data-no-card-tilt="" aria-label="Explore /g)||[]).length,10);
 assert.match(html,/aria-label="Explore Jungle Adventure"/);
 assert.doesNotMatch(html,/<button[^>]*class="adventure-world-card/);
});
test('Explore activates its own adventure callback for every world',()=>{
 let selected='';
 const picker=AdventurePicker({selected:'forest-rescue',onSelect:id=>{selected=id}});
 const carousel=picker.props.children[2];
 for(const item of carousel.props.items){
  const action=item.content.props.children[2].props.children.at(-1);
  assert.equal(action.type,'button');assert.equal(action.props['data-no-card-tilt'],'');
  action.props.onClick();assert.equal(selected,item.id);
 }
});
