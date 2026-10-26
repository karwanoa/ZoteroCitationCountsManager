# Zotero Citation Counts Manager (Zotero 7, 8, 9 & 10)

[![Download Zotero 10 Plugin (.xpi)](https://img.shields.io/badge/%E2%AC%87_Download_Plugin_(.xpi)-v2.3.0_(Zotero_7--10)-CC2936?style=for-the-badge&logo=zotero&logoColor=white)](https://github.com/karwanoa/ZoteroCitationCountsManager/releases/download/v2.3.0/zoterocitationcountsmanager-2.3.0-zotero10.xpi)
[![View Latest Release](https://img.shields.io/badge/GitHub_Release-v2.3.0-0F172A?style=for-the-badge&logo=github&logoColor=white)](https://github.com/karwanoa/ZoteroCitationCountsManager/releases/tag/v2.3.0)
[![License: MPL 2.0](https://img.shields.io/badge/License-MPL_2.0-2563EB?style=for-the-badge)](https://github.com/karwanoa/ZoteroCitationCountsManager/blob/main/LICENSE)

An add-on for [Zotero](https://www.zotero.org) (7.0 – 10.*) that automatically or manually fetches citation counts for scholarly articles using **Crossref**, **INSPIRE-HEP**, **Semantic Scholar**, and **OpenAlex**.

---

## 📥 Download & Installation (Zotero 7 – 10)

| Package | Direct Download Link | Target Version |
| :--- | :--- | :--- |
| **`zoterocitationcountsmanager-2.3.0-zotero10.xpi`** | [**⬇️ Download Latest `.xpi` Installer (v2.3.0)**](https://github.com/karwanoa/ZoteroCitationCountsManager/releases/download/v2.3.0/zoterocitationcountsmanager-2.3.0-zotero10.xpi) *(or [direct repo mirror](https://raw.githubusercontent.com/karwanoa/ZoteroCitationCountsManager/main/zoterocitationcountsmanager-2.3.0-zotero10.xpi))* | **Zotero 7.0 – 10.*** |

> **Note for Firefox users**: Right-click the download button above and select **"Save Link As..."** so Firefox saves the `.xpi` file to your computer instead of trying to install it as a browser add-on.

### How to Install in Zotero
1. Download [**`zoterocitationcountsmanager-2.3.0-zotero10.xpi`**](https://github.com/karwanoa/ZoteroCitationCountsManager/releases/download/v2.3.0/zoterocitationcountsmanager-2.3.0-zotero10.xpi).
2. Open Zotero and go to **Tools → Plugins** (or **Tools → Add-ons**).
3. Click the gear icon (**⚙️**) in the top-right corner and select **Install Plugin From File...**
4. Choose the downloaded `zoterocitationcountsmanager-2.3.0-zotero10.xpi` file.

---

## ✨ What's New in v2.3.0 (Zotero 10 Release)

- **Zotero 8, 9 & 10 Compatibility**: Updated manifest boundaries (`strict_max_version: "10.*"`), Firefox 140 ESR `loadSubScriptWithOptions({ allowUnsafeURL: true })` support for `jar:file:` XPIs, and isolated `Cu.Sandbox` preference pane compatibility.
- **Persisted Custom Column**: Column width, visibility, and sort direction now persist across Zotero restarts via `zoteroPersist`.
- **OpenAlex Integration**: Added [OpenAlex](https://openalex.org) alongside Crossref, INSPIRE-HEP, and Semantic Scholar.
- **PDF Annotation & Note Guard**: Prevents false-positive "No DOI" popups when highlighting PDFs or creating notes in Zotero.
- **In-Place Extra Field Updates & `10.48550/arXiv.*` Routing**: Fixes regex interpolation in `_setCitationCount`, routes synthetic DataCite arXiv DOIs to `_getArxiv()`, and adds optional Crossref title search fallback.

## Acknowledgements

Maintained at [karwanoa/ZoteroCitationCountsManager](https://github.com/karwanoa/ZoteroCitationCountsManager). This plugin is an enhanced Zotero 10 adaptation of FrLars21's [ZoteroCitationCountsManager](https://github.com/FrLars21/ZoteroCitationCountsManager), which refactored Erik Schnetter's [Zotero Citation Counts Manager](https://github.com/eschnett/zotero-citationcounts), based on [Zotero DOI Manager](https://github.com/bwiernik/zotero-shortdoi) by Brenton Wiernik and [Zotero Google Scholar Citations](https://github.com/beloglazov/zotero-scholar-citations) by Anton Beloglazov.

## License

Distributed under the **Mozilla Public License (MPL) Version 2.0**. See [`LICENSE`](LICENSE) for the full license text.
