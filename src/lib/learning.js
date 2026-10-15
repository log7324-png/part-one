import { FACILITIES, COMPARE } from '../data/content.js';
const KEY = 'hanwha-island-explorer-v1';
export function loadProgress() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || '{}');
    const ids = new Set(FACILITIES.map(f => f.id));
    return { name: typeof value.name === 'string' ? value.name.slice(0, 12) : '탐험가', color: /^#[0-9a-f]{6}$/i.test(value.color || '') && (value.color.toLowerCase() !== '#ed9458' || value.outfitVersion === 2) ? value.color : '#58a45f', visited: [...new Set((Array.isArray(value.visited) ? value.visited : []).filter(id => ids.has(id)))], completed: [...new Set((Array.isArray(value.completed) ? value.completed : []).filter(id => ids.has(id)))] };
  } catch { return { name: '탐험가', color: '#58a45f', visited: [], completed: [] }; }
}
export function saveProgress(p) { try { localStorage.setItem(KEY, JSON.stringify({ ...p, outfitVersion: 2 })); } catch {} }
export function getFacility(id) { return FACILITIES.find(f => f.id === id); }
export function getSources(facilityIds) { return [...new Map(FACILITIES.filter(f => facilityIds.includes(f.id)).flatMap(f => f.sources).map(s => [s.id, s])).values()]; }
const aliases = {
  radar: ['레이다', '레이더', 'radar', 'aesa', '센서', '신호'], satellite: ['위성', '탑재체', '관측', 'sar', '카메라'], combat: ['전투체계', '관제', '전투 체계', 'cms'],
  engine: ['엔진', '항공', '가스터빈', '터빈'], launch: ['발사', '누리호', '로켓'], ground: ['지상', '자주포', 'k9', 'k10', '레드백'],
  lng: ['lng', '엘엔지', '천연가스', '액화', '운반', '운송'], naval: ['잠수함', '수상함', '함정', '특수선', '선체'], offshore: ['해양설비', '해양 설비', '생산설비', '해양플랜트', '크레인', 'flng', 'fpso', 'fpu']
};
const companyNames = { systems: /한화\s*시스템/, aerospace: /한화\s*에어로스페이스/, ocean: /한화\s*오션/ };
// Only short, context-only follow-ups may fall back to the current facility.
// An unknown explicit topic such as "초전도체 설명해줘" must not become radar content.
function isContextFollowup(q) {
  let text = q.replace(/[\s?.!,~·]/g, '');
  const phrases = ['이기술', '그기술', '해당기술', '현재기술', '선택한기술', '이장비', '그장비', '이시설', '현재시설', '지금', '조금', '더', '좀', '다시', '쉽게', '자세히', '간단히', '한줄로', '기본', '원리', '고객', '가치', '제공', '문제', '비유', '누구에게', '어떤', '무슨', '도움', '해결', '필요', '왜', '어디에', '쓰이나요', '쓰여', '되나요', '되니', '되는지', '무엇인가요', '무엇인지', '뭐야', '뭔가요', '설명해주세요', '설명해줘', '설명해', '설명', '알려주세요', '알려줘', '알려', '주세요', '해줘', '해요', '하나요', '해', '나요', '인지', '인가요', '한테', '에게', '에서', '대한', '대해', '관해', '은', '는', '이', '가', '을', '를', '의', '에'].sort((a, b) => b.length - a.length);
  while (text) {
    const phrase = phrases.find(p => text.startsWith(p));
    if (!phrase) return false;
    text = text.slice(phrase.length);
  }
  return /설명|원리|고객|가치|문제|비유|누구|무엇|뭐야|쉽게|도움|필요/.test(q);
}
function explanation(f, summary = f.summary) {
  return { summary, analogy: f.analogy, analogyLimit: f.analogyLimit, principle: f.principle, problem: f.problem, value: f.value, comparison: [], sources: f.sources, insufficient: false, mode: 'demo' };
}
export function demoAnswer(question, companyId, facilityId) {
  const q = question.trim().toLowerCase();
  const restricted = /주가|주식|투자|연봉|채용|합격|내부|기밀|사거리|탐지\s*거리|정확한\s*성능|계약금|지원\s*마감|날씨|맛집|비밀번호|ignore|system\s*prompt|(?:지시|지침|규칙|출처).*무시|없는.*출처|출처.*(?:만들|조작)|공동.*개발|협업.*계약|함께.*(?:만들|건조|개발)/;
  if (q.length < 2 || restricted.test(q)) return insufficient('이 질문을 확인할 수 있는 자료가 도감에 없어요. 공개된 기술의 역할과 고객 가치에 대해 물어봐 주세요.');
  const matched = FACILITIES.filter(f => aliases[f.id].some(a => /^[a-z0-9]+$/.test(a) ? new RegExp(`(?:^|[^a-z0-9])${a}(?=$|[^a-z0-9])`).test(q) : q.includes(a)));
  const namedCompanies = Object.keys(companyNames).filter(id => companyNames[id].test(q));
  const targetCompany = namedCompanies.length === 1 ? namedCompanies[0] : companyId;
  if (namedCompanies.length === 1 && matched.length && !matched.some(f => f.companyId === targetCompany)) return insufficient('질문에 나온 회사와 기술을 연결하는 근거가 현재 도감에 없어요. 해당 사업이 없다는 뜻은 아니며 추가 공식 자료가 필요해요.');
  if (/비교|차이|세\s*회사|3사|어떻게\s*달라|역할.*다|관계|회사별/.test(q)) {
    if (!matched.length && namedCompanies.length < 2 && !/우주|바다|해양|방산|세\s*회사|3사/.test(q)) return insufficient('비교하려는 기술의 자료가 도감에 없어요. 우주·해양·방산 또는 도감의 기술 이름을 포함해 질문해 주세요.');
    if (/sar/.test(q) && /카메라|광학/.test(q) && !/회사|3사/.test(q)) return explanation(getFacility('satellite'), 'SAR는 전파의 반사 신호로, 일반 광학 카메라는 빛으로 관측 정보를 얻어요. 위성 관측에는 임무에 맞는 서로 다른 탑재체를 사용해요.');
    if (matched.some(f => f.id === 'offshore') && /운반선|운송/.test(q) && !/회사|3사/.test(q)) {
      const answer = explanation(getFacility('offshore'), '해양 생산설비는 바다에서 에너지를 생산·처리하고, LNG 운반선은 생산지와 수요지를 연결해 화물을 운송해요. 설비와 운송 선박은 서로 다른 역할이에요.');
      return { ...answer, sources: getSources(['offshore', 'lng']) };
    }
    const category = /우주|위성|발사/.test(q) ? 'space' : /바다|해양|함정|전투체계|잠수함|선박/.test(q) ? 'ocean' : 'defense';
    const rows = COMPARE[category];
    return { summary: category === 'space' ? '위성 탑재체는 정보를 얻는 장치, 발사체는 우주로 운반하는 수단이에요.' : category === 'ocean' ? '선박은 바다에서 임무를 수행하는 플랫폼, 전투체계는 여러 정보를 연결해 판단을 돕는 시스템이에요.' : '세 회사의 공개 사업을 감지·판단, 추진·운용, 해상 플랫폼이라는 역할로 비교할 수 있어요.', comparison: rows, sources: getSources(rows.flatMap(r => r.facilityIds)), insufficient: false, mode: 'demo', scopeNote: '사업 역할을 비교한 설명입니다. 특정 제품의 공동사업 관계를 뜻하지 않습니다.' };
  }
  let f = matched.find(f => f.companyId === targetCompany) || matched[0];
  if (!f && isContextFollowup(q)) f = getFacility(facilityId);
  if (!f) return insufficient('도감의 9개 기술에서 관련 자료를 찾지 못했어요. 레이다, 발사체, LNG 운반선처럼 기술 이름을 포함해서 질문해 주세요.');
  if (f.id === 'engine' && /생산만/.test(q)) return explanation(f, '엔진 생산뿐 아니라 설계·개발, 시험·인증과 유지보수·정비 역량도 소개하고 있어요. 공식 자료는 해외 회사와의 기술협력 생산과 독자 엔진 개발 역량을 구분해서 설명해요.');
  return explanation(f);
}
function insufficient(summary) { return { summary, insufficient: true, sources: [], comparison: [], mode: 'demo' }; }
export async function askQuestion(question, companyId, facilityId, depth, signal) {
  const base = import.meta.env.VITE_API_BASE_URL;
  if (!base) return demoAnswer(question, companyId, facilityId);
  const response = await fetch(`${base.replace(/\/$/, '')}/api/ask`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question, companyId, facilityId, depth, comparison: /비교|차이|세 회사|어떻게 달라|관계/.test(question) }), signal });
  if (!response.ok) throw new Error(response.status === 429 ? '오늘의 질문 한도에 도달했어요. 도감과 기술 체험은 계속 이용할 수 있어요.' : '질문 안내소에 잠시 연결되지 않아요. 입력을 유지했으니 다시 시도해 주세요.');
  return response.json();
}
