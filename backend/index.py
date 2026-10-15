"""Build optional checked-source vectors explicitly; never run automatically on startup."""
from __future__ import annotations

import json
import os
from pathlib import Path
import sys

from backend.core import Catalog


def main() -> int:
    key = os.getenv("OPENAI_API_KEY", "").strip()
    if not key:
        print("Set OPENAI_API_KEY on the server before building embeddings.", file=sys.stderr)
        return 1
    import httpx
    base = Path(__file__).resolve().parent / "data"
    catalog = Catalog.from_file(base / "content.json")
    sources = list(catalog.sources.values())
    model = os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")
    try:
        with httpx.Client(timeout=60) as client:
            result = client.post("https://api.openai.com/v1/embeddings",
                                 headers={"Authorization": "Bearer " + key},
                                 json={"model": model, "input": [s["title"] + "\n" + s["body"] for s in sources]})
            result.raise_for_status()
            response = result.json()
        items = sorted(response["data"], key=lambda item: item["index"])
        if len(items) != len(sources):
            raise ValueError("Incomplete embedding result")
        index = {"model": model, "contentDigest": catalog.digest,
                 "vectors": {s["id"]: item["embedding"] for s, item in zip(sources, items)}}
        temporary = base / "vectors.json.tmp"
        temporary.write_text(json.dumps(index, ensure_ascii=False), encoding="utf-8")
        temporary.replace(base / "vectors.json")
        print(f"Indexed {len(sources)} checked paragraphs. Tokens: {response.get('usage', {}).get('total_tokens', 'unknown')}")
        return 0
    except Exception as exc:
        print(f"Index build failed ({type(exc).__name__}); existing index was preserved.", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
