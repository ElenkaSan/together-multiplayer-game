export function readInviteCode(search:string){
 const code=(new URLSearchParams(search).get('room')||'').trim().toUpperCase();
 return /^[A-Z0-9]{6}$/.test(code)?code:'';
}
export function shouldRestoreSeat(seat:{code?:string}|null,inviteCode:string){
 return !!seat&&(!inviteCode||seat.code===inviteCode);
}
