(() => {
'use strict';
const grid=document.querySelector('.nav-showcase-grid'); if(!grid)return;
const buttons=[...grid.querySelectorAll('.nav-showcase-button')];
const parentOrigin=(()=>{try{return document.referrer?new URL(document.referrer).origin:''}catch(_){return ''}})();
let selected=-1;
const apply=(index,notify)=>{
 const next=Number(index); if(!Number.isInteger(next)||next<0||next>=buttons.length)return false;
 selected=next;
 buttons.forEach((button,i)=>{const active=i===selected;button.classList.toggle('active',active);button.classList.toggle('is-sample-active',active);button.setAttribute('aria-pressed',String(active))});
 if(notify){const detail={index:selected,label:buttons[selected].getAttribute('aria-label')||''};window.dispatchEvent(new CustomEvent('navigation-interaction:select',{detail}));if(window.parent!==window&&parentOrigin)window.parent.postMessage({type:'gongshui:navigation-interaction:select',...detail},parentOrigin)}
 return true;
};
grid.addEventListener('click',event=>{const button=event.target.closest('.nav-showcase-button');if(button&&grid.contains(button))apply(button.dataset.navSample,true)});
buttons.forEach(button=>button.setAttribute('aria-pressed','false'));
window.addEventListener('message',event=>{if(window.parent===window||!parentOrigin||event.source!==window.parent||event.origin!==parentOrigin)return;const message=event.data;if(message&&message.type==='gongshui:navigation-interaction:select')apply(message.index,false)});
window.NavigationInteraction={select:index=>apply(index,true),reset:()=>{selected=-1;buttons.forEach(button=>{button.classList.remove('active','is-sample-active');button.setAttribute('aria-pressed','false')})},get selectedIndex(){return selected},get count(){return buttons.length}};
})();