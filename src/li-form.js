import { getTrackerAppearance } from "./lancer-combat-tracker";
// type Appearance = NonNullable<typeof CONFIG.LancerInitiative.def_appearance>;

/**
 * Settings form for customizing the icon appearance of the icon used in the
 * tracker
 */
export class LancerInitiativeConfigForm extends FormApplication {
  static get defaultOptions() {
    return {
      ...super.defaultOptions,
      title: "Lancer Intiative",
      id: "lancer-initiative-settings",
      template: "modules/lancer-initiative/templates/lancer-initiative-settings.hbs",
      width: 350,
    };
  }

  getData() {
    return getTrackerAppearance();
  }

  /**
   * @param html {JQuery<HTMLElement>}
   */
  activateListeners(html) {
    super.activateListeners(html);

    //update the preview icon
    html.find('input[name="icon"]').on("change", e => {
      html
        .find("a.preview")
        .removeClass()
        .addClass($(e.target).val() + " preview");
    });

    // Update the preview icon size
    html.find('input[name="icon_size"]').on("change", e => {
      html.find("a.preview").css("font-size", $(e.target).val() + "rem");
    });

    // Set the preview icon color to the last hovered color picker
    html.find('input[type="color"]').on("mouseenter mouseleave", e => {
      html.find("a.preview").css("color", $(e.target).val());
      if ($(e.target).attr("name") === "done_selector") return;
      html.find("div.fake-combatant").css("border-color", $(e.target).val());
    });

    html.find('button[name="reset"]').on("click", this.resetSettings.bind(this));
  }

  /**
   * @param _ev {Event}
   * @param data {Record<string, unknown>}
   */
  async _updateObject(_ev, data) {
    const config = CONFIG.LancerInitiative;
    game.settings.set(
      config.module,
      "combat-tracker-appearance",
      foundry.utils.diffObject(config.def_appearance, data, { inner: true })
    );
  }

  /**
   * Sets all settings handled by the form to undefined in order to revert to
   * their default values.
   */
  async resetSettings() {
    const config = CONFIG.LancerInitiative;
    await game.settings.set(config.module, "combat-tracker-appearance", {});
    return this.render();
  }
}
