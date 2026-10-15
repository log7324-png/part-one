import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Leaf, BookOpen, Compass, ArrowUpRight, ArrowRight, Sparkles, X, Check, ChevronRight, Volume2, VolumeX, HelpCircle, Settings2, MapPin, Sun, Award, RotateCcw, Send, ExternalLink, Radio, Rocket, Anchor, Satellite, Shield, Wind, Factory, Ship, Waves, Loader2, Trees, Move, Target, CircleCheck, House, DoorOpen, PanelRightClose, PanelRightOpen, Maximize2, Minimize2 } from 'lucide-react';
import { COMPANIES, FACILITIES, COMPARE } from './data/content.js';
import { createVillageGame, makeExplorer, disposeGroup } from './game/VillageGame.js';
import { HOUSES, houseById } from './data/houses.js';
import { loadProgress, saveProgress, getFacility as getTechFacility, askQuestion, getSources } from './lib/learning.js';

const HUB = { id: 'hub', name: '중앙 광장', shortName: '중앙 광장', englishName: 'WELCOME, LITTLE EXPLORER', tagline: '새로운 발견이 기다리는 곳', description: '포근한 마을에 오신 것을 환영해요. 세 회사의 집으로 걸어가 새로운 기술을 만나보세요.', color: '#658b55', lightColor: '#e8efd9', guideName: '초록' };
function getFacility(id) { return getTechFacility(id); }
const ICONS = { radar: Radio, satellite: Satellite, combat: Shield, engine: Wind, launch: Rocket, ground: Factory, lng: Ship, naval: Anchor, offshore: Waves, 'portal-systems': Radio, 'portal-aerospace': Rocket, 'portal-ocean': Anchor };
function FacilityIcon({ id, size = 21, ...props }) { const Icon = ICONS[id] || Compass; return <Icon size={size} strokeWidth={1.65} {...props}/>; }
function Avatar({ color = '#58a45f', small = false }) { return <span className={`dog-avatar ${small ? 'small' : ''}`} style={{ '--shirt': color }} aria-hidden="true"><span className="dog-shirt"/><span className="dog-head"><i className="dog-ear left"/><i className="dog-ear right"/><i className="dog-blaze"/><i className="dog-eye left"/><i className="dog-eye right"/><i className="dog-muzzle"/><i className="dog-nose"/><i className="dog-smile"/><i className="dog-cheek left"/><i className="dog-cheek right"/></span></span>; }
function MeshAvatarPreview({ color }) {
  const mount=useRef(null);
  useEffect(()=>{
    const host=mount.current;
    if(!host)return;
    let renderer;
    try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});}
    catch{return;}
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
    renderer.setSize(144,154,false);
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.4;
    host.appendChild(renderer.domElement);
    const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(33,144/154,.1,20);
    camera.position.set(0,2.05,4.35);camera.lookAt(0,1.15,0);
    scene.add(new THREE.HemisphereLight('#fff9e9','#9b9e82',3));
    const sun=new THREE.DirectionalLight('#fff4d3',3);sun.position.set(-3,6,5);scene.add(sun);
    const character=makeExplorer(color);scene.add(character.group);
    let frame=0;
    const draw=time=>{character.group.rotation.y=Math.sin(time*.0008)*.3;renderer.render(scene,camera);frame=requestAnimationFrame(draw);};
    frame=requestAnimationFrame(draw);
    return()=>{cancelAnimationFrame(frame);scene.remove(character.group);disposeGroup(character.group);renderer.dispose();renderer.domElement.remove();};
  },[color]);
  return <span className="mesh-avatar-preview" role="img" aria-label="회전하는 3D 강아지 캐릭터" ref={mount}/>;
}

