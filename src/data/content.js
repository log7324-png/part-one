// Reviewed educational paraphrases. Analogies and game steps are learning aids;
// they are not specifications, operational procedures, or physical simulations.
const source = (id, title, url, body) => ({ id, title, url, checkedAt: '2026-10-14', body });

export const COMPANIES = [
  { id: 'systems', name: '한화시스템', shortName: '시스템', englishName: 'HANWHA SYSTEMS', tagline: '세상을 발견하는 기술', description: '센서가 발견한 정보를 연결하고, 사람이 더 잘 판단할 수 있도록 돕는 섬이에요.', color: '#529b85', lightColor: '#e5f3ea', guideName: '모아', guideRole: '관측 연구원' },
  { id: 'aerospace', name: '한화에어로스페이스', shortName: '에어로스페이스', englishName: 'HANWHA AEROSPACE', tagline: '새로운 길을 여는 기술', description: '항공엔진부터 발사체와 지상장비까지, 움직임과 임무 수행을 가능하게 하는 섬이에요.', color: '#d28c53', lightColor: '#faeedc', guideName: '누리', guideRole: '추진 연구원' },
  { id: 'ocean', name: '한화오션', shortName: '오션', englishName: 'HANWHA OCEAN', tagline: '바다를 연결하는 기술', description: '에너지를 실어 나르고, 해양 임무와 에너지 생산을 위한 배와 설비를 만드는 섬이에요.', color: '#508fa7', lightColor: '#e2f1f5', guideName: '바다', guideRole: '조선 연구원' },
];

