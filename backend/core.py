"""Pure local retrieval and validation. No HTTP calls or question persistence."""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone, timedelta
import hashlib
import json
import math
from pathlib import Path
import re
from threading import Lock
from typing import Any
from urllib.parse import urlparse

COMPANY_IDS = ("systems", "aerospace", "ocean")
FACILITY_IDS = ("radar", "satellite", "combat", "engine", "launch", "ground", "lng", "naval", "offshore")
FACILITY_OWNERS = dict(zip(FACILITY_IDS, ("systems",) * 3 + ("aerospace",) * 3 + ("ocean",) * 3))
TOPIC_ALIASES = {
    "radar": ("레이다", "레이더", "radar", "aesa", "센서", "신호"),
    "satellite": ("위성", "탑재체", "관측", "sar", "카메라"),
    "combat": ("전투체계", "전투 체계", "관제", "cms"),
    "engine": ("엔진", "항공", "가스터빈", "터빈"),
    "launch": ("발사", "누리호", "로켓"),
    "ground": ("지상", "자주포", "k9", "k10", "레드백"),
    "lng": ("lng", "엘엔지", "천연가스", "액화", "운반", "운송"),
    "naval": ("잠수함", "수상함", "함정", "특수선", "선체"),
    "offshore": ("해양설비", "해양 설비", "생산설비", "해양플랜트", "flng", "fpso", "fpu"),
}
EXPLANATION_FIELDS = ("summary", "analogy", "analogyLimit", "principle", "problem", "value")
COMPANY_NAMES = {"systems": "한화시스템", "aerospace": "한화에어로스페이스", "ocean": "한화오션"}
TRUSTED_HOSTS = {"hanwhasystems.com", "hanwhaaerospace.com", "hanwhaocean.com", "hanwha.com", "hanwha.co.kr", "nasa.gov"}
SEOUL = timezone(timedelta(hours=9))


class EvidenceError(ValueError):
    """A proposed factual answer could not be tied to retrieved evidence."""


class DailyLimitError(RuntimeError):
    pass


def tokens(text: str) -> set[str]:
    words = re.findall(r"[a-z0-9]+|[가-힣]+", text.lower())
    result = {w for w in words if len(w) > 1}
    for word in words:
        if re.fullmatch(r"[가-힣]+", word):
            result.update(word[i:i + 2] for i in range(len(word) - 1))
    return result


def _official_url(url: str) -> bool:
    parsed = urlparse(url)
    host = (parsed.hostname or "").lower()
    return (parsed.scheme == "https" and not parsed.username and not parsed.password
            and any(host == domain or host.endswith("." + domain) for domain in TRUSTED_HOSTS))


def cosine(left: list[float], right: list[float]) -> float:
    if len(left) != len(right) or not left:
        return 0.0
    divisor = math.sqrt(sum(x * x for x in left) * sum(x * x for x in right))
    return sum(a * b for a, b in zip(left, right)) / divisor if divisor else 0.0


class Catalog:
    """IDs are the only model citation interface; URLs come from this checked catalog."""

    def __init__(self, data: dict[str, Any]):
        facilities = data.get("facilities", [])
        if isinstance(facilities, dict):
            facilities = list(facilities.values())
        self.facilities = {item["id"]: item for item in facilities}
        if len(self.facilities) != len(facilities):
            raise ValueError("Duplicate facility ID.")
        self.comparisons = data.get("compare", data.get("comparisons", {}))
        self.sources: dict[str, dict[str, Any]] = {}
        for facility in self.facilities.values():
            if FACILITY_OWNERS.get(facility["id"]) != facility["companyId"]:
                raise ValueError("Unknown company or facility in checked content.")
            for source in facility.get("sources", []):
                if not _official_url(source.get("url", "")):
                    raise ValueError("Only official HTTPS source URLs are allowed.")
                sid = source["id"]
                if sid in self.sources:
                    raise ValueError("Duplicate paragraph ID.")
                self.sources[sid] = {**source, "companyId": facility["companyId"], "facilityId": facility["id"]}
        self.digest = hashlib.sha256(json.dumps(data, ensure_ascii=False, sort_keys=True).encode()).hexdigest()

    @classmethod
    def from_file(cls, path: Path) -> "Catalog":
        with path.open(encoding="utf-8-sig") as handle:
            return cls(json.load(handle))

    def retrieve(self, question: str, company_id: str, facility_id: str | None = None,
                 limit: int = 3, vectors: dict[str, list[float]] | None = None,
                 query_vector: list[float] | None = None) -> list[dict[str, Any]]:
        candidates = [s for s in self.sources.values() if s["companyId"] == company_id
                      and (facility_id is None or s["facilityId"] == facility_id)]
        query_terms = tokens(question)

        def score(source: dict[str, Any]) -> float:
            facility = self.facilities[source["facilityId"]]
            text = " ".join([source["body"], source["title"], facility.get("name", ""),
                             " ".join(facility.get("tags", []))])
            overlap = len(query_terms & tokens(text)) / max(1, len(query_terms))
            semantic = cosine(query_vector, (vectors or {}).get(source["id"], [])) if query_vector else 0
            return overlap + semantic

        return sorted(candidates, key=score, reverse=True)[:limit]

    def retrieve_balanced(self, question: str, limit_per_company: int = 2, **kwargs: Any) -> list[dict[str, Any]]:
        return [s for company in COMPANY_IDS for s in self.retrieve(question, company, limit=limit_per_company, **kwargs)]

    @staticmethod
    def public_source(source: dict[str, Any]) -> dict[str, Any]:
        return {key: source.get(key, "") for key in ("id", "title", "url", "checkedAt", "body")}


