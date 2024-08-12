/**
 * Overrides the display of the combat and turn order tab to add activation
 * buttons and either move or remove the initiative button
 */
export class LancerCombatTracker extends CombatTracker {
  static get defaultOptions() {
    return {
      ...super.defaultOptions,
      template: CONFIG.LancerInitiative.templatePath,
    };
  }

  scrollToTurn() {
    if (this.viewed?.turn == null || !(CONFIG.LancerInitiative?.sort ?? true))
      return super.scrollToTurn();
    this.element.find("ol#combat-tracker")[0].scrollTop = 0;
  }

  /**
   * Intercepts the data being sent to the combat tracker window and
   * optionally sorts the the turn data that gets displayed. This allows the
   * units that have already gone to be moved to the bottom without the risk of
   * updateCombat events being eaten.
   */
  async getData(options = {}) {
    const config = CONFIG.LancerInitiative;
    const appearance = game.settings.get("lancer-initiative", "combat-tracker-appearance");
    /**@type { { turns: { id: string; css: string; pending: number; finished: number; }[]; [x: string]: unknown; } */
    const data = await super.getData(options);
    const sort = config.sort ?? true;
    const disp = {
      [-2]: "secret",
      [-1]: "enemy",
      [0]: "neutral",
      [1]: "friendly",
      [2]: "player",
    };
    data.turns = data.turns.map(t => {
      /** @type {LancerCombatant|undefined} */
      const combatant = this.viewed.getEmbeddedDocument("Combatant", t.id);
      return {
        ...t,
        css: t.css + " " + disp[combatant?.disposition ?? -2],
        pending: combatant?.activations.value ?? 0,
        finished: +(combatant === this.viewed.combatant), // (combatant?.activations.max ?? 1) - (combatant?.activations.value ?? 0),
      };
    });
    if (sort) {
      data.turns.sort(function (a, b) {
        const aa = a.css.indexOf("active") !== -1 ? 1 : 0;
        const ba = b.css.indexOf("active") !== -1 ? 1 : 0;
        if (ba - aa !== 0) return ba - aa;
        const ad = a.pending === 0 ? 1 : 0;
        const bd = b.pending === 0 ? 1 : 0;
        return ad - bd;
      });
    }
    data.icon_class = appearance.icon;
    data.deactivate_icon_class = appearance.deactivate;
    data.enable_initiative = config.enable_initiative ?? false;
    return data;
  }

  /**
   * @param html {JQuery<HTMLElement>}
   */
  activateListeners(html) {
    super.activateListeners(html);
    html.find(".lancer-combat-control").on("click", this._onActivateCombatant.bind(this));
  }

  /**
   * Activate the selected combatant
   * @param event {JQuery.ClickEvent<HTMLElement, undefined, HTMLElement, HTMLElement>}
   */
  async _onActivateCombatant(event) {
    event.preventDefault();
    event.stopPropagation();
    /** @type {HTMLElement} */
    const btn = event.currentTarget;
    const id = btn.closest(".combatant")?.dataset.combatantId;
    if (!id) return;
    switch (btn.dataset.control) {
      case "deactivateCombatant":
        await this.viewed.deactivateCombatant(id);
        break;
      case "activateCombatant":
        await this.viewed.activateCombatant(id);
        break;
    }
  }

  /**
   * @param li {JQuery<HTMLElement>}
   */
  async _onAddActivation(li) {
    /** @type {LancerCombatant} */
    const combatant = this.viewed.getEmbeddedDocument("Combatant", li.data("combatant-id"));
    await combatant.addActivations(1);
  }

  /**
   * @param li {JQuery<HTMLElement>}
   */
  async _onRemoveActivation(li) {
    /** @type {LancerCombatant} */
    const combatant = this.viewed.getEmbeddedDocument("Combatant", li.data("combatant-id"));
    await combatant.addActivations(-1);
  }

  /**
   * @param li {JQuery<HTMLElement>}
   */
  async _onUndoActivation(li) {
    /** @type {LancerCombatant} */
    const combatant = this.viewed.getEmbeddedDocument("Combatant", li.data("combatant-id"));
    await combatant.modifyCurrentActivations(1);
  }

  /**
   * @returns {ContextMenuEntry[]}
   */
  _getEntryContextOptions() {
    /** @type {ContextMenuEntry[]} */
    const m = [
      {
        name: "LANCERINITIATIVE.AddActivation",
        icon: '<i class="fas fa-plus"></i>',
        callback: this._onAddActivation.bind(this),
      },
      {
        name: "LANCERINITIATIVE.RemoveActivation",
        icon: '<i class="fas fa-minus"></i>',
        callback: this._onRemoveActivation.bind(this),
      },
      {
        name: "LANCERINITIATIVE.UndoActivation",
        icon: '<i class="fas fa-undo"></i>',
        callback: this._onUndoActivation.bind(this),
      },
    ];
    m.push(...super._getEntryContextOptions().filter(i => i.name !== "COMBAT.CombatantReroll"));
    return m;
  }
}

/**
 * Register the helper we use to print the icon the correnct number of times
 */
Handlebars.registerHelper("lancerinitiative-repeat", function (n, block) {
  let accum = "";
  for (let i = 0; i < n; i++) accum += block.fn(i);
  return accum;
});
