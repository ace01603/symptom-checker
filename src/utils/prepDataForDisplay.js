import { faQuestionCircle, faExclamationTriangle, faStethoscope, faLightbulb } from "@fortawesome/free-solid-svg-icons";

/**
 * A class to store all misconceptions, symptoms, and concepts for display in a common format
 */
export class DataObject {
    #uniqueID;
    #contents;
    #connectedObjects;

    /**
     * 
     * @param {String} uniqueID The unique string that will be used to represent this object in the HTML
     * @param {Object} contents The raw original JSON object.
     */
    constructor(uniqueID, contents) {
        this.#uniqueID = uniqueID;
        this.#contents = contents;
        this.#connectedObjects = [];
    }

    
    /**
     * Gets the unique ID of this object.
     * @returns {String}
     */
    getHTMLId() {
        return this.#uniqueID;
    }

    /**
     * Gets the category of this object (e.g. misconception, concept)
     * @returns {String}
     */
    getCategory() {
        return "";
    }

    /**
     * Gets the type of the object within the category e.g. UnusedReturn
     * @returns {String}
     */
    getType() {
        return this.#contents.type;
    }

    /**
     * Gets the line number that the object is found on.
     * @returns {Number}
     */
    getLine() {
        return this.getContents().line;
    }

    /**
     * Gets the line index of the object
     * @returns {Number}
     */
    getLineIndex() {
        return 0;
    }

    /**
     * Gets the raw original object
     * @returns {Object}
     */
    getContents() {
        return this.#contents;
    }

    /**
     * Gets data objects that this object is connected to
     * @returns {String[]} An array of data objects
     */
    getConnectedObjects() {
        return this.#connectedObjects;
    }

    /**
     * Make a new connection with another object
     * @param {String} id The unique ID of the other object
     */
    addConnection(id) {
        this.#connectedObjects.push(id);
    }

    /**
     * Add a list of ids to the connections
     * @param {String[]} idArr An array of unique IDs
     */
    addAllConnections(idArr) {
        this.#connectedObjects.push(...idArr);
    }

    toJSON() {
        return {
            objectType: this.constructor.name,
            uniqueID: this.getHTMLId(),
            line: this.getLine(),
            type: this.getType(),
            connections: this.getConnectedObjects(),
            contents: this.getContents()

        }
    }
}

export class SymptomDataObject extends DataObject {
    /**
     * @inheritdoc
     */
    constructor(uniqueID, contents) {
        super(uniqueID, contents);
    }

    /**
     * @inheritdoc
     */
    getCategory() {
        return "symptom";
    }

    /**
     * @inheritdoc
     */
    getLineIndex() {
        return this.getContents().lineIndex;
    }
}

export class MisconceptionDataObject extends DataObject {
    /**
     * @inheritdoc
     */
    constructor(uniqueID, contents) {
        super(uniqueID, contents);
    }

    /**
     * @inheritdoc
     */
    getCategory() {
        return "misconception";
    }

    /**
     * @inheritdoc
     */
    getLineIndex() {
        const contributingSymptoms = this.getContents().reason.contributingSymptoms;
        for (const s of contributingSymptoms) {
            if (s.line === this.getLine()) {
                return s.lineIndex;
            }
        }
        return 0;
    }
}

export class ConceptDataObject extends MisconceptionDataObject {
    /**
     * @inheritdoc
     */
    constructor(uniqueID, contents) {
        super(uniqueID, contents);
    }

    /**
     * @inheritdoc
     */
    getCategory() {
        return "concept";
    }

    /**
     * @inheritdoc
     */
    // getLine() {
    //     const contributingSymptoms = this.getContents().
    //     return this.getContents().line;
    // }
}

/**
 * 
 * @param {DataObject} a 
 * @param {DataObject} b 
 * @returns {Number}
 */
export const sortDataObjects = (a, b) => {
    if (a.getLine() < b.getLine()) return -1;
    else if (a.getLine() > b.getLine()) return 1;
    else {
        if (a.getLineIndex() < b.getLineIndex()) return -1;
        else if (a.getLineIndex() > b.getLineIndex()) return 1;
        else return 0;
    }
}

export class Card {
    static DEFAULT_Y = -1000;
    #yPos; 
    #classNames = [];
    #dataObject;

    /**
     * Create a new Card with the appropriate type
     * @param {DataObject} dataObject 
     */
    static create(dataObject) {
        switch (dataObject.getCategory()) {
            case "misconception":
                return new MisconceptionCard(dataObject);
            case "symptom":
                return new SymptomCard(dataObject);
            case "concept":
                return new ConceptCard(dataObject);
            default:
                return new Card(dataObject);
        }
    }

    /**
     * Create a new Card
     * @param {DataObject} dataObject 
     */
    constructor(dataObject) {
        this.#dataObject = dataObject;
        this.#yPos = Card.DEFAULT_Y;
    }

    /**
     * Get the unique id used for the card's HTML id
     * @returns {string}
     */
    getHTMLId() {
        return this.#dataObject.getHTMLId();
    }

    /**
     * Gets the category e.g. misconception, symptom
     * @returns {string}
     */
    getCategory() {
        return this.#dataObject.getCategory();
    }

    /**
     * Gets the type of the object in the category, e.g. UnusedReturn
     * @returns {string}
     */
    getType() {
        return this.#dataObject.getType();
    }

    /**
     * Gets the code line number that the card is associated with
     * @returns {number}
     */
    getLine() {
        return this.#dataObject.getLine();
    }

    /**
     * Gets the line index of the data
     * @returns {number}
     */
    getLineIndex() {
        return this.#dataObject.getLineIndex();
    }

    /**
     * Gets the y coordinate of the card
     * @returns {number}
     */
    getY() {
        return this.#yPos;
    }

    /**
     * Updates the y coordinate
     * @param {number} newY 
     */
    setY(newY) {
        this.#yPos = newY;
    }

    /**
     * Gets the contents of the card, either a symptom object or a misconception occurrence
     * @returns {Object}
     */
    getContents() {
        return this.#dataObject.getContents();
    }

    /**
     * 
     * @returns {String[]}
     */
    getConnectedObjects() {
        return this.#dataObject.getConnectedObjects();
    }

    /**
     * Gets an array of class names to add to the HTML element
     * @returns {string[]}
     */
    getClassNames() {
        return this.#classNames;
    }

    /**
     * Get the Font Awesome Icon for this card type
     * @returns 
     */
    getIcon() {
        return faQuestionCircle; // Unknown
    }
}

export class MisconceptionCard extends Card {

    constructor(dataObject) {
        super(dataObject);
    }

    /**
     * @inheritdoc
     */
    getIcon() {
        return faExclamationTriangle
    }
}

export class SymptomCard extends Card {
    constructor(dataObject) {
        super(dataObject);
    }

    /**
     * @inheritdoc
     */
    getIcon() {
        return faStethoscope;
    }
}

export class ConceptCard extends MisconceptionCard {
    constructor(dataObject) {
        super(dataObject);
    }

    /**
     * @inheritdoc
     */
    getIcon() {
        return faLightbulb;
    }
}
