// Five shared-village homes. Every learning topic still has a physical exhibit.
export const HOUSES = [
  { id:'radar', companyId:'systems', name:'탐지의 집', subtitle:'레이다 · 위성 탑재체', icon:'radar', x:-22, z:-14, topics:['radar','satellite'], resident:'루미', residentColor:'#a18abe', residentIntro:'작은 신호에서 큰 이야기를 찾는 관찰가예요.' },
  { id:'combat', companyId:'systems', name:'관제의 집', subtitle:'함정 전투체계', icon:'combat', x:-22, z:8, topics:['combat'], resident:'모아', residentColor:'#77b5a8', residentIntro:'여러 정보를 모아 한눈에 보여주는 주민이에요.' },
  { id:'engine', companyId:'aerospace', name:'동력의 집', subtitle:'항공엔진 · 지상방산', icon:'engine', x:0, z:-18, topics:['engine','ground'], resident:'토비', residentColor:'#d59b62', residentIntro:'움직이는 장비의 원리를 궁금해하는 발명가예요.' },
  { id:'launch', companyId:'aerospace', name:'우주의 집', subtitle:'우주 발사체', icon:'launch', x:3, z:8, topics:['launch'], resident:'별이', residentColor:'#858fc9', residentIntro:'하늘과 우주로 향하는 길을 이야기해 줘요.' },
  { id:'lng', companyId:'ocean', name:'바다의 집', subtitle:'LNG 운반선 · 특수선 · 해양설비', icon:'lng', x:26, z:-6, topics:['lng','naval','offshore'], resident:'파도', residentColor:'#65a9c4', residentIntro:'배와 바다 위 시설에 관한 이야기를 들려줘요.' },
];

export const houseForTopic = topicId => HOUSES.find(house => house.topics.includes(topicId));
export const houseById = houseId => HOUSES.find(house => house.id === houseId);
