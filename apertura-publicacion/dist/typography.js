import { typeActAt } from './sequence.js?v=16';

const resources = Object.freeze({
  appearance: './assets/brand/prohibido-cartel.webp',
  name: './assets/brand/prohibido-wordmark-red.webp',
  broyer: './assets/brand/broyer-du-noir.webp',
  societe: './assets/brand/la-societe-depressive.webp',
  trace: './assets/brand/prohibido-symbol-black.svg',
});

function loadImage(path){
  return new Promise((resolve,reject)=>{
    const img=new Image();
    img.onload=()=>resolve(img);
    img.onerror=()=>reject(new Error('No se pudo cargar '+path));
    img.src=new URL(path,import.meta.url).href;
  });
}

/** Original marks are fixed impressions. Timing and scale carry the tension. */
export class TypeIntervention {
  constructor(stage){
    this.stage=stage;this.images=new Map();this.key='';this.bounds=[];
    this.canvas=document.createElement('canvas');
    this.canvas.className='type-print';stage.appendChild(this.canvas);
    this.ctx=this.canvas.getContext('2d');
    // Resolve failures without an unhandled rejection; entry reports an actionable error.
    this.ready=Promise.all(Object.entries(resources).map(async([id,path])=>{
      this.images.set(id,await loadImage(path));
    })).then(()=>{this.key='';return true;},()=>{this.key='';return false;});
  }
  place(id,x,y,maxWidth,maxHeight){
    const img=this.images.get(id);
    if(!img)return;
    const scale=Math.min(maxWidth/img.naturalWidth,maxHeight/img.naturalHeight);
    const w=img.naturalWidth*scale,h=img.naturalHeight*scale;
    const bounds={id,x:x-w/2,y:y-h/2,w,h};
    this.ctx.drawImage(img,bounds.x,bounds.y,w,h);this.bounds.push(bounds);
  }
  prepare(act,width,height,ratio){
    this.canvas.width=Math.round(width*ratio);this.canvas.height=Math.round(height*ratio);
    this.canvas.style.width=width+'px';this.canvas.style.height=height+'px';
    this.canvas.style.transform='none';this.bounds=[];
    const ctx=this.ctx;ctx.setTransform(ratio,0,0,ratio,0,0);
    const portrait=width<height*.8;
    if(act.id==='appearance'){
      // One hard arrival; the complete poster stays within the white frame.
      this.place(act.id,width*.5,height*.5,width*.84,height*.86);
    }else if(act.id==='name'){
      const img=this.images.get('name');
      if(img){
        const w=width*.74,h=w*img.naturalHeight/img.naturalWidth;
        const box={id:'name',x:width*.13,y:height*.59-h/2,w,h};
        ctx.drawImage(img,box.x,box.y,w,h);this.bounds.push(box);
      }
    }else if(act.id==='broyer'||act.id==='societe'){
      // Both credits occupy the future incision's position.
      const size=Math.min(portrait?104:138,height*.23,width*.26);
      this.place(act.id,width*.64,height*.43,size,size);
      const fontSize=Math.max(10,Math.min(12,width*.028));
      const bottom=Math.min(height*.8,height-62);
      ctx.fillStyle='#000';ctx.textBaseline='top';
      ctx.font='400 '+(fontSize-1)+'px "Helvetica Neue", Helvetica, Arial, sans-serif';
      ctx.fillText('Colaboradores',width*.13,bottom);
      ctx.font='500 '+fontSize+'px "Helvetica Neue", Helvetica, Arial, sans-serif';
      ctx.fillText(act.id==='broyer'?'Broyer du Noir.':'La Societe Depressive.',width*.13,bottom+21);
    }else if(act.id==='trace'){
      this.place(act.id,width*.64,height*.43,width*.13,Math.min(66,height*.12));
    }
    this.stage.dataset.composition=act.id;
    this.stage.dataset.brand='original';
    this.stage.dataset.orientation=portrait?'portrait':'landscape';
    this.stage.dataset.visible=String(this.bounds.length>0);
    this.key=[act.id,width,height,ratio,this.images.size].join(':');
  }
  draw(t,width,height,ratio){
    const act=typeActAt(t);this.stage.style.opacity=act?'1':'0';
    if(!act)return null;
    const key=[act.id,width,height,ratio,this.images.size].join(':');
    if(this.key!==key)this.prepare(act,width,height,ratio);
    return act;
  }
}