export const FACILITIES = [
  {
    id: 'radar', companyId: 'systems', name: '레이다 연구소', subtitle: '보이지 않는 정보를 발견해요', icon: 'radar',
    summary: '레이다는 전파로 주변 대상을 탐지하고, 위치와 움직임을 알아내는 센서예요.',
    analogy: '안개 속에서 손전등을 비추고 돌아오는 빛을 살펴보는 탐험가를 떠올려 보세요.',
    analogyLimit: '실제 레이다는 눈에 보이는 빛 대신 전파를 쓰고, 돌아온 신호를 장비가 계산해요.',
    principle: '전파를 보내고 돌아오는 신호를 처리해 대상 정보를 얻어요. AESA 레이다는 여러 송수신 모듈로 전파의 방향을 전자적으로 조절해 탐지와 추적 등 여러 임무를 수행해요.',
    problem: '항공기나 함정을 운용할 때 주변 상황을 빠르게 알아야 하지만, 사람의 눈만으로 모든 대상을 확인하기는 어려워요.',
    value: '운용자가 주변 상황을 파악하는 데 필요한 정보를 제공해요. 한화시스템은 항공·지상·해상용 레이다 기술을 개발해요.',
    tags: ['레이다', '레이더', 'radar', 'AESA', '센서', '탐지', '추적', '전파', '방산'],
    sources: [
      source('radar-01', '한화시스템 · 레이다 사업 소개', 'https://www.hanwhasystems.com/kr/business/defense/isr/radar_index.do', '한화시스템은 지상·함정 방공용 다기능레이다와 항공용 AESA 레이다를 소개한다. 레이다 하드웨어와 소프트웨어를 개발하며 탐지·추적용 제품을 제공한다.'),
      source('radar-02', '한화시스템 · KF-21 AESA 레이다', 'https://www.hanwhasystems.com/m/kr/business/defense/isr/radar01-aesa.do', 'AESA 레이다는 항공기의 항전센서로 대상을 탐지·추적하고 거리, 방향, 고도와 속도 정보를 얻는다. 안테나와 반도체 송수신 모듈을 이용해 전파 방향을 조절한다.'),
    ],
    challenge: { type: 'sequence', title: '레이다의 신호 여행', instruction: '전파가 정보를 만드는 흐름대로 세 카드를 선택해 주세요.', steps: ['전파를 보내요', '돌아온 신호를 받아요', '대상의 정보를 해석해요'], explanation: '신호를 보내고, 받고, 해석하면 주변 대상을 이해할 수 있어요. 이 체험은 개념 순서이며 탐지 성능을 계산하지 않아요.' },
  },
  {
    id: 'satellite', companyId: 'systems', name: '위성 관측소', subtitle: '우주에서 지구를 살펴봐요', icon: 'satellite',
    summary: '위성 탑재체는 위성에 실려 관측이나 통신 같은 임무를 수행하는 핵심 장비예요.',
    analogy: '여행 버스에 실린 카메라를 생각해 보세요. 위성이 버스라면 관측 탑재체는 풍경을 기록하는 카메라예요.',
    analogyLimit: '위성에는 관측장비 외에 전력·통신·자세제어 장치도 필요해요. 모든 위성 탑재체가 카메라는 아니에요.',
    principle: '전자광학·적외선 탑재체는 빛과 열에 관한 정보를, SAR 탑재체는 전파로 얻은 정보를 영상으로 만들어요. SAR는 주야간과 날씨의 영향을 덜 받으며 관측할 수 있어요.',
    problem: '국토나 해양의 넓은 지역을 계속 살펴보고 변화와 재난 상황을 파악해야 해요.',
    value: '멀리 떨어진 지역의 관측 정보를 제공해 국토 관리와 재난 대응 등의 판단을 도와요. 한화시스템은 위성 탑재체와 소형 SAR 위성 사업을 수행해요.',
    tags: ['위성', '탑재체', 'satellite', 'SAR', 'EO', 'IR', '관측', '우주', '카메라', '재난'],
    sources: [
      source('satellite-01', '한화시스템 · 우주 사업 소개', 'https://www.hanwhasystems.com/kr/business/defense/space/space_index.do', '한화시스템은 위성용 전자광학·적외선 센서와 SAR 탑재체를 제공한다. 전자광학·적외선 장비는 관측 영상을 얻고 SAR는 전파의 반사 신호를 처리해 지표와 해양을 관찰한다. 관측 정보는 국토·자원관리와 재난 대응 등에 활용된다.'),
      source('satellite-02', '한화그룹 · Hanwha Systems', 'https://www.hanwha.com/companies/hanwha-systems.do', '한화시스템은 소형 SAR 위성과 관측영상 분석 사업을 소개한다. SAR 위성은 주야간 및 다양한 날씨에서 자료를 얻으며, 관측영상은 국토·해양 모니터링과 재난 관리 등에서 활용할 수 있다.'),
    ],
    challenge: { type: 'sequence', title: '관측 정보를 배달해요', instruction: '관측에서 활용까지, 정보의 여행 순서를 완성해 주세요.', steps: ['관측할 지역을 정해요', '탑재체로 정보를 얻어요', '정보를 분석해 변화에 대비해요'], explanation: '발사체가 위성을 우주로 보내면, 위성의 관측 탑재체는 정보를 얻는 임무를 수행해요. 발사와 관측은 서로 다른 역할이에요.' },
  },
  {
    id: 'combat', companyId: 'systems', name: '함정 관제실', subtitle: '흩어진 정보를 한눈에 모아요', icon: 'combat',
    summary: '함정 전투체계는 배의 센서와 여러 장비를 연결해 전술 상황 파악과 운용을 돕는 시스템이에요.',
    analogy: '여러 팀원의 소식을 모아 상황을 정리하는 팀장의 공동 상황판과 비슷해요.',
    analogyLimit: '실제 전투체계는 장비 간 연동과 통제를 담당하는 복잡한 시스템이며, 모든 판단을 사람 대신 혼자 내리는 것은 아니에요.',
    principle: '센서에서 들어오는 정보를 모으고 분석해 운용자가 상황을 확인할 수 있도록 해요. 연결된 무장과 장비의 운용을 통합하는 역할도 수행해요.',
    problem: '배에 있는 여러 센서와 장비를 따로 살펴보면 같은 상황을 함께 이해하고 대응하기 어려워요.',
    value: '정보와 장비를 연결해 상황 인식과 지휘를 지원해요. 한화시스템의 역할은 함정 자체를 만드는 조선 사업과 구분할 수 있어요.',
    tags: ['함정', '전투체계', 'CMS', 'combat', '관제', '상황판', '통합', '센서', '해양', '방산'],
    sources: [
      source('combat-01', '한화시스템 · 함정 전투체계', 'https://www.hanwhasystems.com/kr/business/defense/naval/combat_index.do', '함정 전투체계는 탑재 센서와 무장을 하나의 시스템으로 연결한다. 센서 자료를 분석해 위협을 식별하고 장비 운용과 지휘를 지원하며, 구축함·호위함·잠수함 등 다양한 함정에 적용된다.'),
      source('combat-02', '한화시스템 · 통합기관제어체계 국산화 기술 소개', 'https://www.hanwhasystems.com/kr/prcenter/newsView.do?bbidx=579', '2023년 8월 8일 발표 자료는 CMS를 센서·무장 등 장비를 통합해 전술 상황 분석과 운용 통제를 수행하는 체계로 설명한다. 별도 체계인 ECS는 추진·전력·보조기기 등을 연결해 감시하고 제어한다.'),
    ],
    challenge: { type: 'sequence', title: '하나의 상황판 만들기', instruction: '여러 장비의 정보가 운용자에게 전달되는 흐름을 연결해 주세요.', steps: ['센서에서 정보를 받아요', '정보를 하나의 상황판으로 모아요', '운용자가 상황을 확인해요'], explanation: '함정은 바다에서 임무를 수행하는 플랫폼이고, 전투체계는 그 안의 정보와 장비를 연결해요. 특정 함정의 협업 관계는 별도 근거가 필요해요.' },
  },
  {
    id: 'engine', companyId: 'aerospace', name: '항공엔진 공방', subtitle: '하늘을 향한 움직임을 만들어요', icon: 'engine',
    summary: '항공엔진은 비행에 필요한 추진력이나 동력을 만드는 장치예요.',
    analogy: '바람을 뒤로 내보내며 앞으로 나아가는 풍선을 떠올려 보세요.',
    analogyLimit: '풍선과 달리 가스터빈 엔진은 공기를 압축하고 연료를 태우며, 터빈 등 많은 정밀 부품이 함께 작동해요.',
    principle: '가스터빈 엔진의 기본 흐름은 공기 압축, 연료와 공기의 연소, 터빈과 노즐을 통한 에너지 활용이에요. 엔진 형식에 따라 팬이나 회전날개에 동력을 전달하는 방식이 달라요.',
    problem: '항공기를 안정적으로 운용하려면 정밀한 엔진을 생산하고, 시험하고, 사용 중에도 상태를 관리해야 해요.',
    value: '엔진 생산뿐 아니라 부품과 정비를 통해 비행 운용을 지원해요. 한화에어로스페이스는 항공엔진의 개발·생산·정비 역량을 소개하고 있어요.',
    tags: ['항공', '엔진', 'engine', '가스터빈', '공기', '압축', '연소', '터빈', 'MRO', '추진', '해양'],
    sources: [
      source('engine-01', '한화에어로스페이스 · 항공 제품 소개', 'https://www.hanwhaaerospace.com/kor/whatwedo/product/air.do', '항공 사업의 제품군으로 고정익·회전익 항공기 엔진, 항공엔진 모듈과 부품, 전기추진시스템 등을 소개한다.'),
      source('engine-02', '한화에어로스페이스 · 항공엔진 통합 역량', 'https://m.hanwhaaerospace.com/kor/media/newsroom/view.do?seq=397', '2024년 4월 15일 발표 자료는 엔진 설계·해석, 소재·제조, 시험·인증과 유지보수·정비의 역량을 설명한다. 해외 회사와의 기술협력 생산 및 독자 엔진 개발 역량을 구분해 소개한다.'),
      source('engine-03', '한화그룹 · 한화에어로스페이스 사업영역', 'https://www.hanwha.co.kr/business/manufacture/aerospace.do', '한화에어로스페이스는 항공엔진과 부품, 통합 후속군수지원, 함정 엔진·발전기 및 선박·잠수함용 전기추진체계를 사업영역으로 소개한다. 해양에서는 추진과 에너지 공급을 담당하는 역할을 확인할 수 있다.'),
      source('engine-04', 'NASA Glenn · 가스터빈 엔진의 기본 구성', 'https://www.grc.nasa.gov/www/k-12/airplane/enex.html', '가스터빈 엔진의 압축기 뒤에는 공기와 연료를 섞어 태우는 연소부가 있다. 뜨거운 기체는 터빈과 노즐을 통과하며, 노즐에서 가속된 배기가스는 추진력을 만든다. 이 자료는 일반 원리이며 특정 한화 제품의 성능을 설명하지 않는다.'),
    ],
    challenge: { type: 'sequence', title: '공기의 여행', instruction: '가스터빈 엔진을 지나는 공기의 기본 흐름을 완성해 주세요.', steps: ['공기를 압축해요', '연료와 공기를 태워요', '터빈과 노즐에서 에너지를 활용해요'], explanation: '공기 흐름을 간단히 세 단계로 묶었어요. 실제 엔진의 설계와 성능을 계산하는 시뮬레이션은 아니에요.' },
  },
  {
    id: 'launch', companyId: 'aerospace', name: '우주 발사장', subtitle: '위성의 여행을 시작해요', icon: 'launch',
    summary: '우주 발사체는 위성 같은 탑재물을 우주로 보내는 운송 수단이에요.',
    analogy: '관측장비를 목적지까지 데려다주는 배송차를 떠올려 보세요. 발사체는 우주로 향하는 배송차예요.',
    analogyLimit: '위성은 우주에 도착한 뒤 자체 임무를 수행해요. 발사체와 위성은 같은 장비가 아니고, 발사에는 복잡한 제작·시험·운용 과정이 필요해요.',
    principle: '엔진과 구조체, 제어 장치 등 여러 부분을 함께 설계·제작하고 시험해 발사체로 통합해요. 한화에어로스페이스는 누리호의 핵심 구성품과 체계종합 업무에 참여해요.',
    problem: '위성을 제작해도 목표한 우주 환경으로 보내는 수단과 발사 운용 역량이 필요해요.',
    value: '위성이 임무를 시작할 수 있도록 우주 수송을 지원해요. 체계종합은 여러 부품을 완성된 발사체로 묶는 중요한 역할이에요.',
    tags: ['우주', '발사체', '누리호', '로켓', 'launch', '발사', '체계종합', '수송', '위성'],
    sources: [
      source('launch-01', '한화에어로스페이스 · 기업 소개 / Space', 'https://www.hanwhaaerospace.com/kor/whoweare/about.do', '한화에어로스페이스는 한국형 발사체 누리호의 체계종합 및 핵심부품 공급을 우주 사업으로 소개한다. 발사서비스 등으로 사업을 확장하는 방향을 설명한다.'),
      source('launch-02', '한화에어로스페이스 · 누리호 고도화사업', 'https://www.hanwhaaerospace.com/kor/media/newsroom/view.do?seq=191', '2022년 12월 2일 발표 자료는 누리호 고도화사업을 통해 한국항공우주연구원의 체계종합 기술과 발사운용 경험을 순차적으로 이전받는 역할을 설명한다. 발사체는 실용위성을 궤도로 운송하는 역할을 수행한다.'),
    ],
    challenge: { type: 'sequence', title: '우주로 가는 세 걸음', instruction: '제작부터 우주 수송까지, 큰 흐름에 맞게 선택해 주세요.', steps: ['구성품을 제작하고 통합해요', '발사 준비와 시험을 진행해요', '발사해 위성의 여행을 시작해요'], explanation: '한 회사가 모든 과정을 혼자 수행한다는 뜻은 아니에요. 여러 기관과 기업이 참여하는 발사체 사업의 큰 흐름을 배웠어요.' },
  },
  {
    id: 'ground', companyId: 'aerospace', name: '지상장비 체험장', subtitle: '임무 수행과 운용을 함께 생각해요', icon: 'ground',
    summary: '지상방산 체계는 지상에서 이동하고 임무를 수행하는 장비와 지원체계를 뜻해요.',
    analogy: '여행에 차량, 짐을 나를 도구, 정비 지원이 함께 필요한 것처럼 생각해 보세요.',
    analogyLimit: '실제 방산 장비는 군의 요구에 맞춰 설계·시험되며, 일반 여행 차량과 목적과 구조가 달라요.',
    principle: '장비의 이동 기능과 임무 장비를 결합하고, 운용 환경을 고려해 시험해요. 장비를 계속 사용하려면 정비와 지원도 필요해요.',
    problem: '지상 임무에는 장비 자체의 기능뿐 아니라 다양한 환경에서의 운용과 지속적인 지원이 필요해요.',
    value: '한화에어로스페이스는 K9 자주포, K10 탄약운반장갑차, 레드백 등 지상장비를 제공하고 후속 지원도 수행해요.',
    tags: ['지상', 'ground', '방산', 'K9', 'K10', '레드백', '장갑차', '자주포', '정비', '운용'],
    sources: [
      source('ground-01', '한화에어로스페이스 · 지상 제품 소개', 'https://www.hanwhaaerospace.com/kor/whatwedo/product/land.do', '지상 제품군에는 화력체계, 기동체계, 대공체계 등이 있다. 대표 제품으로 K9 자주포, K10 탄약운반장갑차, 레드백 보병전투장갑차 등을 소개한다.'),
      source('ground-02', '한화에어로스페이스 · K9 엔진 내구도 시험', 'https://www.hanwhaaerospace.com/kor/media/newsroom/view.do?seq=478', '2025년 2월 12일 발표 자료는 국내에서 개발한 K9용 엔진을 산악과 사막 등에서 시험한 사례를 소개한다. 지상장비의 운용 환경을 고려한 내구도 검증과 핵심 부품 확보의 필요성을 확인할 수 있다.'),
      source('ground-03', '한화에어로스페이스 · 고객지원 및 생산 사업장', 'https://m.hanwhaaerospace.com/kor/whoweare/location/domestic.do', '공식 사업장 소개는 지상장비 고객지원에 정비, 납품과 후송을 포함한다. 지상장비의 가치는 제작 이후의 운용 지원과도 연결된다.'),
    ],
    challenge: { type: 'sequence', title: '장비의 하루', instruction: '임무 전부터 임무 후까지 필요한 활동을 연결해 주세요.', steps: ['임무와 장비 상태를 확인해요', '이동해 필요한 임무를 수행해요', '점검과 정비로 다음 임무를 준비해요'], explanation: '운용 가치는 장비를 만드는 데서 끝나지 않아요. 점검과 지원도 필요해요. 이 체험에는 실제 무장 운용 절차가 포함되지 않아요.' },
  },
  {
    id: 'lng', companyId: 'ocean', name: 'LNG 항구', subtitle: '에너지의 바닷길을 연결해요', icon: 'lng',
    summary: 'LNG 운반선은 액화천연가스를 싣고 생산지와 필요한 지역을 연결하는 배예요.',
    analogy: '차가운 물건을 보관하며 멀리 보내는 냉동 배송차의 바다 버전으로 생각해 보세요.',
    analogyLimit: '실제 LNG 운반선은 특수 화물창과 안전·추진 설비를 사용하는 선박이에요. 일반 냉장고와 같은 구조는 아니에요.',
    principle: '액체 상태의 천연가스를 전용 화물창에 싣고 운송해요. 운송 중 생기는 기체를 다루는 연료가스 공급과 재액화 기술도 중요해요.',
    problem: '천연가스가 생산되는 곳과 사용되는 곳은 멀리 떨어져 있어, 바다를 통한 운송과 화물 관리가 필요해요.',
    value: '에너지를 필요한 지역으로 운송하도록 도와요. 한화오션은 LNG 운반선과 관련 설비를 건조하고 연료 효율을 위한 기술을 개발해요.',
    tags: ['LNG', '엘엔지', '천연가스', '운반선', 'lng', '에너지', '운송', '재액화', '해양'],
    sources: [
      source('lng-01', '한화그룹 · 한화오션 LNG 운반선 인도', 'https://www.hanwha.com/newsroom/news/press-releases/hanwha-ocean-reaches-world-first-milestone-with-200th-lng-carrier-delivery.do', '2025년 2월 28일 발표 자료는 한화오션의 LNG 운반선 건조와 재액화 기술을 소개한다. 이중연료 추진과 재액화 시스템, 스마트 선박 솔루션 등을 활용하는 사례를 설명한다.'),
      source('lng-02', '한화그룹 · Hanwha Ocean / Commercial ships', 'https://www.hanwha.com/companies/hanwha-ocean.do?nlsFlag=gnb', '한화오션의 상선 사업에는 LNG 운반선 등이 포함된다. LNG 관련 기술로 연료가스 공급시스템과 재액화 시스템을 소개하며 에너지 생산설비와 운송 선박 사업을 구분한다.'),
    ],
    challenge: { type: 'sequence', title: '에너지를 배달해요', instruction: '생산지에서 수요지까지 LNG의 운송 경로를 완성해 주세요.', steps: ['생산지에서 LNG를 실어요', '화물을 관리하며 바다를 건너요', '필요한 지역에 LNG를 내려요'], explanation: 'LNG 운반선의 핵심 역할은 운송이에요. 천연가스를 해상에서 생산·액화하는 FLNG 설비와 구분해 보세요.' },
  },
  {
    id: 'naval', companyId: 'ocean', name: '특수선 조선소', subtitle: '바다의 임무를 위한 배를 만들어요', icon: 'naval',
    summary: '잠수함과 수상함은 바다에서 임무를 수행할 수 있도록 장비와 공간을 갖춘 선박 플랫폼이에요.',
    analogy: '여러 팀과 장비가 함께 일할 수 있게 만든 바다 위, 또는 바다 아래의 이동식 작업장으로 생각해 보세요.',
    analogyLimit: '함정은 군의 임무와 운용 조건에 맞춰 설계해요. 일반 작업장과 달리 선체·추진·탑재 장비의 통합이 중요해요.',
    principle: '임무 요구에 맞게 선체와 공간, 추진과 에너지 장비 등을 설계하고 통합해 선박을 건조해요. 이후 시험과 정비를 통해 운용을 지원해요.',
    problem: '해군은 바다에서 오래 운용할 수 있는 배와 그 배의 수명 동안 유지할 수 있는 지원을 필요로 해요.',
    value: '한화오션은 잠수함·수상함 등 특수선의 건조와 정비 사업을 수행해요. 배를 만드는 역할과 센서·전투체계를 만드는 역할을 나누어 이해할 수 있어요.',
    tags: ['특수선', '잠수함', '수상함', '함정', 'naval', '선체', '플랫폼', '조선', '해양', '방산'],
    sources: [
      source('naval-01', '한화오션 · 2025 영문 브로슈어 / Specialty ships', 'https://www.hanwhaocean.com/pdf/Hanwha_Ocean_Brochure_EN_2025.pdf', '한화오션의 특수선 사업은 잠수함과 수상함 등 선박의 설계·건조와 정비를 소개한다. 선박 플랫폼의 건조는 함정에 탑재되는 개별 센서나 전투체계 공급과 구분되는 역할이다.'),
      source('naval-02', '한화그룹 · 해양 플랫폼과 통합 시스템', 'https://www.hanwha.com/newsroom/news/feature-stories/how-integrated-maritime-power-is-shaping-modern-naval-capability.do', '2026년 2월 24일 자료는 해양 플랫폼, 센서, 전투체계, 추진과 정비의 관계를 설명한다. 선박 설계와 건조, 탑재 장비 통합 및 수명 동안의 유지·정비는 각각 연결된 역할이다. 특정 제품의 회사 간 공동 공급 관계를 일반화할 근거로 사용하지 않는다.'),
    ],
    challenge: { type: 'sequence', title: '임무에 맞는 배 만들기', instruction: '함정 건조의 큰 흐름에 맞게 카드를 선택해 주세요.', steps: ['필요한 임무를 이해해요', '선체와 탑재 공간을 설계해요', '건조하고 통합 상태를 시험해요'], explanation: '배는 여러 장비가 작동할 수 있는 플랫폼이에요. 전투체계는 그 안에서 정보와 장비를 연결해요. 실제 건조 공정은 이보다 훨씬 복잡해요.' },
  },
  {
    id: 'offshore', companyId: 'ocean', name: '해양설비 부두', subtitle: '바다에 에너지 작업장을 세워요', icon: 'offshore',
    summary: '해양 생산설비는 바다에서 에너지를 생산·처리하거나 저장하는 일을 수행하는 시설이에요.',
    analogy: '바다 위에 놓인 커다란 에너지 공장을 떠올려 보세요.',
    analogyLimit: '모든 해양설비가 떠 있는 것은 아니에요. 고정식 플랫폼도 있고, 설비마다 생산·저장·액화 등 맡는 일이 달라요.',
    principle: '에너지를 다루는 장비와 이를 지탱하는 구조물을 함께 설계·제작해요. FLNG는 바다에서 천연가스를 처리·액화·저장·하역하는 설비이고, FPSO는 원유의 생산·저장·하역 등을 위한 설비예요.',
    problem: '해상 에너지 자원을 활용하려면 바다 환경에 맞는 생산·처리 설비와 여러 장비의 통합이 필요해요.',
    value: '해상에서 에너지 생산과 저장을 수행할 수 있는 기반을 제공해요. 한화오션은 FLNG, FPSO, FPU와 고정식 플랫폼 등 해양설비 사업을 소개해요.',
    tags: ['해양', '설비', '생산', 'offshore', 'FLNG', 'FPSO', 'FPU', '플랫폼', '플랜트', '에너지'],
    sources: [
      source('offshore-01', '한화오션 · 2025 국문 브로슈어 / 해양사업', 'https://www.hanwhaocean.com/pdf/Hanwha_Ocean_Brochure_KR_2025.pdf', '해양사업 소개에는 부유식 LNG 생산저장하역설비, 부유식 원유 생산저장하역설비, 부유식 생산설비와 고정식 플랫폼이 포함된다. 한화오션은 해상 환경에 맞는 설비와 플랫폼을 개발·생산한다.'),
      source('offshore-02', '한화그룹 · LNG 2026의 해상 생산 솔루션', 'https://www.hanwha.com/newsroom/news/feature-stories/hanwha-presents-integrated-lng-solutions-at-lng-2026.do', '2026년 2월 24일 자료는 FLNG가 해상에서 천연가스를 생산·액화·저장·하역하는 기술이라고 설명한다. 한화오션의 해양 엔지니어링과 선박 건조 역량을 통해 에너지 생산, 저장과 이송 시설을 구현하는 역할을 소개한다.'),
    ],
    challenge: { type: 'sequence', title: '바다의 공장 완성하기', instruction: '복잡한 설비를 만드는 큰 흐름을 연결해 주세요.', steps: ['환경과 생산 요구에 맞게 설계해요', '장비와 구조물을 제작해요', '통합하고 작동을 확인해요'], explanation: '운반선은 에너지를 옮기고, 생산설비는 에너지를 생산·처리해요. 서로 연결되지만 역할은 달라요. 실제 공정과 운용 절차를 단순화한 학습 체험이에요.' },
  },
];