def comparison_theme(question: str) -> str:
    if any(word in question.lower() for word in ("위성", "우주", "발사", "space", "satellite")):
        return "space"
    if any(word in question.lower() for word in ("함정", "전투체계", "해양", "바다", "선박", "잠수함", "lng", "ocean")):
        return "ocean"
    return "defense"


def unsupported_question(question: str) -> bool:
    text = question.lower()
    return any(word in text for word in (
        "주가", "주식", "날씨", "연봉", "채용", "합격", "개인정보", "비밀번호", "api 키", "api key",
        "시스템 프롬프트", "이전 지시", "지시를 무시", "ignore previous", "system prompt", "계약 금액",
        "기밀", "사거리", "최고 속도", "최대 속도", "수주 금액", "점심", "맛집", "운세")) or bool(re.search(
            r"탐지\s*거리|정확한\s*성능|(?:지시|지침|규칙|출처).*무시|없는.*출처|출처.*(?:만들|조작)|"
            r"공동.*개발|함께.*(?:만들|건조|개발)", text))


def is_context_followup(question: str) -> bool:
    """Allow only a short follow-up with no new explicit subject to use the current facility."""
    text = re.sub(r"[\s?.!,~·]", "", question.lower())
    phrases = sorted(("이기술", "그기술", "해당기술", "현재기술", "선택한기술", "이장비", "그장비",
                      "이시설", "현재시설", "지금", "조금", "더", "좀", "다시", "쉽게", "자세히",
                      "간단히", "한줄로", "기본", "원리", "고객", "가치", "역할", "제공", "문제",
                      "비유", "누구에게", "어떤", "무슨", "도움", "해결", "필요", "왜", "어디에",
                      "쓰이나요", "쓰여", "되나요", "되니", "되는지", "무엇인가요", "무엇인지",
                      "뭐야", "뭔가요", "설명해주세요", "설명해줘", "설명해", "설명", "알려주세요",
                      "알려줘", "알려", "주세요", "해줘", "해요", "하나요", "해", "나요", "인지",
                      "인가요", "한테", "에게", "에서", "대한", "대해", "관해", "은", "는", "이",
                      "가", "을", "를", "의", "에"), key=len, reverse=True)
    while text:
        phrase = next((part for part in phrases if text.startswith(part)), None)
        if phrase is None:
            return False
        text = text[len(phrase):]
    return bool(re.search(r"설명|원리|고객|가치|역할|문제|비유|누구|무엇|뭐야|쉽게|도움|필요", question))


def question_scope(catalog: Catalog, question: str, company_id: str, facility_id: str | None,
                   comparison: bool = False) -> tuple[str, str | None] | None:
    """Resolve an explicit topic, or the selected facility for a context-only question."""
    text = question.lower()
    matched = []
    for fid, facility in catalog.facilities.items():
        aliases = (*TOPIC_ALIASES.get(fid, ()), facility.get("name", ""))
        if any(alias and (bool(re.search(r"(?<![a-z0-9])" + re.escape(alias) + r"(?![a-z0-9])", text))
                          if re.fullmatch(r"[a-z0-9]+", alias) else alias in text) for alias in aliases):
            matched.append(facility)
    named = [cid for cid, name in COMPANY_NAMES.items() if name in re.sub(r"\s+", "", text)]
    target = named[0] if len(named) == 1 else company_id
    if len(named) == 1 and matched and not any(f["companyId"] == target for f in matched):
        return None
    if comparison:
        if matched or re.search(r"우주|바다|해양|방산|세\s*회사|3사|한화", text):
            return target, None
        return None
    topic = next((f for f in matched if f["companyId"] == target), None)
    if topic:
        return target, topic["id"]
    if not matched and facility_id and FACILITY_OWNERS.get(facility_id) == target and is_context_followup(question):
        return target, facility_id
    return None


