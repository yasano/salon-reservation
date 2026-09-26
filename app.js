(() => {
  'use strict';
  const el=(s,r=document)=>r.querySelector(s), all=(s,r=document)=>[...r.querySelectorAll(s)];
  const yen=n=>'¥'+Number(n).toLocaleString('ja-JP'), pad=n=>String(n).padStart(2,'0');
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const today=new Date();today.setHours(0,0,0,0);
  const dateKey=o=>{const d=new Date(today);d.setDate(d.getDate()+o);return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());};
  const localDateKey=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
  const weekdays=['日','月','火','水','木','金','土'];
  const dateInfo=o=>{const d=new Date(today);d.setDate(d.getDate()+o);return {key:dateKey(o),offset:o,day:d.getDate(),weekday:weekdays[d.getDay()],weekDayIndex:d.getDay(),month:d.getMonth()+1};};
  let calendarWeekStart=0,bookingStageStep=1,bookingTransitionTimer=null,scheduleWeekStart=0,scheduleDrag=null,scheduleSubjectId='';
  const owners=[
    {id:'owner-a',name:'今井 はるか',email:'haruka@example.jp'},
    {id:'owner-b',name:'小川 玲奈',email:'rena@example.jp'}
  ];
  const venues=[
    {id:'venue-kichijoji',name:'シェアサロン 吉祥寺',address:'東京都武蔵野市吉祥寺本町 2-8-4',access:'吉祥寺駅北口から徒歩5分',contact:'0422-00-0001',active:true},
    {id:'venue-nakameguro',name:'シェアサロン 中目黒',address:'東京都目黒区上目黒 1-12-3',access:'中目黒駅から徒歩4分',contact:'03-0000-0002',active:true},
    {id:'venue-sangenjaya',name:'シェアサロン 三軒茶屋',address:'東京都世田谷区太子堂 4-8-7',access:'三軒茶屋駅から徒歩3分',contact:'03-0000-0003',active:true}
  ];
  const stores=[
    {id:'store-kichijoji',ownerId:'owner-a',venueId:'venue-kichijoji',name:'knot. 吉祥寺店',address:'東京都武蔵野市吉祥寺本町 2-8-4',access:'吉祥寺駅北口から徒歩5分',contact:'0422-00-0001',active:true},
    {id:'store-nakameguro',ownerId:'owner-a',venueId:'venue-nakameguro',name:'SCENE 中目黒店',address:'東京都目黒区上目黒 1-12-3',access:'中目黒駅から徒歩4分',contact:'03-0000-0002',active:true},
    {id:'store-sangenjaya',ownerId:'owner-b',venueId:'venue-sangenjaya',name:'Lito 三軒茶屋店',address:'東京都世田谷区太子堂 4-8-7',access:'三軒茶屋駅から徒歩3分',contact:'03-0000-0003',active:true}
  ];
  const PUBLIC_STORE_ID='store-nakameguro';
  const stylists=[
    {id:'haruka',storeId:'store-kichijoji',name:'今井 はるか',email:'haruka.staff@example.jp',notifyByEmail:true,displayTitle:'スタイリスト',short:'はるか',initials:'H',role:'スタッフ',specialty:'ボブ・透明感カラー',avatar:'sage',years:9,bio:'一人ひとりの髪質に合わせた、扱いやすいボブと肌なじみのよいカラーをご提案します。ご希望を伺いながら丁寧に施術します。',socialUrl:'https://www.instagram.com/haruka_knot_demo/',photoData:null},
    {id:'sota',storeId:'store-kichijoji',name:'佐藤 奏太',email:'sota.staff@example.jp',notifyByEmail:true,displayTitle:'スタイリスト',short:'奏太',initials:'S',role:'スタッフ',specialty:'メンズカット・パーマ',avatar:'blue',years:8,bio:'髪質と骨格に合わせた、自然に決まるメンズスタイルをご提案します。',socialUrl:'https://www.instagram.com/sota_hair_demo/',photoPath:'assets/naoki-profile.png',photoData:null},
    {id:'mio',storeId:'store-kichijoji',name:'早川 美緒',email:'mio.staff@example.jp',notifyByEmail:true,displayTitle:'スタイリスト',short:'美緒',initials:'M',role:'スタッフ',specialty:'ショート・ヘッドスパ',avatar:'rose',years:6,bio:'毎日のお手入れがしやすいショートスタイルと、ゆっくり過ごせるヘッドスパが得意です。',socialUrl:'https://www.instagram.com/mio_hair_demo/',photoPath:'assets/rena-profile.png',photoData:null},
    {id:'naoki',storeId:'store-nakameguro',name:'田中 直樹',email:'naoki.staff@example.jp',notifyByEmail:true,displayTitle:'スタイリスト',short:'直樹',initials:'N',role:'スタッフ',specialty:'メンズカット・パーマ',avatar:'blue',years:11,bio:'骨格と髪質に合わせたスタイルをご提案します。',socialUrl:'https://www.instagram.com/naoki_hair_demo/',photoData:null},
    {id:'yui',storeId:'store-nakameguro',name:'堀田 ゆい',email:'yui.staff@example.jp',notifyByEmail:true,displayTitle:'スタイリスト',short:'ゆい',initials:'Y',role:'スタッフ',specialty:'ボブ・透明感カラー',avatar:'sage',years:8,bio:'顔まわりのデザインと、肌になじむ柔らかなカラーをご提案します。',socialUrl:'https://www.instagram.com/yui_hair_demo/',photoPath:'assets/haruka-profile.png',photoData:null},
    {id:'sena',storeId:'store-nakameguro',name:'小林 世奈',email:'sena.staff@example.jp',notifyByEmail:true,displayTitle:'スタイリスト',short:'世奈',initials:'S',role:'スタッフ',specialty:'ショート・ヘッドスパ',avatar:'rose',years:6,bio:'乾かすだけでまとまるショートと、頭皮を整えるヘッドスパが得意です。',socialUrl:'https://www.instagram.com/sena_hair_demo/',photoPath:'assets/rena-profile.png',photoData:null},
    {id:'rena',storeId:'store-sangenjaya',name:'小川 玲奈',email:'rena.staff@example.jp',notifyByEmail:true,displayTitle:'スタイリスト',short:'玲奈',initials:'R',role:'スタッフ',specialty:'ショート・ヘッドスパ',avatar:'rose',years:7,bio:'日々のお手入れがしやすいスタイルを大切にしています。',socialUrl:'https://www.instagram.com/rena_hair_demo/',photoPath:'assets/rena-profile.png',photoData:null}
  ];
  const seats=[
    {id:'S-01',storeId:'store-kichijoji',name:'セット面 01',type:'セット面',area:'窓側',active:true,icon:'◒'},
    {id:'S-02',storeId:'store-kichijoji',name:'セット面 02',type:'セット面',area:'中央',active:true,icon:'◒'},
    {id:'S-03',storeId:'store-kichijoji',name:'セット面 03',type:'セット面',area:'奥側',active:true,icon:'◒'},
    {id:'S-04',storeId:'store-kichijoji',name:'セット面 04',type:'セット面',area:'窓側',active:true,icon:'◒'},
    {id:'N-01',storeId:'store-nakameguro',name:'セット面 01',type:'セット面',area:'窓側',active:true,icon:'◒'},
    {id:'N-02',storeId:'store-nakameguro',name:'セット面 02',type:'セット面',area:'奥側',active:true,icon:'◒'},
    {id:'SG-01',storeId:'store-sangenjaya',name:'セット面 01',type:'セット面',area:'窓側',active:true,icon:'◒'},
    {id:'SG-02',storeId:'store-sangenjaya',name:'セット面 02',type:'セット面',area:'奥側',active:true,icon:'◒'}
  ];
  const menuTemplates=[
    {id:'cut',name:'カット',detail:'シャンプー・ブロー込',duration:60,price:6600},
    {id:'cutcolor',name:'カット + カラー',detail:'全体カラー・ケア込',duration:120,price:13200},
    {id:'perm',name:'カット + パーマ',detail:'デザインパーマ',duration:150,price:15400},
    {id:'color',name:'カラー',detail:'全体カラー',duration:90,price:7700},
    {id:'retouch',name:'カラーリタッチ',detail:'根元2cmまで',duration:75,price:6600},
    {id:'cut_treatment',name:'カット + トリートメント',detail:'内部補修ケア',duration:90,price:9900},
    {id:'treatment',name:'トリートメント',detail:'集中補修・ホームケア付',duration:45,price:5500},
    {id:'headspa',name:'ヘッドスパ',detail:'頭皮クレンジング・30分',duration:45,price:4400},
    {id:'bangcut',name:'前髪カット',detail:'前髪・顔まわり',duration:20,price:1650},
    {id:'bangperm',name:'前髪パーマ',detail:'前髪カット込',duration:45,price:4950},
    {id:'highlight',name:'ハイライトカラー',detail:'デザインカラー',duration:150,price:16500},
    {id:'bleach',name:'ブリーチ + カラー',detail:'ケアブリーチ1回',duration:180,price:22000},
    {id:'straight',name:'縮毛矯正',detail:'全体・カット別',duration:180,price:19800}
  ];
  const menus=stores.flatMap(store=>menuTemplates.map(m=>({...m,id:store.id+'-'+m.id,templateId:m.id,storeId:store.id})));
  let staffSchedules=[];
  let storeClosures=[];
  let demoScheduleSeeded=false;
  const seed=(id,storeId,offset,sid,seat,mid,customer,phone,note,attendance='upcoming')=>{
    const m=menus.find(x=>x.storeId===storeId&&x.templateId===mid);return {id,storeId,dayOffset:offset,date:dateKey(offset),stylistId:sid,seatId:seat,time:'10:00',menuId:m.id,menuName:m.name,duration:m.duration,price:m.price,customer,phone,note,status:'confirmed',attendance,line:false};
  };
  const defaultStaffs=stylists.map(person=>({...person}));
  let bookings=[
    {...seed('KN-2038','store-kichijoji',-30,'haruka','S-02','cut','小林 美咲','09000001111','前回と同じ長さで','completed'),time:'14:00'},
    {...seed('KN-2039','store-kichijoji',-18,'haruka','S-03','cutcolor','田中 里奈','09000002222','暗めのブラウン希望','no_show_contacted'),time:'12:00'},
    {...seed('KN-2040','store-kichijoji',-12,'haruka','S-01','cutcolor','山本 由香','09000004444','肌が敏感です','no_show_uncontacted'),time:'16:00'},
    {...seed('KN-2048','store-kichijoji',0,'haruka','S-02','cut','小林 美咲','09000001111','前回と同じ長さで'),time:'10:00'},
    {...seed('KN-2049','store-kichijoji',0,'haruka','S-03','cutcolor','田中 里奈','09000002222','暗めのブラウン希望'),time:'12:00'},
    {...seed('KN-2051','store-kichijoji',0,'haruka','S-01','cutcolor','山本 由香','09000004444','肌が敏感です'),time:'16:00'},
    {...seed('KN-2052','store-kichijoji',1,'haruka','S-02','perm','松本 亜紀','09000005555',''),time:'10:30'},
    {...seed('NK-1001','store-nakameguro',-15,'naoki','N-01','cut','青木 絵里','08000006666','襟足を短めに','completed'),time:'11:00'},
    {...seed('NK-1002','store-nakameguro',0,'naoki','N-01','cut','青木 絵里','08000006666','前回の仕上がりが気に入った'),time:'13:00'},
    {...seed('SG-1001','store-sangenjaya',0,'rena','SG-02','cutcolor','高橋 由美','07000007777','カラーは相談したい'),time:'15:00'}
  ];
  function restoreDemoState(){
    try{
      const saved=JSON.parse(sessionStorage.getItem('knot-prototype-session-v3')||'null');if(!saved||saved.day!==dateKey(0))return;
      if(Array.isArray(saved.bookings))bookings=saved.bookings;
      if(Array.isArray(saved.stores))stores.splice(0,stores.length,...saved.stores);
      if(Array.isArray(saved.venues))venues.splice(0,venues.length,...saved.venues);
      if(Array.isArray(saved.owners))owners.splice(0,owners.length,...saved.owners);
      if(Array.isArray(saved.seats))seats.splice(0,seats.length,...saved.seats);
      if(Array.isArray(saved.menus))menus.splice(0,menus.length,...saved.menus);
      if(Array.isArray(saved.staffSchedules))staffSchedules.splice(0,staffSchedules.length,...saved.staffSchedules);
      else if(Array.isArray(saved.pairRules)){
        const migrated=[];saved.pairRules.forEach(rule=>(rule.days||[]).forEach(day=>{if(!migrated.some(item=>item.staffId===rule.stylistId&&item.days[0]===day))migrated.push({id:rule.stylistId+'-schedule-'+day,storeId:rule.storeId,staffId:rule.stylistId,days:[day],start:rule.start||'10:00',end:rule.end||'19:00'});}));
        staffSchedules.splice(0,staffSchedules.length,...migrated);
      }
      if(Array.isArray(saved.storeClosures))storeClosures.splice(0,storeClosures.length,...saved.storeClosures);
      demoScheduleSeeded=saved.demoScheduleSeeded===true;
      if(Array.isArray(saved.stylists))stylists.splice(0,stylists.length,...saved.stylists);
    }catch(_){/* Browser storage can be unavailable for local files; the mock still works in memory. */}
  }
  function saveDemoState(){
    try{sessionStorage.setItem('knot-prototype-session-v3',JSON.stringify({day:dateKey(0),bookings,staffSchedules,storeClosures,demoScheduleSeeded,stylists,stores,venues,owners,seats,menus}));}catch(_){/* Keep the current interaction usable if the browser blocks storage. */}
  }
  restoreDemoState();
  defaultStaffs.forEach(person=>{if(!stylists.some(current=>current.id===person.id))stylists.push(person);});
  owners.forEach(owner=>stores.filter(store=>store.ownerId===owner.id).forEach(store=>{
    const matches=(person,otherName)=>person.name.replace(/\s/g,'')===otherName.replace(/\s/g,'');
    if(!stylists.some(person=>person.storeId===store.id&&matches(person,owner.name))){const profile=stylists.find(person=>matches(person,owner.name));if(profile)stylists.push({...profile,id:owner.id+'-'+store.id,storeId:store.id,email:owner.email,ownerProfile:true});}
  }));
  // Keep explicit date ranges, discard the old automatically generated 10:00–19:00 demo availability.
  const legacySchedules=staffSchedules.splice(0,staffSchedules.length);
  legacySchedules.forEach(rule=>{
    const start=rule.start||'10:00',end=rule.end||'19:00';
    if(rule.date){if(rule.id!==rule.staffId+'-'+rule.date)staffSchedules.push(rule);return;}
    if(start==='10:00'&&end==='19:00')return;
    for(let offset=0;offset<35;offset++)if((rule.days||[]).includes(dateInfo(offset).weekDayIndex))staffSchedules.push({id:rule.staffId+'-'+dateKey(offset)+'-'+toMinutes(start),storeId:rule.storeId,staffId:rule.staffId,date:dateKey(offset),start,end});
  });
  if(!demoScheduleSeeded&&!staffSchedules.length){
    stylists.forEach((person,index)=>{for(let offset=1;offset<=21;offset++)if((offset+index)%3!==0)staffSchedules.push({id:'demo-'+person.id+'-'+dateKey(offset),storeId:person.storeId,staffId:person.id,date:dateKey(offset),start:'10:00',end:'19:00'});});
  }
  demoScheduleSeeded=true;
  const legacyVenueByStore={ 'store-kichijoji':'venue-kichijoji','store-nakameguro':'venue-nakameguro','store-sangenjaya':'venue-sangenjaya' };
  stores.forEach(store=>{store.venueId=store.venueId||legacyVenueByStore[store.id]||venues[0]?.id||'';});
  stylists.forEach(person=>{const seeded=defaultStaffs.find(item=>item.id===person.id);delete person.seats;person.role='スタッフ';person.displayTitle=person.displayTitle||seeded?.displayTitle||'スタイリスト';person.email=person.email||seeded?.email||'';person.notifyByEmail=true;if(typeof person.socialUrl!=='string')person.socialUrl='';});
  seats.forEach(item=>{item.type=item.type||'セット面';item.active=item.active!==false;delete item.features;});
  stores.forEach(store=>menuTemplates.forEach(template=>{if(!menus.some(menu=>menu.storeId===store.id&&menu.templateId===template.id))menus.push({...template,id:store.id+'-'+template.id,templateId:template.id,storeId:store.id});}));
  const publicStoreRecord=stores.find(store=>store.id===PUBLIC_STORE_ID);if(publicStoreRecord)publicStoreRecord.name='SCENE 中目黒店';
  stylists.forEach(person=>{person.role='スタッフ';if(typeof person.socialUrl!=='string')person.socialUrl='';});
  let publicStoreId=PUBLIC_STORE_ID,selectedMenu=PUBLIC_STORE_ID+'-cut',selectedDateOffset=0,selectedStylistId=stylists[0].id,chosen=null,currentRole='owner',currentOwnerId='owner-a',currentStaffId='',staffPhotoDraft='',photoCropSequence=0,selectedStoreId=PUBLIC_STORE_ID,selectedVenueId='',currentOpsPage='overview',opsDateOffset=0,toastTimer=null,nextBookingNumber=2053;
  nextBookingNumber=Math.max(2053,...bookings.map(b=>Number(String(b.id).replace(/\D/g,''))+1));
  const dayLabel=o=>o===0?'今日':o===1?'明日':(()=>{const d=dateInfo(o);return d.month+'月'+d.day+'日 ('+d.weekday+')';})();
  const stylistById=id=>stylists.find(x=>x.id===id), seatById=id=>seats.find(x=>x.id===id), menuById=id=>menus.find(x=>x.id===id);
  const ownerById=id=>owners.find(x=>x.id===id), storeById=id=>stores.find(x=>x.id===id), venueById=id=>venues.find(x=>x.id===id);
  const storesForOwner=ownerId=>stores.filter(store=>store.ownerId===ownerId);
  function storesInScope(){
    if(currentRole==='system')return stores.filter(store=>selectedStoreId==='all'||store.id===selectedStoreId);
    if(currentRole==='staff'){const own=stylistById(currentStaffId);return own?stores.filter(store=>store.id===own.storeId):[];}
    return stores.filter(store=>store.ownerId===currentOwnerId&&(selectedStoreId==='all'||store.id===selectedStoreId));
  }
  function recordInScope(record){
    const store=storeById(record.storeId);if(!store)return false;
    if(currentRole==='system')return selectedStoreId==='all'||record.storeId===selectedStoreId;
    if(currentRole==='staff')return store.id===stylistById(currentStaffId)?.storeId;
    return store.ownerId===currentOwnerId&&(selectedStoreId==='all'||record.storeId===selectedStoreId);
  }
  function storeMenus(storeId){return menus.filter(item=>item.storeId===storeId);}
  function publicStore(){return storeById(publicStoreId);}
  function customerLabel(name){const text=String(name||'').trim();return text.endsWith('様')?text:text+'様';}
  function customerPhoneKey(phone){return String(phone||'').replace(/[^\d]/g,'');}
  const visitLabels={upcoming:'来店前',completed:'施術済み',no_show_contacted:'未来店（連絡あり）',no_show_uncontacted:'未来店（連絡なし）'};
  const toMinutes=t=>{const p=t.split(':').map(Number);return p[0]*60+p[1];}, fromMinutes=m=>pad(Math.floor(m/60))+':'+pad(m%60);
  const bookingEnd=b=>toMinutes(b.time)+b.duration+15;
  function showToast(msg){const t=el('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2600);}
  function setView(view){el('#customerView').hidden=view!=='customer';el('#opsView').hidden=view!=='ops';document.body.classList.toggle('admin-mode',view==='ops');if(view==='ops')renderOps();window.scrollTo({top:0,behavior:'smooth'});}
  function photoMarkup(person,admin=false){
    if(person.photoData)return '<div class="profile-photo"><img src="'+esc(person.photoData)+'" alt="'+esc(person.name)+'のプロフィール写真"></div>';
    const src=staffPhotoSource(person);
    return src?'<div class="profile-photo"><img src="'+esc(src)+'" alt="'+esc(person.name)+'のプロフィール写真"></div>':'<div class="profile-photo"><div class="profile-photo-placeholder"><span>'+esc(person.initials||person.name.slice(0,1))+'</span></div></div>';
  }
  function staffPhotoSource(person){const photoById={haruka:'assets/haruka-profile.png',naoki:'assets/naoki-profile.png',rena:'assets/rena-profile.png'};return person.photoData||person.photoPath||photoById[person.id]||'';}
  function safeExternalUrl(value){try{const url=new URL(String(value||'').trim());return ['https:','http:'].includes(url.protocol)?url.href:'';}catch(_){return '';}}
  function stylistLinks(person){
    const legacy=String(person.socialUrl||''),instagram=person.instagramUrl||(/instagram\.com/i.test(legacy)?legacy:''),portfolio=person.portfolioUrl||(/instagram\.com/i.test(legacy)?'':legacy);
    return [{label:'Instagramで作品を見る',url:safeExternalUrl(instagram)},{label:'作品サイトを見る',url:safeExternalUrl(portfolio)}].filter(link=>link.url);
  }
  function stylistCardMarkup(person,selected=false,staffAdmin=false){
    const links=stylistLinks(person).map(link=>'<a class="stylist-portfolio" href="'+esc(link.url)+'" target="_blank" rel="noopener noreferrer">'+esc(link.label)+' <span aria-hidden="true">↗</span></a>').join('');
    const actions=staffAdmin?'<div class="stylist-card-actions"><button type="button" class="stylist-choose staff-edit-button" data-edit-staff="'+person.id+'">編集</button>'+(currentRole==='owner'||currentRole==='system'?'<button type="button" class="small-button staff-delete-button" data-delete-staff="'+person.id+'">削除</button>':'')+'</div>':'<button type="button" class="stylist-choose" data-stylist="'+person.id+'" aria-pressed="'+selected+'">'+(selected?'選択中':'この人を選ぶ')+'</button>';
    const linked=staffAdmin&&person.lineLinked===true?'<span class="line-linked-indicator">LINE通知連携済み</span>':'';
    return '<article class="stylist-option '+(selected?'selected':'')+' '+(person.active===false?'is-inactive':'')+'" data-stylist-card="'+person.id+'">'+photoMarkup(person)+'<div class="stylist-option-body"><span class="stylist-role">'+esc(person.displayTitle||'スタイリスト')+'</span><h4>'+esc(person.name)+'</h4><span class="stylist-specialty">'+esc(person.specialty)+'</span><p class="stylist-bio">'+esc(person.bio)+'</p><span class="stylist-years">美容師歴 '+person.years+'年</span>'+links+linked+'</div>'+actions+'</article>';
  }
  function renderStylistOptions(){
    const storeStylists=stylists.filter(person=>person.storeId===publicStoreId&&person.active!==false);
    if(!storeStylists.some(person=>person.id===selectedStylistId))selectedStylistId=storeStylists[0]?.id||'';
    el('#stylistOptions').innerHTML=storeStylists.map(person=>stylistCardMarkup(person,person.id===selectedStylistId)).join('');
    el('#stylistSelectionNote').textContent=storeStylists.length===1?'プロフィールをご確認ください。':'担当者はいつでも変更できます。';
  }
  function renderMenus(){const options=storeMenus(publicStoreId);if(!options.some(item=>item.id===selectedMenu))selectedMenu=options[0]?.id||'';el('#menuOptions').innerHTML=options.map(m=>'<button class="menu-option '+(m.id===selectedMenu?'selected':'')+'" type="button" role="radio" aria-checked="'+(m.id===selectedMenu)+'" aria-label="'+esc(m.name+'、'+m.duration+'分、'+yen(m.price))+'" title="'+esc(m.detail)+'" data-menu="'+m.id+'"><strong>'+esc(m.name)+'</strong><span class="menu-meta"><span>'+m.duration+'分</span><span class="menu-price">'+yen(m.price)+'</span></span></button>').join('');}
  function renderPublicStore(){
    const store=publicStore();if(!store)return;
    const parts=store.name.split(/\s+/),brand=parts.shift()||store.name,branch=parts.join(' ');
    el('#brandHome').setAttribute('aria-label',store.name);el('#brandMark').textContent=brand.slice(0,1);el('#brandName').textContent=brand;el('#brandCaption').textContent=branch;
    const venue=venueById(store.venueId),address=venue?.address||store.address,access=venue?.access||store.access||'';
    el('#publicStoreTitle').textContent=store.name;el('#publicStoreAddress').textContent=address+(access?' · '+access:'');el('#publicStoreAddressDetail').textContent=address;el('#publicBookingTitle').textContent=store.name+'の予約';el('#publicStoreFooter').textContent=store.name;
    el('#booking').hidden=!store.active;el('#storeInactiveNotice').hidden=store.active;
    document.title=store.name+' — 予約';document.querySelector('meta[name="description"]').content=store.name+'の美容師予約ページです。';
  }
  function renderDates(){
    const week=Array.from({length:7},(_,i)=>dateInfo(calendarWeekStart+i));
    el('#weekLabel').textContent=week[0].month+'月'+week[0].day+'日 〜 '+week[6].month+'月'+week[6].day+'日';
    el('#prevWeek').disabled=calendarWeekStart<=0;
    renderAvailabilityMatrix(week);
    updateBookingAdvance();
  }
  function findAvailableSeat(storeId,offset,start,duration){
    const begin=toMinutes(start),end=begin+duration+15;
    return seats.find(seat=>seat.storeId===storeId&&seat.type==='セット面'&&seat.active!==false&&!bookings.some(booking=>booking.storeId===storeId&&booking.seatId===seat.id&&booking.date===dateKey(offset)&&booking.status!=='cancelled'&&begin<bookingEnd(booking)&&end>toMinutes(booking.time)));
  }
  const isStoreClosed=(storeId,date)=>storeClosures.some(closure=>closure.storeId===storeId&&closure.date===date);
  function canBook(selection,offset,start,duration){
    const person=stylistById(selection.stylistId);if(!person)return false;
    const begin=toMinutes(start),end=begin+duration+15,date=dateKey(offset);
    if(isStoreClosed(person.storeId,date))return false;
    const withinSchedule=staffSchedules.some(rule=>rule.staffId===person.id&&rule.date===date&&begin>=toMinutes(rule.start)&&end<=toMinutes(rule.end));if(!withinSchedule)return false;
    if(offset===0){const now=new Date();if(begin<=now.getHours()*60+now.getMinutes())return false;}
    const staffIsFree=!bookings.some(booking=>booking.storeId===person.storeId&&booking.stylistId===person.id&&booking.date===dateKey(offset)&&booking.status!=='cancelled'&&begin<bookingEnd(booking)&&end>toMinutes(booking.time));
    return staffIsFree&&!!findAvailableSeat(person.storeId,offset,start,duration);
  }
  function getAvailableTimes(stylistId,offset,duration,maxSlots=40){
    const rules=staffSchedules.filter(r=>r.staffId===stylistId&&r.date===dateKey(offset));
    if(isStoreClosed(stylistById(stylistId)?.storeId,dateKey(offset)))return [];
    if(!rules.length)return [];
    const open=Math.min(...rules.map(r=>toMinutes(r.start))),close=Math.max(...rules.map(r=>toMinutes(r.end))),slots=[];
    for(let minute=Math.ceil(open/30)*30;minute+duration+15<=close;minute+=30){
      const time=fromMinutes(minute);
      if(canBook({stylistId},offset,time,duration))slots.push({time});
      if(slots.length>=maxSlots)break;
    }
    return slots;
  }
  function renderAvailabilityMatrix(week=Array.from({length:7},(_,i)=>dateInfo(calendarWeekStart+i))){
    const person=stylistById(selectedStylistId),menu=menuById(selectedMenu),duration=menu?.duration||60;
    const rules=staffSchedules.filter(rule=>rule.staffId===selectedStylistId),open=rules.length?Math.min(...rules.map(rule=>toMinutes(rule.start))):600,close=rules.length?Math.max(...rules.map(rule=>toMinutes(rule.end))):1140;
    const first=Math.ceil(open/30)*30,last=Math.min(close-30,1140),times=[];for(let minute=first;minute<=last;minute+=30)times.push(fromMinutes(minute));
    const allSlots=week.map(date=>getAvailableTimes(selectedStylistId,date.offset,duration,40));
    el('#availabilityHead').innerHTML='<tr><th class="matrix-time-head" scope="col">時間</th>'+week.map((date,index)=>{const count=allSlots[index].length,label=date.offset===0?'今日':date.offset===1?'明日':'';return '<th scope="col" class="matrix-date-head '+(date.offset===selectedDateOffset?'is-selected':'')+'"><button type="button" data-date-offset="'+date.offset+'" aria-pressed="'+(date.offset===selectedDateOffset)+'"><span>'+label+'</span><b>'+(date.month)+'/'+date.day+'</b><small>('+date.weekday+')</small><i>'+count+'枠</i></button></th>';}).join('')+'</tr>';
    if(!person){el('#availabilityBody').innerHTML='<tr><td colspan="8" class="matrix-empty">スタッフが登録されていません。</td></tr>';return;}
    el('#availabilityBody').innerHTML=times.map(time=>{
      const minute=toMinutes(time);
      return '<tr><th class="matrix-time" scope="row">'+time+'</th>'+week.map((date,index)=>{
        const available=allSlots[index].find(slot=>slot.time===time),dayRules=rules.filter(rule=>rule.date===date.key),isWithinHours=dayRules.some(rule=>minute>=toMinutes(rule.start)&&minute+duration+15<=toMinutes(rule.end));
        if(available){const isSelected=!!chosen&&chosen.stylistId===selectedStylistId&&chosen.menuId===selectedMenu&&chosen.dayOffset===date.offset&&chosen.time===time;return '<td><button type="button" class="matrix-slot matrix-slot-open '+(isSelected?'matrix-slot-selected':'')+'" data-time-choice="'+time+'" data-slot-date="'+date.offset+'" aria-pressed="'+isSelected+'" aria-label="'+date.month+'月'+date.day+'日 '+time+' 予約可能">○</button></td>';}
        return '<td><span class="matrix-slot '+(isWithinHours?'matrix-slot-full':'matrix-slot-closed')+'" aria-label="'+date.month+'月'+date.day+'日 '+time+' 予約不可">×</span></td>';
      }).join('')+'</tr>';
    }).join('');
    const date=dateInfo(selectedDateOffset);el('#selectedDateTitle').textContent=date.month+'月'+date.day+'日 ('+date.weekday+') を選択中';
  }
  function renderTimeSlots(){
    /* Kept as a compatibility hook for the booking event handlers. */
  }
  function updateBookingAdvance(){
    const review=el('#selectedSlotReview'),button=el('#goToContact');if(!review||!button)return;
    button.disabled=!chosen;
    el('#goToContactLabel').textContent=chosen?'この日時で次へ進む':'日時を選択して次へ';
    review.hidden=!chosen;if(!chosen)return;
    const person=stylistById(chosen.stylistId),menu=menuById(chosen.menuId),date=dateInfo(chosen.dayOffset);
    el('#selectedSlotSummary').textContent=person.name+' · '+menu.name+' · '+date.month+'月'+date.day+'日 ('+date.weekday+') '+chosen.time;
  }
  function setBookingStep(step){
    const stages=[el('#bookingStepOne'),el('#bookingStepTwo'),el('#bookingSuccess')],outgoing=stages[bookingStageStep-1],incoming=stages[step-1],direction=step<bookingStageStep?'back':'forward';
    clearTimeout(bookingTransitionTimer);stages.forEach(stage=>stage.classList.remove('carousel-enter-forward','carousel-enter-back','carousel-exit-forward','carousel-exit-back'));
    if(incoming&&outgoing&&incoming!==outgoing){stages.forEach(stage=>{if(stage!==incoming&&stage!==outgoing)stage.hidden=true;});incoming.hidden=false;outgoing.hidden=false;incoming.classList.add('carousel-enter-'+direction);outgoing.classList.add('carousel-exit-'+direction);bookingStageStep=step;bookingTransitionTimer=setTimeout(()=>{outgoing.hidden=true;incoming.classList.remove('carousel-enter-'+direction);outgoing.classList.remove('carousel-exit-'+direction);},300);}
    else stages.forEach((stage,index)=>{stage.hidden=index!==step-1;});
    all('#bookingStepper .step').forEach(x=>{const n=Number(x.dataset.step);x.classList.toggle('active',n===step);x.classList.toggle('complete',n<step);});
    if(step===2)renderSummary();
  }
  function renderSummary(){
    if(!chosen)return;const p=stylistById(chosen.stylistId),m=menuById(chosen.menuId),d=dateInfo(chosen.dayOffset);
    el('#bookingSummary').innerHTML='<h4>予約内容</h4><div class="summary-person">'+photoMarkup(p)+'<div><b>'+esc(p.name)+'</b><small>'+esc(p.specialty)+'</small></div></div><div class="summary-row"><span>メニュー</span><b>'+esc(m.name)+'</b></div><div class="summary-row"><span>日時</span><b>'+d.month+'月'+d.day+'日 ('+d.weekday+') '+chosen.time+'</b></div><div class="summary-row"><span>所要時間</span><b>約 '+m.duration+' 分</b></div><div class="summary-row summary-total"><span>施術料金目安</span><b>'+yen(m.price)+'</b></div>';
  }
  function renderConfirmation(b){
    const p=stylistById(b.stylistId),store=storeById(b.storeId),d=new Date(b.date+'T00:00:00');
    el('#successDetails').innerHTML='<div><small>予約番号</small><b>'+esc(b.id)+'</b></div><div><small>日時</small><b>'+(d.getMonth()+1)+'月'+d.getDate()+'日 ('+weekdays[d.getDay()]+') '+esc(b.time)+'</b></div><div><small>メニュー</small><b>'+esc(b.menuName)+'</b></div><div><small>担当美容師</small><b>'+esc(p.name)+'</b></div><div><small>施術料金目安</small><b>'+yen(b.price)+'</b></div>'+(store?.contact?'<div><small>店舗への連絡</small><b><a href="tel:'+esc(store.contact)+'">'+esc(store.contact)+'</a></b></div>':'');
  }
  function handleBookingSubmit(event){
    event.preventDefault();const name=el('#guestName').value.trim(),phone=el('#guestPhone').value.trim(),error=el('#bookingError');
    if(!publicStore()?.active){error.textContent='この店舗では現在予約を受け付けていません。';return;}
    if(!chosen){error.textContent='日時を選択してください。';return;}
    if(!name||!phone){error.textContent='お名前と電話番号を入力してください。';return;}
    if(!/^[+＋]?[\d０-９\s()（）-]{8,}$/.test(phone)){error.textContent='電話番号の形式をご確認ください。';return;}
    if(!el('#policyCheck').checked){error.textContent='キャンセルポリシーと個人情報の取扱いに同意してください。';return;}
    const m=menuById(chosen.menuId);
    const assignedSeat=findAvailableSeat(publicStoreId,chosen.dayOffset,chosen.time,m.duration);
    if(!canBook(chosen,chosen.dayOffset,chosen.time,m.duration)||!assignedSeat){chosen=null;error.textContent='';renderDates();renderTimeSlots();setBookingStep(1);showToast('この時間は埋まりました。空いている別の時間をお選びください。');return;}
    const b={id:'KN-'+nextBookingNumber++,storeId:publicStoreId,dayOffset:chosen.dayOffset,date:dateKey(chosen.dayOffset),stylistId:chosen.stylistId,seatId:assignedSeat.id,time:chosen.time,menuId:m.id,menuName:m.name,duration:m.duration,price:m.price,customer:name,phone,note:el('#guestNote').value.trim(),status:'confirmed',attendance:'upcoming',line:el('#lineOptin').checked};
    bookings.unshift(b);saveDemoState();renderConfirmation(b);setBookingStep(3);el('#booking').scrollIntoView({behavior:'smooth',block:'start'});
  }
  const longDate=o=>{const d=dateInfo(o);return d.month+'月'+d.day+'日 ('+d.weekday+')';};
  function navDefinitions(role){
    const common=[['overview','⌂',role==='system'?'全体状況':'店舗の状況'],['calendar','▦','予約カレンダー'],['reservations','≡','予約一覧'],['customers','♙','お客さま']];
    if(role==='staff')return [{label:'MY WORK',items:[['availability','◷','勤務スケジュール'],['profile','♙','プロフィール']]}];
    const storeTools=[['stylists','♙','スタッフ'],['availability','◷','勤務スケジュール'],['closures','◷','店舗休業日'],['seats','◒','店舗設備'],['menus','▤','施術メニュー'],['settings','⚙','店舗情報']];
    if(role==='system')return [{label:'SYSTEM',items:[...common,['venues','⌖','実店舗管理'],['stores','▣','店舗管理']]},{label:'OPERATIONS',items:[...storeTools,['billing','¥','利用料・請求'],['messages','▱','通知設定']]}];
    return [{label:'MY STORES',items:common},{label:'STORE OPERATIONS',items:storeTools},{label:'ACCOUNT',items:[['billing','¥','プラン・売上'],['messages','▱','通知設定']]}];
  }
  function renderNav(){
    const permitted=storesInScope();if(currentRole!=='system'&&permitted.length&&!permitted.some(x=>x.id===selectedStoreId))selectedStoreId=permitted[0].id;
    const options=(currentRole==='system'?'<option value="all">すべての店舗</option>':'')+permitted.map(store=>'<option value="'+store.id+'">'+esc(store.name)+'</option>').join('');
    el('#storeSelector').innerHTML=options;el('#storeSelector').value=selectedStoreId;
    el('#storeSwitcher').hidden=currentRole==='staff'||(currentRole==='owner'&&permitted.length<2);
    el('#workspaceCard').classList.toggle('system-workspace',currentRole==='system');
    el('#roleLabel').textContent=currentRole==='system'?'SYSTEM ADMIN':currentRole==='staff'?'店舗スタッフ':'店舗管理者';
    const activeStore=storeById(selectedStoreId),workspaceTitle=currentRole==='system'&&selectedStoreId==='all'?'全店舗':(activeStore?.name||'店舗');
    document.title=currentRole==='system'&&selectedStoreId==='all'?'システム管理 — SCENE':workspaceTitle+' — 管理 | SCENE';
    el('#workspaceTitle').textContent=workspaceTitle;el('#workspaceSub').textContent=currentRole==='system'?'実店舗・屋号店舗を管理':currentRole==='staff'?'スタッフ用':(venueById(activeStore?.venueId)?.name||'')+' · '+(ownerById(currentOwnerId)?.name||'店舗管理者');
    el('#breadcrumbStore').textContent=workspaceTitle;
    el('#opsCustomerPreview').hidden=currentRole==='staff'||(currentRole==='system'&&selectedStoreId==='all');
    const person=currentRole==='system'?null:currentRole==='staff'?stylistById(currentStaffId):ownerById(currentOwnerId);
    el('#profileName').textContent=person?.name||'システム管理者';el('#profileRole').textContent=currentRole==='system'?'システム管理者':currentRole==='staff'?'店舗スタッフ':'店舗管理者';
    el('#opsNav').innerHTML=navDefinitions(currentRole).map(g=>'<div class="nav-label">'+g.label+'</div>'+g.items.map(i=>{const n=i[0]==='reservations'?displayBookings(0).filter(b=>b.status==='confirmed').length:0;return '<button class="nav-item '+(currentOpsPage===i[0]?'active':'')+'" data-page="'+i[0]+'"><span class="nav-icon">'+i[1]+'</span><span>'+i[2]+'</span>'+(n?'<span class="nav-count">'+n+'</span>':'')+'</button>';}).join('')).join('');
  }
  const pageHeader=(k,t,d,a='')=>'<div class="page-header"><div><div class="page-kicker">'+esc(k)+'</div><h1>'+esc(t)+'</h1><p>'+esc(d)+'</p></div><div class="page-actions">'+a+'</div></div>';
  const metric=(l,v,u,i,f)=>'<div class="metric-card"><div class="metric-top"><span>'+l+'</span><span class="metric-icon">'+i+'</span></div><div class="metric-value">'+v+'<small> '+u+'</small></div><div class="metric-foot">'+f+'</div></div>';
  const avatar=p=>staffPhotoSource(p)?'<span class="avatar avatar-photo"><img src="'+esc(staffPhotoSource(p))+'" alt=""></span>':'<span class="avatar '+esc(p.avatar||'sage')+'">'+esc(p.initials||'S')+'</span>';
  function bookingInScope(booking){return recordInScope(booking)&&(currentRole!=='staff'||booking.stylistId===currentStaffId);}
  function displayBookings(offset=0){return bookings.filter(b=>bookingInScope(b)&&b.date===dateKey(offset)).sort((a,b)=>toMinutes(a.time)-toMinutes(b.time));}
  function status(b){return b.status==='cancelled'?'<span class="status-pill cancelled">キャンセル</span>':b.status==='pending'?'<span class="status-pill pending">要確認</span>':'<span class="status-pill">予約確定</span>';}
  function attendancePill(b){return '<span class="attendance-pill attendance-'+b.attendance+'">'+(visitLabels[b.attendance]||visitLabels.upcoming)+'</span>';}
  function bookingRow(b){const p=stylistById(b.stylistId),seat=seatById(b.seatId);return '<button class="schedule-row schedule-row-button" data-booking-detail="'+b.id+'"><div class="schedule-time">'+b.time+'</div><div class="schedule-person">'+avatar(p)+'<div><b>'+esc(customerLabel(b.customer))+'</b><small>'+esc(b.menuName)+' · '+b.duration+'分 · 担当 '+esc(p.name)+'</small></div></div><span class="schedule-seat">'+esc(seat?.name||b.seatId)+'</span></button>';}
  function overviewPage(){
    const system=currentRole==='system',todayBookings=displayBookings(0).filter(b=>b.status==='confirmed'),allRecords=bookings.filter(b=>recordInScope(b)&&b.status!=='cancelled'),noShows=allRecords.filter(b=>b.attendance==='no_show_contacted'||b.attendance==='no_show_uncontacted'),next=todayBookings.slice(0,5);
    const title=system?(selectedStoreId==='all'?'システム全体の状況':(storeById(selectedStoreId)?.name||'店舗')+'の状況'):'店舗の予約状況',desc=system?(selectedStoreId==='all'?'契約店舗と予約・来店状況を横断して確認できます。':'選択した店舗の予約・来店状況を確認できます。'):'今日の予約と顧客の来店履歴を確認できます。';
    const actions='<button class="small-button" data-page="calendar">カレンダーを見る →</button>'+(system?'<button class="small-button" data-page="venues">実店舗を登録</button><button class="small-button primary" data-page="stores">屋号店舗を登録</button>':'<button class="small-button primary" data-page="availability">勤務予定を見る</button>');
    const stats=system?metric('実店舗',venues.length,'物件','⌖',stores.length+' 屋号店舗')+metric('今日の予約',todayBookings.length,'件','▦',selectedStoreId==='all'?'全屋号店舗':storeById(selectedStoreId)?.name||'選択店舗')+metric('施術済み',allRecords.filter(b=>b.attendance==='completed').length,'件','✓','記録済み')+metric('未来店',noShows.length,'件','!','連絡あり・なし'):metric('今日の予約',todayBookings.length,'件','▦',longDate(0))+metric('予約中のスタッフ',new Set(todayBookings.map(b=>b.stylistId)).size,'名','♙','この店舗')+metric('施術済み',allRecords.filter(b=>b.attendance==='completed').length,'件','✓','履歴全件')+metric('未来店',noShows.length,'件','!','連絡あり '+allRecords.filter(b=>b.attendance==='no_show_contacted').length+' · なし '+allRecords.filter(b=>b.attendance==='no_show_uncontacted').length);
    const list=next.length?next.map(bookingRow).join(''):'<div class="empty-state">今日の予約はありません。</div>';
    const up=next.slice(0,3).map(b=>'<button class="upcoming-row upcoming-row-button" data-booking-detail="'+b.id+'"><span><b>'+esc(customerLabel(b.customer))+' · '+esc(stylistById(b.stylistId).name)+'</b><small>'+b.time+' — '+esc(b.menuName)+' · '+esc(storeById(b.storeId)?.name||'')+'</small></span>'+attendancePill(b)+'</button>').join('');
    return pageHeader(system?'SYSTEM OVERVIEW':'STORE OVERVIEW',title,desc,actions)+'<div class="metric-grid">'+stats+'</div>'+
      '<div class="ops-grid-two"><section class="panel"><div class="panel-head"><div><h2>今日の予約</h2><p>'+longDate(0)+(system?' · '+(selectedStoreId==='all'?'全店舗':esc(storeById(selectedStoreId)?.name||'')):' · '+esc(storeById(selectedStoreId)?.name||''))+'</p></div><button class="text-action" data-page="reservations">すべて見る →</button></div><div class="schedule-list">'+list+'</div></section>'+
      '<section class="panel"><div class="panel-head"><div><h2>'+(system?'物件・屋号店舗':'来店状況')+'</h2><p>'+(system?'実店舗の物件と、オーナー別の屋号店舗':'施術記録・未来店記録を集計')+'</p></div><span class="status-pill">'+(system?'稼働中 '+stores.filter(x=>x.active).length+' 店舗':'更新済み')+'</span></div><div class="occupancy-body">'+(system?'<div class="tenant-summary">'+stores.map(store=>'<button class="tenant-summary-row" data-store-select="'+store.id+'"><b>'+esc(store.name)+'</b><small>'+esc(venueById(store.venueId)?.name||'')+' · '+esc(ownerById(store.ownerId)?.name||'')+' · '+bookings.filter(b=>b.storeId===store.id).length+'件</small></button>').join('')+'</div><div class="system-venue-shortcut"><button class="small-button" data-page="venues">実店舗を管理</button><button class="small-button" data-page="stores">屋号店舗を管理</button></div>':'<div class="attendance-summary">'+Object.entries(visitLabels).map(([key,label])=>'<div><span>'+label+'</span><b>'+allRecords.filter(b=>b.attendance===key).length+'件</b></div>').join('')+'</div>')+'</div></section></div>'+
      '<div class="ops-grid-two" style="margin-top:14px"><section class="panel"><div class="panel-head"><div><h2>次のお客さま</h2><p>予約を選ぶと連絡先と前回の記録を確認できます</p></div><button class="text-action" data-page="customers">顧客一覧 →</button></div><div class="upcoming-list">'+(up||'<div class="empty-state">確認できる予約はありません。</div>')+'</div></section><section class="panel"><div class="panel-head"><div><h2>予約・来店記録</h2><p>来店状況を記録して後から件数を確認できます</p></div></div><div class="occupancy-body"><div class="notice-box">予約カレンダーの予約を選ぶと、お客さまの電話番号、今回のメモ、過去の施術記録を確認・更新できます。</div><button class="small-button" data-page="customers">お客さま一覧を見る →</button></div></section></div>';
  }
  function calendarPage(){
    const d=dateInfo(opsDateOffset),events=displayBookings(opsDateOffset),viewSeats=seats.filter(item=>item.type==='セット面'&&recordInScope(item)),times=[10,11,12,13,14,15,16,17,18],cols='66px repeat('+Math.max(viewSeats.length,1)+', minmax(140px, 1fr))';
    const head='<div class="calendar-grid-head" style="grid-template-columns:'+cols+'"><div>時間</div>'+viewSeats.map(s=>'<div>'+(currentRole==='system'&&selectedStoreId==='all'?esc(storeById(s.storeId)?.name)+' · ':'')+esc(s.name)+'<br><small>'+esc(s.area)+'</small></div>').join('')+'</div>';
    const rows=times.map(hour=>'<div class="calendar-grid-row" style="grid-template-columns:'+cols+'"><div class="calendar-time">'+pad(hour)+':00</div>'+viewSeats.map(s=>{
      const b=events.find(x=>x.seatId===s.id&&x.storeId===s.storeId&&Math.floor(toMinutes(x.time)/60)===hour&&x.status!=='cancelled');
      if(!b)return '<div class="calendar-cell"><div class="calendar-empty">—</div></div>';
      const p=stylistById(b.stylistId),color=Math.max(0,stylists.findIndex(x=>x.id===p.id));
      return '<div class="calendar-cell"><button type="button" class="calendar-event color-'+color+'" data-booking-detail="'+b.id+'" aria-label="'+esc(b.time+' '+customerLabel(b.customer)+' 予約詳細')+'"><b>'+esc(b.time)+' · '+esc(customerLabel(b.customer))+'</b><small>'+esc(p.name)+' / '+b.duration+'分</small><small>'+attendancePill(b)+'</small></button></div>';
    }).join('')+'</div>').join('');
    const actions='<div class="calendar-toolbar"><button class="small-button" data-date-shift="-1">←</button><strong>'+d.month+'月'+d.day+'日 ('+d.weekday+')</strong><button class="small-button" data-date-shift="1">→</button><button class="small-button" data-date-today="true">今日</button></div>';
    return pageHeader('RESERVATION CALENDAR','予約カレンダー','予約を選ぶと連絡先・施術メモ・過去の来店履歴を確認できます。',actions)+'<div class="notice-box"><strong>確認方法：</strong>予約カードを選ぶと顧客詳細が開き、来店状況と今回のメモを記録できます。</div><div class="calendar-grid-wrap"><div class="calendar-grid">'+head+(rows||'<div class="calendar-grid-row"><div class="calendar-empty">店舗・セット面がありません</div></div>')+'</div></div>';
  }
  function reservationsPage(){
    const list=bookings.filter(recordInScope).slice().sort((a,b)=>a.date.localeCompare(b.date)||toMinutes(a.time)-toMinutes(b.time)),allStores=currentRole==='system'&&selectedStoreId==='all';
    const filters='<div class="filter-row"><label class="search-box"><span>⌕</span><input type="search" id="reservationSearch" placeholder="お客さま・スタッフ・メニューで検索"></label><select id="reservationDateFilter" class="filter-select"><option value="all">すべての日程</option><option value="'+dateKey(0)+'">今日</option><option value="'+dateKey(1)+'">明日</option></select><select id="reservationVisitFilter" class="filter-select"><option value="all">すべての来店状況</option>'+Object.entries(visitLabels).map(([key,label])=>'<option value="'+key+'">'+label+'</option>').join('')+'</select><select id="reservationStatusFilter" class="filter-select"><option value="all">すべての予約状態</option><option value="confirmed">予約確定</option><option value="cancelled">キャンセル</option></select></div>';
    const rows=list.map(b=>{const p=stylistById(b.stylistId),d=new Date(b.date+'T00:00:00'),search=[b.customer,p.name,b.menuName,b.seatId,storeById(b.storeId)?.name].join(' ').toLowerCase();return '<tr data-booking-row data-date="'+b.date+'" data-status="'+b.status+'" data-attendance="'+b.attendance+'" data-search="'+esc(search)+'">'+(allStores?'<td>'+esc(storeById(b.storeId)?.name||'')+'</td>':'')+'<td><span class="table-main">'+esc(b.id)+'</span></td><td>'+(d.getMonth()+1)+'月'+d.getDate()+'日 ('+weekdays[d.getDay()]+')<span class="table-sub">'+b.time+' · '+b.duration+'分</span></td><td><button class="table-customer" data-booking-detail="'+b.id+'">'+esc(customerLabel(b.customer))+'</button><span class="table-sub">電話 '+esc(b.phone)+'</span></td><td><span class="table-avatar">'+avatar(p)+'<span>'+esc(p.name)+'</span></span></td><td>'+esc(b.menuName)+'</td><td><span class="seat-chip">'+esc(seatById(b.seatId)?.name||b.seatId)+'</span></td><td>'+attendancePill(b)+'</td><td>'+status(b)+'</td><td>'+(b.status==='confirmed'?'<button class="table-action" data-cancel="'+b.id+'">取消</button>':'—')+'</td></tr>';}).join('');
    return pageHeader('BOOKINGS','予約一覧','予約・来店状況を確認し、顧客名から過去の施術記録を開けます。','<button class="small-button primary" data-page="calendar">カレンダーを見る</button>')+filters+'<div class="data-table-wrap"><table class="data-table"><thead><tr>'+(allStores?'<th>店舗</th>':'')+'<th>予約番号</th><th>日時</th><th>お客さま</th><th>担当スタッフ</th><th>メニュー</th><th>席</th><th>来店状況</th><th>予約状態</th><th></th></tr></thead><tbody id="reservationRows">'+rows+'</tbody></table></div>';
  }
  function availabilityPage(){
    const people=stylists.filter(person=>recordInScope({storeId:person.storeId})&&person.active!==false);
    if(currentRole==='staff')scheduleSubjectId=currentStaffId;
    else if(!people.some(person=>person.id===scheduleSubjectId))scheduleSubjectId=people[0]?.id||'';
    const subject=stylistById(scheduleSubjectId),canEdit=['owner','staff'].includes(currentRole);
    const selector=currentRole==='owner'?'<label class="schedule-subject-select">スケジュールを表示<select id="scheduleSubject">'+people.map(person=>'<option value="'+person.id+'" '+(person.id===scheduleSubjectId?'selected':'')+'>'+esc(person.name)+(stylistIsOwner(person)?'（オーナー）':'')+'</option>').join('')+'</select></label>':subject?'<div class="schedule-subject-chip">'+avatar(subject)+'<span>'+esc(subject.name)+'</span></div>':'';
    const week=Array.from({length:7},(_,i)=>dateInfo(scheduleWeekStart+i)),start=week[0],end=week[6],gridTimes=Array.from({length:24},(_,i)=>fromMinutes(540+i*30));
    const header='<tr><th class="schedule-time-head">時間</th>'+week.map(date=>'<th><span>'+date.month+'/'+date.day+'</span><small>('+date.weekday+')</small></th>').join('')+'</tr>';
    const body=gridTimes.map((time,row)=>'<tr><th class="schedule-time-label">'+(row%2===0?time:'')+'</th>'+week.map(date=>{
      const closed=isStoreClosed(subject?.storeId,date.key),inRange=staffSchedules.some(rule=>rule.staffId===scheduleSubjectId&&rule.date===date.key&&toMinutes(time)>=toMinutes(rule.start)&&toMinutes(time)<toMinutes(rule.end));
      const booked=bookings.some(booking=>booking.storeId===subject?.storeId&&booking.stylistId===scheduleSubjectId&&booking.date===date.key&&booking.status==='confirmed'&&toMinutes(time)<bookingEnd(booking)&&toMinutes(time)+30>toMinutes(booking.time));
      const locked=closed||booked||!canEdit;
      return '<td><button type="button" class="schedule-cell '+(inRange?'is-available':'')+(booked?' is-booked':'')+(closed?' is-closed':'')+'" data-schedule-cell data-date="'+date.key+'" data-row="'+row+'" data-available="'+inRange+'" '+(locked?'disabled':'')+' aria-label="'+date.month+'月'+date.day+'日 '+time+(booked?' 予約あり':closed?' 店舗休業日':inRange?' 空き時間':' 空き時間にする')+'">'+(booked?'予約':closed?'休業':inRange?'○':'')+'</button></td>';
    }).join('')+'</tr>').join('');
    const weekNav='<div class="schedule-week-nav"><button type="button" class="small-button" data-schedule-shift="-7" '+(scheduleWeekStart<=0?'disabled':'')+'>← 前の週</button><strong>'+start.month+'月'+start.day+'日 〜 '+end.month+'月'+end.day+'日</strong><button type="button" class="small-button" data-schedule-shift="7">次の週 →</button></div>';
    const explanation=canEdit?'セルを押したまま上下にドラッグすると、時間帯をまとめて登録・解除できます。予約済みの時間と店舗休業日は変更できません。':'閲覧のみです。空き時間の編集は店舗管理者またはスタッフ本人が行います。';
    return pageHeader('STAFF SCHEDULE','勤務スケジュール','予約を受け付ける日と時間を、日付ごとに登録します。予約可能枠はメニュー所要時間・予約状況・店舗設備をあわせて判定します。')+'<section class="panel schedule-editor-panel"><div class="schedule-editor-toolbar">'+selector+weekNav+'</div><p class="schedule-instructions">'+explanation+'</p><div class="schedule-grid-scroll"><table class="schedule-grid"><thead>'+header+'</thead><tbody>'+body+'</tbody></table></div><div class="schedule-legend"><span><i class="legend-open">○</i>受付時間</span><span><i class="legend-booked">予</i>予約済み</span><span><i class="legend-closed">休</i>店舗休業</span></div></section>';
  }
  function stylistIsOwner(person){if(person?.ownerProfile)return true;const store=storeById(person?.storeId),owner=ownerById(store?.ownerId);return !!owner&&owner.name.replace(/\s/g,'')===String(person?.name||'').replace(/\s/g,'');}
  function storeClosuresPage(){
    const scopedStores=storesInScope(),items=storeClosures.filter(item=>recordInScope({storeId:item.storeId})).sort((a,b)=>a.date.localeCompare(b.date)),rows=items.map(item=>{const date=new Date(item.date+'T00:00:00');return '<tr><td>'+date.getFullYear()+'年'+(date.getMonth()+1)+'月'+date.getDate()+'日 ('+weekdays[date.getDay()]+')</td><td>'+esc(storeById(item.storeId)?.name||'')+'</td><td>'+esc(item.reason||'店舗休業')+'</td><td>'+(['owner','system'].includes(currentRole)?'<button type="button" class="table-action" data-delete-closure="'+item.id+'">解除</button>':'—')+'</td></tr>';}).join('');
    const form=['owner','system'].includes(currentRole)?'<section class="panel closure-form-panel"><div class="panel-head"><div><h2>休業日を追加</h2><p>年末年始やゴールデンウィークなど、休業する期間をまとめて設定できます。</p></div></div><form id="storeClosureForm" class="closure-form">'+(currentRole==='system'?'<label>店舗<select name="storeId">'+scopedStores.map(store=>'<option value="'+store.id+'">'+esc(store.name)+'</option>').join('')+'</select></label>':'<input type="hidden" name="storeId" value="'+esc(scopedStores[0]?.id||'')+'">')+'<label>開始日<input type="date" name="startDate" min="'+dateKey(0)+'" required></label><label>終了日<input type="date" name="endDate" min="'+dateKey(0)+'" required></label><label>メモ（任意）<input name="reason" placeholder="例）年末年始"></label><button type="submit" class="small-button primary">期間を休業日にする</button></form></section>':'<div class="notice-box">店舗休業日の登録・解除は店舗管理者が行います。</div>';
    return pageHeader('STORE CLOSURES','店舗休業日','店舗全体の休みを日付単位で管理します。休業日はスタッフの勤務スケジュールにかかわらず、お客さまの予約画面で予約不可になります。')+form+'<section class="panel closure-list-panel"><div class="panel-head"><div><h2>登録済みの休業日</h2><p>休業日にスタッフの空き時間を公開することはできません。</p></div></div><div class="data-table-wrap"><table class="data-table"><thead><tr><th>日付</th><th>店舗</th><th>メモ</th><th></th></tr></thead><tbody>'+(rows||'<tr><td class="empty-table-cell" colspan="4">休業日は登録されていません。</td></tr>')+'</tbody></table></div></section>';
  }
  function stylistsPage(){
    const people=stylists.filter(person=>recordInScope({storeId:person.storeId})&&person.active!==false),archived=stylists.filter(person=>recordInScope({storeId:person.storeId})&&person.active===false),cards=people.map(person=>stylistCardMarkup(person,false,true)).join('');
    const addButton='<button class="small-button primary" type="button" data-add-staff '+(currentRole==='system'&&selectedStoreId==='all'?'disabled':'')+'>スタッフを登録する</button>',notice=currentRole==='system'&&selectedStoreId==='all'?'<div class="notice-box">登録する店舗を右上の店舗選択で指定してください。</div>':'';
    const archivedSection=archived.length?'<details class="archived-staff"><summary>予約ページに非公開のスタッフ（'+archived.length+'名）</summary><div>'+archived.map(person=>'<div class="archived-staff-row"><span>'+esc(person.name)+'</span><button class="table-action" type="button" data-edit-staff="'+person.id+'">プロフィール編集</button><button class="table-action" type="button" data-restore-staff="'+person.id+'">予約ページに再公開</button></div>').join('')+'</div></details>':'';
    return pageHeader('TEAM','スタッフ','予約ページに表示するプロフィールです。店舗管理者はスタッフを登録・編集・非公開にできます。',addButton)+notice+'<div class="resource-grid staff-card-grid">'+(cards||'<div class="empty-state">登録済みのスタッフはいません。</div>')+'</div>'+archivedSection;
  }
  function staffProfilePage(){
    const person=stylistById(currentStaffId);if(!person||person.storeId!==selectedStoreId)return '<div class="notice-box">プロフィールを確認できませんでした。</div>';
    return pageHeader('MY PROFILE','プロフィール','予約ページに表示するご自身のプロフィールと予約通知を設定します。')+'<div class="resource-grid staff-card-grid staff-self-profile">'+stylistCardMarkup(person,false,true)+'</div><section class="panel line-profile-panel"><div class="panel-head"><div><h2>予約通知先</h2><p>予約が入るとログイン用メールアドレスにも通知します。LINEを連携するとLINEにも届きます。</p><p class="staff-notification-email">通知先メール：<strong>'+esc(person.email||'未登録')+'</strong></p></div><span class="status-pill '+(person.lineLinked?'':'pending')+'">LINE '+(person.lineLinked?'連携済み（デモ）':'未連携')+'</span></div><button type="button" class="small-button primary" data-edit-staff="'+person.id+'">プロフィール・通知先を設定</button><p class="small-muted">このモックではメール・LINEを送信しません。実際の通知にはメール配信とLINE公式アカウントのサーバー設定が必要です。</p></section>';
  }
  function seatsPage(){
    const allStores=currentRole==='system'&&selectedStoreId==='all',items=seats.filter(recordInScope),rows=items.map(item=>'<tr>'+(allStores?'<td>'+esc(storeById(item.storeId)?.name||'')+'</td>':'')+'<td><span class="table-main">'+esc(item.name)+'</span><span class="table-sub">'+esc(item.id)+'</span></td><td>'+esc(item.type||'設備')+'</td><td>'+esc(item.area||'未設定')+'</td><td><span class="status-pill '+(item.active===false?'cancelled':'')+'">'+(item.active===false?'停止中':'利用可')+'</span></td></tr>').join('');
    const storeId=selectedStoreId==='all'?'':selectedStoreId,form=storeId?'<section class="panel equipment-create-panel"><div class="panel-head"><div><h2>店舗設備を登録</h2><p>セット面は予約時に空き状況を自動で確認します。</p></div></div><form id="equipmentCreateForm" class="equipment-create-form"><input type="hidden" name="storeId" value="'+esc(storeId)+'"><label>設備名<input name="name" placeholder="例）セット面 03" required></label><label>設備区分<select name="type"><option>セット面</option><option>その他</option></select></label><label>設置場所<input name="area" placeholder="例）窓側"></label><button type="submit" class="small-button primary">設備を登録</button></form></section>':'<div class="notice-box">登録する店舗を右上の店舗選択で指定してください。</div>';
    return pageHeader('SALON EQUIPMENT','店舗設備','セット面やシャンプー台など、店舗で利用する設備を登録します。スタッフと席は事前に組み合わせません。','')+'<section class="panel equipment-list-panel"><div class="panel-head"><div><h2>設備一覧</h2><p>予約確定時に利用可能なセット面を自動で割り当てます。</p></div><span class="status-pill">'+items.length+' 件</span></div><div class="data-table-wrap"><table class="data-table"><thead><tr>'+(allStores?'<th>店舗</th>':'')+'<th>設備名</th><th>区分</th><th>設置場所</th><th>状態</th></tr></thead><tbody>'+(rows||'<tr><td class="empty-table-cell" colspan="'+(allStores?5:4)+'">登録済みの設備はありません。</td></tr>')+'</tbody></table></div></section>'+form;
  }
  function menusPage(){
    const allStores=currentRole==='system'&&selectedStoreId==='all',rows=menus.filter(recordInScope).map(m=>'<tr>'+(allStores?'<td>'+esc(storeById(m.storeId)?.name||'')+'</td>':'')+'<td><span class="table-main">'+esc(m.name)+'</span><span class="table-sub">'+esc(m.detail)+'</span></td><td>'+m.duration+'分</td><td>'+yen(m.price)+'</td><td>15分</td><td><span class="status-pill">公開中</span></td><td><button class="table-action" data-action="edit-menu">編集</button></td></tr>').join('');
    return pageHeader('SERVICE MENU','施術メニュー','現在選択中の店舗で受け付けるメニューを確認します。','<button class="small-button primary" data-action="add-menu">メニューを追加</button>')+'<div class="notice-box"><strong>時間の扱い：</strong>デモでは施術時間に15分の片付け時間を加えて予約枠を判定します。</div><div class="data-table-wrap"><table class="data-table"><thead><tr>'+(allStores?'<th>店舗</th>':'')+'<th>メニュー</th><th>施術時間</th><th>料金目安</th><th>後片付け</th><th>公開状態</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>';
  }
  function customersPage(){
    const map=new Map(),records=bookings.filter(recordInScope),activeRecords=records.filter(b=>b.status!=='cancelled'),totals=Object.fromEntries(Object.keys(visitLabels).map(key=>[key,activeRecords.filter(b=>b.attendance===key).length]));
    activeRecords.slice().sort((a,b)=>a.date.localeCompare(b.date)||toMinutes(a.time)-toMinutes(b.time)).forEach(b=>{const key=b.storeId+'|'+customerPhoneKey(b.phone),c=map.get(key)||{storeId:b.storeId,name:b.customer,phone:b.phone,count:0,completed:0,contacted:0,uncontacted:0,last:b.date,note:b.note,lastBookingId:b.id,attendance:b.attendance};c.count++;if(b.attendance==='completed')c.completed++;if(b.attendance==='no_show_contacted')c.contacted++;if(b.attendance==='no_show_uncontacted')c.uncontacted++;c.name=b.customer;c.phone=b.phone;c.last=b.date;c.note=b.note;c.lastBookingId=b.id;c.attendance=b.attendance;map.set(key,c);});
    const allStores=currentRole==='system'&&selectedStoreId==='all';
    const cards=Object.entries(visitLabels).map(([key,label])=>metric(label,totals[key],'件','▦','全記録')).join('');
    const rows=[...map.values()].sort((a,b)=>b.last.localeCompare(a.last)).map(c=>{const d=new Date(c.last+'T00:00:00'),search=[c.name,c.phone,storeById(c.storeId)?.name||''].join(' ').toLowerCase();return '<tr data-customer-row data-attendance="'+c.attendance+'" data-search="'+esc(search)+'">'+(allStores?'<td>'+esc(storeById(c.storeId)?.name||'')+'</td>':'')+'<td><button class="table-customer" data-booking-detail="'+c.lastBookingId+'">'+esc(customerLabel(c.name))+'</button><span class="table-sub">会員登録なし · 電話番号で照合</span></td><td>'+esc(c.phone)+'</td><td>'+c.count+' 件</td><td>施術済み '+c.completed+' · 未来店（連絡あり） '+c.contacted+' · 未来店（連絡なし） '+c.uncontacted+'</td><td>'+(d.getMonth()+1)+'月'+d.getDate()+'日</td><td>'+(c.note?esc(c.note):'<span style="color:#a3a79f">記録なし</span>')+'</td></tr>';}).join('');
    return pageHeader('CUSTOMER RECORDS','お客さま情報','予約カレンダーから来店結果と施術メモを記録し、顧客ごとの履歴を確認できます。','<button class="small-button">CSVを出力</button>')+'<div class="metric-grid customer-status-metrics">'+cards+'</div><div class="notice-box"><strong>記録の単位：</strong>予約ごとに施術済み／未来店（連絡あり）／未来店（連絡なし）を記録します。予約前は「来店前」として数え、自由記述メモも来店履歴に残します。</div><div class="filter-row"><label class="search-box"><span>⌕</span><input type="search" id="customerSearch" placeholder="お客さま名・電話番号で検索"></label><select id="customerVisitFilter" class="filter-select"><option value="all">すべての来店状況</option>'+Object.entries(visitLabels).map(([key,label])=>'<option value="'+key+'">'+label+'</option>').join('')+'</select></div><div class="data-table-wrap"><table class="data-table"><thead><tr>'+(allStores?'<th>店舗</th>':'')+'<th>お客さま</th><th>電話番号</th><th>予約数</th><th>来店結果の内訳</th><th>最終予約</th><th>直近の施術メモ</th></tr></thead><tbody id="customerRows">'+rows+'</tbody></table></div>';
  }
  let selectedDetailBookingId=null,detailPreviousFocus=null;
  function openBookingDetail(id){
    if(currentRole==='staff')return;const booking=bookings.find(item=>item.id===id);if(!booking||!bookingInScope(booking))return;
    selectedDetailBookingId=id;detailPreviousFocus=document.activeElement;
    const customerHistory=bookings.filter(item=>item.storeId===booking.storeId&&customerPhoneKey(item.phone)===customerPhoneKey(booking.phone)&&item.status!=='cancelled').sort((a,b)=>b.date.localeCompare(a.date)||toMinutes(b.time)-toMinutes(a.time));
    const date=new Date(booking.date+'T00:00:00'),person=stylistById(booking.stylistId),now=new Date(),visitDue=booking.date<dateKey(0)||(booking.date===dateKey(0)&&toMinutes(booking.time)<=now.getHours()*60+now.getMinutes());
    const history=customerHistory.map(item=>{const d=new Date(item.date+'T00:00:00');return '<article class="history-row"><div class="history-date">'+(d.getMonth()+1)+'月'+d.getDate()+'日 · '+esc(item.time)+'</div><div class="history-main"><b>'+esc(item.menuName)+' · '+esc(stylistById(item.stylistId)?.name||'')+'</b>'+attendancePill(item)+'</div>'+(item.note?'<p>'+esc(item.note)+'</p>':'')+'</article>';}).join('');
    const canRecordVisit=booking.status!=='cancelled'&&visitDue,options=(canRecordVisit?Object.entries(visitLabels):[[booking.attendance||'upcoming',visitLabels[booking.attendance]||visitLabels.upcoming]]).map(([key,label])=>'<option value="'+key+'" '+(booking.attendance===key?'selected':'')+'>'+label+'</option>').join('');
    const recordNotice=booking.status==='cancelled'?'この予約はキャンセル済みのため、来店実績は記録できません。':!visitDue?'来店予定です。予約時間を過ぎると来店実績を記録できます。':'';
    el('#customerDetailContent').innerHTML='<div class="detail-booking-meta"><span>'+((date.getMonth()+1)+'月'+date.getDate()+'日 ('+weekdays[date.getDay()]+') '+esc(booking.time))+'</span><span>'+esc(storeById(booking.storeId)?.name||'')+'</span></div><h2>'+esc(customerLabel(booking.customer))+'</h2><p class="detail-phone"><a href="tel:'+esc(booking.phone)+'">'+esc(booking.phone)+'</a></p><div class="detail-facts"><div><small>担当スタッフ</small><b>'+esc(person?.name||'')+'</b></div><div><small>メニュー</small><b>'+esc(booking.menuName)+' · '+booking.duration+'分</b></div><div><small>予約番号</small><b>'+esc(booking.id)+'</b></div></div>'+(recordNotice?'<div class="notice-box detail-record-notice">'+recordNotice+'</div>':'')+'<label class="field-label detail-field">今回の来店状況<select id="detailAttendance" '+(canRecordVisit?'':'disabled')+'>'+options+'</select></label><label class="field-label detail-field">今回の施術メモ<textarea id="detailNote" rows="4" placeholder="施術内容・次回への申し送り" '+(booking.status==='cancelled'?'disabled':'')+'>'+esc(booking.note||'')+'</textarea></label><section class="customer-history"><div class="history-heading"><h3>この店舗の予約・来店履歴</h3><span>'+customerHistory.length+'件</span></div>'+(history||'<div class="empty-state">履歴はありません。</div>')+'</section>';
    el('#saveCustomerRecord').disabled=booking.status==='cancelled';el('#customerDetailOverlay').hidden=false;document.body.classList.add('modal-open');el('#closeCustomerDetail').focus();
  }
  function closeCustomerDetail(){el('#customerDetailOverlay').hidden=true;document.body.classList.remove('modal-open');selectedDetailBookingId=null;if(detailPreviousFocus?.isConnected)detailPreviousFocus.focus();detailPreviousFocus=null;}
  function saveCustomerRecord(){
    if(currentRole==='staff')return;const booking=bookings.find(item=>item.id===selectedDetailBookingId);if(!booking||!bookingInScope(booking))return;
    if(booking.status==='cancelled')return;const now=new Date(),visitDue=booking.date<dateKey(0)||(booking.date===dateKey(0)&&toMinutes(booking.time)<=now.getHours()*60+now.getMinutes());booking.attendance=visitDue?el('#detailAttendance').value:'upcoming';booking.note=el('#detailNote').value.trim();saveDemoState();closeCustomerDetail();renderOps();showToast('来店状況と施術メモを保存しました。');
  }
  function billingPage(){
    if(currentRole==='owner')return pageHeader('SALON BILLING','利用料・請求','席利用料とシステムの月額利用料を分けて管理します。','<button class="small-button">請求一覧を見る</button>')+'<div class="metric-grid">'+metric('今月の施設利用料','¥36,000','','¥','スタッフ1名分 · 予定額')+metric('未入金','¥0','','!','期限内')+metric('今月の予約売上','¥248,600','','↗','施術代は美容師が受領')+metric('システム利用料','¥25,000','','▤','1オーナー・1店舗の想定額')+'</div><div class="billing-note"><div><b>① シェアサロンの席利用料</b><p>施設運営者から美容師へ時間貸しや月次利用料を請求します。施術代とは別の契約・台帳として管理する想定です。</p></div><div><b>② 予約システム利用料</b><p>初期は1オーナー・1店舗あたり月額2万〜3万円を想定しています。2店舗目以降の料金は本実装前に確定します。</p></div><div><b>③ お客さまの施術代</b><p>デモでは来店時に美容師が直接受け取ります。オンライン決済・プラットフォーム分配は未実装です。</p></div><div><b>本実装時の注意</b><p>資金の流れを混ぜると返金・未収・精算が複雑になります。販売者、決済、領収書、返金負担を先に決めます。</p></div></div>';
    return pageHeader('PLAN & REVENUE','プラン・売上','予約システム利用料と施術代の受け取りを分けて確認します。','<button class="small-button">利用明細をダウンロード</button>')+'<section class="plan-card"><div><div class="page-kicker">CURRENT PLAN · MONTHLY</div><h2>knot. スタンダード</h2><p>予約受付 · スタッフ勤務管理・セット面自動割当 · 顧客メモ · LINE通知</p></div><div class="plan-price"><strong>¥25,000</strong><small>税別 / 月 · デモ料金</small></div></section><div class="metric-grid">'+metric('今月の施術売上','¥248,600','','¥','お客さまから直接受け取り')+metric('今月の予約数','42','件','▦','キャンセル 2件を含む')+metric('シェアサロン利用料','¥36,000','','◒','利用した席・時間の合計')+metric('次回請求日','10/01','','↻','スタンダード · 自動更新')+'</div><div class="billing-note"><div><b>システム利用料</b><p>初期は1オーナー・1店舗あたり月額2万〜3万円を想定しています。2店舗目以降の料金は本実装前に確定します。</p></div><div><b>お客さまの施術代</b><p>施術代は美容師の売上です。デモでは店頭払いとし、プラットフォームは決済を預かりません。</p></div></div>';
  }
  function messagesPage(){
    const store=selectedStoreId==='all'?null:storeById(selectedStoreId),storeName=store?.name||'店舗名',person=stylists.find(item=>item.storeId===store?.id),personName=person?.name||'担当美容師',address=store?.address||'店舗所在地';
    return pageHeader('MESSAGES & REMINDERS','LINE・通知','予約確認や前日のリマインドを、必要な連絡だけに絞って届けます。','<button class="small-button primary" id="sendLineSample">テスト通知を送る</button>')+'<div class="ops-grid-two"><section class="panel"><div class="panel-head"><div><h2>お客さまへの予約通知</h2><p>予約成立・前日リマインド・変更のお知らせ</p></div><span class="status-pill">設定中</span></div><div class="occupancy-body"><div class="setting-row"><span>予約成立メール</span><span class="toggle"></span></div><div class="setting-row"><span>前日リマインド</span><span class="toggle"></span></div><div class="setting-row"><span>LINE通知（友だち追加した方のみ）</span><span class="toggle"></span></div><div class="setting-row"><span>通知タイミング</span><select><option>前日の 18:00</option></select></div><div class="notice-box" style="margin-top:12px">LINE通知にはお客さまの同意とLINE公式アカウントの設定が必要です。友だち追加なしでも予約できます。</div></div></section><section class="panel"><div class="panel-head"><div><h2>通知メッセージのイメージ</h2><p>予約後に届くお知らせのデモ</p></div></div><div class="occupancy-body"><div class="message-preview"><div class="message-preview-head"><span class="line-mark">LINE</span><div><b>'+esc(storeName)+'</b><small>公式アカウント · 今</small></div></div><div class="chat-bubble">ご予約ありがとうございます ✂<br><br>担当：'+esc(personName)+'<br>日時：9月27日 14:00<br>メニュー：カット<br>場所：'+esc(address)+'<br><br>変更・キャンセルはこのトークからご連絡ください。</div></div></div></section></div>';
  }
  function venuesPage(){
    if(currentRole!=='system')return '<div class="notice-box">この画面を表示する権限がありません。</div>';
    const editing=venueById(selectedVenueId),rows=venues.map(venue=>'<tr><td><span class="table-main">'+esc(venue.name)+'</span><span class="table-sub">'+esc(venue.address)+'</span></td><td>'+stores.filter(store=>store.venueId===venue.id).length+' 店舗</td><td><span class="status-pill '+(venue.active?'':'cancelled')+'">'+(venue.active?'利用中':'停止中')+'</span></td><td><button class="table-action" data-venue-edit="'+venue.id+'">実店舗情報を編集</button></td></tr>').join('');
    const field=(label,name,value,placeholder,required=true)=>'<label class="field-label">'+label+'<input name="'+name+'" value="'+esc(value||'')+'" placeholder="'+placeholder+'" '+(required?'required':'')+'></label>';
    return pageHeader('PHYSICAL LOCATIONS','実店舗管理','シェアサロンの物件・住所・アクセスを管理します。ここへ複数の屋号店舗を紐付けられます。','<button class="small-button" data-page="overview">全体状況へ戻る</button>')+'<div class="data-table-wrap"><table class="data-table"><thead><tr><th>実店舗（物件）</th><th>紐付く屋号店舗</th><th>状態</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div><section class="panel store-create-panel"><div class="panel-head"><div><h2>'+(editing?'実店舗情報を編集':'実店舗を登録')+'</h2><p>住所とアクセスは物件に登録し、配下の屋号店舗の予約ページで共通表示します。</p></div></div><form id="venueCreateForm" class="store-form"><input type="hidden" name="venueId" value="'+esc(editing?.id||'')+'">'+field('実店舗名','name',editing?.name,'例）シェアサロン 中目黒')+field('住所','address',editing?.address,'東京都目黒区上目黒 1-1-1')+field('アクセス','access',editing?.access,'最寄駅から徒歩5分',false)+field('施設連絡先','contact',editing?.contact,'電話番号',false)+(editing?'<label class="field-label">利用状態<select name="active"><option value="true" '+(editing.active?'selected':'')+'>利用中</option><option value="false" '+(!editing.active?'selected':'')+'>停止中</option></select></label>':'')+'<div class="store-form-actions">'+(editing?'<button class="small-button" type="button" data-clear-venue-edit>新規登録に戻る</button>':'')+'<button class="small-button primary" type="submit">'+(editing?'実店舗情報を保存':'実店舗を登録')+'</button></div></form></section>';
  }
  function storesPage(){
    if(currentRole!=='system')return '<div class="notice-box">この画面を表示する権限がありません。</div>';
    const rows=stores.map(store=>'<tr><td><span class="table-main">'+esc(store.name)+'</span><span class="table-sub">予約ページに表示する屋号</span></td><td>'+esc(venueById(store.venueId)?.name||'未割当')+'<span class="table-sub">'+esc(venueById(store.venueId)?.address||store.address||'')+'</span></td><td>'+esc(ownerById(store.ownerId)?.name||'未割当')+'<span class="table-sub">'+esc(ownerById(store.ownerId)?.email||'')+'</span></td><td><span class="status-pill '+(store.active?'':'cancelled')+'">'+(store.active?'契約中':'停止中')+'</span></td><td><button class="table-action" data-store-edit="'+store.id+'">店舗情報を編集</button></td></tr>').join('');
    const ownerOptions=owners.map(owner=>'<option value="'+owner.id+'">'+esc(owner.name)+' · '+esc(owner.email)+'</option>').join(''),venueOptions=venues.filter(venue=>venue.active).map(venue=>'<option value="'+venue.id+'">'+esc(venue.name)+'</option>').join('');
    return pageHeader('TENANT SHOPS','店舗管理','屋号店舗を実店舗へ紐付け、契約オーナーのメールアカウントを設定します。','<button class="small-button" data-page="venues">実店舗を管理</button>')+'<div class="data-table-wrap"><table class="data-table"><thead><tr><th>屋号店舗</th><th>実店舗（物件）</th><th>契約オーナー</th><th>契約状態</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div><section class="panel store-create-panel"><div class="panel-head"><div><h2>屋号店舗を登録</h2><p>オーナーはメールアドレスでログインし、所属店舗のスタッフ・設備・予約を管理します。</p></div></div>'+(venues.length?'<form id="storeCreateForm" class="store-form"><label class="field-label">店舗名（屋号）<input name="name" placeholder="例）SCENE 中目黒店" required></label><label class="field-label">実店舗（物件）<select name="venueId" required>'+venueOptions+'</select></label><label class="field-label">予約・店舗連絡先<input name="contact" type="tel" placeholder="電話番号" required></label><label class="field-label">契約オーナー<select name="ownerId" id="newOwnerSelect">'+ownerOptions+'<option value="new">新しいオーナーを登録</option></select></label><div class="new-owner-fields" id="newOwnerFields" hidden><label class="field-label">オーナー名<input name="newOwnerName" placeholder="氏名"></label><label class="field-label">ログイン用メールアドレス<input name="newOwnerEmail" type="email" placeholder="owner@example.jp"></label></div><button class="small-button primary" type="submit">屋号店舗を登録</button></form>':'<div class="notice-box">先に「実店舗管理」から物件を登録してください。</div>')+'</section>';
  }
  function createStore(event){
    event.preventDefault();if(currentRole!=='system'){showToast('店舗登録はシステム管理者のみ操作できます。');return;}
    const data=new FormData(event.currentTarget),storeId='store-'+Date.now(),venue=venueById(String(data.get('venueId')));let ownerId=String(data.get('ownerId'));
    if(!venue||!venue.active){showToast('利用中の実店舗を選択してください。');return;}
    if(ownerId==='new'){
      const name=String(data.get('newOwnerName')||'').trim(),email=String(data.get('newOwnerEmail')||'').trim().toLowerCase();if(!name||!email){showToast('新しいオーナーの氏名とログイン用メールアドレスを入力してください。');return;}
      if([...owners,...stylists].some(account=>String(account.email||'').toLowerCase()===email)){showToast('このメールアドレスは別のアカウントで使用されています。');return;}
      ownerId='owner-'+Date.now();owners.push({id:ownerId,name,email,loginStatus:'setup_sent'});
    }
    const store={id:storeId,ownerId,venueId:venue.id,name:String(data.get('name')).trim(),address:venue.address,access:venue.access,contact:String(data.get('contact')).trim(),active:true};stores.push(store);
    menuTemplates.forEach(template=>menus.push({...template,id:storeId+'-'+template.id,templateId:template.id,storeId}));
    selectedStoreId=storeId;saveDemoState();renderOps();showToast('屋号店舗を登録しました。オーナーのログイン設定メールを送信しました（デモ）。');
  }
  function saveVenue(event){
    event.preventDefault();if(currentRole!=='system'){showToast('実店舗の登録・編集はシステム管理者のみ操作できます。');return;}
    const data=new FormData(event.currentTarget),id=String(data.get('venueId')||''),venue=id?venueById(id):null,name=String(data.get('name')).trim(),address=String(data.get('address')).trim();
    if(id&&!venue){showToast('実店舗を確認できませんでした。');return;}
    const goingInactive=venue&&venue.active&&String(data.get('active'))==='false',affectedShops=goingInactive?stores.filter(store=>store.venueId===id&&store.active):[];
    if(affectedShops.length&&!window.confirm('この実店舗の利用を停止し、紐付く屋号店舗 '+affectedShops.length+' 店の予約受付も停止します。続けますか？'))return;
    if(venue){Object.assign(venue,{name,address,access:String(data.get('access')||'').trim(),contact:String(data.get('contact')||'').trim(),active:String(data.get('active'))!=='false'});stores.filter(store=>store.venueId===id).forEach(store=>{store.address=venue.address;store.access=venue.access;if(!venue.active)store.active=false;});}
    else {const newVenue={id:'venue-'+Date.now(),name,address,access:String(data.get('access')||'').trim(),contact:String(data.get('contact')||'').trim(),active:true};venues.push(newVenue);selectedVenueId='';}
    saveDemoState();renderOps();showToast(venue?'実店舗情報を更新しました。':'実店舗を登録しました。');
  }
  function settingsPage(){
    if(currentRole==='system'&&selectedStoreId==='all')return pageHeader('SHOP PROFILE','店舗情報','編集する店舗を上部の店舗選択から指定してください。')+'<div class="notice-box">すべての店舗を選択中です。屋号店舗を選ぶと、店舗名・実店舗との紐付け・連絡先・オーナー・契約状態を編集できます。</div>';
    const store=storeById(selectedStoreId);if(!store||!recordInScope({storeId:store.id}))return '<div class="notice-box">この店舗情報を表示する権限がありません。</div>';
    const venue=venueById(store.venueId),venueField=currentRole==='system'?'<label class="field-label">実店舗（物件）<select name="venueId">'+venues.map(item=>'<option value="'+item.id+'" '+(item.id===store.venueId?'selected':'')+' '+(!item.active?'disabled':'')+'>'+esc(item.name)+(item.active?'':'（停止中）')+'</option>').join('')+'</select></label>':'<div class="field-label">実店舗（物件）<div class="read-only-value">'+esc(venue?.name||'未割当')+' · '+esc(venue?.address||store.address||'')+'</div></div>';
    const ownerSelect=currentRole==='system'?'<label class="field-label">契約オーナー<select name="ownerId">'+owners.map(owner=>'<option value="'+owner.id+'" '+(owner.id===store.ownerId?'selected':'')+'>'+esc(owner.name)+' · '+esc(owner.email)+'</option>').join('')+'</select></label>':'<div class="field-label">契約オーナー<div class="read-only-value">'+esc(ownerById(store.ownerId)?.name||'')+'</div></div>',contractStatus=currentRole==='system'?'<label class="field-label">契約状態<select name="active"><option value="true" '+(store.active?'selected':'')+'>契約中</option><option value="false" '+(!store.active?'selected':'')+'>停止中</option></select></label>':'';
    return pageHeader('SHOP PROFILE','店舗情報','屋号店舗の予約ページ表示と契約情報を管理します。')+'<form id="storeSettingsForm" class="store-settings-form"><input type="hidden" name="storeId" value="'+esc(store.id)+'"><label class="field-label">店舗名（屋号）<input name="name" value="'+esc(store.name)+'" required></label>'+venueField+'<label class="field-label">予約・店舗連絡先<input name="contact" value="'+esc(store.contact)+'" required></label>'+ownerSelect+contractStatus+'<div class="store-form-actions"><button class="small-button" data-page="'+(currentRole==='system'?'stores':'overview')+'" type="button">'+(currentRole==='system'?'店舗一覧へ戻る':'状況へ戻る')+'</button><button class="small-button primary" type="submit">変更を保存</button></div></form>';
  }
  function saveStoreSettings(event){
    event.preventDefault();if(!['owner','system'].includes(currentRole))return;const data=new FormData(event.currentTarget),store=storeById(String(data.get('storeId')));if(!store||!recordInScope({storeId:store.id}))return;
    const nextVenue=currentRole==='system'?venueById(String(data.get('venueId'))):venueById(store.venueId),nextActive=currentRole==='system'?String(data.get('active'))==='true':store.active;
    if(nextActive&&nextVenue&&!nextVenue.active){showToast('停止中の実店舗には利用中の屋号店舗を登録できません。');return;}
    store.name=String(data.get('name')).trim();store.contact=String(data.get('contact')).trim();if(currentRole==='system'){store.active=nextActive;store.ownerId=String(data.get('ownerId'));const venue=nextVenue;if(venue){store.venueId=venue.id;store.address=venue.address;store.access=venue.access;}}
    saveDemoState();renderOps();showToast('店舗情報を保存しました。');
  }
  function pageContent(page){return ({overview:overviewPage,calendar:calendarPage,reservations:reservationsPage,availability:availabilityPage,closures:storeClosuresPage,profile:staffProfilePage,stylists:stylistsPage,seats:seatsPage,menus:menusPage,customers:customersPage,stores:storesPage,venues:venuesPage,billing:billingPage,messages:messagesPage,settings:settingsPage}[page]||overviewPage)();}
  function titleFor(page){return ({overview:currentRole==='owner'?'店舗の状況':'全体状況',calendar:'予約カレンダー',reservations:'予約一覧',availability:'勤務スケジュール',closures:'店舗休業日',profile:'プロフィール',stylists:'スタッフ',seats:'店舗設備',menus:'施術メニュー',customers:'お客さま情報',stores:'店舗管理',venues:'実店舗管理',billing:currentRole==='owner'?'利用料・請求':'契約・利用料',messages:'LINE・通知',settings:'店舗情報'})[page]||'ホーム';}
  function renderOps(){if(currentRole==='staff'&&!['availability','profile'].includes(currentOpsPage))currentOpsPage='availability';renderNav();el('#opsToday').textContent=longDate(0);el('#breadcrumbTitle').textContent=titleFor(currentOpsPage);el('#opsContent').innerHTML=pageContent(currentOpsPage);}
  function changePage(page){if(currentRole==='staff'&&!['availability','profile'].includes(page)){showToast('スタッフは勤務スケジュールと自分のプロフィールを利用できます。');return;}currentOpsPage=page;renderOps();el('.ops-main').scrollIntoView({behavior:'smooth',block:'start'});}
  function saveStaffSchedule(event){
    event.preventDefault();showToast('カレンダー上をドラッグして空き時間を登録してください。');
  }
  function removeStaffSchedule(id,day){
    if(currentRole==='staff'&&id&&day!==undefined)showToast('勤務時間はカレンダーでドラッグして変更してください。');
  }
  function scheduleDragStart(cell){if(!cell||cell.disabled)return;const row=Number(cell.dataset.row);scheduleDrag={date:cell.dataset.date,start:row,end:row,mode:cell.dataset.available==='true'?'remove':'add'};paintScheduleDrag();}
  function scheduleDragMove(cell){if(!scheduleDrag||!cell||cell.disabled||cell.dataset.date!==scheduleDrag.date)return;scheduleDrag.end=Number(cell.dataset.row);paintScheduleDrag();}
  function paintScheduleDrag(){all('[data-schedule-cell]').forEach(cell=>cell.classList.remove('drag-preview','drag-remove-preview'));if(!scheduleDrag)return;const low=Math.min(scheduleDrag.start,scheduleDrag.end),high=Math.max(scheduleDrag.start,scheduleDrag.end);all('[data-schedule-cell][data-date="'+scheduleDrag.date+'"]').forEach(cell=>{const row=Number(cell.dataset.row);if(row>=low&&row<=high&&!cell.disabled)cell.classList.add(scheduleDrag.mode==='add'?'drag-preview':'drag-remove-preview');});}
  function scheduleDragEnd(){
    if(!scheduleDrag)return;const drag=scheduleDrag;scheduleDrag=null;const person=stylistById(scheduleSubjectId);if(!person)return;
    const low=Math.min(drag.start,drag.end),high=Math.max(drag.start,drag.end),minutes=Array.from({length:high-low+1},(_,i)=>540+(low+i)*30);
    const blocked=bookings.some(booking=>booking.storeId===person.storeId&&booking.stylistId===person.id&&booking.date===drag.date&&booking.status==='confirmed'&&minutes.some(minute=>minute<bookingEnd(booking)&&minute+30>toMinutes(booking.time)));
    if(blocked){renderOps();showToast('予約済みの時間帯は変更できません。');return;}if(isStoreClosed(person.storeId,drag.date)){renderOps();showToast('店舗休業日は空き時間を登録できません。');return;}
    const slots=new Set();staffSchedules.filter(rule=>rule.staffId===person.id&&rule.date===drag.date).forEach(rule=>{for(let minute=toMinutes(rule.start);minute<toMinutes(rule.end);minute+=30)slots.add(minute);});
    minutes.forEach(minute=>drag.mode==='add'?slots.add(minute):slots.delete(minute));staffSchedules=staffSchedules.filter(rule=>!(rule.staffId===person.id&&rule.date===drag.date));
    const ordered=[...slots].sort((a,b)=>a-b);let first=null,last=null;const saveRange=()=>staffSchedules.push({id:person.id+'-'+drag.date+'-'+first,storeId:person.storeId,staffId:person.id,date:drag.date,start:fromMinutes(first),end:fromMinutes(last)});
    ordered.forEach(minute=>{if(first===null){first=minute;last=minute+30;}else if(minute===last)last+=30;else{saveRange();first=minute;last=minute+30;}});if(first!==null)saveRange();
    saveDemoState();renderOps();renderDates();showToast(drag.mode==='add'?'空き時間を登録しました。':'空き時間を解除しました。');
  }
  function saveStoreClosure(event){
    event.preventDefault();if(!['owner','system'].includes(currentRole)){showToast('店舗休業日の登録は店舗管理者が行います。');return;}
    const data=new FormData(event.currentTarget),storeId=String(data.get('storeId')||''),startDate=String(data.get('startDate')||''),endDate=String(data.get('endDate')||''),reason=String(data.get('reason')||'').trim(),store=storeById(storeId);
    if(!store||!recordInScope({storeId})||!startDate||!endDate||startDate<dateKey(0)||endDate<startDate){showToast('登録する店舗と開始・終了日を確認してください。');return;}
    const dates=[],cursor=new Date(startDate+'T00:00:00'),last=new Date(endDate+'T00:00:00');while(cursor<=last){dates.push(localDateKey(cursor));cursor.setDate(cursor.getDate()+1);}
    if(bookings.some(booking=>booking.storeId===storeId&&dates.includes(booking.date)&&booking.status==='confirmed')){showToast('期間内に確定済み予約があるため登録できません。先に予約を調整してください。');return;}
    dates.forEach(date=>{if(!storeClosures.some(item=>item.storeId===storeId&&item.date===date))storeClosures.push({id:'closure-'+storeId+'-'+date,storeId,date,reason:reason||'店舗休業'});});
    staffSchedules=staffSchedules.filter(rule=>!(rule.storeId===storeId&&dates.includes(rule.date)));saveDemoState();renderOps();renderDates();showToast(dates.length+'日分の店舗休業日を登録しました。スタッフの空き時間も解除しました。');
  }
  function deleteStoreClosure(id){if(!['owner','system'].includes(currentRole))return;const item=storeClosures.find(closure=>closure.id===id);if(!item||!recordInScope({storeId:item.storeId}))return;if(!window.confirm('この店舗休業日を解除しますか？'))return;storeClosures.splice(storeClosures.indexOf(item),1);saveDemoState();renderOps();renderDates();showToast('店舗休業日を解除しました。');}
  function createEquipment(event){
    event.preventDefault();if(!['owner','system'].includes(currentRole)){showToast('設備登録は店舗管理者のみ行えます。');return;}
    const data=new FormData(event.currentTarget),storeId=String(data.get('storeId')),store=storeById(storeId),type=String(data.get('type')),name=String(data.get('name')||'').trim(),area=String(data.get('area')||'').trim();
    if(!store||!recordInScope({storeId})||!name){showToast('登録先の店舗と設備名を確認してください。');return;}
    const id=storeId+'-equipment-'+Date.now(),item={id,storeId,name,type,area,active:true,icon:type==='セット面'?'◒':'◇'};seats.push(item);saveDemoState();renderOps();showToast('店舗設備を登録しました。');
  }
  function applyReservationFilters(){
    const q=(el('#reservationSearch')?.value||'').trim().toLowerCase(),date=el('#reservationDateFilter')?.value||'all',state=el('#reservationStatusFilter')?.value||'all',attendance=el('#reservationVisitFilter')?.value||'all';
    all('[data-booking-row]').forEach(r=>{r.hidden=!((!q||r.dataset.search.includes(q))&&(date==='all'||r.dataset.date===date)&&(state==='all'||r.dataset.status===state)&&(attendance==='all'||r.dataset.attendance===attendance));});
  }
  function applyCustomerFilters(){const q=(el('#customerSearch')?.value||'').trim().toLowerCase(),attendance=el('#customerVisitFilter')?.value||'all';all('[data-customer-row]').forEach(r=>{r.hidden=!((!q||r.dataset.search.includes(q))&&(attendance==='all'||r.dataset.attendance===attendance));});}
  function cancelBooking(id){const b=bookings.find(x=>x.id===id);if(!b||currentRole==='staff'||!recordInScope(b)||b.status==='cancelled')return;b.status='cancelled';saveDemoState();renderOps();showToast('予約をキャンセルしました。スタッフとセット面の枠を開放しました。');}
  function openStaffEditor(staffId=''){
    photoCropSequence++;
    const selfEdit=currentRole==='staff'&&staffId===currentStaffId;
    if(currentRole==='staff'&&!selfEdit){showToast('スタッフは自分のプロフィールだけ編集できます。');return;}
    const person=staffId?stylistById(staffId):null;if(staffId&&(!person||!recordInScope({storeId:person.storeId}))){showToast('このスタッフを編集する権限がありません。');return;}
    if(selfEdit&&person?.storeId!==stylistById(currentStaffId)?.storeId){showToast('自分のスタッフ情報のみ編集できます。');return;}
    if(!person&&currentRole==='system'&&selectedStoreId==='all'){showToast('スタッフを登録する店舗を選択してください。');return;}
    const storeId=person?.storeId||selectedStoreId,store=storeById(storeId);if(!store||!recordInScope({storeId})){showToast('登録先の店舗を選択してください。');return;}
    const form=el('#staffEditorForm');form.reset();el('#staffEditorId').value=person?.id||'';el('#staffEditorStoreId').value=storeId;el('#staffEditorTitle').textContent=person?'スタッフ情報を編集':'スタッフを登録する';
    form.elements.name.value=person?.name||'';form.elements.displayTitle.value=person?.displayTitle||'スタイリスト';form.elements.specialty.value=person?.specialty||'';form.elements.years.value=person?.years??1;form.elements.bio.value=person?.bio||'';form.elements.email.value=person?.email||'';
    const legacy=String(person?.socialUrl||''),instagram=person?.instagramUrl||(/instagram\.com/i.test(legacy)?legacy:''),portfolio=person?.portfolioUrl||(/instagram\.com/i.test(legacy)?'':legacy);
    form.elements.instagramUrl.value=instagram;form.elements.portfolioUrl.value=portfolio;staffPhotoDraft=person?.photoData||'';
    el('#staffEditorPhoto').innerHTML=person?'<img src="'+esc(staffPhotoSource(person))+'" alt="'+esc(person.name)+'のプロフィール写真">':'<span class="staff-photo-placeholder">写真を追加</span>';
    const linked=person?.lineLinked===true;el('#staffLineStatus').textContent=linked?(selfEdit?'連携済み（デモ）':'連携済み'):'未連携';el('#staffLineStatus').classList.toggle('is-linked',linked);
    el('#staffLineHelp').textContent=selfEdit?'店舗のLINE公式アカウントを友だち追加し、ご自身のアカウントを連携します。本番では安全なアカウント連携画面を使用します。':'LINE通知の登録・解除はスタッフ本人がプロフィール画面から行います。';
    el('#connectStaffLine').hidden=!selfEdit;el('#connectStaffLine').textContent=linked?'連携を解除（デモ）':'LINEアカウントを連携（デモ）';
    el('#staffLoginHelp').textContent=person?(selfEdit?'パスワードはご本人だけが設定・変更できます。設定用リンクを登録メールへ送ります（デモ）。':'パスワードは確認できません。忘れた場合は登録メール宛に再設定用リンクを送ります（デモ）。'):'登録後、入力したメールアドレスへパスワード設定用リンクを送ります（デモ）。';
    el('#resetStaffPassword').hidden=!person||(!['owner','system'].includes(currentRole)&&!selfEdit);el('#resetStaffPassword').textContent=selfEdit?'パスワード設定メールを自分に送る':'パスワード再設定メールを送る';
    el('#staffEditorOverlay').hidden=false;document.body.classList.add('modal-open');el('#closeStaffEditor').focus();
  }
  function closeStaffEditor(){photoCropSequence++;el('#staffEditorForm').querySelector('[type="submit"]').disabled=false;el('#staffEditorOverlay').hidden=true;document.body.classList.remove('modal-open');staffPhotoDraft='';}
  function saveStaffProfile(event){
    event.preventDefault();const data=new FormData(event.currentTarget),staffId=String(data.get('staffId')||''),person=staffId?stylistById(staffId):null,selfEdit=currentRole==='staff'&&staffId===currentStaffId;
    if(currentRole==='staff'&&!selfEdit){showToast('スタッフは自分のプロフィールだけ編集できます。');return;}
    if(selfEdit&&(!person||person.storeId!==stylistById(currentStaffId)?.storeId)){showToast('自分のスタッフ情報のみ編集できます。');return;}
    const storeId=selfEdit?person.storeId:String(data.get('storeId')),store=storeById(storeId);if(!store||!recordInScope({storeId})){showToast('この店舗を編集する権限がありません。');return;}
    const rawInstagram=String(data.get('instagramUrl')||'').trim(),rawPortfolio=String(data.get('portfolioUrl')||'').trim(),instagramUrl=safeExternalUrl(rawInstagram),portfolioUrl=safeExternalUrl(rawPortfolio);if((rawInstagram&&!instagramUrl)||(rawPortfolio&&!portfolioUrl)){showToast('作品リンクは http:// または https:// から始まるURLを入力してください。');return;}
    const email=String(data.get('email')||'').trim().toLowerCase();
    if([...owners,...stylists.filter(item=>item.id!==staffId)].some(account=>String(account.email||'').toLowerCase()===email)){showToast('このメールアドレスは別のアカウントで使用されています。');return;}
    const values={name:String(data.get('name')).trim(),displayTitle:String(data.get('displayTitle')).trim(),specialty:String(data.get('specialty')).trim(),years:Number(data.get('years')),bio:String(data.get('bio')).trim(),instagramUrl,portfolioUrl,email,notifyByEmail:true};
    if(staffId&&!person){showToast('スタッフ情報を確認できませんでした。');return;}
    if(!person){if(!['owner','system'].includes(currentRole)){showToast('スタッフ登録は店舗管理者のみ行えます。');return;}person={id:'staff-'+Date.now(),storeId,short:'',initials:'',role:'スタッフ',avatar:'sage',photoPath:null,photoData:null,socialUrl:'',active:true,loginStatus:'setup_sent'};stylists.push(person);}
    const changedLoginEmail=person.email!==values.email;
    Object.assign(person,values,{role:'スタッフ',short:values.name.split(/[\s　]/)[0]||values.name,initials:values.name.slice(0,1),socialUrl:instagramUrl||portfolioUrl});if(staffPhotoDraft)person.photoData=staffPhotoDraft;
    if(changedLoginEmail)person.loginStatus='setup_sent';
    saveDemoState();closeStaffEditor();renderOps();renderStylistOptions();showToast(!staffId?'スタッフを登録しました。設定用メールを送信しました（デモ）。':changedLoginEmail?'プロフィールを更新し、新しいメールアドレスへログイン案内を送信しました（デモ）。':'スタッフ情報を更新しました。');
  }
  function archiveStaff(staffId){
    if(!['owner','system'].includes(currentRole)){showToast('スタッフの非公開設定は店舗管理者のみ行えます。');return;}
    const person=stylistById(staffId);if(!person||!recordInScope({storeId:person.storeId})||person.active===false)return;
    const upcoming=bookings.filter(booking=>booking.stylistId===staffId&&booking.status==='confirmed'&&booking.date>=dateKey(0)).length;
    const detail=upcoming?'\n\n今後の確定予約 '+upcoming+' 件はそのまま残ります。':'既存の予約履歴は保持されます。';
    if(!window.confirm('「'+person.name+'」さんを予約ページから非公開にしますか？'+detail))return;
    person.active=false;saveDemoState();if(selectedStylistId===staffId){selectedStylistId=stylists.find(item=>item.storeId===publicStoreId&&item.active!==false)?.id||'';chosen=null;}
    renderOps();renderStylistOptions();renderDates();showToast('スタッフを予約ページから非公開にしました。予約履歴は保持しています。');
  }
  function restoreStaff(staffId){
    if(!['owner','system'].includes(currentRole))return;const person=stylistById(staffId);if(!person||!recordInScope({storeId:person.storeId})||person.active!==false)return;
    person.active=true;saveDemoState();renderOps();renderStylistOptions();showToast('スタッフを予約ページに再公開しました。');
  }
  async function cropProfilePhoto(file){
    const objectUrl=URL.createObjectURL(file);
    try{
      const image=await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('画像を読み込めませんでした。'));img.src=objectUrl;});
      const targetRatio=3/4,sourceRatio=image.width/image.height;let sx=0,sy=0,sw=image.width,sh=image.height;
      if(sourceRatio>targetRatio){sw=image.height*targetRatio;sx=(image.width-sw)/2;}
      else {sh=image.width/targetRatio;sy=(image.height-sh)*.12;}
      const canvas=document.createElement('canvas');canvas.width=720;canvas.height=960;
      const context=canvas.getContext('2d');if(!context)throw new Error('画像を調整できませんでした。');
      context.drawImage(image,sx,sy,sw,sh,0,0,canvas.width,canvas.height);return canvas.toDataURL('image/jpeg',.88);
    } finally {URL.revokeObjectURL(objectUrl);}
  }
  document.addEventListener('click',event=>{
    const v=event.target.closest('[data-view]');if(v){setView(v.dataset.view);return;}
    if(event.target.closest('#opsCustomerPreview')){if(currentRole==='staff')return;publicStoreId=selectedStoreId==='all'?PUBLIC_STORE_ID:selectedStoreId;selectedDateOffset=0;calendarWeekStart=0;chosen=null;setBookingStep(1);try{history.pushState({view:'customer'},'',location.pathname+'?store='+encodeURIComponent(publicStoreId));}catch(_){}renderPublicStore();renderStylistOptions();renderMenus();renderDates();renderTimeSlots();setView('customer');return;}
    if(event.target.closest('#brandHome')){event.preventDefault();if(!el('#opsView').hidden){publicStoreId=selectedStoreId==='all'?PUBLIC_STORE_ID:selectedStoreId;try{history.pushState({view:'customer'},'',location.pathname+'?store='+encodeURIComponent(publicStoreId));}catch(_){}}renderPublicStore();setView('customer');return;}
    const toggle=event.target.closest('#storeDetailsToggle');if(toggle){const details=el('#storeDetails');details.hidden=!details.hidden;toggle.setAttribute('aria-expanded',String(!details.hidden));toggle.lastElementChild.textContent=details.hidden?'＋':'−';return;}
    const stylist=event.target.closest('[data-stylist]');if(stylist&&!stylist.matches('input')){selectedStylistId=stylist.dataset.stylist;chosen=null;renderStylistOptions();renderDates();renderTimeSlots();return;}
    const m=event.target.closest('[data-menu]');if(m){selectedMenu=m.dataset.menu;chosen=null;renderMenus();renderDates();renderTimeSlots();return;}
    const prev=event.target.closest('#prevWeek');if(prev&&!prev.disabled){calendarWeekStart=Math.max(0,calendarWeekStart-7);selectedDateOffset=calendarWeekStart;chosen=null;renderDates();renderTimeSlots();return;}
    const next=event.target.closest('#nextWeek');if(next){calendarWeekStart+=7;selectedDateOffset=calendarWeekStart;chosen=null;renderDates();renderTimeSlots();return;}
    const d=event.target.closest('[data-date-offset]');if(d&&!d.disabled){selectedDateOffset=Number(d.dataset.dateOffset);chosen=null;renderDates();renderTimeSlots();return;}
    const slot=event.target.closest('[data-time-choice]');if(slot){const dayOffset=Number(slot.dataset.slotDate),assignment=getAvailableTimes(selectedStylistId,dayOffset,menuById(selectedMenu).duration).find(item=>item.time===slot.dataset.timeChoice);if(!assignment)return;selectedDateOffset=dayOffset;chosen={stylistId:selectedStylistId,time:slot.dataset.timeChoice,dayOffset,menuId:selectedMenu};el('#bookingError').textContent='';renderDates();return;}
    if(event.target.closest('#clearSelectedSlot')){chosen=null;renderDates();return;}
    if(event.target.closest('#goToContact')){if(!chosen)return;setBookingStep(2);el('#booking').scrollIntoView({behavior:'smooth',block:'start'});return;}
    if(event.target.closest('[data-booking-back]')){setBookingStep(1);renderDates();renderTimeSlots();el('#booking').scrollIntoView({behavior:'smooth',block:'start'});return;}
    if(event.target.closest('#newBooking')){chosen=null;el('#bookingForm').reset();selectedMenu=publicStoreId+'-cut';calendarWeekStart=0;selectedDateOffset=0;renderMenus();renderStylistOptions();renderDates();renderTimeSlots();setBookingStep(1);return;}
    if(event.target.closest('#closeCustomerDetail')||event.target.closest('#cancelCustomerDetail')||event.target===el('#customerDetailOverlay')){closeCustomerDetail();return;}
    if(event.target.closest('#closeStaffEditor')||event.target.closest('#cancelStaffEditor')||event.target===el('#staffEditorOverlay')){closeStaffEditor();return;}
    if(event.target.closest('#resetStaffPassword')){const staffId=String(el('#staffEditorId').value||''),person=stylistById(staffId),selfReset=currentRole==='staff'&&staffId===currentStaffId;if(!person||(!selfReset&&(!['owner','system'].includes(currentRole)||!recordInScope({storeId:person.storeId})))||!person.email){showToast('再設定メールの送信先を確認してください。');return;}person.loginStatus='reset_sent';saveDemoState();showToast(person.email+' にパスワード設定・再設定用メールを送信しました（デモ）。');return;}
    if(event.target.closest('[data-venue-edit]')){selectedVenueId=event.target.closest('[data-venue-edit]').dataset.venueEdit;currentOpsPage='venues';renderOps();return;}
    if(event.target.closest('[data-clear-venue-edit]')){selectedVenueId='';renderOps();return;}
    const editStaff=event.target.closest('[data-edit-staff]');if(editStaff){openStaffEditor(editStaff.dataset.editStaff);return;}
    if(event.target.closest('[data-add-staff]')){openStaffEditor();return;}
    const deleteStaff=event.target.closest('[data-delete-staff]');if(deleteStaff){archiveStaff(deleteStaff.dataset.deleteStaff);return;}
    const restoreStaffButton=event.target.closest('[data-restore-staff]');if(restoreStaffButton){restoreStaff(restoreStaffButton.dataset.restoreStaff);return;}
    if(event.target.closest('#connectStaffLine')){
      if(currentRole!=='staff'){showToast('LINE通知の連携はスタッフ本人が行います。');return;}
      const person=stylistById(currentStaffId);if(!person)return;person.lineLinked=person.lineLinked!==true;saveDemoState();
      el('#staffLineStatus').textContent=person.lineLinked?'連携済み（デモ）':'未連携';el('#staffLineStatus').classList.toggle('is-linked',person.lineLinked);el('#connectStaffLine').textContent=person.lineLinked?'連携を解除（デモ）':'LINEアカウントを連携（デモ）';renderOps();
      showToast('連携状態をデモ表示しました。実際のLINE接続は行っていません。');return;
    }
    const removeSchedule=event.target.closest('[data-remove-staff-schedule]');if(removeSchedule){removeStaffSchedule(removeSchedule.dataset.removeStaffSchedule,Number(removeSchedule.dataset.scheduleDay));return;}
    const scheduleShift=event.target.closest('[data-schedule-shift]');if(scheduleShift){scheduleWeekStart=Math.max(0,scheduleWeekStart+Number(scheduleShift.dataset.scheduleShift));renderOps();return;}
    const deleteClosure=event.target.closest('[data-delete-closure]');if(deleteClosure){deleteStoreClosure(deleteClosure.dataset.deleteClosure);return;}
    if(event.target.closest('#saveCustomerRecord')){saveCustomerRecord();return;}
    const customerDetail=event.target.closest('[data-booking-detail]');if(customerDetail){openBookingDetail(customerDetail.dataset.bookingDetail);return;}
    const storeEdit=event.target.closest('[data-store-edit]');if(storeEdit&&currentRole==='system'){selectedStoreId=storeEdit.dataset.storeEdit;currentOpsPage='settings';renderOps();return;}
    const storeSelect=event.target.closest('[data-store-select]');if(storeSelect&&currentRole==='system'){selectedStoreId=storeSelect.dataset.storeSelect;renderOps();return;}
    const page=event.target.closest('[data-page]');if(page){changePage(page.dataset.page);return;}
    const shift=event.target.closest('[data-date-shift]');if(shift){opsDateOffset=Math.max(0,Math.min(5,opsDateOffset+Number(shift.dataset.dateShift)));renderOps();return;}
    if(event.target.closest('[data-date-today]')){opsDateOffset=0;renderOps();return;}
    const cancel=event.target.closest('[data-cancel]');if(cancel){cancelBooking(cancel.dataset.cancel);return;}
    if(event.target.closest('#sendLineSample')){showToast('通知を送信しました（デモ表示）。LINE連携は未接続です。');return;}
    const action=event.target.closest('[data-action]');if(action){const messages={'add-menu':'メニュー追加の入力画面はプロトタイプ対象外です。','edit-menu':'メニュー編集の入力画面はプロトタイプ対象外です。'};showToast(messages[action.dataset.action]||'操作しました（デモ）。');}
  });
  document.addEventListener('pointerdown',event=>{const cell=event.target.closest('[data-schedule-cell]');if(cell){event.preventDefault();scheduleDragStart(cell);}});
  document.addEventListener('pointerover',event=>{const cell=event.target.closest('[data-schedule-cell]');if(cell)scheduleDragMove(cell);});
  document.addEventListener('pointermove',event=>{if(!scheduleDrag)return;const cell=document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-schedule-cell]');if(cell)scheduleDragMove(cell);});
  document.addEventListener('pointerup',()=>scheduleDragEnd());
  document.addEventListener('pointercancel',()=>{if(scheduleDrag){scheduleDrag=null;renderOps();}});
  document.addEventListener('submit',event=>{if(event.target.id==='bookingForm')handleBookingSubmit(event);if(event.target.id==='staffScheduleForm')saveStaffSchedule(event);if(event.target.id==='storeClosureForm')saveStoreClosure(event);if(event.target.id==='equipmentCreateForm')createEquipment(event);if(event.target.id==='staffEditorForm')saveStaffProfile(event);if(event.target.id==='storeCreateForm')createStore(event);if(event.target.id==='venueCreateForm')saveVenue(event);if(event.target.id==='storeSettingsForm')saveStoreSettings(event);});
  document.addEventListener('input',event=>{if(event.target.id==='reservationSearch')applyReservationFilters();if(event.target.id==='customerSearch')applyCustomerFilters();});
  document.addEventListener('change',event=>{
    if(event.target.id==='reservationDateFilter'||event.target.id==='reservationStatusFilter'||event.target.id==='reservationVisitFilter')applyReservationFilters();
    if(event.target.id==='customerVisitFilter')applyCustomerFilters();
    if(event.target.id==='storeSelector'){
      const permitted=storesForOwner(currentOwnerId);const requested=event.target.value;
      if(currentRole==='system')selectedStoreId=requested==='all'?'all':storeById(requested)?.id||'all';
      else if(permitted.some(store=>store.id===requested))selectedStoreId=requested;
      renderOps();return;
    }
    if(event.target.id==='newOwnerSelect'){el('#newOwnerFields').hidden=event.target.value!=='new';return;}
    if(event.target.id==='scheduleSubject'){scheduleSubjectId=event.target.value;renderOps();return;}
    if(event.target.id==='staffEditorPhotoInput'){
      const file=event.target.files?.[0];if(!file)return;
      if(!file.type.startsWith('image/')){showToast('画像ファイルを選択してください。');event.target.value='';return;}
      if(file.size>12*1024*1024){showToast('写真は12MB以下の画像を選択してください。');event.target.value='';return;}
      event.target.value='';const sequence=++photoCropSequence,saveButton=el('#staffEditorForm').querySelector('[type="submit"]');saveButton.disabled=true;
      cropProfilePhoto(file).then(dataUrl=>{if(sequence!==photoCropSequence)return;staffPhotoDraft=dataUrl;el('#staffEditorPhoto').innerHTML='<img src="'+esc(staffPhotoDraft)+'" alt="プロフィール写真プレビュー">';showToast('縦3:4にトリミングしました。');}).catch(()=>{if(sequence===photoCropSequence)showToast('写真を読み込めませんでした。別の画像をお試しください。');}).finally(()=>{if(sequence===photoCropSequence)saveButton.disabled=false;});
    }
  });
  document.addEventListener('keydown',event=>{
    const current=event.target.closest('#menuOptions [role="radio"]');if(!current)return;
    const options=all('#menuOptions [role="radio"]');let index=options.indexOf(current);
    if(event.key==='ArrowRight'||event.key==='ArrowDown')index=(index+1)%options.length;
    else if(event.key==='ArrowLeft'||event.key==='ArrowUp')index=(index-1+options.length)%options.length;
    else if(event.key==='Home')index=0;
    else if(event.key==='End')index=options.length-1;
    else return;
    event.preventDefault();selectedMenu=options[index].dataset.menu;chosen=null;renderMenus();renderDates();el('#menuOptions [aria-checked="true"]')?.focus();
  });
  document.addEventListener('keydown',event=>{if(event.key!=='Escape')return;if(!el('#staffEditorOverlay').hidden)closeStaffEditor();else if(!el('#customerDetailOverlay').hidden)closeCustomerDetail();});
  function applyRoute(){
    const params=new URLSearchParams(location.search);
    if(params.get('mode')==='admin'){
      const requestedRole=params.get('role');currentRole=requestedRole==='system'?'system':requestedRole==='staff'?'staff':'owner';
      currentOwnerId=ownerById(params.get('owner'))?params.get('owner'):'owner-a';
      currentStaffId=params.get('staff')||'';
      if(currentRole==='staff'&&!stylistById(currentStaffId)){currentRole='owner';currentStaffId='';}
      if(currentRole==='staff'){currentOwnerId=storeById(stylistById(currentStaffId).storeId)?.ownerId||currentOwnerId;}
      const requestedStore=params.get('store');
      if(currentRole==='system')selectedStoreId=requestedStore==='all'||!storeById(requestedStore)?'all':requestedStore;
      else if(currentRole==='staff')selectedStoreId=stylistById(currentStaffId)?.storeId||'';
      else {const owned=storesForOwner(currentOwnerId);selectedStoreId=owned.some(store=>store.id===requestedStore)?requestedStore:(owned[0]?.id||'');}
      currentOpsPage=currentRole==='staff'?'availability':'overview';setView('ops');
    }else {
      publicStoreId=storeById(params.get('store'))?.id||PUBLIC_STORE_ID;selectedMenu=publicStoreId+'-cut';selectedStylistId=stylists.find(person=>person.storeId===publicStoreId)?.id||'';selectedDateOffset=0;calendarWeekStart=0;chosen=null;
      renderPublicStore();renderStylistOptions();renderMenus();renderDates();renderTimeSlots();setView('customer');
    }
  }
  window.addEventListener('popstate',applyRoute);
  renderStylistOptions();renderMenus();renderDates();renderTimeSlots();renderOps();
  applyRoute();
})();
