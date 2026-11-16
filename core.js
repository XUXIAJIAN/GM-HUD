(function(root){
function parseSheets(sheets){
 const result=[];
 for(const [sheet,rows] of Object.entries(sheets)){
  const hi=rows.findIndex(r=>String(r[0]||'').trim().toLowerCase()==='item');
  if(hi<0)continue;
  const headers=rows[hi];
  for(const row of rows.slice(hi+1)){
   const name=String(row[0]||'').trim();
   if(!name)continue;
   const points=[];let missing=0,invalid=0;
   for(let c=1;c<headers.length;c++){
    if(headers[c]==null||headers[c]==='')continue;
    const raw=row[c];
    if(raw==null||raw===''){missing++;continue;}
    const v=typeof raw==='number'?raw:(typeof raw==='string'&&/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(raw.trim())?Number(raw):NaN);
    if(Number.isFinite(v))points.push({id:String(headers[c]),v});else invalid++;
   }
   if(!points.length)continue;
   const unit=(name.match(/\(([^()]*)\)\s*$/)||[])[1]||'';
   let lo=null,hi=null,source='未提供客户限值',note='仅统计，待补充项目要求';
   if(/Image Size/i.test(name)&&unit==='%'){lo=-5;hi=5;source='表内限值 ±5%';note='本表项目筛查；全局指标不能替代所有相邻网格点的 ±5% 验证';}
   if(/Global Mag/i.test(name)&&unit==='%'){lo=95;hi=105;source='表内 global magnification ±5%';note='按 100% 为标称值，范围 95%～105%；请确认客户定义';}
   if(/Rotation/i.test(name)&&unit==='°'){lo=-1;hi=1;source='表内限值 ±1°';note='当前为平均旋转，不能证明所有水平线段均满足 ±1°';}
   if(/Ghost/i.test(name)&&unit==='mm'){let limit=sheet==='EB_N'?1:(sheet==='EB_H'||sheet==='EB_L'?1.5:null);if(limit!==null){lo=-limit;hi=limit;source='工作表重影限值 ±'+limit+' mm';note='按表内双向限值筛查。PDF 的 Tall 向下 / Short 向上为方向性要求；本表 Avg 不足以核验逐点最差重影、方向及三眼位最终判定';}}
   result.push({key:sheet+'|'+name,sheet,name,unit,points,missing,invalid,lo,hi,source,note});
  }
 }
 return result;
}
function stats(item){const a=item.points.map(p=>p.v),n=a.length,mean=a.reduce((s,x)=>s+x,0)/n,sd=n>1?Math.sqrt(a.reduce((s,x)=>s+(x-mean)**2,0)/(n-1)):0;const specified=item.lo!==null||item.hi!==null;const bad=item.points.filter(p=>(item.lo!==null&&p.v<item.lo)||(item.hi!==null&&p.v>item.hi));return{n,mean,sd,min:Math.min(...a),max:Math.max(...a),specified,bad,pass:specified?(n-bad.length)/n:null};}
function groupItems(items){
 const groups=new Map();
 for(const item of items){
 const name=item.name.replace(/_EBC/ig,'').replace(/_/g,' ').replace(/Buttom/ig,'Bottom').replace(/\s+/g,' ').trim();
 const key=name.toLowerCase();
 if(!groups.has(key))groups.set(key,{key,name,unit:item.unit,primary:/ghost|rotation|image size/i.test(name),series:[]});
 groups.get(key).series.push(item);
 }
 return [...groups.values()];
}
root.HUD={parseSheets,stats,groupItems};if(typeof module!=='undefined')module.exports=root.HUD;
})(globalThis);
