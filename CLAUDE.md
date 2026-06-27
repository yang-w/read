# todo-read

This project tracks reading progress for two books:

- **YDKJS** — You Don't Know JS Yet (2nd Edition) by Kyle Simpson
- **TS** — Effective TypeScript (2nd Edition) by Dan Vanderkam

## Reading Progress Files

Always refer to these files to check and update reading progress:

- [`YDKJS/NOTES.md`](YDKJS/NOTES.md) — chapter checklist and notes for YDKJS
- [`TS/NOTES.md`](TS/NOTES.md) — chapter checklist and notes for Effective TypeScript

When the user asks about progress, what to read next, or wants to log notes, read the relevant NOTES.md file first.

## Reading Workflow

`docs/guide.md` is the **base** — notes built from JS: The Definitive Guide and a previous YDKJS edition. The section numbers in guide.md (§4.13.3, §6.2, §8.6, etc.) are from JS: The Definitive Guide's chapter numbering, not YDKJS.

The YDKJS 2nd edition chapters are read **on top of** guide.md:
1. Review the guide.md section (existing notes) — check it off in NOTES.md
2. Read the linked YDKJS chapter to fill gaps or update stale content — check it off too
3. Add new sections to guide.md if YDKJS covers something not already there

NOTES.md tracks both guide.md sections and YDKJS chapters as checkboxes. Guide.md sections appear as the primary checkbox; the corresponding YDKJS chapter is nested under it as supplementary reading.

**The order in NOTES.md is intentional and topic-driven — do not reorder it.** Section numbers are from JS: The Definitive Guide and do not dictate reading order. For example, §8.1 (Defining Functions) appears in Book 2 before §6.2 (Creating Objects) in Book 3, because functions are needed to understand closures. A higher section number does not mean it should be read later. guide.md has been reordered to match this same reading sequence.

## Chapter Backups

Original unedited chapter files are backed up in `backup/`:

- `backup/ydkjs/scope-closures/` — YDKJS Book 2 chapters (ch1, ch3–ch8, apB)
- `backup/ydkjs/objects-classes/` — YDKJS Book 3 chapters (ch1–ch4)
- `backup/ydkjs/types-grammar/` — YDKJS Book 4 chapters (ch1–ch4)
- `backup/ts/` — Effective TypeScript chapters (ch1–ch10)

The live chapter files (in `YDKJS/` and `TS/chaps/`) have been edited to remove book-intro fluff and meta commentary, keeping only technical content. Check `backup/` for the originals.

## How Notes Are Written

Detailed notes go into `docs/guide.md`, NOT into NOTES.md. NOTES.md is only for tracking progress (checkboxes).

### guide.md structure

**TOC** (at the top of the file):
```
* [N. Topic1, Topic2, Topic3](#anchor-id)
```
- `N` = chapter number (just an indicator, not the chapter title)
- Label is content-focused (what the notes are about), not the chapter name

**Section header** (in the notes body):
```
#### <a name="anchor-id">N. Topic1, Topic2, Topic3</a>
> Book > Chapter
```
- Anchor is wrapped inside the heading tag (not a separate tag before it)
- Breadcrumb on the line below as a blockquote

**Subsections** use `N.1`, `N.2`, `N.3` format:
```
### N.1 Subtopic
### N.2 Subtopic
```

**When editing guide.md**: always update the TOC entry and section header to match any changes to subsection titles, order, or topics.

**Code style in guide.md**: use double quotes for strings in all code examples.

**Linking**: whenever referring to a section in guide.md or a chapter in YDKJS/TS, always include a markdown link — never mention a section name or number without linking to it.

**Example** (ch1 of YDKJS Get Started):
- TOC: `* [1. Transpiling, Build Pipeline, Compile vs Runtime](#ydkjs-ch1)`
- Header: `#### <a name="ydkjs-ch1">1. Transpiling, Build Pipeline, Compile vs Runtime</a>`
- Breadcrumb: `> YDKJS > Get Started > ch1`
- Subsections: `### 1.1 Transpiling`, `### 1.2 Build Pipeline`, `### 1.3 Compile vs Runtime`
