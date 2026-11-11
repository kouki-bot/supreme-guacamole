(function(){
  "use strict";
  const KEY="kurashiNaviFavoritesV1";
  const read=()=>{try{const v=JSON.parse(localStorage.getItem(KEY)||"[]");return Array.isArray(v)?v:[]}catch(_){return[]}};
  const write=(items)=>{try{localStorage.setItem(KEY,JSON.stringify(items));return true}catch(_){return false}};
  const titles={
    rent:"退去費用が高すぎると感じる",rentincrease:"家賃の値上げを求められた",unemployment:"失業給付を受けたい",refund:"ネット通販の商品を返品したい",resign:"仕事を辞めたい・退職手続きが知りたい",gasleak:"ガス臭い・ガス漏れの疑い",noise:"近隣の騒音に困っている",unknowncharge:"身に覚えのない請求がある",subscription:"解約したのに請求が続いている",moving:"引っ越し後の住所変更をしたい",leak:"賃貸住宅で水漏れが起きた",gasstove:"ガスコンロが点火しない",electric:"停電・ブレーカー・コンセントのトラブル",cleaning:"ハウスクリーニング・害虫駆除を依頼したい",security:"鍵をなくした・交換したい・防犯対策をしたい",waste:"不用品・粗大ごみを処分したい",movingservice:"引っ越し業者を探したい・引っ越し費用を知りたい", "work-date":"退職日はいつにするのがいい？", "work-paidleave":"退職前に有給休暇を消化したい", "work-documents":"退職後の書類が届かない", "work-wages":"最後の給料や残業代が支払われない", "work-harassment":"パワハラ・職場環境が原因で辞めたい", "work-separation":"離職票の退職理由が実際と違う", "work-retirementpay":"退職金が支払われない・金額が違う", "work-illness":"体調不良で退職・休職を考えている","money-undelivered":"注文した商品が届かない","money-defective":"届いた商品が不良品・注文と違う","money-debt":"借金・ローンの返済が苦しい","money-tax":"税金・国民健康保険料の支払いが難しい","shopping-store-return":"お店で買った商品を返品したい","shopping-warranty":"保証期間内に商品が故障した","shopping-door":"訪問販売・電話勧誘で契約してしまった","mynumber-lost":"マイナンバーカードを紛失した","work-insurance":"退職後の健康保険・年金の手続きが分からない"
  };
  const save=(id,title,url)=>{
    const items=read().filter(x=>x.id!==id);
    items.unshift({schemaVersion:1,id,title:title||titles[id]||id,url:url||("index.html?topic="+encodeURIComponent(id)),savedAt:Date.now()});
    // 現段階では保存数を制限しない。将来のクラウド保存へ移行しやすい共通データ形式を維持する。
    return write(items);
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
    // トップページの「よくある困りごと」に保存ボタンを追加
    document.querySelectorAll(".popular-item[data-quick]").forEach(item=>{
      const id=item.dataset.quick;
      if(!titles[id]||item.querySelector("[data-favorite-id]"))return;
      const title=titles[id];
      let url=id.startsWith("work-")?("guide-work-issues.html#"+id):("index.html?topic="+encodeURIComponent(id));if(id.startsWith("money-"))url="guide-money-issues.html#"+id;if(id.startsWith("shopping-"))url="guide-shopping-issues.html#"+id;if(id==="mynumber-lost")url="guide-mynumber-lost.html";if(id==="work-insurance")url="guide-work-insurance.html";item.appendChild(button(id,title,url));
    });
    const section=document.createElement("section");section.className="favorites-section section-wrap";section.id="favorites";
    section.innerHTML='<div class="favorites-heading"><div><p class="eyebrow">YOUR SAVED GUIDES</p><h2>お気に入り <small>（<span id="favoriteCount">0</span>）</small></h2></div><p>無料で保存できます（この端末・ブラウザ内のみ）。端末変更やブラウザデータ削除で消える場合があります。</p></div><p id="favoriteEmpty">まだ保存したガイドはありません。気になる困りごとの「お気に入りに保存」を押してください。</p><ul id="favoriteItems" class="favorite-items"></ul>';
    document.querySelector(".site-footer")?.before(section);
    const params=new URLSearchParams(location.search),topic=params.get("topic");
    if(topic&&titles[topic]){const target=document.querySelector('[data-quick="'+CSS.escape(topic)+'"]');if(target)target.click();}
  }else if(path.startsWith("guide-")){
    const h1=document.querySelector("h1"),canonical=document.querySelector('link[rel="canonical"]')?.href||location.href;
    const id=path.replace(/^guide-/,"").replace(/\.html$/,"");
    if(h1&&id&&!document.querySelector("[data-favorite-id]")){const holder=document.createElement("div");holder.className="article-favorite";holder.style.margin="14px 0 22px";holder.appendChild(button(id,titles[id]||h1.textContent.trim(),canonical));h1.after(holder);}
  }
  refresh();
})();