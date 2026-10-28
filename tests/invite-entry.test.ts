import test from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {RoomEntry} from '../src/RoomEntry';
import {readInviteCode,shouldRestoreSeat} from '../src/invite-entry';
const props={name:'Hero',code:'SURWEW',connected:true,pending:false,createLabel:'Create Room',onName:()=>{},onCode:()=>{},onEnter:(_:'join'|'create')=>{}};
test('invite panel puts focused name, prefilled code, Join and Create in that order',()=>{
 const html=renderToStaticMarkup(createElement(RoomEntry,{...props,invite:true}));
 const positions=['id="name"','id="code"','>Join room<','>Create Room<'].map(x=>html.indexOf(x));assert.ok(positions.every(p=>p>=0));assert.deepEqual([...positions].sort((a,b)=>a-b),positions);assert.match(html,/<input[^>]*id="name"[^>]*autofocus/);assert.match(html,/value="SURWEW"/);assert.match(html,/<button[^>]*type="submit"[^>]*>Join room<\/button>/);assert.match(html,/or start a new team/);
});
test('normal entry keeps Create before room-code input and Join',()=>{
 const html=renderToStaticMarkup(createElement(RoomEntry,{...props,tiny:true,code:''}));assert.ok(html.indexOf('>Create Room<')<html.indexOf('id="code"'));assert.doesNotMatch(html,/autofocus/);
});
test('invitation submits Join even if code is empty; normal empty-code form submits Create',()=>{
 for(const invite of [true,false]){let called='';const form=RoomEntry({...props,invite,code:'',onEnter:t=>{called=t}});let prevented=false;form.props.onSubmit({preventDefault:()=>{prevented=true}});assert.ok(prevented);assert.equal(called,invite?'join':'create');}
});
test('Create on invitation opens game selection instead of creating an accidental Tiny room',()=>{
 let entered=false,chosen=false;const form=RoomEntry({...props,invite:true,onEnter:()=>{entered=true},onChooseGame:()=>{chosen=true}});
 const fragment=form.props.children.at(-1);const create=fragment.props.children[1];create.props.onClick();assert.ok(chosen);assert.equal(entered,false);
});
test('Join is disabled for missing name, incomplete code, offline connection or pending request',()=>{
 for(const change of [{name:' '},{code:'ABC'},{connected:false},{pending:true}]){const html=renderToStaticMarkup(createElement(RoomEntry,{...props,...change,invite:true}));assert.match(html,/<button[^>]*type="submit"[^>]*disabled/);}
});
test('invite code is normalized and malformed links do not enable invitation mode',()=>{
 assert.equal(readInviteCode('?room=surwew'),'SURWEW');assert.equal(readInviteCode('?room=%20SURWEW%20'),'SURWEW');for(const s of ['','?room=','?room=ABC','?room=%3Csvg%3E','?room=ABC!DE','?room=ABC1234'])assert.equal(readInviteCode(s),'');
});
test('different invitation takes precedence over stored seat; same-room and ordinary reconnect still restore',()=>{
 assert.ok(shouldRestoreSeat({code:'SURWEW'},'SURWEW'));assert.ok(shouldRestoreSeat({code:'SURWEW'},''));assert.equal(shouldRestoreSeat({code:'ABC234'},'SURWEW'),false);assert.equal(shouldRestoreSeat(null,'SURWEW'),false);
});
