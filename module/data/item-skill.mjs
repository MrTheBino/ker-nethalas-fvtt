import KerNethalasItemBase from "./base-item.mjs";

export default class KerNethalasSkill extends KerNethalasItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.value = new fields.NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0, max: 100 });
    schema.marked = new fields.BooleanField({ required: true, nullable: false, initial: false });

    return schema;
  }
}