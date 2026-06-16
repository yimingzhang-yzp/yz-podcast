// ── app hero waveform ──
(function(){
  const wave=document.getElementById('ahcwave');
  const N=42;
  const seed=(i)=>((Math.sin(i*12.9898+3*78.233)*43758.5453)%1+1)%1;
  for(let i=0;i<N;i++){
    const t=i/N;
    const env=0.35+0.65*Math.pow(Math.sin(Math.PI*t),2);
    const h=0.28+env*0.72*(0.4+seed(i)*0.6);
    const s=document.createElement('span');
    s.style.height=(h*100)+'%';
    s.style.animation=`wv ${1.0+(i%5)*0.16}s ease-in-out infinite`;
    s.style.animationDelay=`${(i%7)*0.07}s`;
    wave.appendChild(s);
  }
  const st=document.createElement('style');
  st.textContent='@keyframes wv{0%,100%{transform:scaleY(1)}50%{transform:scaleY(.42)}}';
  document.head.appendChild(st);
})();

// ── voices ──
(function(){
  const VOICES=[
    {n:'ハル',q:'好奇心旺盛',c:'#3DDC97',g:'radial-gradient(circle at 30% 30%, #C7F5DC 0%, #3DDC97 45%, #0E7C4E 100%)'},
    {n:'リン',q:'知的・冷静',c:'#5EEAD4',g:'radial-gradient(circle at 30% 30%, #C7FFF2 0%, #5EEAD4 45%, #0E7C6E 100%)'},
    {n:'ソラ',q:'穏やか',c:'#9CC2FF',g:'radial-gradient(circle at 30% 30%, #DCE9FF 0%, #9CC2FF 45%, #2E5BAF 100%)'},
    {n:'カイ',q:'機知に富む',c:'#F2C94C',g:'radial-gradient(circle at 30% 30%, #FBEBA8 0%, #F2C94C 45%, #8C6B14 100%)'},
    {n:'アオイ',q:'明晴・軽快',c:'#FF8FB1',g:'radial-gradient(circle at 30% 30%, #FFD3DF 0%, #FF8FB1 45%, #B23E63 100%)'},
    {n:'レン',q:'低音・落ち着き',c:'#B7A5FF',g:'radial-gradient(circle at 30% 30%, #E1D9FF 0%, #B7A5FF 45%, #5B47B0 100%)'},
    {n:'メイ',q:'ロジカル',c:'#7DD4FF',g:'radial-gradient(circle at 30% 30%, #C6ECFF 0%, #7DD4FF 45%, #1F6E9F 100%)'},
    {n:'ツバサ',q:'温かく誠実',c:'#E08E5A',g:'radial-gradient(circle at 30% 30%, #F4CDB3 0%, #E08E5A 45%, #823A14 100%)'},
  ];
  const box=document.getElementById('voices');
  VOICES.forEach(v=>{
    const el=document.createElement('div');
    el.className='voice';
    el.style.setProperty('--vc', v.c);
    el.innerHTML=`<div class="vo-wrap"><div class="vo" style="background:${v.g}"></div><div class="vo-ring"></div></div><div class="vn">${v.n}</div><div class="vq">${v.q}</div>`;
    box.appendChild(el);
  });
})();

// ── ticker: AI words people are curious about ──
(function(){
  const items=[
    ['t','Anthropic 新モデルリリース'],
    ['','Anthropic 上場の噂'],
    ['t','OpenAI o5 推論ベンチマーク'],
    ['j','文化庁・著作権ガイドライン改訂'],
    ['','GPT-6 のリーク情報'],
    ['t','DeepMind Gemini 3 発表'],
    ['j','ソフトバンク AGIファンド第2弾'],
    ['','AGI 到達は何年か'],
    ['t','NVIDIA 時価総額が最高更新'],
    ['j','メルカリ AIエージェント導入'],
    ['','AIエージェントが仕事を奪う？'],
    ['t','Figure 03 ヒューマノイド公開'],
    ['j','トヨタ AI研究所の新ロードマップ'],
    ['','中国の生成AI規制が再強化'],
  ];
  const track=document.getElementById('ticker');
  const make=()=>items.map(([cls,txt])=>`<span class="ticker-item"><span class="b ${cls}"></span>${txt}</span>`).join('');
  track.innerHTML=make()+make();
})();

// ── scroll reveal ──
(function(){
  const io=new IntersectionObserver((es)=>{
    es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} });
  },{threshold:0.12});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
})();

