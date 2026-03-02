class EndlessNPCGenerator {
    constructor() {
        this.deckRawData = null;
    }

    async loadData() {
        if (!this.deckRawData) {
            try {
                const response = await fetch('modules/deck-endless-npcs/endlessNPCs_utf8.json');
                this.deckRawData = await response.json();
            } catch (error) {
                console.error("Deck of Endless NPCs | Error loading JSON data:", error);
            }
        }
        return this.deckRawData;
    }

    async generate() {
        await this.loadData();
        if (!this.deckRawData) return null;

        const pickCard = (n) => {
            const rand = n || (Math.floor(Math.random() * 104) + 1);
            return foundry.utils.deepClone(this.deckRawData[`CARD#${rand}`]);
        };

        const firstcardNumber = Math.floor(Math.random() * 104) + 1;
        const card1 = pickCard(firstcardNumber);
        const card2 = pickCard();
        const card3 = pickCard();
        const card4 = pickCard();

        // Simulate Hearts and Scrolls since they are missing from endlessNPCs.json
        const hearts1 = Math.floor(Math.random() * 4);
        const hearts2 = Math.floor(Math.random() * 4);
        const scrolls1 = Math.floor(Math.random() * 4);
        const scrolls2 = Math.floor(Math.random() * 4);
        const hearts = hearts1 + hearts2;
        const scrolls = scrolls1 + scrolls2;

        const names = Object.values(card1.NAME);
        const sName = names[Math.floor(Math.random() * names.length)];

        // Simulate Alignment
        const alignments = ["Lawful Good", "Neutral Good", "Chaotic Good", "Lawful Neutral", "True Neutral", "Chaotic Neutral", "Lawful Evil", "Neutral Evil", "Chaotic Evil"];
        const sAlignment = alignments[Math.floor(Math.random() * alignments.length)];

        let sAncestry = null;
        if (card1.ANCESTRY) {
            sAncestry = card1.ANCESTRY.charAt(0).toUpperCase() + card1.ANCESTRY.slice(1).toLowerCase();
        }

        const tablePresence1 = ["Newly Arrived", "Frequent Visitor", "Frequent Visitor", "Local Resident", "Local Resident", "Local Resident", "Local Resident"];
        const tablePresence2 = ["Local Resident", "Local Resident", "Local Resident", "Local Resident", "Frequent Visitor", "Frequent Visitor", "Newly Arrived"];
        const tableGroup1 = ["Alone", "A few Friends", "A few Friends", "Friends and Family", "Friends and Family", "Friends and Family", "Friends and Family"];
        const tableGroup2 = ["Friends and Family", "Friends and Family", "Friends and Family", "Friends and Family", "A few Friends", "A few Friends", "Alone"];

        const getPresence = (cardnum, sc) => {
            const index = Math.min(sc, 6);
            if (cardnum % 2 === 0) return tablePresence1[index];
            return tablePresence2[index];
        };

        const getGroup = (cardnum, hts) => {
            const index = Math.min(hts, 6);
            if (cardnum % 4 === 1 || cardnum % 4 === 2) return tableGroup1[index];
            return tableGroup2[index];
        };

        const sPresence = getPresence(firstcardNumber, scrolls);
        const sGroup = getGroup(firstcardNumber, hearts);

        let sDescriptor = "";
        let sEthHeri = "";

        if (card1.HERITAGE) {
            sDescriptor = "Heritage";
            sEthHeri = card1.HERITAGE.charAt(0).toUpperCase() + card1.HERITAGE.slice(1).toLowerCase();
        } else if (card1.ETHNICITY) {
            sDescriptor = "Ethnicity";
            sEthHeri = card1.ETHNICITY.charAt(0).toUpperCase() + card1.ETHNICITY.slice(1).toLowerCase();
        }

        if (card2.TABLE1 && card2.TABLE1.NAME === "CHARLATAN") {
            const extraCardNum = Math.floor(Math.random() * 103) + 1;
            const extraCard = pickCard(extraCardNum);
            if (extraCard && extraCard.TABLE1) {
                card2.TABLE1.TEXT += " " + extraCard.TABLE1.TEXT;
                card2.TABLE1.DETAIL_override = extraCard.TABLE1;
            }
        }

        const isApplySecret = (rule, hts, scs) => {
            if (!rule) return true;
            if (rule.H) {
                const hRule = rule.H;
                if (hRule.endsWith("+")) {
                    if (parseInt(hRule.charAt(0)) > hts) return false;
                } else if (hRule.endsWith("-")) {
                    if (parseInt(hRule.charAt(0)) < hts) return false;
                } else if (parseInt(hRule) !== hts) {
                    return false;
                }
            }
            if (rule.S) {
                const sRule = rule.S;
                if (sRule.endsWith("+")) {
                    if (parseInt(sRule.charAt(0)) > scs) return false;
                } else if (sRule.endsWith("-")) {
                    if (parseInt(sRule.charAt(0)) < scs) return false;
                } else if (parseInt(sRule) !== scs) {
                    return false;
                }
            }
            return true;
        };

        let sSecret = "";
        if (card4.RULE && card4.RULE.SECRET && isApplySecret(card4.RULE.SECRET, hearts, scrolls)) {
            sSecret += card4.SECRET + " ";
            if (card4.RULE.OTHER1 && isApplySecret(card4.RULE.OTHER1, hearts, scrolls)) sSecret += card4.RULE.OTHER1.TEXT + " ";
            if (card4.RULE.OTHER2 && isApplySecret(card4.RULE.OTHER2, hearts, scrolls)) sSecret += card4.RULE.OTHER2.TEXT + " ";
        }

        const getStrFromTable = (tTable, rawSelection, overrideTable) => {
            if (!tTable) return null;
            let selection = rawSelection > 6 ? 6 : rawSelection;
            let detailKey = null;
            let detailObj = null;

            const targetTable = overrideTable || tTable;
            for (const [k, v] of Object.entries(targetTable)) {
                if (k !== "NAME" && k !== "TEXT" && typeof v === 'object') {
                    detailKey = k;
                    detailObj = v;
                    break;
                }
            }

            return {
                NAME: tTable.NAME,
                TEXT: tTable.TEXT,
                detailName: detailKey,
                detailValue: detailObj ? detailObj[selection] : ""
            };
        };

        const table1Data = getStrFromTable(card2.TABLE1, scrolls, card2.TABLE1.DETAIL_override);
        const table2Data = getStrFromTable(card3.TABLE2, hearts);

        const npcData = {
            name: sName,
            alignment: sAlignment,
            ancestry: sAncestry,
            descriptor: sDescriptor,
            ethHeri: sEthHeri,
            presence: sPresence,
            group: sGroup,
            trait: card4.TRAIT ? {
                NAME: card4.TRAIT.NAME,
                TEXT: card4.TRAIT.TEXT
            } : null,
            table1: table1Data,
            table2: table2Data,
            secret: sSecret.trim()
        };

        return npcData;
    }
}
