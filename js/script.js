function switchTab(tabId, btn) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    btn.classList.add('active');
  }
  function scrollToSection(id) {
    const map = { how: 'how', find: 'find', hunt: 'hunt', impact: 'impact' };
    document.getElementById(map[id])?.scrollIntoView({ behavior: 'smooth' });
  }
  let activeTags = [];
  function addTag(tag) {
    if (activeTags.includes(tag)) return;
    activeTags.push(tag);
    renderTags();
    showAIRunBtn();
  }
  function removeTag(tag) { activeTags = activeTags.filter(t => t !== tag); renderTags(); }
  function renderTags() {
    const container = document.getElementById('tagChips');
    container.innerHTML = activeTags.map(tag => `<button class="tag-chip" onclick="removeTag('${tag}')">${tag} <span>×</span></button>`).join('');
  }
  function showAIRunBtn() { document.getElementById('aiRunBtn').style.display='block'; document.getElementById('aiIdle').style.display='none'; }
  function handleFiles(e) {
    const files = Array.from(e.target.files);
    const grid = document.getElementById('previewGrid');
    files.slice(0,4).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => { const img = document.createElement('img'); img.src=ev.target.result; img.className='preview-thumb'; grid.appendChild(img); };
      reader.readAsDataURL(file);
    });
    showAIRunBtn();
  }
  function addPinterestUrl() { const v = document.getElementById('pinterestUrl').value.trim(); if(!v)return; showToast('📌 Style board linked!'); document.getElementById('pinterestUrl').value=''; showAIRunBtn(); }

  const aiMatchData = {
    'Cottagecore': { era:['1970s Rural','Victorian'], palette:['Sage Green','Butter Yellow','Dusty Rose'], silhouette:['Flowy','Prairie Cut'], vibe:['Romantic','Earthy'], stylists:[{name:'Delilah M.',avatar:'🦋',match:'97% match'},{name:'Imogen C.',avatar:'📚',match:'84% match'}] },
    'Y2K': { era:['2000–2006'], palette:['Metallic','Baby Blue','Hot Pink'], silhouette:['Low Rise','Crop Top'], vibe:['Bold','Playful'], stylists:[{name:'Kai V.',avatar:'🎸',match:'99% match'},{name:'Nova X.',avatar:'✨',match:'91% match'}] },
    'Dark Academia': { era:['1940s–1960s'], palette:['Charcoal','Burgundy','Forest'], silhouette:['Blazer','Trousers'], vibe:['Scholarly','Moody'], stylists:[{name:'Imogen C.',avatar:'📚',match:'98% match'},{name:'Rosalind T.',avatar:'🌹',match:'82% match'}] },
    'Vintage Western': { era:['1960s–1980s'], palette:['Denim','Tan','Rust'], silhouette:['Boot Cut','Fringe'], vibe:['Authentic','Rugged'], stylists:[{name:'Buck W.',avatar:'🌵',match:'99% match'},{name:'Delilah M.',avatar:'🦋',match:'73% match'}] },
    '90s Minimalist': { era:['1990s'], palette:['Neutral','Black','White'], silhouette:['Straight Leg','Oversized'], vibe:['Clean','Understated'], stylists:[{name:'Kai V.',avatar:'🎸',match:'96% match'},{name:'Nova X.',avatar:'✨',match:'88% match'}] },
    'Avant-garde': { era:['Contemporary'], palette:['Monochrome','Unexpected'], silhouette:['Deconstructed','Asymmetric'], vibe:['Bold','Conceptual'], stylists:[{name:'Nova X.',avatar:'✨',match:'95% match'},{name:'Rosalind T.',avatar:'🌹',match:'79% match'}] }
  };

  function runAIMatch() {
    const aiAnalyzing=document.getElementById('aiAnalyzing'), aiResults=document.getElementById('aiResults'), aiIdle=document.getElementById('aiIdle'), aiRunBtn=document.getElementById('aiRunBtn');
    aiIdle.style.display='none'; aiRunBtn.style.display='none'; aiAnalyzing.classList.add('active'); aiResults.classList.remove('active');
    const tag=activeTags[0]||'Cottagecore'; const data=aiMatchData[tag]||aiMatchData['Cottagecore'];
    setTimeout(()=>{
      aiAnalyzing.classList.remove('active'); aiResults.classList.add('active');
      const tagsRow=document.getElementById('aiTagsRow'); tagsRow.innerHTML='';
      data.era.forEach(t=>tagsRow.innerHTML+=`<span class="ai-tag era">⏳ ${t}</span>`);
      data.palette.forEach(t=>tagsRow.innerHTML+=`<span class="ai-tag palette">🎨 ${t}</span>`);
      data.silhouette.forEach(t=>tagsRow.innerHTML+=`<span class="ai-tag silhouette">✂️ ${t}</span>`);
      data.vibe.forEach(t=>tagsRow.innerHTML+=`<span class="ai-tag vibe">✨ ${t}</span>`);
      const stylistsEl=document.getElementById('aiStylests');
      stylistsEl.innerHTML=data.stylists.map(s=>`<div class="ai-stylist-chip" onclick="showToast('Opening chat with ${s.name}…')"><div class="chip-avatar">${s.avatar}</div><div><div class="chip-name">${s.name}</div><div class="chip-match">${s.match}</div></div></div>`).join('');
      showToast('✦ AI match complete!');
    }, 2200);
  }

  let currentStreamer=null, viewerCountInterval=null, findFlashInterval=null, streamChatInterval=null, myViewerInterval=null, myViewerNum=0, camStream=null;
  const streamFinds = { cottagecore:['🌸 Floral midi dress — $8','🧶 Cream knit cardigan — $12','🌿 Linen wide-leg trousers — $15'], y2k:['✨ Velour tracksuit — $14','💿 Low-rise flares — $11','🕶 Tinted sunglasses — $5'], oldmoney:['🧥 Vintage Burberry scarf — $35','💼 Leather structured bag — $42'], western:['🤠 Vintage snap shirt — $16','👢 Leather boots — $45'] };
  const liveChatMessages = [['@shopaholic22','rgba(249,246,242,0.7)','omg that color is gorgeous!!'],['@thriftsister','rgba(249,246,242,0.6)','do you see any size L tops?'],['@vintagegal','rgba(249,246,242,0.8)','how much was that one??'],['@slowfashion','rgba(249,246,242,0.55)','love this stream every week 🌿'],['@resalejunkie','rgba(249,246,242,0.7)','adding to my request rn!']];

  function tuneIn(name, avatar, location, tags, viewers, theme) {
    currentStreamer={name,avatar,location,tags,viewers,theme};
    document.querySelectorAll('.stream-thumb').forEach(t=>t.classList.remove('active-stream'));
    event.currentTarget.classList.add('active-stream');
    document.getElementById('videoIdle').style.display='none'; document.getElementById('videoLive').style.display='block'; document.getElementById('videoGoLive').style.display='none';
    document.getElementById('videoStreamTitle').textContent=`${name} — ${location.split('·')[0].trim()}`;
    document.getElementById('videoAvatar').innerHTML=`${avatar}<div class="online-dot"></div>`;
    document.getElementById('videoStylistName').textContent=name;
    document.getElementById('videoStylistLoc').textContent='📍 '+location;
    document.getElementById('videoViewers').textContent=`👁 ${viewers.toLocaleString()} watching`;
    document.getElementById('dropRequestSub').textContent=`${name} is live right now. Tell them exactly what you're looking for.`;
    const items={cottagecore:'👗🌸🧶🌿🎀👚🌼',y2k:'✨👖💿🦺👟🕶🌈',oldmoney:'🧥💼👠🎩🧣💍',western:'🤠👢🪢👖🎸'};
    document.getElementById('rackItems').textContent=(items[theme]||'👗🧥👚👜').split('').join(' ');
    clearInterval(viewerCountInterval); let v=viewers;
    viewerCountInterval=setInterval(()=>{ v+=Math.floor(Math.random()*7)-2; if(v<1)v=1; document.getElementById('videoViewers').textContent=`👁 ${v.toLocaleString()} watching`; },3000);
    clearInterval(findFlashInterval); const finds=streamFinds[theme]||streamFinds.cottagecore; let fi=0;
    findFlashInterval=setInterval(()=>{ const flash=document.getElementById('findFlash'); flash.textContent='✦ Found: '+finds[fi%finds.length]; flash.classList.add('show'); fi++; setTimeout(()=>flash.classList.remove('show'),3000); },5000);
    clearInterval(streamChatInterval); const chatEl=document.getElementById('streamChatMessages');
    streamChatInterval=setInterval(()=>{ const[user,color,text]=liveChatMessages[Math.floor(Math.random()*liveChatMessages.length)]; const msg=document.createElement('div'); msg.className='stream-chat-msg'; msg.innerHTML=`<span class="scm-user" style="color:${color};">${user}</span><span class="scm-text">${text}</span>`; chatEl.appendChild(msg); chatEl.scrollTop=chatEl.scrollHeight; while(chatEl.children.length>30)chatEl.removeChild(chatEl.firstChild); },1800);
  }
  function sendLiveHeart() { const container=document.getElementById('heartsContainer'); const hearts=['❤️','🧡','💛','🤍','🩶']; const heart=document.createElement('div'); heart.className='heart-float'; heart.textContent=hearts[Math.floor(Math.random()*hearts.length)]; heart.style.left=(Math.random()*30-15)+'px'; container.appendChild(heart); setTimeout(()=>heart.remove(),2600); }
  function openGoLive() { document.getElementById('goLiveOverlay').style.display='flex'; }
  function closeGoLive() { document.getElementById('goLiveOverlay').style.display='none'; }
  async function startCamPreview() { try { camStream=await navigator.mediaDevices.getUserMedia({video:true,audio:true}); document.getElementById('camPreview').srcObject=camStream; document.getElementById('camOff').style.display='none'; showToast('📷 Camera enabled!'); } catch(e) { showToast('⚠️ Camera access denied.'); } }
  async function startLiveStream() {
    const title=document.getElementById('streamTitleInput').value||'My Hunt Stream';
    closeGoLive();
    if(!camStream){try{camStream=await navigator.mediaDevices.getUserMedia({video:true,audio:true});}catch(e){camStream=null;}}
    document.getElementById('videoIdle').style.display='none'; document.getElementById('videoLive').style.display='none'; document.getElementById('videoGoLive').style.display='block';
    if(camStream){document.getElementById('liveStreamVideo').srcObject=camStream;}
    document.getElementById('myStreamTitle').textContent=title;
    myViewerNum=0; clearInterval(myViewerInterval);
    myViewerInterval=setInterval(()=>{ myViewerNum+=Math.floor(Math.random()*5); document.getElementById('myViewerCount').textContent=`👁 ${myViewerNum} watching`; },2000);
    clearInterval(streamChatInterval);
    const chatEl=document.getElementById('streamChatMessages'); chatEl.innerHTML='';
    const msgs=['just joined 👋','is watching 👀','dropped a request!','sent a ❤️'];
    const names=['@shopfan','@thriftlover','@rackrat','@vintagegal'];
    streamChatInterval=setInterval(()=>{ const user=names[Math.floor(Math.random()*names.length)]; const text=msgs[Math.floor(Math.random()*msgs.length)]; const msg=document.createElement('div'); msg.className='stream-chat-msg'; msg.innerHTML=`<span class="scm-user" style="color:rgba(249,246,242,0.65);">${user}</span><span class="scm-text">${text}</span>`; chatEl.appendChild(msg); chatEl.scrollTop=chatEl.scrollHeight; },2500);
    showToast('🔴 You\'re live!');
  }
  function endStream() { clearInterval(myViewerInterval); clearInterval(streamChatInterval); if(camStream){camStream.getTracks().forEach(t=>t.stop());camStream=null;} document.getElementById('videoGoLive').style.display='none'; document.getElementById('videoIdle').style.display='flex'; showToast('✓ Stream ended. Great hunt!'); }
  function sendStreamChat() { const input=document.getElementById('streamChatInput'); const val=input.value.trim(); if(!val)return; const chatEl=document.getElementById('streamChatMessages'); const msg=document.createElement('div'); msg.className='stream-chat-msg'; msg.innerHTML=`<span class="scm-user" style="color:rgba(249,246,242,0.9);">@you</span><span class="scm-text">${val}</span>`; chatEl.appendChild(msg); chatEl.scrollTop=chatEl.scrollHeight; input.value=''; }
  function openDropRequestModal() { document.getElementById('dropRequestOverlay').style.display='flex'; }
  function closeDropRequest() { document.getElementById('dropRequestOverlay').style.display='none'; }
  function submitDropRequest() {
    const text=document.getElementById('dropRequestText').value;
    if(!text.trim()){showToast('⚠️ Please describe what you want!');return;}
    closeDropRequest();
    const chatEl=document.getElementById('streamChatMessages');
    const name=currentStreamer?currentStreamer.name:'Stylist';
    const msg=document.createElement('div'); msg.className='stream-chat-msg'; msg.innerHTML=`<span class="scm-user" style="color:rgba(249,246,242,0.9);">📌 Request →</span><span class="scm-text">${text.substring(0,60)}…</span>`;
    chatEl.appendChild(msg); chatEl.scrollTop=chatEl.scrollHeight;
    showToast(`📌 Request sent to ${name}!`);
    setTimeout(()=>{ const reply=document.createElement('div'); reply.className='stream-chat-msg'; reply.innerHTML=`<span class="scm-user" style="color:rgba(249,246,242,0.8);">${name}</span><span class="scm-text">Got it! I'll keep an eye out 👀</span>`; chatEl.appendChild(reply); chatEl.scrollTop=chatEl.scrollHeight; },2200);
  }

  function animateCounter(el,target,suffix,duration) { let start=0; const step=target/(duration/16); const timer=setInterval(()=>{ start+=step; if(start>=target){start=target;clearInterval(timer);} el.textContent=Math.floor(start).toLocaleString()+suffix; },16); }
  const impactObserver=new IntersectionObserver((entries)=>{ entries.forEach(entry=>{ if(entry.isIntersecting){ document.querySelectorAll('.metric-bar-fill').forEach(bar=>bar.classList.add('animate')); animateCounter(document.getElementById('countCO2'),52400,' kg',2000); animateCounter(document.getElementById('countWater'),141200000,' L',2500); animateCounter(document.getElementById('countItems'),12400,'',1800); impactObserver.disconnect(); } }); },{threshold:0.3});
  const impactSection=document.getElementById('impact'); if(impactSection)impactObserver.observe(impactSection);

  function openModal(type) {
    const overlay=document.getElementById('modalOverlay'); const content=document.getElementById('modalContent');
    if(type==='shopper'){ content.innerHTML=`<h2>Post Your Style Request</h2><p class="modal-sub">Share your inspo photos and style goals. Thrift stylists will hunt down second-hand pieces that match your vision.</p><div class="form-group"><label>Name or Username</label><input type="text" placeholder="@yourhandle" style="width:100%;background:rgba(255,255,255,0.06);border:1.5px solid rgba(255,255,255,0.1);color:var(--cream);padding:0.8rem;font-size:0.85rem;outline:none;border-radius:999px;"></div><div class="form-group"><label>Mood Board URL (optional)</label><input type="text" placeholder="https://..." style="width:100%;background:rgba(255,255,255,0.06);border:1.5px solid rgba(255,255,255,0.1);color:var(--cream);padding:0.8rem;font-size:0.85rem;outline:none;border-radius:999px;"></div><div class="form-group"><label>Describe Your Aesthetic</label><textarea placeholder="What vibes are you going for?" style="width:100%;background:rgba(255,255,255,0.06);border:1.5px solid rgba(255,255,255,0.1);color:var(--cream);padding:0.8rem;font-size:0.85rem;outline:none;resize:vertical;min-height:100px;border-radius:1.4rem;"></textarea></div><button class="btn-submit" onclick="submitRequest();closeModal();">✦ Post Style Request</button>`; }
    else if(type==='stylist'){ content.innerHTML=`<h2>Become a Stylist</h2><p class="modal-sub">Turn your weekend thrifting habit into something meaningful.</p><div class="form-group"><label>Your Name</label><input type="text" placeholder="First name or handle" style="width:100%;background:rgba(255,255,255,0.06);border:1.5px solid rgba(255,255,255,0.1);color:var(--cream);padding:0.8rem;font-size:0.85rem;outline:none;border-radius:999px;"></div><div class="form-group"><label>Where Do You Thrift?</label><input type="text" placeholder="City, State" style="width:100%;background:rgba(255,255,255,0.06);border:1.5px solid rgba(255,255,255,0.1);color:var(--cream);padding:0.8rem;font-size:0.85rem;outline:none;border-radius:999px;"></div><div class="form-group"><label>Your Style Specialty</label><input type="text" placeholder="e.g. 90s grunge, vintage prep, boho" style="width:100%;background:rgba(255,255,255,0.06);border:1.5px solid rgba(255,255,255,0.1);color:var(--cream);padding:0.8rem;font-size:0.85rem;outline:none;border-radius:999px;"></div><button class="btn-submit" onclick="submitStylist();closeModal();">✦ Join as a Stylist</button>`; }
    overlay.classList.add('open');
  }
  function closeModal() { document.getElementById('modalOverlay').classList.remove('open'); }
  function closeModalOutside(e) { if(e.target===document.getElementById('modalOverlay'))closeModal(); }
  function submitRequest() { showToast('🎉 Style request posted! Stylists will reach out soon.'); }
  function submitStylist() { showToast('✨ Welcome to the community! Profile is live.'); }

  let toastTimer;
  function showToast(msg) { const toast=document.getElementById('toast'); toast.textContent=msg; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>toast.classList.remove('show'),3500); }