// ── signup modal flow ──
(function(){
  // ── Google スプレッドシート連携 ──
  // メール登録時に、下記スプレッドシートへ1行追記する。
  //   https://docs.google.com/spreadsheets/d/1HrfT9etBCn2qusR7DAIat6QtlaNKoAOFEiFhfVtgrN4/edit
  // 書き込みは「Google Apps Script の Web アプリ」が受け口になる（apps-script.gs を参照）。
  // GAS をデプロイして得た /exec の URL を、ここに貼り付けてください。
  const SHEET_ENDPOINT='https://script.google.com/macros/s/AKfycbzrG-pDrPelnV6u2L65aChvlmdy_T2jaisrmbQcSnoZlK7DS_yMzEGhLMRcHMCrJi7F/exec';

  // スプレッドシートにメールアドレスを送信する（fire-and-forget）。
  // no-cors のためレスポンスは読み取れないが、追記処理は実行される。
  function recordEmail(email){
    if(!SHEET_ENDPOINT || SHEET_ENDPOINT.indexOf('__PASTE')===0){
      if(window.console) console.warn('[sheet] SHEET_ENDPOINT 未設定のため送信をスキップしました');
      return;
    }
    try{
      const body=new URLSearchParams({
        email:email,
        source:(location && location.pathname)||'',
        ua:(navigator && navigator.userAgent)||''
      });
      fetch(SHEET_ENDPOINT,{method:'POST',mode:'no-cors',body:body})
        .catch(err=>{ if(window.console) console.warn('[sheet] 送信に失敗しました',err); });
    }catch(err){
      if(window.console) console.warn('[sheet] 送信処理でエラー',err);
    }
  }

  const modal=document.getElementById('modal');
  const closeBtn=document.getElementById('modalClose');
  const formState=document.getElementById('formState');
  const thanksState=document.getElementById('thanksState');
  const emailInput=document.getElementById('modalEmail');
  const emailErr=document.getElementById('emailErr');
  const submitBtn=document.getElementById('modalSubmit');
  const inlineEmail=document.getElementById('inlineEmail');
  let lastFocus=null;

  const isValid=(v)=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  function open(prefill){
    lastFocus=document.activeElement;
    formState.style.display='';
    thanksState.style.display='none';
    emailErr.textContent='';
    if(prefill && isValid(prefill)) emailInput.value=prefill;
    modal.classList.add('open');
    setTimeout(()=>emailInput.focus(),320);
  }
  function close(){
    modal.classList.remove('open');
    if(lastFocus) lastFocus.focus();
  }

  // ── CONVERSION EVENT ──
  // ここがリスティング広告のコンバージョン計測ポイント。
  // メール登録完了時に1度だけ発火する。Google Ads / GA4 等の
  // 計測タグをこの関数内に設置してください。
  function fireConversion(email){
    // 例: gtag('event','conversion',{'send_to':'AW-XXXX/YYYY'});
    // 例: gtag('event','sign_up',{method:'email'});
    // 例: window.dataLayer && window.dataLayer.push({event:'lead_signup', email_domain:(email.split('@')[1]||'')});
    if(window.console) console.log('[conversion] email signup completed');
  }

  function submit(){
    const v=emailInput.value.trim();
    if(!isValid(v)){
      emailErr.textContent='メールアドレスの形式を確認してください。';
      emailInput.focus();
      return;
    }
    emailErr.textContent='';
    recordEmail(v);             // ← スプレッドシートへ転記
    fireConversion(v);          // ← コンバージョン発火
    formState.style.display='none';
    thanksState.style.display='';
  }

  // open triggers
  document.querySelectorAll('[data-signup]').forEach(el=>{
    el.addEventListener('click',(e)=>{e.preventDefault();open();});
  });
  // inline form: open the modal AND, if the email is already valid,
  // record it immediately so a single click completes the signup.
  function openInline(){
    const v=(inlineEmail&&inlineEmail.value.trim())||'';
    open(v);
    if(isValid(v)) submit();   // 有効なメールならその場で記録＆サンクス表示
  }
  document.querySelectorAll('[data-signup-inline]').forEach(el=>{
    el.addEventListener('click',(e)=>{e.preventDefault();openInline();});
  });
  if(inlineEmail){
    inlineEmail.addEventListener('keydown',(e)=>{ if(e.key==='Enter'){e.preventDefault();openInline();} });
  }

  closeBtn.addEventListener('click',close);
  modal.addEventListener('click',(e)=>{ if(e.target===modal) close(); });
  document.addEventListener('keydown',(e)=>{ if(e.key==='Escape' && modal.classList.contains('open')) close(); });
  submitBtn.addEventListener('click',submit);
  emailInput.addEventListener('keydown',(e)=>{ if(e.key==='Enter'){e.preventDefault();submit();} });
})();
