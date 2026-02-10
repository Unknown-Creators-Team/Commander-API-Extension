import fs from "fs";

const INPUT_FILE_PATH = "default/player.json";
const OUTPUT_FILE_PATH = "entities/player.json";
const WARNING_TEXT = `/**
* Warning: This file is auto-generated. Do not edit it directly.
* Instead, edit the default/player.json file and run the script again.
*/\n`;

const isEmpty = process.argv[2] === "empty";

const file = fs.readFileSync(INPUT_FILE_PATH, "utf-8");
if (!file) throw new Error("File not found");
const json = JSON.parse(file);
if (!json) throw new Error("File is empty");

if (isEmpty) {
    const string = JSON.stringify(json, null, 4);
    fs.writeFileSync(OUTPUT_FILE_PATH, WARNING_TEXT.concat(string), "utf-8");
    console.log("File written successfully.");
    process.exit(0);
}

const description = json["minecraft:entity"].description;
if (!description) throw new Error("Description not found");
const componentGroups = json["minecraft:entity"].component_groups;
if (!componentGroups) throw new Error("Component groups not found");
const components = json["minecraft:entity"].components;
if (!components) throw new Error("Components not found");
const events = json["minecraft:entity"].events;
if (!events) throw new Error("Events not found");

description["properties"] = {
    "capi:team": {
        type: "int",
        default: 0,
        range: [0, 40],
    },
};

components["minecraft:damage_sensor"] = {
    triggers: [],
};

for (let i = 0.0; Math.round(i * 100) / 100 <= 10.0; i += 0.01) {
    i = Math.round(i * 100) / 100; // Round to 2 decimal places
    componentGroups[`capi:size_${i}`] = {
        "minecraft:scale": {
            value: i,
        },
    };

    events[`capi:size_${i}`] = {
        add: {
            component_groups: [`capi:size_${i}`],
        },
    };
}

for (let i = 1; i <= 200; i += 1) {
    i = Math.round(i * 10) / 10; // Round to 1 decimal place
    componentGroups[`capi:health_${i}`] = {
        "minecraft:health": {
            max: i,
        },
    };

    events[`capi:health_${i}`] = {
        add: {
            component_groups: [`capi:health_${i}`],
        },
    };
}

for (let i = 0; i <= 200; i++) {
    componentGroups[`capi:attack_${i}`] = {
        "minecraft:attack": {
            damage: i,
        },
    };

    events[`capi:attack_${i}`] = {
        add: {
            component_groups: [`capi:attack_${i}`],
        },
    };
}

for (let i = 1; i <= 40; i++) {
    components["minecraft:damage_sensor"].triggers.push({
        on_damage: {
            filters: {
                all_of: [
                    {
                        test: "int_property",
                        subject: "self",
                        domain: "capi:team",
                        value: i,
                    },
                    {
                        test: "int_property",
                        subject: "other",
                        domain: "capi:team",
                        value: i,
                    },
                ],
            },
        },
        deals_damage: false,
    });
}

json["minecraft:entity"].component_groups = componentGroups;
json["minecraft:entity"].components = components;
json["minecraft:entity"].events = events;
const string = JSON.stringify(json, null, 4);
fs.writeFileSync(OUTPUT_FILE_PATH, WARNING_TEXT.concat(string), "utf-8");
console.log("File written successfully.");
