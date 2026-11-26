/* The Bookmark Hall — standalone two-line embed loader. */
(function(){
'use strict';
var script=document.currentScript;if(!script)return;
var base=new URL('./',script.src).href,targetId=script.getAttribute('data-target');
var slot=targetId?document.getElementById(targetId):script.previousElementSibling,owned=false;
if(!slot||(!targetId&&!slot.hasAttribute('data-bookmark-hall-embed'))){
 slot=document.createElement('div');slot.setAttribute('data-bookmark-hall-embed','');owned=true;
 var insert=function(){if(script.parentNode&&script.parentNode!==document.head)script.parentNode.insertBefore(slot,script);else(document.body||document.documentElement).appendChild(slot)};
 if(document.body)insert();else document.addEventListener('DOMContentLoaded',insert,{once:true});
}
slot.setAttribute('data-gongshui-embed','bookmark-hall');slot.style.display=slot.style.display||'block';slot.style.width=script.getAttribute('data-width')||slot.style.width||'100%';
if(script.hasAttribute('data-height'))slot.style.height=script.getAttribute('data-height');
else if(!slot.hasAttribute('data-embed-fill')&&!slot.style.height){slot.style.aspectRatio=script.getAttribute('data-ratio')||'1.6439';slot.style.minHeight=script.getAttribute('data-min-height')||'280px'}
slot.style.overflow='hidden';slot.style.position=slot.style.position||'relative';slot.style.background=slot.style.background||'#080b12';
var frame=document.createElement('iframe'),url=new URL('index.html',base);url.searchParams.set('embed','1');
var lang=script.getAttribute('data-lang');if(lang)url.searchParams.set('lang',lang);
frame.src=url.href;frame.title=script.getAttribute('data-label')||'The Bookmark Hall';frame.loading=script.getAttribute('data-loading')||'lazy';frame.referrerPolicy='strict-origin-when-cross-origin';frame.allow='fullscreen; accelerometer; gyroscope';frame.setAttribute('allowfullscreen','');frame.style.cssText='display:block;width:100%;height:100%;min-height:inherit;border:0;margin:0;padding:0;background:transparent';slot.replaceChildren(frame);
var origin=new URL(frame.src).origin,loaded=false,queued=null,listeners=[];
function send(message){if(!message||!frame.contentWindow)return;if(!loaded){queued=message;return}frame.contentWindow.postMessage(message,origin)}
frame.addEventListener('load',function(){loaded=true;if(queued){frame.contentWindow.postMessage(queued,origin);queued=null}});
window.addEventListener('message',function(event){if(event.source!==frame.contentWindow||event.origin!==origin)return;var message=event.data;if(!message||message.type!=='gongshui:bookmark-hall:open')return;listeners.slice().forEach(function(fn){fn(message)});slot.dispatchEvent(new CustomEvent('gongshui:bookmark-hall:open',{detail:message}))});
var api={element:slot,iframe:frame,setItems:function(items){if(Array.isArray(items))send({type:'gongshui:bookmark-hall:data',items:items.slice(0,300)})},onOpen:function(listener){if(typeof listener!=='function')return function(){};listeners.push(listener);return function(){listeners=listeners.filter(function(fn){return fn!==listener})}},destroy:function(){listeners=[];frame.remove();if(owned)slot.remove();else slot.removeAttribute('data-gongshui-embed')}};
slot.gongshuiEmbed=api;window.dispatchEvent(new CustomEvent('gongshui:embed:ready',{detail:{kind:'bookmark-hall',element:slot,iframe:frame,api:api}}));
})();