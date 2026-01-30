// ===== دمج CSS داخل JS =====
const style = document.createElement('style');
style.textContent = `
/* ===== زر الأصوات ===== */
button#sound-toggle {
    position: absolute;
    top: 6px;
    width: 55px;
    height: 55px;
    right: 8px;
    background: #222;
    color: #fff;
    border: none;
    border-radius: 8px 24px 24px 8px;
    cursor: pointer;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    transition: all 0.3s ease;
}
#sound-toggle[data-enabled="true"] {
    background: #2ecc71;
    color: #042;
}
#sound-toggle:hover { transform: scale(1.02); }

/* ===== الرسائل Linen ===== */
.public_message.linen.js-join { border-left:5px solid #2ecc71!important; background:linear-gradient(90deg, rgba(46, 204, 113, 0.08), #7fffd4); color:aquamarine!important; animation:fadeIn 0.6s ease; }
.public_message.linen.js-leave { border-left:5px solid #e74c3c!important; background:linear-gradient(90deg, rgba(46, 204, 113, 0.08), #c11200); color:red!important; animation:fadeOut 0.6s ease; }
.public_message.linen.js-move { border-left:5px solid #f1c40f!important; background:linear-gradient(90deg, rgba(46, 204, 113, 0.08), #f1c40f); color:yellow!important; animation:pulse 0.9s ease-in-out; }
.public_message.linen.js-kick { border:2px solid #D51919!important; border-radius:10px; background:linear-gradient(90deg, rgba(46, 204, 113, 0.08), #D51919); box-shadow:0 0 6px rgba(255,30,30,0.9),0 0 12px rgba(255,30,30,0.6), inset 0 0 6px rgba(255,30,30,0.8), inset 0 0 10px rgba(255,30,30,0.5); color:red!important; animation:shake 0.5s ease-in-out; }

/* Hover */
.public_message.linen:hover, .public_message:not(.linen):hover { transform:scale(1.01); transition: transform 0.2s ease; }

/* Reply */
.public_message--reply {
    background: linear-gradient(90deg, rgba(46, 204, 113, 0.08), #9b59b6);
    color: #9b59b6;
    font-weight: bold;
    animation: replyFade 0.6s ease;
    border-radius: 6px;
    border: 2px solid rgb(158 113 186);
    border-left: 5px solid #9b59b6;
}
.public_message--reply:hover { transform:scale(1.02); transition: transform 0.2s ease; }

/* Public / AD */
.public_message.public_message_ad { border-left:5px solid #e67e22; background:linear-gradient(90deg, rgba(230,126,34,0.08), rgba(230,126,34,0.2)); color:#e67e22; font-weight:bold; animation:adFade 0.6s ease; border-radius:6px; }
.public_message.public_message_ad:hover { transform:scale(1.02); transition: transform 0.2s ease; }

/* Keyframes */
@keyframes fadeIn { from {opacity:0; transform:translateY(-6px)} to {opacity:1; transform:translateY(0)} }
@keyframes fadeOut { from {opacity:0.9} to {opacity:0.35} }
@keyframes pulse {0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}
@keyframes shake {0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
@keyframes replyFade {from{opacity:0; transform:translateY(4px)} to{opacity:1; transform:translateY(0)}}
@keyframes adFade {from{opacity:0; transform:translateY(-4px)} to{opacity:1; transform:translateY(0)}}
`;
document.head.appendChild(style);

