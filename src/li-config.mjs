export class LancerInitiativeConfigApp extends foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.api.ApplicationV2
) {
  static PARTS = {
    form: { template: "modules/lancer-initiative/templates/lancer-initiative-settings-v2.hbs" },
  };

  static DEFAULT_OPTIONS = {
    id: "lancer-initiative-settings",
    tag: "form",
    position: { width: 350 },
    window: { title: "LANCERINITIATIVE.IconSettingsMenu" },
    form: {
      handler: this.#formHandler,
      submitOnChange: false,
      closeOnSubmit: true,
    },
    actions: { onReset: this.#onReset },
  };

  async _prepareContext(opts) {
    const appearance = game.settings.get("lancer-initiative", "combat-tracker-appearance");
    const ctx = {
      appearance: opts.reset ? CONFIG.LancerInitiative.def_appearance : appearance,
      fields: appearance.schema.fields,
    };
    opts.reset = false;
    return ctx;
  }

  _onRender(ctx, opts) {
    const icon = this.element.querySelector("a.preview");
    const fake_combatant = this.element.querySelector("div.fake-combatant");
    this.element.querySelectorAll("input[name=icon],input[name=deactivate]").forEach(e => {
      const handler = ev => {
        icon.className = "preview";
        icon.classList.add(...ev.target.value.split(" ").filter(c => !!c));
      };
      e.addEventListener("change", handler);
      e.addEventListener("mouseover", handler);
    });
    this.element.querySelectorAll("range-picker input").forEach(e => {
      e.addEventListener("change", ev => (icon.style.fontSize = `${ev.target.value}rem`));
    });
    this.element.querySelectorAll("input[type=color]").forEach(e => {
      e.addEventListener("mouseover", ev => {
        icon.style.color = fake_combatant.style.borderColor = ev.target.value;
      });
    });
  }

  static async #onReset(ev, target) {
    this.render(false, { reset: true });
  }

  static async #formHandler(_ev, _form, formData) {
    game.settings.set("lancer-initiative", "combat-tracker-appearance", formData.object);
  }
}
