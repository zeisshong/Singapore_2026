(function(){
  if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));}
  document.querySelectorAll('.card').forEach((card,i)=>{card.style.animationDelay=(i%8)*45+'ms';card.classList.add('reveal-card')});
  const s=document.createElement('style');s.textContent='@keyframes rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}.reveal-card{animation:rise .45s both}';document.head.appendChild(s);
})();

(function(){
  const top=document.querySelector('.sticky-top');
  if(!top)return;
  let compact=false;
  const sync=()=>{
    const next=window.scrollY>90;
    if(next!==compact){
      compact=next;
      top.classList.toggle('is-compact',compact);
      requestAnimationFrame(()=>document.documentElement.style.setProperty('--sticky-h',top.offsetHeight+'px'));
    }
  };
  window.addEventListener('scroll',sync,{passive:true});
  sync();
})();

(function(){
  const tripDays={
    '2026-07-22':{day:'Day 1',main:'星耀樟宜、牛車水、濱海灣',detail:'從清晨南洋早餐開始冒險。',tip:'抵達後先補充水分，下午戶外行程注意防曬。'},
    '2026-07-23':{day:'Day 2',main:'新加坡環球影城',detail:'全天探索熱門設施與園區美食。',tip:'提早入園，先玩排隊時間最長的熱門設施。'},
    '2026-07-24':{day:'Day 3',main:'濱海灣金沙、返程',detail:'把握最後半天，預留時間前往機場。',tip:'出發前再次確認護照、行李與航班時間。'}
  };
  const fmt=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Singapore',year:'numeric',month:'2-digit',day:'2-digit'});
  const today=fmt.format(new Date());
  const start='2026-07-22', end='2026-07-24';
  let info=tripDays[today];
  if(!info){
    if(today<start){
      const days=Math.ceil((new Date(start+'T00:00:00+08:00')-new Date())/86400000);
      info={day:'行前準備',main:`距離出發還有 ${Math.max(0,days)} 天`,detail:'行程將在旅遊日期自動切換。',tip:'先確認護照、網路、保險與行李清單。'};
    }else{
      info={day:'旅程完成',main:'新加坡三天兩夜已完成',detail:'可以回顧行程與記帳紀錄。',tip:'記得整理照片與核對最後支出。'};
    }
  }
  const title=document.getElementById('highlight-title');
  if(title) title.textContent='今日亮點 · '+info.day;
  const main=document.getElementById('highlight-main'); if(main) main.textContent=info.main;
  const detail=document.getElementById('highlight-detail'); if(detail) detail.textContent=info.detail;
  const tip=document.getElementById('dino-tip'); if(tip) tip.textContent=info.tip;

  const budgetTotal=21360;
  let spent=0, hasCache=false;
  try{
    const cached=JSON.parse(localStorage.getItem('expenseCache_singapore')||'null');
    if(cached && Array.isArray(cached.rows)){
      hasCache=true;
      const rates={TWD:1,SGD:24.5,USD:32.5,JPY:0.22};
      spent=Math.round(cached.rows.reduce((sum,row)=>sum+(Number(row['金額'])||0)*(rates[row['幣別']||'TWD']||1),0));
    }
  }catch(e){}
  const spentEl=document.getElementById('budget-spent');
  const detailEl=document.getElementById('budget-detail');
  if(spentEl) spentEl.textContent=hasCache?'已記帳 NT$ '+spent.toLocaleString():'預估 NT$ '+budgetTotal.toLocaleString();
  if(detailEl) detailEl.textContent=hasCache?`剩餘約 NT$ ${Math.max(0,budgetTotal-spent).toLocaleString()}，資料來自記帳系統。`:'尚無記帳快取，開啟記帳頁後會自動同步。';

  const weatherMain=document.getElementById('weather-main');
  const weatherDetail=document.getElementById('weather-detail');
  const codeText={0:'晴朗',1:'大致晴朗',2:'局部多雲',3:'陰天',45:'有霧',48:'霧凇',51:'毛毛雨',53:'毛毛雨',55:'較強毛毛雨',61:'小雨',63:'中雨',65:'大雨',80:'陣雨',81:'陣雨',82:'強陣雨',95:'雷雨'};
  fetch('https://api.open-meteo.com/v1/forecast?latitude=1.3521&longitude=103.8198&current=temperature_2m,apparent_temperature,precipitation,weather_code&timezone=Asia%2FSingapore')
    .then(r=>{if(!r.ok)throw new Error('weather');return r.json()})
    .then(data=>{
      const w=data.current||{};
      if(weatherMain) weatherMain.innerHTML=`🌤️ <strong>${Math.round(w.temperature_2m)}°C</strong>`;
      if(weatherDetail) weatherDetail.textContent=`${codeText[w.weather_code]||'即時天氣'}，體感 ${Math.round(w.apparent_temperature)}°C，降雨 ${w.precipitation||0} mm。`;
    })
    .catch(()=>{
      if(weatherMain) weatherMain.innerHTML='🌤️ <strong>暫時無法更新</strong>';
      if(weatherDetail) weatherDetail.textContent='請確認網路連線後重新整理。';
    });
})();
