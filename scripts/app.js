const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

class DeckEndlessNPCsApp extends HandlebarsApplicationMixin(ApplicationV2) {
    constructor(options) {
        super(options);
        this.npc = null;
        this.generator = new EndlessNPCGenerator();
    }

    static DEFAULT_OPTIONS = {
        id: "deck-endless-npcs-app",
        classes: ["deck-endless-npcs-window"],
        tag: "form",
        window: {
            title: "Deck of Endless NPCs",
            icon: "fas fa-dice",
            resizable: true,
            contentClasses: ["standard-form"]
        },
        position: {
            width: 450,
            height: "auto"
        },
        actions: {
            generate: DeckEndlessNPCsApp._onGenerate,
            copy: DeckEndlessNPCsApp._onCopy
        }
    };

    static PARTS = {
        form: {
            template: "modules/deck-endless-npcs/templates/generator.html"
        }
    };

    async _prepareContext(options) {
        return {
            npc: this.npc
        };
    }

    static async _onGenerate(event, target) {
        event.preventDefault();

        const btn = $(target);
        btn.prop('disabled', true);
        btn.html('<i class="fas fa-spinner fa-spin"></i> Generating...');

        this.npc = await this.generator.generate();

        btn.prop('disabled', false);
        btn.html('<i class="fas fa-dice"></i> Generate New');

        this.render({ force: true });
    }

    static async _onCopy(event, target) {
        event.preventDefault();
        if (!this.npc) return;

        let content = `<h1>${this.npc.name}</h1>`;
        content += `<p>${this.npc.alignment}</p>`;
        content += `<p><strong>Ancestry:</strong> ${this.npc.ancestry}</p>`;
        if (this.npc.descriptor) {
            content += `<p><strong>${this.npc.descriptor}:</strong> ${this.npc.ethHeri}</p>`;
        }
        content += `<p><strong>Presence:</strong> ${this.npc.presence}</p>`;
        content += `<p><strong>Group:</strong> ${this.npc.group}</p>`;

        if (this.npc.trait) {
            content += `<p><strong>${this.npc.trait.NAME}</strong></p><p>${this.npc.trait.TEXT}</p>`;
        }

        if (this.npc.table1) {
            content += `<p><strong>${this.npc.table1.NAME}</strong></p>`;
            content += `<p>${this.npc.table1.TEXT} <strong>${this.npc.table1.detailName}:</strong> ${this.npc.table1.detailValue}</p>`;
        }

        if (this.npc.table2) {
            content += `<p><strong>${this.npc.table2.NAME}</strong></p>`;
            content += `<p>${this.npc.table2.TEXT} <strong>${this.npc.table2.detailName}:</strong> ${this.npc.table2.detailValue}</p>`;
        }

        if (this.npc.secret) {
            content += `<p><strong>SECRET</strong></p><p>${this.npc.secret}</p>`;
        }

        try {
            await navigator.clipboard.writeText(content);
            if (ui.notifications) {
                ui.notifications.info(`Copied ${this.npc.name}'s details to clipboard!`);
            }
        } catch (err) {
            console.error("Deck of Endless NPCs | Failed to copy text: ", err);
            if (ui.notifications) {
                ui.notifications.error("Failed to copy to clipboard.");
            }
        }
    }
}
