var ZoteroCitationCounts;
var itemObserver = null;
var registeredColumnId = null;

function install() {}

function uninstall() {}

async function startup({ id, version, rootURI }) {
  // Firefox 140 ESR (Zotero 9/10) requires allowUnsafeURL: true for jar:file: XPI URIs (Mozilla bug 1974213)
  if (Services.scriptloader.loadSubScriptWithOptions) {
    Services.scriptloader.loadSubScriptWithOptions(
      rootURI + "zoterocitationcounts.js",
      {
        target: this,
        ignoreCache: true,
        allowUnsafeURL: true,
      }
    );
  } else {
    Services.scriptloader.loadSubScript(rootURI + "zoterocitationcounts.js", this);
  }

  ZoteroCitationCounts.init({ id, version, rootURI });
  ZoteroCitationCounts.addToAllWindows();

  // Register custom column immediately so ZoteroPane restores column order & width on startup
  const registerCol = Zotero.ItemTreeManager.registerColumn
    ? Zotero.ItemTreeManager.registerColumn.bind(Zotero.ItemTreeManager)
    : Zotero.ItemTreeManager.registerColumns.bind(Zotero.ItemTreeManager);

  const colResult = await registerCol({
    dataKey: "citationcounts",
    label: await ZoteroCitationCounts.l10n.formatValue(
      "citationcounts-column-title"
    ),
    pluginID: id,
    flex: 0,
    width: "100px",
    minWidth: 45,
    staticWidth: true,
    zoteroPersist: ["width", "hidden", "sortDirection"],
    dataProvider: (item) => ZoteroCitationCounts.getCitationCount(item),
  });
  registeredColumnId = Array.isArray(colResult) ? colResult[0] : colResult;

  await Zotero.PreferencePanes.register({
    pluginID: id,
    label: await ZoteroCitationCounts.l10n.formatValue(
      "citationcounts-preference-pane-label"
    ),
    image: rootURI + "icons/icon.svg",
    src: rootURI + "preferences.xhtml",
    scripts: [rootURI + "preferences.js"],
  });

  itemObserver = Zotero.Notifier.registerObserver(
    {
      notify: function (event, type, ids, extraData) {
        if (event === "add") {
          const pref = ZoteroCitationCounts.getPref("autoretrieve");
          if (!pref || pref === "none") return;

          const api = ZoteroCitationCounts.APIs.find((a) => a.key === pref);
          if (!api) return;

          const items = Zotero.Items.get(ids).filter(
            (item) =>
              item &&
              typeof item.isRegularItem === "function" &&
              item.isRegularItem() &&
              !item.isFeedItem
          );
          if (items.length > 0) {
            ZoteroCitationCounts.updateItems(items, api);
          }
        }
      },
    },
    ["item"],
    "citationcounts-item-observer"
  );
}

function onMainWindowLoad({ window }) {
  if (ZoteroCitationCounts) {
    ZoteroCitationCounts.addToWindow(window);
  }
}

function onMainWindowUnload({ window }) {
  if (ZoteroCitationCounts) {
    ZoteroCitationCounts.removeFromWindow(window);
  }
}

async function shutdown() {
  if (ZoteroCitationCounts) {
    ZoteroCitationCounts.removeFromAllWindows();
  }

  if (registeredColumnId) {
    try {
      if (Zotero.ItemTreeManager.unregisterColumn) {
        await Zotero.ItemTreeManager.unregisterColumn(registeredColumnId);
      } else if (Zotero.ItemTreeManager.unregisterColumns) {
        await Zotero.ItemTreeManager.unregisterColumns([registeredColumnId]);
      }
    } catch (e) {
      Zotero.debug("Zotero Citation Counts: Column unregister error: " + e);
    }
    registeredColumnId = null;
  }

  if (itemObserver) {
    Zotero.Notifier.unregisterObserver(itemObserver);
    itemObserver = null;
  }

  ZoteroCitationCounts = undefined;
}
