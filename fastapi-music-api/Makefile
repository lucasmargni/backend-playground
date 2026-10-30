.PHONY: install dev typecheck lint test

install:
	uv sync --all-groups

dev:
	uv run fastapi dev app/main.py

typecheck:
	uv run mypy .

lint:
	uv run ruff check .

test:
	uv run pytest