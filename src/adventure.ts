import {cyan, inverse, Writer} from "./io/writer";
import {Reader} from "./io/reader";
import {command} from "./commands/command";
import {Vm} from "./synachor/vm";
import {save} from "./commands/save";
import {load} from "./commands/load";
import {solve} from "./commands/solve";
import {disasm} from "./commands/disasm";

const verbs = "use take drop help inv look go".split(" ");
const vm = new Vm();
const commands = [
    save,
    load,
    solve,
    disasm,
    command(["help"], "This message.", () => {
        writer.write(commands.map(command => `${command.name}\n\n${command.help}\n`).join(""));
        runMachine("help\n");
    })
];

const writer = new Writer(
    () => [...things, ...verbs, ...commands.map(command => command.name), "Grue", "grue"]
);

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
        let rxThing = st.match(/- (.*)/);
        if (rxThing) {
            things.push(rxThing[1]);
        }
        let rxLocation = st.match(/== (.*) ==/);
        if (rxLocation) {
            location = rxLocation[1];
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
    vm.load(file);
    runMachine('');
    while (true) {

        const line = (await reader.question(`${inverse`${cyan` ${location} `}`}${cyan`\u25B6`} `)) + "\n";

        const env = {writer: writer, things: things, vm: vm, location: location};
        let found = commands.some(command => command.do(env, line));
        if (found) {
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
