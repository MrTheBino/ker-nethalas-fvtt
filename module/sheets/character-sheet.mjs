const { ActorSheetV2 } = foundry.applications.sheets
const { HandlebarsApplicationMixin } = foundry.applications.api
const { TextEditor, DragDrop } = foundry.applications.ux


export class KerNethalasCharacterSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
    #dragDrop

    /** @inheritDoc */
    static DEFAULT_OPTIONS = {
        classes: ['sheet', 'actor'],
        tag: 'form',
        position: {
            width: 850,
            height: 800
        },
        actions: {
            editItem: this.#handleEditItem,
            deleteItem: this.#handleDeleteItem
        },
        form: {
            submitOnChange: true
        },
        actor: {
            type: 'character'
        },
        window: {
            resizable: true,
            controls: [
            ]
        },
        dragDrop: [{
            dragSelector: '[data-drag="true"]',
            dropSelector: '.sheet.actor'
        }],
    }

    /** @inheritDoc */
    static PARTS = {
        header: {
            id: 'header',
            template: 'systems/ker-nethalas-fvtt/templates/actor/character/header.hbs'
        },
        tabs: {
            id: 'tabs',
            template: 'templates/generic/tab-navigation.hbs'
        },
        main: {
            id: 'main',
            template: 'systems/ker-nethalas-fvtt/templates/actor/character/tab-main.hbs'
        },
        masteries: {
            id: 'masteries',
            template: 'systems/ker-nethalas-fvtt/templates/actor/character/tab-masteries.hbs'
        },
        restistances: {
            id: 'restistances',
            template: 'systems/ker-nethalas-fvtt/templates/actor/character/tab-damage-vulnerability-resistance.hbs'
        }
    }

    /**
   * Define the structure of tabs used by this sheet.
   * @type {Record<string, ApplicationTabsConfiguration>}
   */
    static TABS = {
        sheet: { // this is the group name
            tabs:
                [
                    { id: 'main', group: 'sheet', label: 'Main' },
                    { id: 'masteries', group: 'sheet', label: 'Masteries' },
                    { id: 'restistances', group: 'sheet', label: 'Damage Vulnerabilities & Resistance' }
                ],
            initial: 'main'
        }
    }

    constructor(options = {}) {
        super(options)
        this.#dragDrop = this.#createDragDropHandlers()
    }




    /* @inheritDoc */
    async _prepareContext(options) {
        const context = await super._prepareContext(options)
        const actorData = this.document.toPlainObject();

        context.system = actorData.system;
        context.flags = actorData.flags;
        context.actor = this.document;
        context.skills = [];
        context.gear = [];
        context.masteries = [];
        context.damageVulnerabilityResistances = [];

        context.config = CONFIG.KER_NETHALAS_FVTT;

        let inventory = this.options.document.items;
        
        for (let i of inventory) {
            i.img = i.img || Item.DEFAULT_ICON;
            // Append to gear.
            if (i.type === 'item') {
                context.gear.push(i);
            }
            else if (i.type === 'skill') {
                context.skills.push(i);
            } else if(i.type === 'mastery'){
                context.masteries.push(i);
            }
            else if(i.type == "damage-vulnerability-resistance"){
                context.damageVulnerabilityResistances.push(i);
            }
        }

        context.skills.sort((a, b) => a.name.localeCompare(b.name));

        context.biographyHTML = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
            this.document.system.biography,
            {
                // Whether to show secret blocks in the finished html
                secrets: this.document.isOwner,
                // Necessary in v11, can be removed in v12
                async: true,
                // Data to fill in for inline rolls
                rollData: this.document.getRollData(),
                // Relative UUID resolution
                relativeTo: this.document,
            }
        );
        return context;
    }

    /** @inheritDoc */
    _onRender(context, options) {
        this.#dragDrop.forEach((d) => d.bind(this.element))

        const itemEditableStatsElements = this.element.querySelectorAll('.item-editable-stat');
        for (const input of itemEditableStatsElements) {
            input.addEventListener("change", event => this.handleItemStatChanged(event))
        }

        const actorArrayUpdateElements = this.element.querySelectorAll('.actor-array-update');
        for (const input of actorArrayUpdateElements) {
            input.addEventListener("change", event => this.handleArrayUpdate(event))
        }

        const updateMasteryTierSelections = this.element.querySelectorAll('.update-mastery-tier-selection');
        for (const select of updateMasteryTierSelections) {
            select.addEventListener("change", event => this.handleMasteryTierChange(event));
        }
    }

    async _onItemCreate(event, target, actor) {
        event.preventDefault();

        // Get the type of item to create.
        const type = target.dataset.type;
        // Grab any data associated with this control.
        const data = duplicate(target.dataset);
        // Initialize a default name.
        const name = `New ${type.capitalize()}`;
        // Prepare the item object.

        const itemData = {
            name: name,
            type: type,
            system: data
        };
        // Remove the type from the dataset since it's in the itemData.type prop.
        delete itemData.system['type'];

        // Finally, create the item!
        return await KerNathalasItem.create(itemData, { parent: actor });
    }


    async handleMasteryTierChange(ev) {
        const mastery = ev.target.dataset.masteryId ? this.actor.items.get(ev.target.dataset.masteryId) : null;
        const tierLevel  = ev.target.dataset.tierLevel;
        const selectedOption = parseInt(ev.target.value);

        console.log(mastery);

        if(selectedOption == 0){
            await mastery.update({ [`system.tier${tierLevel}.option1.chosen`]: false, [`system.tier${tierLevel}.option2.chosen`]: false });
        }else if(selectedOption == 1){
            await mastery.update({ [`system.tier${tierLevel}.option1.chosen`]: true, [`system.tier${tierLevel}.option2.chosen`]: false });
        }else if(selectedOption == 2){
            await mastery.update({ [`system.tier${tierLevel}.option1.chosen`]: false, [`system.tier${tierLevel}.option2.chosen`]: true });
        }

    }

    async handleItemStatChanged(ev) {
        const item = ev.target.dataset.itemId ? this.actor.items.get(ev.target.dataset.itemId) : null;

        if (ev.target.type === 'checkbox') {
            item.update({ [ev.target.dataset.itemStat]: ev.target.checked });
        } else {
            item.update({ [ev.target.dataset.itemStat]: ev.target.value });
        }
    }

    async handleArrayUpdate(ev){
        ev.preventDefault();
        console.log("hier");
        const key = ev.target.dataset.key;
        const index = parseInt(ev.target.dataset.index);
        const array = foundry.utils.getProperty(this.actor, key);

        if(ev.target.type === 'checkbox')
        {
            array[index] = ev.target.checked;
        }else{
            array[index] = ev.target.value;
        }
        await this.actor.update({ [key]: array });
    }

     static async #handleEditItem(event, target) {
        event.preventDefault();
        const item = this.options.document.items.get(target.dataset.itemId);
        await item.sheet.render({ force: true });
    }

    static async #handleDeleteItem(event, target) {
        const proceed = await foundry.applications.api.DialogV2.confirm({
            content: 'Do you really want to delete this item?',
            rejectClose: false,
            modal: true
        });
        if (proceed) {
            if (target.dataset.itemId == undefined) {
                const li = $(target).parents('.item');
                const item = this.actor.items.get(li.data('itemId'));
                item.delete();
                li.slideUp(200, () => this.render(false));
            } else {
                const item = this.actor.items.get(target.dataset.itemId);
                item.delete();
                li.slideUp(200, () => this.render(false));
            }
        }
    }

    /**
     * Create drag-and-drop workflow handlers for this Application
     * @returns {DragDrop[]} An array of DragDrop handlers
     * @private
     */
    #createDragDropHandlers() {
        return this.options.dragDrop.map((d) => {
            d.permissions = {
                dragstart: this._canDragStart.bind(this),
                drop: this._canDragDrop.bind(this)
            }
            d.callbacks = {
                dragstart: this._onDragStart.bind(this),
                dragover: this._onDragOver.bind(this),
                drop: this._onDrop.bind(this)
            }
            return new DragDrop(d)
        })
    }
    /**
 * Define whether a user is able to begin a dragstart workflow for a given drag selector
 * @param {string} selector       The candidate HTML selector for dragging
 * @returns {boolean}             Can the current user drag this selector?
 * @protected
 */
    _canDragStart(selector) {
        // game.user fetches the current user
        return this.isEditable;
    }


    /**
     * Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector
     * @param {string} selector       The candidate HTML selector for the drop target
     * @returns {boolean}             Can the current user drop on this selector?
     * @protected
     */
    _canDragDrop(selector) {
        // game.user fetches the current user
        return this.isEditable;
    }

    /**
     * Callback actions which occur at the beginning of a drag start workflow.
     * @param {DragEvent} event       The originating DragEvent
     * @protected
     */
    _onDragStart(event) {
        const el = event.currentTarget;
        if ('link' in event.target.dataset) return;

        // Extract the data you need
        let dragData = null;

        if (!dragData) return;

        // Set data transfer
        event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
    }


    /**
     * Callback actions which occur when a dragged element is over a drop target.
     * @param {DragEvent} event       The originating DragEvent
     * @protected
     */
    _onDragOver(event) { }


    /**
     * Callback actions which occur when a dragged element is dropped on a target.
     * @param {DragEvent} event       The originating DragEvent
     * @protected
     */
    async _onDrop(event) {
        const data = TextEditor.getDragEventData(event);

        //console.log(data.type);
        // Handle different data types
        switch (data.type) {
            // write your cases
        }

        return super._onDrop?.(event);
    }
}