def insufficient_answer(mode: str = "demo") -> dict[str, Any]:
    return {
        "summary": "검토한 공식 자료만으로는 이 질문에 답할 근거가 부족해요.",
        "analogy": "", "analogyLimit": "", "principle": "",
        "problem": "이 서비스는 세 회사의 기술 역할과 고객 가치를 설명해요.",
        "value": "레이다의 역할, 위성과 발사체의 차이, 함정과 전투체계의 관계를 물어보세요.",
        "comparison": [], "sources": [], "insufficient": True, "mode": mode,
    }


def demo_answer(catalog: Catalog, question: str, company_id: str, facility_id: str | None,
                depth: str = "intro", comparison: bool = False) -> dict[str, Any]:
    if unsupported_question(question):
        return insufficient_answer()
    scope = question_scope(catalog, question, company_id, facility_id, comparison)
    if scope is None:
        return insufficient_answer()
    company_id, facility_id = scope
    if comparison:
        rows, sources = [], []
        for row in catalog.comparisons.get(comparison_theme(question), []):
            row_sources = [s for fid in row.get("facilityIds", []) for s in catalog.sources.values()
                           if s["facilityId"] == fid and s["companyId"] == row["companyId"]]
            rows.append({**row, "company": COMPANY_NAMES.get(row["companyId"], row["companyId"]),
                         "sourceIds": [s["id"] for s in row_sources]})
            sources.extend(row_sources)
        if not rows:
            return insufficient_answer()
        return {"summary": "같은 분야에서도 회사별 기술과 역할은 달라요. 표의 역할을 비교해 보세요.",
                "analogy": "", "analogyLimit": "특정 공동사업이나 실제 협업을 뜻하는 비교는 아니에요.",
                "principle": "", "problem": "", "value": "", "comparison": rows,
                "sources": [catalog.public_source(s) for s in {s["id"]: s for s in sources}.values()],
                "insufficient": any(row.get("insufficient", False) for row in rows), "mode": "demo"}
    # The fixed explanation was reviewed against the whole facility source set,
    # including its general-principle source; keep those citations together.
    selected = catalog.retrieve(question, company_id, facility_id,
                                limit=len(catalog.facilities[facility_id].get("sources", [])))
    if not selected:
        return insufficient_answer()
    facility = catalog.facilities[selected[0]["facilityId"]]
    content = facility.get("content", facility)
    answer = {key: content.get(key, "") for key in EXPLANATION_FIELDS}
    if depth == "detail":
        answer["principle"] += "\n\n공식 자료 확인: " + selected[0]["body"]
    answer.update({"comparison": [], "sources": [catalog.public_source(s) for s in selected],
                   "insufficient": False, "mode": "demo"})
    return answer


def _validate_claims(text: str, evidence: str) -> None:
    """Conservative lexical checks; semantic accuracy still needs human review."""
    evidence_numbers = set(re.findall(r"\d+(?:\.\d+)?", evidence))
    if not set(re.findall(r"\d+(?:\.\d+)?", text)).issubset(evidence_numbers):
        raise EvidenceError("A numeric claim was absent from cited paragraphs.")
    units = r"\d+(?:\.\d+)?\s*(?:km(?:/h)?|킬로미터|m/s|MHz|GHz|MW|kW|톤|개월|년|명|%|퍼센트)"
    normalize = lambda value: re.sub(r"\s+", "", value).lower()
    source_units = {normalize(match) for match in re.findall(units, evidence, flags=re.IGNORECASE)}
    if not {normalize(match) for match in re.findall(units, text, flags=re.IGNORECASE)}.issubset(source_units):
        raise EvidenceError("A measured claim lacks the same quantity and unit in its evidence.")
    for claim in re.findall(r"공동\s*(?:개발|사업|건조|생산)|협업|협력|계약|독점|수주|"
                            r"(?:함께|같이).{0,20}?(?:개발|건조|만들|생산)|"
                            r"공동으로.{0,20}?(?:개발|건조|생산)", text):
        if normalize(claim) not in normalize(evidence):
            raise EvidenceError("A cooperation or contract claim lacks evidence.")


