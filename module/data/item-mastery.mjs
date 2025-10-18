import KerNethalasItemBase from "./base-item.mjs";

function buildMasteryTier(tierLevel = 1){
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = {};

    let field = new fields.SchemaField({
        level: new fields.NumberField({ ...requiredInteger, initial: tierLevel, min: 0, max: 10 }),
        option1: new fields.SchemaField({
            name: new fields.StringField({ blank: true }),
            chosen: new fields.BooleanField({ initial: false }),
            costType: new fields.StringField({ blank: true }),
            costValue: new fields.StringField({ blank: true }),
            actionType: new fields.StringField({ blank: true }),
            description: new fields.StringField({ blank: true }),
        }),
        option2: new fields.SchemaField({
            name: new fields.StringField({ blank: true }),
            chosen: new fields.BooleanField({ initial: false }),
            costType: new fields.StringField({ blank: true }),
            costValue: new fields.StringField({ blank: true }),
            actionType: new fields.StringField({ blank: true }),
            description: new fields.StringField({ blank: true }),
        }),
    });
    return field;
}

export default class KerNethalasMastery extends KerNethalasItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.shortDescription = new fields.StringField({ blank: true });
    schema.tier1 = buildMasteryTier(1);
    schema.tier2 = buildMasteryTier(2);
    schema.tier3 = buildMasteryTier(3);
    schema.tier4 = buildMasteryTier(4);
    schema.tier5 = buildMasteryTier(5);

    return schema;
  }

  prepareDerivedData() {
    if(this.tier1.option1.chosen){
      this.tier1Selected = this.tier1.option1;
    }
    else if(this.tier1.option2.chosen){
      this.tier1Selected = this.tier1.option2;
    }

    if(this.tier2.option1.chosen){
      this.tier2Selected = this.tier2.option1;
    }
    else if(this.tier2.option2.chosen){
      this.tier2Selected = this.tier2.option2;
    }

    if(this.tier3.option1.chosen){
      this.tier3Selected = this.tier3.option1;
    }
    else if(this.tier3.option2.chosen){
      this.tier3Selected = this.tier3.option2;
    }

    if(this.tier4.option1.chosen){
      this.tier4Selected = this.tier4.option1;
    }
    else if(this.tier4.option2.chosen){
      this.tier4Selected = this.tier4.option2;
    }

    if(this.tier5.option1.chosen){
      this.tier5Selected = this.tier5.option1;
    }
    else if(this.tier5.option2.chosen){
      this.tier5Selected = this.tier5.option2;
    }
  }
}