export default function App() {
  const [progress, setProgress] = useState(loadProgress);
  const [companyId, setCompanyId] = useState('hub');
  const [location, setLocation] = useState({ companyId: 'hub', label: '중앙 광장', interior: false });
  const [modal, setModal] = useState(null);
  const [facilityId, setFacilityId] = useState(null);
  const [residentHouseId, setResidentHouseId] = useState(null);
  const [panelTab, setPanelTab] = useState('learn');
  const [nearby, setNearby] = useState(null);
  const [ready, setReady] = useState(false);
  const [sound, setSound] = useState(false);
  const [toast, setToast] = useState('');
  const [notice, setNotice] = useState(true);
  const [guideOpen, setGuideOpen] = useState(() => window.innerWidth >= 1000);
  const [immersive, setImmersive] = useState(false);
  const [gameError, setGameError] = useState('');
  const canvasRef = useRef(null), gameRef = useRef(null), openRef = useRef(null), closeRef = useRef(null), audioRef = useRef(null);
  const company = COMPANIES.find(c => c.id === companyId) || HUB;
  const facilities = HOUSES;
  const selected = getFacility(facilityId);
  const residentHouse = houseById(residentHouseId);

  function openFacility(id) {
    const facility = getTechFacility(id);
    if (!facility) return;
    setFacilityId(id);
    setPanelTab('learn');
    setModal('facility');
    setProgress(p => ({ ...p, visited: [...new Set([...p.visited, id])] }));
  }
  function closeModal() { setModal(null); }
  openRef.current = openFacility;
  closeRef.current = closeModal;

  useEffect(() => {
    try {
      gameRef.current = createVillageGame(canvasRef.current, {
        companyId: 'hub',
        color: progress.color,
        onInteract: id => openRef.current(id),
        onResident: id => { setResidentHouseId(id);setModal('resident'); },
        onNearby: value => setNearby(value),
        onReady: () => setReady(true),
        onLocationChange: next => {
          setLocation(next);
          setCompanyId(previous => previous === next.companyId ? previous : next.companyId);
          setNearby(null);
          if (next.interior && next.facilityId) {
            setProgress(p => ({ ...p, visited: [...new Set([...p.visited, next.facilityId])] }));
          }
        },
        onError: message => { setGameError(message); setReady(true); }
      });
    } catch (error) {
      setGameError('3D 마을을 열지 못했어요. WebGL을 지원하는 최신 브라우저에서 다시 시도해 주세요.');
      setReady(true);
      console.error(error);
    }
    return () => { gameRef.current?.destroy(); gameRef.current = null; };
  }, []);
  useEffect(() => { gameRef.current?.setCompany(companyId); setNearby(null); }, [companyId]);
  useEffect(() => { gameRef.current?.setPaused(!!modal); }, [modal]);
  useEffect(() => { gameRef.current?.setCharacterColor(progress.color); saveProgress(progress); }, [progress]);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(''), 4200);
    return () => clearTimeout(id);
  }, [toast]);
  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') { closeRef.current(); setImmersive(false); } };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);
  useEffect(() => {
    if (!sound) {
      if (audioRef.current && audioRef.current.state !== 'closed') audioRef.current.close();
      audioRef.current = null;
      return;
    }
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return;
    const context = new Context();
    audioRef.current = context;
    context.resume();
    let step = 0;
    const notes = [261.63, 329.63, 392, 329.63, 293.66, 349.23, 440, 349.23];
    const play = () => {
      if (context.state === 'closed') return;
      const oscillator = context.createOscillator(), gain = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = notes[step++ % notes.length];
      gain.gain.setValueAtTime(0, context.currentTime);
      gain.gain.linearRampToValueAtTime(.016, context.currentTime + .15);
      gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + 1.6);
      oscillator.connect(gain); gain.connect(context.destination);
      oscillator.start(); oscillator.stop(context.currentTime + 1.7);
    };
    play();
    const id = setInterval(play, 1000);
    return () => { clearInterval(id); if (context.state !== 'closed') context.close(); };
  }, [sound]);

  function visit(id) {
    setModal(null);
    setNotice(false);
    gameRef.current?.setPaused(false);
    gameRef.current?.moveToFacility(id);
  }
  function interact() {
    if (!nearby) return;
    if (nearby.type === 'inspect') openFacility(nearby.id);
    else if (nearby.type === 'resident') { setResidentHouseId(nearby.id);setModal('resident'); }
    else if (nearby.type === 'exit') gameRef.current?.exitInterior();
    else if (nearby.type === 'company') visit(`portal-${nearby.id.replace(/^portal-/, '')}`);
    else visit(nearby.id);
    setNotice(false);
  }
  function complete(id) {
    setProgress(p => ({ ...p, completed: [...new Set([...p.completed, id])] }));
    setToast(`${getFacility(id).name} 배지를 얻었어요!`);
  }

  return <div className={`app-shell ${immersive ? 'immersive' : ''}`}>
    <header className="topbar">
      <a href="#" className="brand" onClick={e => { e.preventDefault(); closeModal(); }} aria-label="탐험 화면으로">
        <span className="brand-mark"><Leaf size={24}/></span>
        <span>한화 테크 빌리지<small>HANWHA TECH VILLAGE</small></span>
      </a>
      <nav className="main-nav" aria-label="주요 메뉴">
        <button className={!modal || modal === 'facility' ? 'active' : ''} onClick={closeModal}><Compass size={18}/>마을 탐험</button>
        <button className={modal === 'notebook' ? 'active' : ''} onClick={() => setModal('notebook')}><BookOpen size={18}/>기술 도감<span className="nav-count">{progress.visited.length}</span></button>
        <button className={modal === 'compare' ? 'active' : ''} onClick={() => setModal('compare')}><Trees size={18}/>회사 비교</button>
      </nav>
      <div className="header-actions">
        <button className="icon-button" aria-label={sound ? '배경음 끄기' : '배경음 켜기'} aria-pressed={sound} onClick={() => setSound(!sound)}>{sound ? <Volume2 size={19}/> : <VolumeX size={19}/>}</button>
        <button className="icon-button" aria-label="이용 안내" onClick={() => setModal('help')}><HelpCircle size={19}/></button>
        <span className="header-divider"/>
        <button className="profile-button" aria-label={`${progress.name} 탐험가 설정`} onClick={() => setModal('profile')}><Avatar color={progress.color} small/><span>{progress.name || '탐험가'}</span><Settings2 size={14}/></button>
      </div>
    </header>

    <main className="village-main">
      <div className="village-strip">
        <div className="strip-intro"><span className="tiny-flower">✿</span><div><strong>오늘은 어떤 발견을 할까요?</strong><span>걸어서 만나보는 한화의 기술</span></div></div>
        <div className="house-tabs" aria-label="다섯 기술의 집">
          {HOUSES.map(house => <button key={house.id} onClick={() => visit(house.id)} title={`${COMPANIES.find(c=>c.id===house.companyId)?.name} · ${house.subtitle}`}><FacilityIcon id={house.icon} size={16}/><span>{house.name}</span></button>)}
        </div>
        <button className="badge-counter" aria-label={`기술 배지 ${progress.completed.length}개, 도감 열기`} onClick={() => setModal('notebook')}><Award size={20}/><strong>{progress.completed.length}<small> / 9</small></strong></button>
      </div>

      <section className={`world-frame ${guideOpen ? 'guide-visible' : ''}`} aria-label="3D 마을 탐험" style={{ '--company-color': company.color }}>
        <div ref={canvasRef} className="game-canvas" role="application" aria-label={`${location.label || company.name}. 실제 3D 공간에서 방향키 또는 WASD로 이동하세요. 집 문으로 걸어 들어가고 실내 전시물 앞에서 E를 누르면 설명이 열립니다.`}/>
        {!ready && <div className="game-loading"><span className="loading-leaf"><Leaf size={34}/></span><strong>작은 마을을 준비하고 있어요</strong><span>햇살과 나무, 그리고 새로운 발견까지.</span></div>}
        {gameError && <div className="game-error" role="alert"><HelpCircle size={28}/><h2>마을을 불러오지 못했어요</h2><p>{gameError}</p><button onClick={() => window.location.reload()} className="primary-button">다시 불러오기</button></div>}

        <div className="world-hud">
          <div className="location-card"><span className="location-icon">{location.interior ? <House size={21}/> : <MapPin size={21}/>}</span><div><small>{location.interior ? 'INSIDE THE HOUSE' : 'A LITTLE WORLD OF DISCOVERY'}</small><h1>{location.label || company.name}</h1><span>{location.interior ? '전시물 앞에서 E를 눌러 살펴보세요' : company.tagline}</span></div></div>
          <div className="world-tools"><span className="weather-pill"><Sun size={19}/><span>맑음 · 느긋한 오후</span></span><button className="round-tool" aria-label={immersive ? '기본 화면으로' : '넓게 탐험하기'} onClick={() => setImmersive(!immersive)}>{immersive ? <Minimize2 size={18}/> : <Maximize2 size={18}/>}</button><button className="round-tool" aria-label={guideOpen ? '마을 안내 접기' : '마을 안내 펼치기'} onClick={() => setGuideOpen(!guideOpen)}>{guideOpen ? <PanelRightClose size={18}/> : <PanelRightOpen size={18}/>}</button></div>
        </div>

        {notice && !modal && <div className="welcome-bubble"><span className="welcome-flower">✿</span><div><strong>어서 와요, {progress.name || '탐험가'}님!</strong><p>방향키로 걸어가 집 안을 탐험해 보세요.</p></div><button aria-label="환영 안내 닫기" onClick={() => setNotice(false)}><X size={15}/></button></div>}

        {guideOpen && !immersive && <aside className="village-guide">
          <div className="guide-heading"><span><BookOpen size={14}/>마을 안내서</span><small>VILLAGE GUIDE</small></div>
          <div className="company-intro"><span className="company-symbol" style={{ background: company.lightColor, color: company.color }}>{companyId === 'hub' ? <House size={26}/> : <FacilityIcon id={`portal-${companyId}`} size={26}/>}</span><div><small>{companyId === 'hub' ? 'START YOUR LITTLE JOURNEY' : company.englishName}</small><h2>{company.name}</h2></div></div>
          <p className="company-description">한 마을에 다섯 집이 모여 있어요. 시스템 2채, 에어로스페이스 2채, 바닷가 오션 1채를 둘러보세요.</p>
          <div className="guide-quote"><Leaf size={18}/><p>{location.interior ? '집 안에서도 자유롭게 걸어보세요. 전시물을 살펴본 뒤 문으로 나오면 돼요.' : '아래 집을 고르면 문까지 걸어가요. 집 안에서 전시물을 직접 만나보세요.'}</p></div>
          <div className="facility-heading"><h3>방문할 주민의 집</h3><span>05 HOMES</span></div>
          <div className="facility-list">{facilities.map(f => <button key={f.id} className={`facility-card ${location.facilityId === f.id ? 'current' : ''}`} onClick={() => visit(f.id)}><span className={`facility-icon ${f.topics.every(id=>progress.completed.includes(id)) ? 'done' : ''}`}>{f.topics.every(id=>progress.completed.includes(id)) ? <CircleCheck size={20}/> : <FacilityIcon id={f.icon} size={20}/>}</span><span className="facility-card-copy"><strong>{f.name} · {f.resident}</strong><small>{location.facilityId === f.id ? '지금 이 집 안에 있어요' : f.subtitle}</small></span><ChevronRight size={15}/></button>)}</div>
          <button className="compare-link" onClick={() => setModal('compare')}><Trees size={17}/><span>세 회사의 역할 비교하기</span><ArrowUpRight size={16}/></button>
          <div className="guide-footer"><span className="live-dot"/>{import.meta.env.VITE_API_BASE_URL ? '공식 자료 기반 AI 연결' : '공식 자료 기반 도감 모드'}</div>
        </aside>}

        <div className="world-bottom">
          <div className="controls-card"><span className="control-heading"><Move size={15}/>천천히, 걸어보세요</span><div><span><kbd>↑</kbd><kbd>←</kbd><kbd>↓</kbd><kbd>→</kbd><em>이동</em></span><i/><span><kbd>E</kbd><em>살펴보기</em></span><i/><span><kbd>Esc</kbd><em>닫기</em></span></div><small>집 문으로 걸어 들어가면, 새로운 공간이 펼쳐져요.</small></div>
          <div className="world-status"><span className="status-tag"><span/>LIVE 3D</span>{location.interior && <button className="exit-room" onClick={() => gameRef.current?.exitInterior()}><DoorOpen size={17}/>집 밖으로</button>}<button className="exploration-note" onClick={() => setModal('notebook')}><BookOpen size={16}/>{progress.visited.length}개의 발견<ChevronRight size={14}/></button></div>
        </div>

        {nearby && !modal && <button className="interact-prompt" onClick={interact}><kbd>E</kbd><span>{nearby.label?.replace(/^E\s+/, '') || (nearby.type === 'inspect' ? '전시물 살펴보기' : nearby.type === 'exit' ? '집 밖으로 나가기' : '집으로 들어가기')}</span><ArrowRight size={17}/></button>}
        <div className="touch-controls" aria-label="터치 이동">
          <button aria-label="위로 이동" onPointerDown={() => gameRef.current?.setDirection(0, -1)} onPointerUp={() => gameRef.current?.setDirection(0, 0)} onPointerLeave={() => gameRef.current?.setDirection(0, 0)}>↑</button>
          <div>{[[-1, 0, '←', '왼쪽'], [0, 1, '↓', '아래'], [1, 0, '→', '오른쪽']].map(([x, y, text, label]) => <button key={label} aria-label={`${label}으로 이동`} onPointerDown={() => gameRef.current?.setDirection(x, y)} onPointerUp={() => gameRef.current?.setDirection(0, 0)} onPointerLeave={() => gameRef.current?.setDirection(0, 0)}>{text}</button>)}</div>
        </div>
      </section>
      <footer className="village-footer"><span><Leaf size={13}/>작은 발견이 모여, 기술을 이해하는 힘이 돼요.</span><span>9개의 기술 · 3개의 회사 · 나만의 탐험</span><button onClick={() => setModal('help')}>탐험 안내<ArrowUpRight size={12}/></button></footer>
    </main>

    {toast && <div className="toast" role="status"><Award size={19}/>{toast}</div>}
    {modal && <Modal title={modal === 'facility' ? selected?.name : modal === 'resident' ? `주민 ${residentHouse?.resident||''}` : modal === 'notebook' ? '나의 기술 도감' : modal === 'compare' ? '세 회사의 기술 지도' : modal === 'profile' ? '나의 탐험가' : '마을을 탐험하는 방법'} subtitle={modal === 'facility' ? COMPANIES.find(c => c.id === selected?.companyId)?.name : modal === 'resident' ? residentHouse?.name : 'HANWHA TECH VILLAGE'} onClose={closeModal} wide={['facility', 'notebook', 'compare'].includes(modal)}>
      {modal === 'facility' && selected && <FacilityPanel key={selected.id} facility={selected} tab={panelTab} setTab={setPanelTab} completed={progress.completed.includes(selected.id)} onComplete={() => complete(selected.id)}/>}
      {modal === 'resident' && residentHouse && <div className="panel-body resident-panel"><div className="resident-greeting"><span>✿</span><div><strong>안녕! 나는 {residentHouse.resident}야.</strong><p>{residentHouse.residentIntro}</p><p>우리 집에서 어떤 기술을 먼저 만나볼래?</p></div></div><div className="resident-topics">{residentHouse.topics.map(id=><button key={id} onClick={()=>{setModal(null);gameRef.current?.setPaused(false);gameRef.current?.moveToFacility(id);}}><FacilityIcon id={id} size={20}/><span>{getTechFacility(id)?.name}</span><ArrowRight size={16}/></button>)}</div></div>}
      {modal === 'notebook' && <Notebook progress={progress} onOpen={openFacility} onVisit={visit}/>}
      {modal === 'compare' && <Comparison onOpen={visit}/>}
      {modal === 'profile' && <Profile progress={progress} onSave={p => { setProgress(p); closeModal(); setToast('탐험가의 새 모습이 준비됐어요.'); }}/>}
      {modal === 'help' && <Help onReset={() => { setProgress(p => ({ ...p, visited: [], completed: [] })); closeModal(); setToast('도감과 배지를 초기화했어요.'); }}/>}
    </Modal>}
  </div>;
}
function Modal({ title, subtitle, onClose, wide, children }) {
  const ref = useRef(null), previousFocus = useRef(null);
  useEffect(() => { previousFocus.current = document.activeElement; ref.current?.focus(); const prior = document.body.style.overflow; document.body.style.overflow = 'hidden'; const trap = e => { if (e.key !== 'Tab') return; const items = [...ref.current.querySelectorAll('button:not(:disabled), a[href], input, select, textarea, [tabindex="0"]')].filter(x => x.getClientRects().length); if (!items.length) { e.preventDefault(); return; } const first = items[0], last = items.at(-1); if (e.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } }; const node = ref.current; node?.addEventListener('keydown', trap); return () => { document.body.style.overflow = prior; node?.removeEventListener('keydown', trap); previousFocus.current?.focus?.(); }; }, []);
  return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}><section className={`modal ${wide ? 'wide' : ''}`} ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-header"><div><small>{subtitle}</small><h2 id="modal-title">{title}<span className="heading-leaf"><Leaf size={22}/></span></h2></div><button className="close-button" onClick={onClose} aria-label="닫기"><X size={21}/></button></div>{children}</section></div>;
}
function FacilityPanel({ facility: f, tab, setTab, completed, onComplete }) {
  const [depth, setDepth] = useState('intro');
  return <><div className="panel-tabs" role="tablist"><button role="tab" aria-selected={tab === 'learn'} className={tab === 'learn' ? 'active' : ''} onClick={() => setTab('learn')}><BookOpen size={16}/>쉬운 설명</button><button role="tab" aria-selected={tab === 'play'} className={tab === 'play' ? 'active' : ''} onClick={() => setTab('play')}><Target size={16}/>직접 체험{completed && <Check size={13}/>}</button><button role="tab" aria-selected={tab === 'ask'} className={tab === 'ask' ? 'active' : ''} onClick={() => setTab('ask')}><Sparkles size={16}/>질문 안내소</button><button role="tab" aria-selected={tab === 'sources'} className={tab === 'sources' ? 'active' : ''} onClick={() => setTab('sources')}><ExternalLink size={16}/>출처</button></div><div className="panel-body">{tab === 'learn' && <><div className="learning-title"><span className="learning-icon"><FacilityIcon id={f.id} size={29}/></span><div><small>이 기술을 한 문장으로</small><h3>{f.summary}</h3></div></div><div className="depth-toggle"><span>설명 깊이</span><button className={depth === 'intro' ? 'active' : ''} onClick={() => setDepth('intro')}>입문 설명</button><button className={depth === 'detail' ? 'active' : ''} onClick={() => setDepth('detail')}>조금 더 자세히</button></div><div className="analogy-card"><span>💡</span><div><strong>익숙한 것에 비유하면</strong><p>{f.analogy}</p><small>비유의 한계 · {f.analogyLimit}</small></div></div>{depth === 'detail' && <div className="principle-card"><h4>어떤 원리로 작동할까요?</h4><p>{f.principle}</p></div>}<div className="value-grid"><div><span className="section-tag">고객의 고민</span><h4>어떤 문제를 해결할까요?</h4><p>{f.problem}</p></div><div><span className="section-tag orange">기술이 만드는 가치</span><h4>그래서 무엇이 좋아질까요?</h4><p>{f.value}</p></div></div><Sources sources={f.sources} compact/><button className="primary-button full" onClick={() => setTab('play')}>작은 체험으로 이해하기 <ArrowRight size={17}/></button></>} {tab === 'play' && <Challenge facility={f} completed={completed} onComplete={onComplete}/>} {tab === 'ask' && <QuestionPanel facility={f}/>} {tab === 'sources' && <><p className="section-description">이 기술의 설명은 아래 공개 공식 자료를 바탕으로 정리했어요. 링크에서 원문을 확인할 수 있어요.</p><Sources sources={f.sources}/><div className="source-policy"><Shield size={18}/><p>기술의 역할과 고객 가치를 설명합니다. 실제 성능·계약·회사 간 협업은 근거가 확인되는 경우에만 다룹니다.</p></div></>}</div></>;
}
function Sources({ sources = [], compact }) {
  if (compact) return <details className="source-details"><summary><ExternalLink size={14}/>설명의 근거 확인하기 <span>{sources.length}개 공식 자료</span></summary><Sources sources={sources}/></details>;
  return <div className="source-list">{sources.map((s,i) => <a className="source-item" key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"><span className="source-number">{String(i+1).padStart(2,'0')}</span><div><strong>{s.title}</strong><small>{new URL(s.url).hostname} · 확인일 {s.checkedAt}</small>{s.body && <p>{s.body}</p>}</div><ArrowUpRight size={17}/></a>)}</div>;
}
function Challenge({ facility, completed, onComplete }) {
  const challenge = facility.challenge; const [order, setOrder] = useState([]), [wrong, setWrong] = useState(false), [passed, setPassed] = useState(false);
  const steps = challenge.steps; const choices = steps.map((text,index) => ({ text,index })).slice(1).concat({ text: steps[0], index: 0 });
  function pick(index) { if (index !== order.length) { setWrong(true); return; } setWrong(false); const next = [...order,index]; setOrder(next); if (next.length === steps.length) { setPassed(true); onComplete(); } }
  return <div className="challenge"><span className="pill-label"><Target size={14}/>작은 기술 미션</span><h3>{challenge.title}</h3><p>{challenge.instruction}</p><div className="challenge-note">개념 이해를 위한 체험이에요. 실제 장비의 성능을 재현하지 않습니다.</div><div className="sequence-path">{steps.map((_,i) => <React.Fragment key={i}><div className={order.includes(i) ? 'filled' : ''}><span>{order.includes(i) ? <Check size={17}/> : i+1}</span><small>{order.includes(i) ? steps[i] : '다음 단계를 골라요'}</small></div>{i < steps.length - 1 && <ArrowRight size={17}/>}</React.Fragment>)}</div><div className="choice-list">{choices.map(({text,index}) => <button key={index} disabled={order.includes(index) || passed} onClick={() => pick(index)} className={order.includes(index) ? 'chosen' : ''}><span>{order.includes(index) ? <CircleCheck size={20}/> : <span className="choice-circle"/>}</span>{text}<ChevronRight size={17}/></button>)}</div>{wrong && <p className="hint-message" role="status">조금만 다시 생각해 볼까요? 먼저 일어나는 단계를 골라보세요.</p>}{passed && <div className="success-card" role="status"><Award size={33}/><div><strong>새로운 기술 배지를 발견했어요!</strong><p>{challenge.explanation}</p></div></div>}<div className="challenge-footer"><button className="text-button" onClick={() => { setOrder([]); setPassed(false); setWrong(false); }}><RotateCcw size={15}/>다시 체험하기</button>{completed && <span><Check size={14}/>도감에 배지가 기록되었어요</span>}</div></div>;
}
function QuestionPanel({ facility }) {
  const [question,setQuestion] = useState(''), [answer,setAnswer] = useState(null), [busy,setBusy] = useState(false), [error,setError] = useState(''), [lastQuestion,setLastQuestion] = useState('');
  const controller = useRef(null); useEffect(() => () => controller.current?.abort(), []);
  async function submit(text) { const q = (text || question).trim(); if (!q || busy) return; setQuestion(q); setBusy(true); setError(''); controller.current = new AbortController(); const timeout = setTimeout(() => controller.current?.abort(), 45000); try { const a = await askQuestion(q, facility.companyId, facility.id, 'intro', controller.current.signal); setAnswer(a); setLastQuestion(q); } catch (e) { if (e.name === 'AbortError') setError('응답 시간이 길어지고 있어요. 다시 시도해 주세요.'); else setError(e.message); } finally { clearTimeout(timeout); setBusy(false); } }
  return <div className="questions"><div className="question-intro"><span className="sparkle-circle"><Sparkles size={25}/></span><h3>궁금한 만큼, 더 가까워지는 기술</h3><p>{import.meta.env.VITE_API_BASE_URL ? '공식 자료에서 근거를 찾아 답변해요.' : '지금은 공식 자료를 정리한 데모 답변을 제공해요.'}<br/>기술의 역할이나 세 회사의 차이를 물어보세요.</p></div><div className="suggestions">{[`${facility.name}을 쉽게 설명해줘`, '위성과 발사체는 어떻게 달라?', '함정과 전투체계는 어떤 관계야?'].map(q => <button key={q} disabled={busy} onClick={() => submit(q)}>{q}<ArrowUpRight size={14}/></button>)}</div><form className="question-form" onSubmit={e => { e.preventDefault(); submit(); }}><label className="sr-only" htmlFor="question">기술에 대한 질문</label><input id="question" value={question} onChange={e => setQuestion(e.target.value)} maxLength={1000} placeholder="이 기술이 누구에게 도움이 되나요?" autoComplete="off"/><button type="submit" disabled={busy || !question.trim()} aria-label="질문 보내기">{busy ? <Loader2 className="spin" size={20}/> : <Send size={19}/>}</button></form>{error && <div className="error-card" role="alert"><p>{error}</p><button disabled={busy} onClick={() => submit()}>다시 시도 <RotateCcw size={14}/></button></div>}{busy && <p className="loading-copy" role="status">도감에서 관련 자료를 찾고 있어요…</p>}{answer && <div className="answer-card"><div className="answer-heading"><Sparkles size={17}/><strong>{answer.mode === 'llm' ? 'AI 안내원의 답변' : '도감 안내원의 답변'}</strong><span>{answer.insufficient ? '자료 부족' : '출처 확인'}</span></div><small className="asked-question">{lastQuestion}</small><p className="answer-summary">{answer.summary}</p>{answer.analogy && <p><strong>쉬운 비유</strong><br/>{answer.analogy}<small className="analogy-limit">비유의 한계 · {answer.analogyLimit}</small></p>}{answer.principle && <p><strong>기본 원리</strong><br/>{answer.principle}</p>}{answer.problem && <p><strong>고객의 고민</strong><br/>{answer.problem}</p>}{answer.value && <p><strong>제공 가치</strong><br/>{answer.value}</p>}{answer.comparison?.length > 0 && <ComparisonTable rows={answer.comparison}/>} {answer.scopeNote && <p className="scope-note">{answer.scopeNote}</p>}{answer.sources?.length > 0 && <Sources sources={answer.sources} compact/>}{answer.insufficient && <p className="scope-note">다음 질문: “{facility.name}의 고객 가치는 무엇인가요?”</p>}</div>}</div>;
}
function Notebook({ progress, onOpen, onVisit }) {
  const [filter, setFilter] = useState('all');
  return <div className="panel-body notebook"><div className="notebook-summary"><BookOpen size={32}/><div><h3>{progress.name}님의 작은 발견들</h3><p>방문한 체험관 {progress.visited.length}/9 · 모은 기술 배지 {progress.completed.length}/9</p></div></div><div className="filter-row"><button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>전체</button>{COMPANIES.map(c => <button key={c.id} className={filter === c.id ? 'active' : ''} onClick={() => setFilter(c.id)}>{c.name}</button>)}</div><div className="notebook-grid">{FACILITIES.filter(f => filter === 'all' || f.companyId === filter).map(f => <button className={`notebook-card ${progress.visited.includes(f.id) ? 'discovered' : ''}`} key={f.id} onClick={() => progress.visited.includes(f.id) ? onOpen(f.id) : onVisit(f.id)}><span className="notebook-card-top"><span className="learning-icon"><FacilityIcon id={f.id} size={26}/></span>{progress.completed.includes(f.id) ? <Award size={23} className="badge-icon"/> : <span className="unvisited-label">{progress.visited.includes(f.id) ? '발견 완료' : '탐험 전'}</span>}</span><small>{COMPANIES.find(c => c.id === f.companyId).name}</small><h3>{f.name}</h3><p>{progress.visited.includes(f.id) ? f.summary : '어떤 기술이 기다리고 있을까요? 체험관을 방문해 발견해 보세요.'}</p><span className="card-action">{progress.visited.includes(f.id) ? '도감 읽기' : '이 집으로 걸어가기'}<ArrowRight size={15}/></span></button>)}</div></div>;
}
function ComparisonTable({ rows }) { return <div className="comparison-table-wrap"><table className="comparison-table"><thead><tr><th>회사</th><th>기술과 역할</th><th>고객에게 주는 가치</th></tr></thead><tbody>{rows.map(r => <tr key={r.companyId}><th>{COMPANIES.find(c => c.id === r.companyId)?.name || r.companyId}</th><td>{r.insufficient ? <span className="missing-label">관련 자료 부족</span> : <><strong>{r.technology}</strong><p>{r.role}</p></>}</td><td>{r.insufficient ? '현재 도감에서 확인할 자료가 없습니다.' : r.value}</td></tr>)}</tbody></table></div>; }
function Comparison({ onOpen }) {
  const [category,setCategory] = useState('space'); const rows = COMPARE[category];
  return <div className="panel-body"><div className="comparison-intro"><span className="pill-label"><Trees size={14}/>같은 주제, 다른 역할</span><h3>한화의 기술을 한눈에 연결해 보세요.</h3><p>각 회사가 맡는 역할을 이해하면, 사업의 차이도 더 선명해져요.</p></div><div className="compare-categories">{[{id:'space',name:'우주',icon:Rocket},{id:'ocean',name:'해양',icon:Anchor},{id:'defense',name:'방산',icon:Shield}].map(({id,name,icon:Icon}) => <button key={id} className={category === id ? 'active' : ''} onClick={() => setCategory(id)}><Icon size={19}/>{name}</button>)}</div><ComparisonTable rows={rows}/><p className="scope-note">공개 사업의 역할을 비교한 설명이에요. 특정 제품의 공동개발이나 공급 관계를 의미하지 않습니다.</p><div className="compare-visits">{[...new Set(rows.flatMap(r => r.facilityIds))].map(id => <button key={id} onClick={() => onOpen(id)}><FacilityIcon id={id} size={16}/>{getFacility(id)?.name}<ArrowUpRight size={14}/></button>)}</div><Sources sources={getSources(rows.flatMap(r => r.facilityIds))} compact/></div>;
}
function Profile({ progress, onSave }) {
  const [name,setName] = useState(progress.name), [color,setColor] = useState(progress.color);
  return <form className="panel-body profile-form" onSubmit={e => { e.preventDefault(); onSave({ ...progress,name:name.trim() || '탐험가',color }); }}><div className="profile-preview"><MeshAvatarPreview color={color}/><span>안녕, {name.trim() || '탐험가'}!</span></div><label htmlFor="explorer-name">탐험가 이름</label><input id="explorer-name" value={name} maxLength={12} onChange={e => setName(e.target.value)} placeholder="최대 12글자"/><label>초코의 체크 셔츠 색</label><div className="color-options">{['#58a45f','#ed9458','#73a6c4','#b69acc','#db8e9c'].map(c => <button type="button" key={c} style={{ background:c }} aria-label={`${c} 옷 색상`} aria-pressed={c === color} onClick={() => setColor(c)}>{c === color && <Check size={21}/>}</button>)}</div><button className="primary-button full">이 모습으로 탐험하기 <ArrowRight size={17}/></button><p className="privacy-note">이름과 탐험 기록은 이 브라우저에만 저장돼요.</p></form>;
}
function Help({ onReset }) {
  const [confirm,setConfirm] = useState(false);
  return <div className="panel-body help-panel"><p>급할 것 없어요. 길을 따라 걷다 보면 새로운 기술을 만나게 될 거예요.</p><div className="help-step"><span>01</span><div><h3>탐험할 회사를 선택해요</h3><p>중앙 광장에 있는 세 회사의 집 문으로 걸어가세요. 상단 버튼으로 마을을 바로 선택할 수도 있어요.</p></div></div><div className="help-step"><span>02</span><div><h3>캐릭터와 함께 이동해요</h3><p>WASD·방향키로 실제 3D 마을을 걸어보세요. 집의 현관으로 걸어 들어가면 실내로 이동해요. 안내서의 집을 누르면 문까지 자동으로 걸어가요.</p></div></div><div className="help-step"><span>03</span><div><h3>집 안에서 살펴보고, 체험해요</h3><p>실내에서도 자유롭게 이동할 수 있어요. 전시물 가까이에서 E를 눌러 설명과 체험을 열어보세요. 미션을 완료하면 배지를 얻어요. 출구로 걸어가면 집 밖으로 돌아와요.</p></div></div><div className="source-policy"><BookOpen size={18}/><p>키 없이 이용하는 버전은 검토된 자료를 정리한 데모 답변을 제공합니다. 실시간 생성형 AI는 서버 설정 후 연결할 수 있어요.</p></div><div className="reset-area"><button className="text-button" onClick={() => setConfirm(!confirm)}><RotateCcw size={14}/>탐험 기록 초기화</button>{confirm && <div><p>이 브라우저의 방문 기록과 배지 9개를 지울까요?</p><button onClick={onReset}>기록 지우기</button><button onClick={() => setConfirm(false)}>취소</button></div>}</div></div>;
}




