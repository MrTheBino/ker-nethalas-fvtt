/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  return loadTemplates([
    // Actor partials.
    'systems/ker-nethalas-fvtt/templates/actor/parts/actor-features.hbs',
    'systems/ker-nethalas-fvtt/templates/actor/parts/actor-items.hbs',
    'systems/ker-nethalas-fvtt/templates/actor/parts/actor-spells.hbs',
    'systems/ker-nethalas-fvtt/templates/actor/parts/actor-effects.hbs',
    'systems/ker-nethalas-fvtt/templates/actor/character/main_left_container.hbs',
    'systems/ker-nethalas-fvtt/templates/actor/character/main_right_container.hbs',
    'systems/ker-nethalas-fvtt/templates/actor/character/mastery-container.hbs',
    'systems/ker-nethalas-fvtt/templates/actor/character/mastery-tier.hbs',
    // Item partials
    'systems/ker-nethalas-fvtt/templates/item/parts/item-effects.hbs',
    'systems/ker-nethalas-fvtt/templates/item/parts/mastery-tier.hbs',
  ]);
};
