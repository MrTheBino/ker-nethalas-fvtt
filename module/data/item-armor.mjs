import KerNethalasItem from "./item-item.mjs";

export default class KerNethalasArmor extends KerNethalasItem {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.armorType = new fields.StringField({
        required: true,
        choices: ["full_suit", "piecemeal_armor", "helmet", "shield"],
        initial: "full_suit"
      });
      schema.protection = new fields.NumberField({ required: true, default: 0, min: 0 });
      schema.parryBonus = new fields.NumberField({ required: true, default: 0, min: 0 });
      schema.notes = new fields.StringField({ required: false, blank: true });

    return schema;
  }
}