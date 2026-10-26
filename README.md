# Zotero Citation Counts Manager (Zotero 7 – 10 Compatible)

This is an add-on for [Zotero](https://www.zotero.org) (7.0 – 10.*) that automatically or manually fetches citation counts for scholarly articles using **Crossref**, **INSPIRE-HEP**, **Semantic Scholar**, and **OpenAlex**.

## What's New in v2.3.0 (Zotero 10 Release)

- **Zotero 8, 9 & 10 Compatibility**: Updated manifest boundaries (`strict_max_version: "10.*"`), Firefox 140 ESR `loadSubScriptWithOptions({ allowUnsafeURL: true })` support for `jar:file:` XPIs, and isolated `Cu.Sandbox` preference pane compatibility.
- **Persisted Custom Column**: Column width, visibility, and sort direction now persist across Zotero restarts via `zoteroPersist`.
- **OpenAlex Integration**: Added [OpenAlex](https://openalex.org) alongside Crossref, INSPIRE-HEP, and Semantic Scholar.
- **PDF Annotation & Note Guard**: Prevents false-positive "No DOI" popups when highlighting PDFs or creating notes in Zotero.
- **In-Place Extra Field Updates & `10.48550/arXiv.*` Routing**: Fixes regex interpolation in `_setCitationCount`, routes synthetic DataCite arXiv DOIs to `_getArxiv()`, and adds optional Crossref title search fallback.

## Acknowledgements

This plugin is an enhanced Zotero 10 adaptation of FrLars21's [ZoteroCitationCountsManager](https://github.com/FrLars21/ZoteroCitationCountsManager), which refactored Erik Schnetter's [Zotero Citation Counts Manager](https://github.com/eschnett/zotero-citationcounts), based on [Zotero DOI Manager](https://github.com/bwiernik/zotero-shortdoi) by Brenton Wiernik and [Zotero Google Scholar Citations](https://github.com/beloglazov/zotero-scholar-citations) by Anton Beloglazov.

## License

Distributed under the **Mozilla Public License (MPL) Version 2.0**. See `LICENSE` for the full license text.
