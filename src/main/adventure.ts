import {Writer} from "./writer";
import {Reader} from "./reader";
import {Cmd, command} from "./command";
import {Machine} from "./machine";
import {solveMaze} from "./maze";
import {hackTeleporter} from "./teleporter";

const verbs = "use take drop help inv look go".split(" ");

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
				this.writer.writeLn("saved");
			}),
			command(["!load", "<string>"], (file) => {
				this.machine.load(file);
				this.writer.writeLn("loaded");
			}),
			command(["!trace"], () => {
				this.machine.tracing = !this.machine.tracing;
				this.writer.writeLn(`tracing ${this.machine.tracing ? "enabled" : "disabled"}`);
			}),
			command(["!eval", "<string>"], (arg) => {
				this.writer.writeLn(eval(arg));
			}),
			command(["!disasm", "<number>", "<number>"], (line, length) => {
				this.writer.writeLn(this.machine.disasm(line, length));
			}),

			command(["!maze"], () => {
				solveMaze(this.writer);
			}),

			command(["!ackermann"], () => {
				hackTeleporter(this.writer, this.machine);
			}),
		];
	}

	async run() {
		this.runMachine('');
		while (true) {
			const line = (await this.reader.question("> ")) + "\n";

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