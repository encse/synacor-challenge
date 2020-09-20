import {cyan, inverse, Writer} from "./io/writer";
import {Reader} from "./io/reader";
import {Cmd, command} from "./commands/command";
import {SynachorVm} from "./vm/synachorVm";
import {save} from "./commands/save";
import {load} from "./commands/load";
import {solve} from "./commands/solve";
import {disasm} from "./commands/disasm";

const verbs = "use take drop help inv look go".split(" ");

export class Adventure {
	private things: string[] = [];
	private location: string = "";
	private readonly writer: Writer;
	private readonly reader: Reader;
	private readonly synachorVm: SynachorVm;

	private readonly commands: Cmd[];

	constructor(private challenge: string) {

		this.synachorVm = new SynachorVm();
		this.synachorVm.load(challenge);

		this.writer = new Writer(
			() => [...this.things, ...verbs, ...this.commands.map(command => command.name), "Grue", "grue"]
		);

		this.reader = new Reader(() => [
			...verbs,
			...this.things,
			...this.commands.map(command => command.name),
		]);

		this.commands = [
			save,
			load,
			solve,
			disasm,
			command(["help"], "This message.", () => {
				this.writer.write(this.commands.map(command => `${command.name}\n\n${command.help}\n`).join(""));
				this.runMachine("help\n");
			})
		];
	}

	async run() {
		this.runMachine('');
		while (true) {

			const line = (await this.reader.question(`${inverse`${cyan` ${this.location} `}`}${cyan`\u25B6`} `)) + "\n";

			const env = {writer: this.writer, things: this.things, synachorVm: this.synachorVm, location: this.location};
			let found = this.commands.some(command => command.do(env, line));
			if (found) {
				if (line !== "help\n") {
					this.writer.writeln("\nWhat do you do?");
				}
				this.updateState();
			} else if (this.runMachine(line)) {
				//
			} else {
				break;
			}
		}
	}

	private updateState() {
		this.things = [];
		for (const st of this.synachorVm.run("look\ninv\n").output.split("\n")) {
			let rxThing = st.match(/- (.*)/);
			if (rxThing) {
				this.things.push(rxThing[1]);
			}
			let rxLocation = st.match(/== (.*) ==/);
			if (rxLocation) {
				this.location = rxLocation[1];
			}
		}
	}

	private runMachine(line: string) {
		const res = this.synachorVm.run(line);
		if (!res.stop) {
			this.updateState();
		}

		this.writer.write(res.output);

		return !res.stop;
	}
}