// ===== JavaScript الأصوات والتحكم بالرسائل =====
(function(){
  let audioCtx=null;
  let soundsEnabled=false;

  function ensureAudioContext() {
    if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if(audioCtx.state==='suspended') audioCtx.resume();
  }

  function playTone({freq=440,duration=0.12,type='sine',gain=0.12}={}) {
    if(!audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    g.gain.setValueAtTime(gain, now);
    g.gain.exponentialRampToValueAtTime(0.001, now+duration);
    osc.connect(g); g.connect(audioCtx.destination);
    osc.start(now); osc.stop(now+duration);
  }

  const soundMap={
    join: ()=>{ playTone({freq:720,type:'sine'}); setTimeout(()=>playTone({freq:950,type:'triangle'}),80); },
    leave: ()=>{ playTone({freq:400,type:'sine'}); setTimeout(()=>playTone({freq:300,type:'sine'}),100); },
    move: ()=>{ playTone({freq:800,duration:0.08,type:'square'}); },
    kick: ()=>{ playTone({freq:180,duration:0.15,type:'square'}); setTimeout(()=>playTone({freq:120,duration:0.25,type:'sawtooth'}),100); },
    message: ()=>{ playTone({freq:520,duration:0.08,type:'square'}); },
    reply: ()=>{ playTone({freq:660,duration:0.15,type:'sawtooth',gain:0.2}); },
    ad: ()=>{ 
      playTone({freq:780,duration:0.18,type:'triangle',gain:0.25});
      setTimeout(()=>playTone({freq:880,duration:0.15,type:'sawtooth',gain:0.2}),80);
    }
  };

  function processMessages(){
    document.querySelectorAll('.public_message.public_message_ad').forEach(msg=>{
      if(msg.dataset.processed_ad==='true') return;
      if(soundsEnabled){ ensureAudioContext(); soundMap.ad(); }
      msg.dataset.processed_ad='true';
    });

    document.querySelectorAll('.public_message.linen:not(.public_message_ad)').forEach(msg=>{
      if(msg.dataset.processed==='true') return;
      const text = msg.innerText.trim();
      let eventType=null;
      if(text.includes('دخل')){ msg.classList.add('js-join'); eventType='join'; }
      else if(text.includes('غادر')){ msg.classList.add('js-leave'); eventType='leave'; }
      else if(text.includes('إنتقل إلى')){ msg.classList.add('js-move'); eventType='move'; }
      else if(text.includes('تم طرده من الدردشة')){ msg.classList.add('js-kick'); eventType='kick'; }

      if(soundsEnabled && eventType && soundMap[eventType]){ ensureAudioContext(); soundMap[eventType](); }
      msg.dataset.processed='true';
    });

    document.querySelectorAll('.public_message--reply:not(.public_message_ad)').forEach(msg=>{
      if(msg.dataset.processed_reply==='true') return;
      if(soundsEnabled){ ensureAudioContext(); soundMap.reply(); }
      msg.dataset.processed_reply='true';
    });

    document.querySelectorAll('.public_message:not(.linen):not(.public_message_ad):not(.public_message--reply)').forEach(msg=>{
      if(msg.dataset.processed_message==='true') return;
      if(soundsEnabled){ ensureAudioContext(); soundMap.message(); }
      msg.dataset.processed_message='true';
    });
  }

  function init(){
    const settingsPane=document.querySelector('#chat__body');
    if(!settingsPane){ setTimeout(init,500); return; }

    let toggleBtn=document.getElementById('sound-toggle');
    if(!toggleBtn){
      toggleBtn=document.createElement('button');
      toggleBtn.id='sound-toggle';
      toggleBtn.dataset.enabled='false';
      toggleBtn.textContent='🔇 تفعيل الأصوات';
      settingsPane.appendChild(toggleBtn);
    }

    const saved=localStorage.getItem('chat_sounds_enabled');
    if(saved==='true'){ soundsEnabled=true; toggleBtn.dataset.enabled='true'; toggleBtn.textContent='🔊 الأصوات مفعّلة'; }

    processMessages();
    const observer=new MutationObserver(processMessages);
    observer.observe(document.body,{childList:true,subtree:true});

    toggleBtn.addEventListener('click',()=>{
      ensureAudioContext();
      soundsEnabled=!soundsEnabled;
      toggleBtn.dataset.enabled=soundsEnabled?'true':'false';
      toggleBtn.textContent=soundsEnabled?'🔊 الأصوات مفعّلة':'🔇 تفعيل الأصوات';
      localStorage.setItem('chat_sounds_enabled',soundsEnabled?'true':'false');
      if(soundsEnabled) playTone({freq:880});
    });
  }

  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded',init); }
  else{ init(); }
})();
