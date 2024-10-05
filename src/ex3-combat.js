import { LancerCombat } from "./lancer-combat";

export class Ex3Combat extends LancerCombat {
    async rollInitiative(ids, options) {
        const combatant = this.combatants.get(ids[0]);
        // @ts-expect-error
        if (combatant.token.actor) {
            // @ts-expect-error
            combatant.token.actor.actionRoll(
                {
                    rollType: 'joinBattle',
                    pool: 'joinbattle'
                }
            );
            // @ts-expect-error
            return this.update();
        }
        else {
            return super.rollInitiative(ids, options);
        }
    }
}
