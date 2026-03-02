Hooks.once('init', async function () {
    console.log('Deck of Endless NPCs | Initializing module');
});

Hooks.on('renderActorDirectory', (app, html, data) => {
    // In newer Foundry VTT versions, html might be an HTMLElement rather than a jQuery object
    const htmlJQ = html.find ? html : $(html);

    // Check if the button is already appended
    if (htmlJQ.find('.deck-endless-npcs-btn').length > 0) return;

    const button = $(`<button class="deck-endless-npcs-btn"><i class="fas fa-id-card"></i> Generate NPC</button>`);

    button.click(ev => {
        new DeckEndlessNPCsApp().render({ force: true });
    });

    htmlJQ.find('.directory-footer').append(button);
});
