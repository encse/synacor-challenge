import {blue, cyan, inverse, stripMargin, white, Writer} from "./writer";
import {Reader} from "./reader";
import {Cmd, command} from "./command";
import {Machine} from "./machine";
import {solveVault} from "./maze";
import {hackTeleporter} from "./teleporter";
import {solveCoins} from "./coins";

const verbs = "use take drop help inv look go save load disasm teleporter vault coins".split(" ");

export class Adventure {
	public things: string[] = [];
	public location: string = "";
	private readonly writer: Writer;
	private readonly reader: Reader;
	private readonly machine: Machine;

	private readonly commands: Cmd[];

	constructor(private challenge: string) {

		this.machine = new Machine();
		this.machine.load(challenge);

		this.writer = new Writer(() =>
			[...this.things, ...verbs, "Grue", "grue"]
		);

		this.reader = new Reader(() => [
			...verbs,
			...this.things,
			...this.commands.map(command => command.name),
		]);

		this.commands = [
			command(["!save", "<string>"], (file) => {
				this.machine.save(file);
				this.writer.writeln("\n\nSaved.\n\nWhat do you do?");
				this.updateState();
			}),
			command(["!load", "<string>"], (file) => {
				this.machine.load(file);
				this.writer.writeln("\n\nLoaded.\n\nWhat do you do?");
				this.updateState();
			}),

			command(["!disasm", "<number>", "<number>"], (line, length) => {
				this.writer.writeln(this.machine.disasm(line, length));
				this.updateState();
			}),

			command(["!vault"], () => {
				solveVault(this.writer, this.location);
				this.updateState();
			}),

			command(["!teleporter"], () => {
				hackTeleporter(this.writer, this.location, this.things, this.machine);
				this.updateState();
			}),

			command(["!coins"], () => {
				solveCoins(this.writer, this.location, this.things);
				this.updateState();
			}),

			command(["help"], () => {
				this.writer.writeln(stripMargin`
				| 
				| 
				| !load <file.bin>
				| 
				| Load your progress from a .bin file.
				| !save <file.bin>
				| 
				| Save your progress.
				| !disasm <address> <length>
				| 
				| Disassemble the VM's memory.
				| !vault
				| 
				| Solve the vault challenge.
				| !teleporter
				| 
				| Solve the teleporter challenge.
				| !coins
				| 
				| Solve the coins challenge.
				`);
				this.runMachine("help\n");
			})
		];
	}

	async run() {
		this.runMachine('');
		while (true) {

			const line = (await this.reader.question(`${inverse`${cyan` ${this.location} `}`}${cyan`\u25B6`} `)) + "\n";

			if (!this.commands.some(command => command.do(line)) && !this.runMachine(line)) {
				break;

			}
		}
	}

	private updateState() {
		this.things = [];
		for (const st of this.machine.run("look\ninv\n").output.split("\n")) {
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
		const res = this.machine.run(line);
		if (!res.stop) {
			this.updateState();
		}

		this.writer.write(res.output.replace(/  /g, "\n"));

		return !res.stop;
	}
}