// Business-role comparisons, not claims that specific products are co-supplied.
export const COMPARE = {
  space: [
    { companyId: 'systems', technology: '관측 위성·탑재체', role: '우주에서 관측 정보를 얻고 활용해요.', value: '넓은 지역의 변화와 상황을 파악하는 정보를 제공해요.', facilityIds: ['satellite'], insufficient: false },
    { companyId: 'aerospace', technology: '발사체·체계종합', role: '위성이 우주 임무를 시작하도록 수송을 지원해요.', value: '구성품을 통합하고 우주로 향하는 길을 만들어요.', facilityIds: ['launch'], insufficient: false },
    { companyId: 'ocean', technology: '자료가 부족해요', role: '수록된 공식 자료만으로 직접적인 우주사업 역할을 설명하기 어려워요.', value: '우주사업을 하지 않는다는 뜻은 아니며 추가 근거가 필요해요.', facilityIds: [], insufficient: true },
  ],
  ocean: [
    { companyId: 'systems', technology: '함정 전투체계', role: '배 안의 센서 정보와 장비를 연결해요.', value: '상황 인식과 운용 판단을 지원해요.', facilityIds: ['combat'], insufficient: false },
    { companyId: 'aerospace', technology: '함정 엔진·전기추진체계', role: '함정의 움직임과 에너지 공급에 필요한 장치를 제공해요.', value: '해양 플랫폼의 운용을 추진과 전력 측면에서 지원해요.', facilityIds: ['engine'], insufficient: false },
    { companyId: 'ocean', technology: '상선·특수선·해양설비', role: '배와 해상 에너지 생산설비를 설계하고 건조해요.', value: '해상 운송, 해양 임무와 에너지 생산의 기반을 제공해요.', facilityIds: ['lng', 'naval', 'offshore'], insufficient: false },
  ],
  defense: [
    { companyId: 'systems', technology: '레이다·함정 전투체계', role: '주변 정보를 감지하고 장비와 정보를 연결해요.', value: '상황 파악과 판단에 필요한 정보를 제공해요.', facilityIds: ['radar', 'combat'], insufficient: false },
    { companyId: 'aerospace', technology: '항공엔진·지상장비', role: '이동과 임무 수행을 위한 엔진과 장비를 제공해요.', value: '항공·지상 플랫폼의 운용과 후속 지원을 도와요.', facilityIds: ['engine', 'ground'], insufficient: false },
    { companyId: 'ocean', technology: '잠수함·수상함', role: '바다에서 임무를 수행하는 선박 플랫폼을 만들어요.', value: '해양 임무를 수행할 공간과 운용 기반을 제공해요.', facilityIds: ['naval'], insufficient: false },
  ],
};