def validate_answer(payload: dict[str, Any], retrieved: list[dict[str, Any]],
                    comparison_required: bool = False) -> dict[str, Any]:
    if not isinstance(payload, dict):
        raise EvidenceError("Invalid response shape.")
    allowed = {source["id"]: source for source in retrieved}
    for key in EXPLANATION_FIELDS:
        if not isinstance(payload.get(key), str) or len(payload[key]) > 6000:
            raise EvidenceError("Invalid explanation field.")
    if type(payload.get("insufficient")) is not bool or not isinstance(payload.get("comparison"), list):
        raise EvidenceError("Invalid response shape.")
    source_ids = payload.get("sourceIds", [])
    if not isinstance(source_ids, list) or any(not isinstance(sid, str) or sid not in allowed for sid in source_ids):
        raise EvidenceError("A citation was not in the retrieved evidence.")
    if not payload["insufficient"] and not source_ids:
        raise EvidenceError("A factual answer needs verified citations.")
    if payload["insufficient"] and not source_ids and not payload["comparison"]:
        return insufficient_answer("llm")
    used = list(dict.fromkeys(source_ids))
    explanation_evidence = " ".join(allowed[sid]["body"] for sid in used)
    for key in ("summary", "principle", "problem", "value"):
        _validate_claims(payload[key], explanation_evidence)
    compared = set()
    for row in payload["comparison"]:
        if (not isinstance(row, dict) or row.get("companyId") not in COMPANY_IDS
                or type(row.get("insufficient")) is not bool or row["companyId"] in compared):
            raise EvidenceError("Invalid company comparison.")
        compared.add(row["companyId"])
        refs = row.get("sourceIds", [])
        if not isinstance(refs, list) or any(not isinstance(sid, str) or sid not in allowed or allowed[sid]["companyId"] != row["companyId"] for sid in refs):
            raise EvidenceError("Comparison citations must belong to the compared company.")
        if not row["insufficient"] and not refs:
            raise EvidenceError("Comparison row needs company evidence.")
        for key in ("technology", "role", "value"):
            if not isinstance(row.get(key), str) or len(row[key]) > 6000:
                raise EvidenceError("Invalid comparison field.")
            _validate_claims(row[key], " ".join(allowed[sid]["body"] for sid in refs))
        row["company"] = COMPANY_NAMES[row["companyId"]]
        used.extend(sid for sid in refs if sid not in used)
    if comparison_required and compared != set(COMPANY_IDS):
        raise EvidenceError("A comparison must account for all three companies.")
    result = {key: payload[key] for key in (*EXPLANATION_FIELDS, "comparison", "insufficient")}
    result.update({"sources": [Catalog.public_source(allowed[sid]) for sid in used], "mode": "llm"})
    return result


@dataclass
class DailyBudget:
    """Process-local cap, reset at Seoul midnight. Only aggregate counters are kept."""
    limit: int = 100
    day: str = ""
    calls: int = 0
    errors: int = 0
    input_tokens: int = 0
    output_tokens: int = 0
    embedding_tokens: int = 0
    latency_ms: int = 0
    _lock: Lock = field(default_factory=Lock, repr=False)

    def _reset_if_needed(self, now: datetime | None = None) -> None:
        day = (now or datetime.now(SEOUL)).astimezone(SEOUL).date().isoformat()
        if day != self.day:
            self.day, self.calls, self.errors = day, 0, 0
            self.input_tokens = self.output_tokens = self.embedding_tokens = self.latency_ms = 0

    def reserve(self, now: datetime | None = None) -> None:
        with self._lock:
            self._reset_if_needed(now)
            if self.calls >= self.limit:
                raise DailyLimitError("Daily API call limit reached.")
            self.calls += 1

    def record(self, usage: dict[str, Any] | None = None, elapsed_ms: int = 0,
               error: bool = False, embedding: bool = False) -> None:
        with self._lock:
            usage = usage or {}
            self.errors += int(error)
            self.latency_ms += elapsed_ms
            if embedding:
                self.embedding_tokens += int(usage.get("total_tokens", 0))
            else:
                self.input_tokens += int(usage.get("prompt_tokens", 0))
                self.output_tokens += int(usage.get("completion_tokens", 0))

    def snapshot(self) -> dict[str, Any]:
        with self._lock:
            self._reset_if_needed()
            return {"day": self.day, "limit": self.limit, "calls": self.calls, "errors": self.errors,
                    "inputTokens": self.input_tokens, "outputTokens": self.output_tokens,
                    "embeddingTokens": self.embedding_tokens,
                    "meanLatencyMs": round(self.latency_ms / max(1, self.calls))}
