// Attached explicitly to window for Zotero 8/9/10 Cu.Sandbox PreferencePane isolation
window.ZoteroCitationCounts_Prefs = {
  init: function () {
    const radiogroup = document.getElementById(
      "citationcounts-preference-pane-autoretrieve-radiogroup"
    );
    if (!radiogroup) return;
    const currentPref =
      Zotero.Prefs.get("extensions.citationcounts.autoretrieve", true) || "crossref";
    radiogroup.value = currentPref;
  },
};
