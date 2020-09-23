import {Writer} from "./io/writer";
import {clearScreen, cyan, goHome, inverse} from "./util/ansi";
import {Reader} from "./io/reader";
import {command} from "./commands/command";
import {Vm} from "./synachor/vm";
import {save} from "./commands/save";
import {load} from "./commands/load";
import {solve} from "./commands/solve";
import {disasm} from "./commands/disasm";
import {dump} from "./commands/dump";

const verbs = "use take drop help inv look go".split(" ");
const vm = new Vm();
const commands = [
    save,
    load,
    solve,
    disasm,
    dump,
    command(
        ["help"],
        "This message.",
        async () => {
            writer.write(commands.map(command => `${command.name}\n  ${command.help}\n`).join(""));
            runMachine("help\n");
        })
];

const writer = new Writer(() => [
    ...things,
    ...verbs,
    ...commands.map(command => command.name),
    ...["Grue", "grue"]
]);

const reader = new Reader(() => [
    ...verbs,
    ...things,
    ...commands.map(command => command.name),
]);

let things: string[] = [];
let location: string = "";

function updateState() {
    things = [];
    for (const st of vm.run("look\ninv\n").output.split("\n")) {
        let thingMatch = st.match(/- (.*)/);
        if (thingMatch) {
            things.push(thingMatch[1]);
        }
        let locationMatch = st.match(/== (.*) ==/);
        if (locationMatch) {
            location = locationMatch[1];
        }
    }
}

function runMachine(line: string) {
    const res = vm.run(line);

    if (!res.stop) {
        updateState();
    }

    writer.write(res.output);

    return !res.stop;
}

export async function run(file: string) {
    writer.writeln(`${clearScreen}${goHome}`);
    vm.load(file);
    runMachine('');
    while (true) {

        const prompt = inverse(cyan(` ${location} `)) + cyan(`\u25B6`) + " ";
        const line = (await reader.question(prompt)) + "\n";

        const env = {writer, things, vm, location};

        let foundCommand = false;

        for (let command of commands) {
            if (await command.do(env, line)) {
                foundCommand = true;
                break;
            }
        }

        if (foundCommand) {
            if (line !== "help\n") {
                writer.writeln("\nWhat do you do?");
            }
            updateState();
        } else if (runMachine(line)) {
            // noop
        } else {
            break;
        }
    }
}
