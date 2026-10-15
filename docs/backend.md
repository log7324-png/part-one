# 선택형 Python API

웹 게임의 기본 설명·체험·회사 비교는 API 키 없이 작동합니다. 임의 후속 질문을 공식 자료 검색과 LLM으로 답하려면 로컬 Python 서버를 연결하세요. 키는 서버 환경변수에만 저장합니다.

프로젝트 루트에서 Python 3.10 이상으로 실행합니다.

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r backend/requirements.txt
$env:OPENAI_API_KEY = '본인의 서버용 키'
$env:OPENAI_MODEL = 'gpt-4o-mini'
$env:DAILY_API_CALL_LIMIT = '100'
.\.venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

키를 설정하지 않으면 서버도 검토한 설명을 반환하는 데모 모드로 실행됩니다. `backend/.env.example`은 설정 예시이며 서버는 이 파일을 자동으로 읽지 않습니다. 프런트엔드에는 `VITE_API_BASE_URL=http://127.0.0.1:8000`만 설정한 후 개발 서버를 재시작하세요. 키를 `VITE_` 변수로 만들지 마세요.

`backend/data/content.json`은 `src/data/content.js`의 검토한 설명·출처를 내보낸 자료입니다. 일반 가스터빈 원리는 NASA 출처를 포함합니다. 질의마다 웹을 크롤링하지 않고 이 자료만 검색합니다. 자료 변경 시 JSON을 함께 갱신하세요.

## API

- `GET /api/health`: `mode: demo | llm`. 키 설정 여부이며 공급자 연결 성공을 보장하는 상태는 아닙니다.
- `POST /api/ask`: `{question, companyId, facilityId, depth, comparison}`. 질문 1~1,000자, 회사 `systems | aerospace | ocean`, 시설 ID 또는 `null`, 깊이 `intro | detail`, 비교 기본 `false`.
- 응답: `{summary, analogy, analogyLimit, principle, problem, value, comparison, sources, insufficient, mode}`. 출처는 서버가 검증한 문단 ID로만 연결합니다.
- `GET /api/usage`: 서울 날짜별 프로세스 내 호출·오류·토큰·평균 지연시간 합계. 질문 본문은 저장하지 않습니다.
- `GET /api/docs`: 로컬 API 스키마. 오류 `422` 입력, `429` 호출 한도, `503` 연결·자료·출처 검증 실패.

회사마다 검색 후보를 제한하고, 비교는 회사별로 나누어 검색합니다. 임베딩 인덱스가 없으면 한국어 단어·부분 단어 기반 검색을 사용합니다. API 실패나 검증 실패를 실제 AI 답변인 것처럼 숨기지 않으며, 프런트엔드는 기존 입력·결과를 유지하고 재시도할 수 있습니다.

질문에 기술 이름이 있으면 해당 회사의 기술 범위를 우선하며, “쉽게 설명해줘”처럼 새 주어가 없는 후속 질문만 현재 시설을 사용합니다. “초전도체 설명해줘”처럼 도감에 없는 기술은 선택한 시설의 설명으로 대체하지 않습니다. 수록하지 않은 정확한 탐지거리·공동개발·특정 선박 공동 건조 질문도 자료 부족으로 안내합니다. 비교의 데모 출처는 표에 포함된 모든 시설의 검토 자료를 연결합니다.

## 선택형 임베딩 인덱스

아래 명령은 공식 자료의 문단만 외부 API로 전송하고 비용이 발생할 수 있습니다. 자동 실행하지 않습니다.

```powershell
.\.venv\Scripts\python.exe -m backend.index
```

`OPENAI_EMBEDDING_MODEL` 기본값은 `text-embedding-3-small`입니다. 생성된 `backend/data/vectors.json`은 로컬 파일이고, 자료 내용이나 모델이 바뀌면 다시 만들어야 합니다. 내용 해시가 다르면 오래된 벡터를 사용하지 않습니다. 질의 임베딩 호출과 설명 생성 호출은 각각 하루 호출 한도에 포함되며 기본 한도는 100회입니다.

모델은 환경변수로 교체할 수 있지만 Chat Completions의 구조화 출력을 지원해야 합니다. 구현 스키마는 [OpenAI 구조화 출력 문서](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=chat)와 [임베딩 API](https://developers.openai.com/api/reference/resources/embeddings/methods/create)를 따릅니다. 특정 계정의 모델 접근·비용은 별도 확인이 필요합니다.

## 검증과 운영 한계

```powershell
python -m unittest discover -s tests -p 'backend*'
python -m compileall backend
```

테스트는 외부 API 호출 없이 회사별 검색, 출처 위조, 회사가 다른 인용, 근거 없는 수치·협업 문구, 자료 부족, 동시 호출 한도와 서울 자정 초기화를 검증합니다. 숫자·협업 검사는 보수적인 휴리스틱이며 모든 사실의 의미적 정확성을 자동 보장하지 않습니다. 공식 자료와 답변의 관계는 발표 전 사람이 평가해야 합니다.

비교 행의 수치·협업 검사는 각 회사가 인용한 문단만 근거로 사용합니다. 다른 회사의 인용으로 해당 행의 주장을 통과시킬 수 없습니다. 수치와 단위 조합, 비교 시 세 회사 포함 여부, 잘못된 응답 형태도 확인합니다. 자동 검증 실행 범위와 아직 수행하지 않은 항목은 [검증 기록](validation.md)에 정리했습니다.

실제 LLM·임베딩 실행은 사용자의 서버 키와 네트워크가 필요합니다. 키 없이 수행한 테스트를 실제 AI 품질 평가로 보지 마세요. 외부 API로 질문과 선택된 공식 문단이 전송되며 앱은 대화를 영구 저장하지 않습니다. 개발 서버의 접근 로그에는 질문 본문이 포함되지 않습니다.

하루 호출 한도는 단일 프로세스 메모리에 저장되므로 서버 재시작하면 초기화됩니다. 로컬 시연은 한 worker로 실행하세요. 공개 운영 전에는 사용자 인증, 공용 저장소 기반 호출 한도, TLS와 공급자 계정 예산 제한이 필요합니다. CORS는 허용한 프런트엔드 주소만 설정하고 기본 서버는 루프백에서 실행합니다.

가격을 확인해 `OPENAI_INPUT_USD_PER_MILLION`, `OPENAI_OUTPUT_USD_PER_MILLION`을 설정하면 `/api/usage`에 텍스트 토큰의 추정 비용을 표시합니다. 설정하지 않으면 비용은 `null`이며 임베딩 비용은 포함하지 않습니다.
