(function(){
  "use strict";
  const KEY="kurashiNaviFavoritesV1";
  const read=()=>{try{const v=JSON.parse(localStorage.getItem(KEY)||"[]");return Array.isArray(v)?v:[]}catch(_){return[]}};
  const write=(items)=>{try{localStorage.setItem(KEY,JSON.stringify(items));return true}catch(_){return false}};
  const titles={
    rent:"退去費用が高すぎると感じる",rentincrease:"家賃の値上げを求められた",unemployment:"失業給付を受けたい",refund:"ネット通販の商品を返品したい",resign:"仕事を辞めたい・退職手続きが知りたい",gasleak:"ガス臭い・ガス漏れの疑い",noise:"近隣の騒音に困っている",unknowncharge:"身に覚えのない請求がある",subscription:"解約したのに請求が続いている",moving:"引っ越し後の住所変更をしたい",leak:"賃貸住宅で水漏れが起きた",gasstove:"ガスコンロが点火しない"
  };
  const save=(id,title,url)=>{
    const items=read().filter(x=>x.id!==id);
    items.unshift({id,title:title||titles[id]||id,url:url||("index.html?topic="+encodeURIComponent(id)),savedAt:Date.now()});
    return write(items.slice(0,30));
  };
  const remove=id=>write(read().filter(x=>x.id!==id));
  const button=(id,title,url)=>{
    const b=document.createElement("button");b.type="button";b.className="favorite-toggle";b.dataset.favoriteId=id;b.dataset.favoriteTitle=title;b.dataset.favoriteUrl=url||"";
    const active=read().some(x=>x.id===id);b.setAttribute("aria-pressed",String(active));b.textContent=active?"★ 保存済み":"☆ お気に入りに保存";return b;
  };
  const refresh=()=>{
    document.querySelectorAll("[data-favorite-id]").forEach(b=>{const active=read().some(x=>x.id===b.dataset.favoriteId);b.setAttribute("aria-pressed",String(active));b.textContent=active?"★ 保存済み":"☆ お気に入りに保存";});
    const list=document.querySelector("#favoriteItems"),empty=document.querySelector("#favoriteEmpty"),count=document.querySelector("#favoriteCount");
    if(!list)return;
    const items=read();list.replaceChildren();if(count)count.textContent=String(items.length);
    if(empty)empty.hidden=items.length>0;
    items.forEach(item=>{
      const li=document.createElement("li"),a=document.createElement("a"),del=document.createElement("button");
      a.href=item.url;a.textContent=item.title;del.type="button";del.className="favorite-remove";del.textContent="削除";del.setAttribute("aria-label",item.title+"をお気に入りから削除");
      del.addEventListener("click",()=>{remove(item.id);refresh();});li.append(a,del);list.append(li);
    });
  };
  document.addEventListener("click",e=>{
    const b=e.target.closest("[data-favorite-id]");if(!b)return;e.preventDefault();e.stopPropagation();
    const id=b.dataset.favoriteId;const exists=read().some(x=>x.id===id);
    if(exists)remove(id);else if(!save(id,b.dataset.favoriteTitle,b.dataset.favoriteUrl)){alert("保存できませんでした。ブラウザの設定をご確認ください。");}
    refresh();
  },true);
  const path=location.pathname.split("/").pop()||"index.html";
  const home=path==="index.html"||path==="";
  if(home){
    const section=document.createElement("section");section.className="favorites-section section-wrap";section.id="favorites";
    section.innerHTML='<div class="favorites-heading"><div><p class="eyebrow">YOUR SAVED GUIDES</p><h2>お気に入り <small>（<span id="favoriteCount">0</span>）</small></h2></div><p>この端末・ブラウザに保存されます</p></div><p id="favoriteEmpty">まだ保存したガイドはありません。気になる困りごとの「お気に入りに保存」を押してください。</p><ul id="favoriteItems" class="favorite-items"></ul>';
    document.querySelector(".site-footer")?.before(section);
    const params=new URLSearchParams(location.search),topic=params.get("topic");
    if(topic&&titles[topic]){const target=document.querySelector('[data-quick="'+CSS.escape(topic)+'"]');if(target)target.click();}
  }else if(path.startsWith("guide-")){
    const h1=document.querySelector("h1"),canonical=document.querySelector('link[rel="canonical"]')?.href||location.href;
    const id=path.replace(/^guide-/,"").replace(/\.html$/,"");
    if(h1&&id){const holder=document.createElement("div");holder.className="article-favorite";holder.appendChild(button(id,h1.textContent.trim(),canonical));h1.after(holder);}
  }
  refresh();
})();