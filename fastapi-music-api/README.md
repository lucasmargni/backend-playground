# FastAPI Music API

A music theory engine built with Python and FastAPI. It generates scales and chords, computes diatonic harmony, and navigates the circle of fifths. The project was built to learn Python and FastAPI, using music theory as a domain for practicing algorithms, strict typing, and layered design.

---

## Tech Stack

- **Python 3.12** (fully type-hinted)
- **FastAPI** — web framework
- **Pydantic** — response schemas
- **functools.cache** — in-memory caching of domain results
- **pytest** + **TestClient** — domain and API tests
- **mypy** (strict mode) — static type checking
- **Ruff** — linting
- **uv** — dependency and virtual environment management

---

## Features

- Scale generation for 12 root notes and 7 scale types (major, natural minor, harmonic minor, dorian, phrygian, lydian, mixolydian)
- Chord generation with 8 qualities (4 triads and 4 seventh chords)
- Chord inversions
- Diatonic triads of any scale
- Reverse lookup of every scale containing a given note
- Circle of fifths, with distance and neighbor calculations
- In-memory caching of deterministic results
- Auto-generated Swagger documentation at `/docs`

---

## Project Structure

```
fastapi-music-api/
├── app/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── scale_routes.py
│   │   │   ├── chord_routes.py
│   │   │   └── harmony_routes.py
│   │   ├── schemas/
│   │   │   ├── scale_schemas.py
│   │   │   ├── chord_schemas.py
│   │   │   ├── harmony_schemas.py
│   │   │   └── helpers.py          # Note <-> string conversion
│   │   └── parsers.py              # Raw path params -> domain objects
│   ├── domain/
│   │   ├── models.py               # Note, ScaleType, ChordQuality, Scale, Chord
│   │   ├── scale_engine.py
│   │   ├── chord_engine.py
│   │   └── harmony_engine.py
│   └── main.py                     # Application entry point
├── tests/
│   ├── api/                        # Route tests with TestClient
│   └── domain/                     # Engine unit tests
├── Makefile                        # Project commands
├── pyproject.toml
└── uv.lock
```

---

## Getting Started

### Requirements

