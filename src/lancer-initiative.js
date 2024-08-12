import { LancerCombat, LancerCombatant } from "./lancer-combat";
import { getTrackerAppearance, LancerCombatTracker } from "./lancer-combat-tracker";
import { LancerInitiativeConfigForm } from "./li-form";

const module = "lancer-initiative";
const templatePath = "modules/lancer-initiative/templates/lancer-combat-tracker.hbs";

/**
 * @param {CombatTrackerAppearance} val
 */
export function setAppearance(val) {
  document.documentElement.style.setProperty(
    "--lancer-initiative-icon-size",
    `${val.icon_size}rem`
  );
  document.documentElement.style.setProperty("--lancer-initiative-player-color", val.player_color);
  document.documentElement.style.setProperty(
    "--lancer-initiative-friendly-color",
    val.friendly_color
  );
  document.documentElement.style.setProperty(
    "--lancer-initiative-neutral-color",
    val.neutral_color
  );
  document.documentElement.style.setProperty("--lancer-initiative-enemy-color", val.enemy_color);
  document.documentElement.style.setProperty("--lancer-initiative-secret-color", val.secret_color);
  document.documentElement.style.setProperty("--lancer-initiative-done-color", val.done_color);
  game.combats?.render();
}

function registerSettings() {
  console.log(`${module} | Initializing Lancer Initiative Module`);
  if (!!CONFIG.LancerInitiative?.module) {
    Hooks.once("ready", () =>
      ui.notifications.warn(
        "The system you are using implements lancer initiative natively. You can disable the module",
        { permanent: true }
      )
    );
    throw new Error(
      `${module} | Lancer Intitiative already initiatilized, does your system implement it?`
    );
  }
  CONFIG.LancerInitiative = {
    module,
    templatePath,
    def_appearance: new CombatTrackerAppearance(),
  };
  Object.defineProperty(CONFIG.LancerInitiative, "module", { writable: false });

  // Override classes
  CONFIG.Combat.documentClass = LancerCombat;
  CONFIG.Combatant.documentClass = LancerCombatant;
  CONFIG.ui.combat = LancerCombatTracker;

  // Call hooks to signal other modules of the initialization
  Hooks.callAll("LancerInitiativeInit");

  game.settings.registerMenu(module, "combat-tracker-appearance", {
    name: "LANCERINITIATIVE.IconSettingsMenu",
    label: "LANCERINITIATIVE.IconSettingsMenu",
    type: LancerInitiativeConfigForm,
    restricted: true,
  });
  game.settings.register(module, "combat-tracker-appearance", {
    scope: "world",
    config: false,
    type: CombatTrackerAppearance,
    onChange: setAppearance,
    default: CONFIG.LancerInitiative.def_appearance,
  });
  // Allows combat tracker sorting to be toggled. Optional for downstreams.
  game.settings.register(module, "combat-tracker-sort", {
    name: "LANCERINITIATIVE.SortTracker",
    hint: "LANCERINITIATIVE.SortTrackerDesc",
    scope: "world",
    config: true,
    type: Boolean,
    onChange: v => {
      CONFIG.LancerInitiative.sort = v;
      game.combats?.render();
    },
    default: true,
  });
  CONFIG.LancerInitiative.sort = game.settings.get(module, "combat-tracker-sort");
  // Allows initiative rolling to be toggled. Optional for downstreams.
  game.settings.register(module, "combat-tracker-enable-initiative", {
    name: "LANCERINITIATIVE.EnableInitiative",
    hint: "LANCERINITIATIVE.EnableInitiativeDesc",
    scope: "world",
    config: !!CONFIG.Combat.initiative.formula,
    type: Boolean,
    onChange: v => {
      CONFIG.LancerInitiative.enable_initiative = v;
      game.combats?.render();
    },
    default: false,
  });
  CONFIG.LancerInitiative.enable_initiative = game.settings.get(
    module,
    "combat-tracker-enable-initiative"
  );

  // Set the css vars
  setAppearance(game.settings.get(module, "combat-tracker-appearance"));
}

Hooks.once("init", registerSettings);
export class CombatTrackerAppearance extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      icon: new fields.StringField({
        required: true,
        initial: "fas fa-circle-chevron-right",
        label: "LANCERINITIATIVE.Icon",
      }),
      deactivate: new fields.StringField({
        required: true,
        initial: "fas fa-circle-xmark",
        label: "LANCERINITIATIVE.DeactivateIcon",
      }),
      icon_size: new fields.NumberField({
        required: true,
        initial: 1.5,
        min: 1,
        max: 3,
        step: 0.1,
        integer: false,
        label: "LANCERINITIATIVE.IconSize",
      }),
      player_color: new fields.ColorField({
        required: true,
        initial: "#44abe0",
        label: "LANCERINITIATIVE.PartyColor",
      }),
      friendly_color: new fields.ColorField({
        required: true,
        initial: "#44abe0",
        label: "LANCERINITIATIVE.FriendlyColor",
      }),
      neutral_color: new fields.ColorField({
        required: true,
        initial: "#146464",
        label: "LANCERINITIATIVE.NeutralColor",
      }),
      enemy_color: new fields.ColorField({
        required: true,
        initial: "#d98f30",
        label: "LANCERINITIATIVE.EnemyColor",
      }),
      secret_color: new fields.ColorField({
        required: true,
        initial: "#552f8c",
        label: "LANCERINITIATIVE.SecretColor",
      }),
      done_color: new fields.ColorField({
        required: true,
        initial: "#aaaaaa",
        label: "LANCERINITIATIVE.DeactivateColor",
      }),
    };
  }
}
