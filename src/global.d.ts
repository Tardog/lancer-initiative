import { LancerCombat, LancerCombatant } from "./lancer-combat";

declare global {
  interface LenientGlobalVariableTypes {
    game: never; // the type doesn't matter
  }

  namespace ClientSettings {
    interface Values {
      "lancer-initiative.combat-tracker-appearance": Partial<
        CONFIG["LancerInitiative"]["def_appearance"]
      >;
      "lancer-initiative.combat-tracker-sort": boolean;
      "lancer-initiative.combat-tracker-enable-initiative": boolean;
    }
  }

  interface LancerInitiativeConfig<T extends string = string> {
    /**
     * Namespace for flags and settings. Should be the id of the system or
     * module.
     */
    module: T;
    /**
     * Filepath to the handlebars template for LancerCombatTracker. Can be
     * omitted if LancerCombatTracker is not used.
     */
    templatePath?: string;
    /**
     * Default appearance settings for LancerCombatTracker. Can be omitted if
     * LancerCombatTracker is not used.
     */
    def_appearance?: {
      icon: string;
      icon_size: number;
      player_color: string;
      friendly_color: string;
      neutral_color: string;
      enemy_color: string;
      done_color: string;
    };
    /**
     * Activations for each unit.  If a string, path to the activation parameter
     * in actor.getRollData(), if a number, that value. Otherwise 1
     * @defaultValue `1`
     */
    activations?: string | number;
    /**
     * Whether to enable the initiative rolling buttons in the tracker. Only
     * needed if LancerCombatTracker or a subclass is used for the tracker and
     * intitaitve rolling is wanted.
     * @defaultValue `false`
     */
    enable_initiative?: boolean;
    /**
     * Whether to sort the displayed combat tracker based on activation status.
     * If enabled, the active unit is displayed on the top and units that have
     * used all their activations are sorted to the bottom. Only needed if
     * LancerCombatTracker or a subclass is used and sorting is not wanted, or
     * the ability to toggle it is desired.
     * @defaultValue `true`
     */
    sort?: boolean;
  }

  interface CONFIG {
    LancerInitiative: LancerInitiativeConfig<"lancer-initiative">;
  }

  interface DocumentClassConfig {
    Combat: typeof LancerCombat;
    Combatant: typeof LancerCombatant;
  }
}