- Python 3.12+
- [uv](https://docs.astral.sh/uv/)

### Installation

```bash
make install
```

### Running the Server

```bash
make dev
```

The server will be available at `http://localhost:8000`.
Swagger documentation is available at `http://localhost:8000/docs`, which is the quickest way to try every endpoint.

### Quality Checks

```bash
make test        # run the test suite
make typecheck   # run mypy in strict mode
make lint        # run Ruff
```

---

## API Reference

Full interactive documentation is available at `http://localhost:8000/docs`.

All endpoints are public and read-only. Invalid notes, scale types, or chord qualities return `422`.

### Path Parameters

| Parameter    | Accepted values                                                                                                      |
| ------------ | -------------------------------------------------------------------------------------------------------------------- |
| `note`       | `C`, `C-sharp`, `D`, `D-sharp`, `E`, `F`, `F-sharp`, `G`, `G-sharp`, `A`, `A-sharp`, `B`                             |
| `scale_type` | `major`, `natural_minor`, `harmonic_minor`, `dorian`, `phrygian`, `lydian`, `mixolydian`                             |
| `quality`    | `major`, `minor`, `diminished`, `augmented`, `major_seventh`, `dominant_seventh`, `minor_seventh`, `half_diminished` |

### Health

| Method | Endpoint  | Description         |
| ------ | --------- | ------------------- |
| GET    | `/health` | Check server status |

### Scales

| Method | Endpoint                        | Description                       |
| ------ | ------------------------------- | --------------------------------- |
| GET    | `/api/scales/:note/:scale_type` | Get the notes of a scale          |
| GET    | `/api/scales/containing/:note`  | Get every scale containing a note |

### Chords

| Method | Endpoint                                 | Description                        |
| ------ | ---------------------------------------- | ---------------------------------- |
| GET    | `/api/chords/:note/:quality`             | Get the notes of a chord           |
| GET    | `/api/chords/:note/:quality/inversions`  | Get every voicing of a chord       |
| GET    | `/api/chords/diatonic/:note/:scale_type` | Get the diatonic triads of a scale |

### Harmony

| Method | Endpoint                                      | Description                                       |
| ------ | --------------------------------------------- | ------------------------------------------------- |
| GET    | `/api/harmony/circle-of-fifths`               | Get the 12 notes in circle of fifths order        |
| GET    | `/api/harmony/distance/:note_1/:note_2`       | Get the shortest distance between two notes (0-6) |
| GET    | `/api/harmony/neighbors/:note?max_distance=2` | Get the notes within a distance (default: 2)      |

---

## Request Examples

### Get a Scale

```http
GET /api/scales/A/natural_minor
```

```json
{
  "root": "A",
  "scale_type": "natural_minor",
  "notes": ["A", "B", "C", "D", "E", "F", "G"]
}
```

### Get a Chord

```http
GET /api/chords/G/dominant_seventh
```

```json
{
  "root": "G",
  "quality": "dominant_seventh",
  "notes": ["G", "B", "D", "F"]
}
```

### Get Chord Inversions

```http
GET /api/chords/C/major_seventh/inversions
```

```json
[
  ["C", "E", "G", "B"],
  ["E", "G", "B", "C"],
  ["G", "B", "C", "E"],
  ["B", "C", "E", "G"]
]
```

### Get Diatonic Chords

```http
GET /api/chords/diatonic/C/major
```

```json
[
  { "root": "C", "quality": "major", "notes": ["C", "E", "G"] },
  { "root": "D", "quality": "minor", "notes": ["D", "F", "A"] },
  { "root": "E", "quality": "minor", "notes": ["E", "G", "B"] },
  { "root": "F", "quality": "major", "notes": ["F", "A", "C"] },
  { "root": "G", "quality": "major", "notes": ["G", "B", "D"] },
  { "root": "A", "quality": "minor", "notes": ["A", "C", "E"] },
  { "root": "B", "quality": "diminished", "notes": ["B", "D", "F"] }
]
```

### Get the Distance Between Two Notes

```http
GET /api/harmony/distance/C/F-sharp
```

```json
{
  "note_1": "C",
  "note_2": "F#",
  "distance": 6
}
```

### Get Neighbors in the Circle of Fifths

```http
GET /api/harmony/neighbors/C?max_distance=2
```

```json
["D", "F", "G", "A#"]
```

### Invalid Input

```http
GET /api/scales/H/major
```

```json
{
  "detail": "Invalid note 'H'"
}
```

---

## Technical Highlights

### Music Theory as Modular Arithmetic

The 12 chromatic notes form a cycle, so `Note` is an `IntEnum` and moving between notes is addition modulo 12. Scale types and chord qualities are just tuples of semitone intervals, which means one small algorithm builds all of them: `root.advance(interval)` for each interval. The circle of fifths follows the same idea. It could be modeled as a graph, but multiplying a note by 7 modulo 12 gives its position directly, so distance is calculated in O(1) with no traversal.

### Domain Independent from HTTP

`app/domain/` knows nothing about FastAPI: it receives and returns plain Python types. Pydantic schemas translate domain objects into API responses through `from_domain()`, and `parsers.py` turns raw path parameters into domain objects, raising `HTTPException` when they are invalid. Each layer can change or be tested on its own.

### Immutable Domain with Tuples

`Scale` and `Chord` are frozen dataclasses, but `frozen=True` only prevents reassigning a field: a list inside could still be mutated. Storing notes as `tuple[Note, ...]` makes the objects truly immutable and hashable, which is what allows them to be used as cache keys and shared safely between callers.

### Caching over Finite Inputs

Domain functions are pure, and their input space is small and known: 84 possible scales and 96 possible chords. That makes the usual risk of an unbounded cache disappear, since it can never grow past those limits, so `functools.cache` is enough, with no eviction policy or external service. As an example, `find_scales_containing` builds all 84 scales the first time it runs, and later requests reuse the result.

### The `#` Problem in URLs

`#` starts a URL fragment, and browsers never send fragments to the server: a request to `/scales/C#/major` arrives as `/scales/C`. The API therefore accepts `C-sharp` in URLs, while JSON responses keep the musical notation `C#`. All conversion lives in two helpers, `str_to_note` and `note_to_str`, so routes never deal with it.

---

## Possible Extensions

- **Enharmonic spelling**: notes are always written with sharps, so C# major returns `F` and `C` instead of `E#` and `B#`. Spelling each scale correctly would require tracking letter names as well as pitch.
- **Explicit display names**: define display names on `Note` instead of deriving them from `.name`, decoupling API output from internal identifiers.
- **More harmony endpoints**: expose `find_shared_notes` and `get_scale_degree`, which already exist in the domain.
- **HTTP caching**: add `Cache-Control` headers so browsers and CDNs can reuse responses, complementing the in-memory cache.
