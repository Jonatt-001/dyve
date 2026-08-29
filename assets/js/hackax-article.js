(function(){

const imgs=
document.querySelectorAll(
'.hackax-lazy-image'
);

if(imgs.length){

function load(img){

if(img.dataset.loaded==='true'){
return;
}

const src=img.dataset.src;

if(!src){
return;
}

const p=new Image();

if(img.dataset.srcset){
p.srcset=img.dataset.srcset;
p.sizes=img.sizes||'100vw';
}

p.onload=function(){

if(img.dataset.srcset){
img.srcset=img.dataset.srcset;
}

img.src=src;
img.classList.add('is-loaded');
img.dataset.loaded='true';

};

p.onerror=function(){

img.src=src;
img.dataset.loaded='true';

};

p.src=src;
}

document
.querySelectorAll('.hackax-hero-image')
.forEach(load);

const lazy=[
...document.querySelectorAll(
'.hackax-lazy-image:not(.hackax-hero-image)'
)
];

if(
'IntersectionObserver' in window
){

const o=
new IntersectionObserver(
es=>es.forEach(e=>{

if(e.isIntersecting){

load(e.target);
o.unobserve(e.target);

}

}),
{
rootMargin:'300px 0px'
}
);

lazy.forEach(i=>o.observe(i));

}else{

lazy.forEach(load);

}

}

const progress=
document.querySelector(
'.article-reading-progress span'
);

if(progress){

const update=()=>{

const doc=document.documentElement;

const max=
doc.scrollHeight-
window.innerHeight;

const pct=
max>0
?(window.scrollY/max)*100
:0;

progress.style.width=
Math.max(
0,
Math.min(100,pct)
)+'%';

};

window.addEventListener(
'scroll',
update,
{
passive:true
}
);

update();

}

const copy=
document.querySelector(
'[data-copy-article]'
);

if(copy){

copy.addEventListener(
'click',
async()=>{

try{

await navigator.clipboard.writeText(
location.href
);

copy.textContent='Link copied';

setTimeout(
()=>copy.textContent='Copy link',
1800
);

}catch{

copy.textContent='Copy unavailable';

setTimeout(
()=>copy.textContent='Copy link',
1800
);

}

}
);

}

})();