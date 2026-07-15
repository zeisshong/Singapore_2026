(function(){
  if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));}
  document.querySelectorAll('.card').forEach((card,i)=>{card.style.animationDelay=(i%8)*45+'ms';card.classList.add('reveal-card')});
  const s=document.createElement('style');s.textContent='@keyframes rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}.reveal-card{animation:rise .45s both}';document.head.appendChild(s);
})();
