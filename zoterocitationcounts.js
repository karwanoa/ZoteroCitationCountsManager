ZoteroCitationCounts = {
  _initialized: false,
  pluginID: null,
  pluginVersion: null,
  rootURI: null,
  l10n: null,
  APIs: [],
  _addedElementIDs: [],

  _log(msg) {
    Zotero.debug("Zotero Citation Counts: " + msg);
  },

  init: function ({ id, version, rootURI }) {
    if (this._initialized) return;

    this.pluginID = id;
    this.pluginVersion = version;
    this.rootURI = rootURI;
    this.l10n = new Localization(["citation-counts.ftl"]);

    this.APIs = [
      {
        key: "crossref",
        name: "Crossref",
        useDoi: true,
        useArxiv: true,
        methods: {
          urlBuilder: this._crossrefUrl.bind(this),
          responseCallback: this._crossrefCallback.bind(this),
        },
      },
      {
        key: "inspire",
        name: "INSPIRE-HEP",
        useDoi: true,
        useArxiv: true,
        methods: {
          urlBuilder: this._inspireUrl.bind(this),
          responseCallback: this._inspireCallback.bind(this),
        },
      },
      {
        key: "semanticscholar",
        name: "Semantic Scholar",
        useDoi: true,
        useArxiv: true,
        methods: {
          urlBuilder: this._semanticScholarUrl.bind(this),
          responseCallback: this._semanticScholarCallback.bind(this),
        },
      },
      {
        key: "openalex",
        name: "OpenAlex",
        useDoi: true,
        useArxiv: false,
        methods: {
          urlBuilder: this._openAlexUrl.bind(this),
          responseCallback: this._openAlexCallback.bind(this),
        },
      },
    ];

    this._initialized = true;
  },

  getCitationCount: function (item) {
    if (!item || typeof item.getField !== "function") return "-";
    try {
      const extraFieldLines = (item.getField("extra") || "")
        .split("\n")
        .filter((line) => /^Citations(?:\s*\([^)]*\))?:|^\d+\s+citations/i.test(line));

      if (!extraFieldLines.length) return "-";
      const match = extraFieldLines[0].match(/(\d+)/);
      return match ? match[1] : "-";
    } catch (e) {
      return "-";
    }
  },

  getPref: function (pref) {
    return Zotero.Prefs.get("extensions.citationcounts." + pref, true);
  },

  setPref: function (pref, value) {
    return Zotero.Prefs.set("extensions.citationcounts." + pref, value, true);
  },

  icon: function (iconName) {
    const iconMap = {
      tick: "chrome://zotero/skin/16/universal/check.svg",
      bullet_yellow: "chrome://zotero/skin/16/universal/warning.svg",
      "spinner-16px": "chrome://zotero/skin/spinner-16px@2x.png",
      "toolbar-advanced-search": this.rootURI + "icons/icon.svg",
    };
    return iconMap[iconName] || this.rootURI + "icons/icon.svg";
  },

  _injectXULElement: function (
    document,
    elementType,
    elementID,
    elementAttributes,
    parentID,
    eventListeners
  ) {
    const parent = document.getElementById(parentID);
    if (!parent) return null;

    const existing = document.getElementById(elementID);
    if (existing) existing.remove();

    const element = document.createXULElement(elementType);
    element.id = elementID;

    Object.entries(elementAttributes || {})
      .filter(([_, value]) => value !== null && value !== undefined)
      .forEach(([key, value]) => element.setAttribute(key, value));

    Object.entries(eventListeners || {}).forEach(([eventType, listener]) => {
      element.addEventListener(eventType, listener);
    });

    parent.appendChild(element);
    this._storeAddedElement(element);
    return element;
  },

  _storeAddedElement: function (elem) {
    if (!elem || !elem.id) return;
    if (!this._addedElementIDs.includes(elem.id)) {
      this._addedElementIDs.push(elem.id);
    }
  },

  _createToolsMenu: function (document) {
    const menu = this._injectXULElement(
      document,
      "menu",
      "menu_Tools-citationcounts-menu",
      { "data-l10n-id": "citationcounts-menutools-autoretrieve-title" },
      "menu_ToolsPopup"
    );
    if (!menu) return;

    const menupopup = this._injectXULElement(
      document,
      "menupopup",
      "menu_Tools-citationcounts-menu-popup",
      {},
      menu.id,
      {
        popupshowing: () => {
          this.APIs.concat({ key: "none" }).forEach((api) => {
            const el = document.getElementById(
              `menu_Tools-citationcounts-menu-popup-${api.key}`
            );
            if (el) {
              el.setAttribute(
                "checked",
                Boolean(this.getPref("autoretrieve") === api.key)
              );
            }
          });
        },
      }
    );

    this.APIs.concat({ key: "none" }).forEach((api) => {
      const label =
        api.key === "none"
          ? { "data-l10n-id": "citationcounts-menutools-autoretrieve-api-none" }
          : {
              "data-l10n-id": "citationcounts-menutools-autoretrieve-api",
              "data-l10n-args": JSON.stringify({ api: api.name }),
            };

      this._injectXULElement(
        document,
        "menuitem",
        `menu_Tools-citationcounts-menu-popup-${api.key}`,
        {
          ...label,
          type: "checkbox",
        },
        menupopup.id,
        { command: () => this.setPref("autoretrieve", api.key) }
      );
    });
  },

  _createItemMenu: function (document) {
    const menu = this._injectXULElement(
      document,
      "menu",
      "zotero-itemmenu-citationcounts-menu",
      {
        "data-l10n-id": "citationcounts-itemmenu-retrieve-title",
        class: "menu-iconic",
        image: this.rootURI + "icons/icon.svg",
      },
      "zotero-itemmenu"
    );
    if (!menu) return;

    const menupopup = this._injectXULElement(
      document,
      "menupopup",
      "zotero-itemmenu-citationcounts-menupopup",
      {},
      menu.id
    );

    this.APIs.forEach((api) => {
      this._injectXULElement(
        document,
        "menuitem",
        `zotero-itemmenu-citationcounts-${api.key}`,
        {
          "data-l10n-id": "citationcounts-itemmenu-retrieve-api",
          "data-l10n-args": JSON.stringify({ api: api.name }),
        },
        menupopup.id,
        {
          command: () =>
            this.updateItems(
              Zotero.getActiveZoteroPane().getSelectedItems(),
              api
            ),
        }
      );
    });
  },

  addToWindow: function (window) {
    if (!window || !window.document) return;
    if (window.MozXULElement && window.MozXULElement.insertFTLIfNeeded) {
      window.MozXULElement.insertFTLIfNeeded("citation-counts.ftl");
    }
    this._createToolsMenu(window.document);
    this._createItemMenu(window.document);
  },

  addToAllWindows: function () {
    const windows = Zotero.getMainWindows();
    for (let window of windows) {
      if (!window.ZoteroPane) continue;
      this.addToWindow(window);
    }
  },

  removeFromWindow: function (window) {
    if (!window || !window.document) return;
    const document = window.document;
    for (let id of this._addedElementIDs) {
      document.getElementById(id)?.remove();
    }
    document.querySelector('[href="citation-counts.ftl"]')?.remove();
  },

  removeFromAllWindows: function () {
    const windows = Zotero.getMainWindows();
    for (let window of windows) {
      if (!window.ZoteroPane) continue;
      this.removeFromWindow(window);
    }
  },

  updateItems: async function (itemsRaw, api) {
    const items = (itemsRaw || []).filter(
      (item) =>
        item &&
        typeof item.isRegularItem === "function" &&
        item.isRegularItem() &&
        !item.isFeedItem
    );
    if (!items.length) return;

    const progressWindow = new Zotero.ProgressWindow();
    progressWindow.changeHeadline(
      await this.l10n.formatValue("citationcounts-progresswindow-headline", {
        api: api.name,
      }),
      this.icon("toolbar-advanced-search")
    );

    const progressWindowItems = [];
    const itemTitles = items.map((item) => item.getField("title"));
    itemTitles.forEach((title) => {
      progressWindowItems.push(
        new progressWindow.ItemProgress(this.icon("spinner-16px"), title)
      );
    });

    progressWindow.show();
    await this._updateItem(0, items, api, progressWindow, progressWindowItems);
  },

  _updateItem: async function (
    currentItemIndex,
    items,
    api,
    progressWindow,
    progressWindowItems
  ) {
    if (currentItemIndex >= items.length) {
      const headlineFinished = await this.l10n.formatValue(
        "citationcounts-progresswindow-finished-headline",
        { api: api.name }
      );
      progressWindow.changeHeadline(headlineFinished);
      progressWindow.startCloseTimer(5000);
      return;
    }

    const item = items[currentItemIndex];
    const pwItem = progressWindowItems[currentItemIndex];

    try {
      const [count, source] = await this._retrieveCitationCount(
        item,
        api.name,
        api.useDoi,
        api.useArxiv,
        api.methods.urlBuilder,
        api.methods.responseCallback
      );

      await this._setCitationCount(item, source, count);
      try {
        pwItem.setIcon(this.icon("tick"));
      } catch (_) {}
      pwItem.setProgress(100);
    } catch (error) {
      pwItem.setError();
      new progressWindow.ItemProgress(
        this.icon("bullet_yellow"),
        await this.l10n.formatValue(error.message, { api: api.name }),
        pwItem
      );
    }

    await this._updateItem(
      currentItemIndex + 1,
      items,
      api,
      progressWindow,
      progressWindowItems
    );
  },

  _setCitationCount: async function (item, source, count) {
    const escapedSource = source.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(
      `^Citations(?:\\s*\\(${escapedSource}\\))?:|^\\d+\\s+citations\\s*\\(${escapedSource}\\)`,
      "i"
    );
    const extraFieldLines = (item.getField("extra") || "")
      .split("\n")
      .filter((line) => line.trim() !== "" && !pattern.test(line));

    const today = new Date().toISOString().split("T")[0];
    extraFieldLines.unshift(`${count} citations (${source}) [${today}]`);

    item.setField("extra", extraFieldLines.join("\n"));
    await item.saveTx();
  },

  _getDoi: function (item) {
    let doi = (item.getField("DOI") || "").trim();
    if (!doi) {
      const extra = item.getField("extra") || "";
      const extraMatch = extra.match(/^DOI:\s*(.+)$/im);
      if (extraMatch) {
        doi = extraMatch[1].trim();
      } else {
        const url = item.getField("url") || "";
        const urlMatch = url.match(/doi\.org\/(10\.\d{4,9}\/[-._;()/:A-Z0-9]+)/i);
        if (urlMatch) doi = urlMatch[1].trim();
      }
    }

    doi = doi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, "").trim();
    // Synthetic DataCite arXiv DOIs (10.48550/arXiv.*) fail with 404 on /doi/ endpoints; route via _getArxiv instead
    if (!doi || /^10\.48550\/arXiv\./i.test(doi)) {
      throw new Error("citationcounts-progresswindow-error-no-doi");
    }
    return encodeURIComponent(doi);
  },

  _getArxiv: function (item) {
    const sources = [
      item.getField("url") || "",
      item.getField("extra") || "",
      item.getField("DOI") || "",
      item.getField("archiveID") || "",
    ].join("\n");

    const arxivMatch =
      /(?:arxiv\.org\/(?:abs|pdf)\/|arXiv:\s*|10\.48550\/arXiv\.)([a-z.-]+\/\d+|\d{4}\.\d{4,5}(?:v\d+)?)/i.exec(
        sources
      );
    if (!arxivMatch) {
      throw new Error("citationcounts-progresswindow-error-no-arxiv");
    }
    return encodeURIComponent(arxivMatch[1].replace(/v\d+$/i, ""));
  },

  _sendRequest: async function (url, callback, retries = 2) {
    let res;
    try {
      res = await fetch(url, {
        headers: {
          Accept: "application/json",
        },
      });
    } catch (_) {
      throw new Error("citationcounts-progresswindow-error-bad-api-response");
    }

    if (res.status === 429) {
      if (retries > 0) {
        await new Promise((r) => setTimeout(r, 3500));
        return this._sendRequest(url, callback, retries - 1);
      }
      throw new Error("citationcounts-progresswindow-error-bad-api-response");
    }

    if (!res.ok) {
      throw new Error("citationcounts-progresswindow-error-no-citation-count");
    }

    const response = await res.json().catch(() => {
      throw new Error("citationcounts-progresswindow-error-bad-api-response");
    });

    try {
      const count = parseInt(await callback(response), 10);
      if (!(Number.isInteger(count) && count >= 0)) {
        throw new Error();
      }
      return count;
    } catch (error) {
      throw new Error("citationcounts-progresswindow-error-no-citation-count");
    }
  },

  _retrieveCitationCount: async function (
    item,
    apiName,
    useDoi,
    useArxiv,
    urlFunction,
    requestCallback
  ) {
    let errorMessage = "";
    let doiField = false;
    let arxivField = false;
    const useTitleFallback = Boolean(this.getPref("useTitleFallback"));

    if (useDoi) {
      try {
        doiField = this._getDoi(item);
        const count = await this._sendRequest(
          urlFunction(doiField, "doi"),
          requestCallback
        );
        return [count, `${apiName}/DOI`];
      } catch (error) {
        errorMessage = error.message;
      }

      if (!useArxiv && !(useTitleFallback && apiName === "Crossref")) {
        throw new Error(errorMessage);
      }
    }

    if (useArxiv) {
      const doiErrorMessage = errorMessage;
      try {
        arxivField = this._getArxiv(item);
        const count = await this._sendRequest(
          urlFunction(arxivField, "arxiv"),
          requestCallback
        );
        return [count, `${apiName}/arXiv`];
      } catch (error) {
        errorMessage = error.message;
      }

      if (useTitleFallback && apiName === "Crossref") {
        try {
          const title = (item.getField("title") || "").trim();
          if (title) {
            const count = await this._sendRequest(
              this._crossrefUrlByTitle(title),
              this._crossrefCallbackByTitle
            );
            return [count, `${apiName}/title`];
          }
        } catch (err) {
          errorMessage = err.message;
        }
      }

      if (useDoi && !doiField && !arxivField) {
        throw new Error("citationcounts-progresswindow-error-no-doi-or-arxiv");
      }
      if (useDoi && !arxivField && doiErrorMessage) {
        throw new Error(doiErrorMessage);
      }
      throw new Error(errorMessage);
    }

    if (useTitleFallback && apiName === "Crossref") {
      const title = (item.getField("title") || "").trim();
      if (title) {
        const count = await this._sendRequest(
          this._crossrefUrlByTitle(title),
          this._crossrefCallbackByTitle
        );
        return [count, `${apiName}/title`];
      }
    }

    throw new Error(errorMessage || "citationcounts-internal-error");
  },

  _crossrefUrl: function (id, type) {
    if (type === "arxiv") {
      return `https://api.crossref.org/works?query.bibliographic=${id}&rows=1`;
    }
    return `https://api.crossref.org/works/${id}/transform/application/vnd.citationstyles.csl+json`;
  },

  _crossrefCallback: function (response) {
    if (response && response.message && Array.isArray(response.message.items)) {
      return response.message.items[0]?.["is-referenced-by-count"];
    }
    return response["is-referenced-by-count"];
  },

  _crossrefUrlByTitle: function (title) {
    return `https://api.crossref.org/works?query.title=${encodeURIComponent(title)}&rows=1`;
  },

  _crossrefCallbackByTitle: function (response) {
    return response?.message?.items?.[0]?.["is-referenced-by-count"];
  },

  _inspireUrl: function (id, type) {
    return `https://inspirehep.net/api/${type}/${id}`;
  },

  _inspireCallback: function (response) {
    return response["metadata"]["citation_count"];
  },

  _semanticScholarUrl: function (id, type) {
    const prefix = type === "doi" ? "DOI:" : "ARXIV:";
    return `https://api.semanticscholar.org/graph/v1/paper/${prefix}${id}?fields=citationCount`;
  },

  _semanticScholarCallback: async function (response) {
    const count = response["citationCount"];
    await new Promise((r) => setTimeout(r, 3000));
    return count;
  },
  _openAlexUrl: function (id, type) {
    return `https://api.openalex.org/works/https://doi.org/${id}`;
  },

  _openAlexCallback: function (response) {
    return response["cited_by_count"];
  },
};
