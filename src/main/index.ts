import * as fs from "fs";
import readline from "readline";

function fail(): never {
	throw new Error();
}

class Machine {
	private readonly memory: Uint16Array;

	get ip(): number {
		return this.memory[32776];
	}
	set ip(num: number){
		this.memory[32776] = num;
	}

	get sp(): number {
		return this.memory[32777];
	}
	set sp(num: number){
		this.memory[32777] = num;
	}

	push(val: number): void {
		this.memory[this.sp--] = val;
	}

	pop(): number {
		return this.memory[++this.sp];
	}

	constructor() {
		this.memory = new Uint16Array(65536);
		this.ip = 0;
		this.sp = 65535;
	}

	public save(file: string) {
		fs.writeFileSync(file, this.memory);
	}

	public load(file: string) {
		const prog = fs.readFileSync(file)
		const challenge = new Uint16Array(prog.buffer, 0, prog.buffer.byteLength / Uint16Array.BYTES_PER_ELEMENT);
		this.memory.set(challenge, 0);
	}

	private read(num: number): number {
		const val = this.memory[num];
		return val < 32768 ? val : this.memory[val];
	}

	public run(input: string): boolean {

		while(true) {
			let cmd = (this.memory)[this.ip];
			let arg1 = (this.memory)[this.ip + 1];
			switch (cmd) {
				case 0:
					return false;
				case 1:
					(this.memory)[arg1] = this.read(this.ip + 2);
					this.ip += 3;
					break;
				case 2:
					this.push(this.read(this.ip + 1));
					this.ip += 2;
					break;
				case 3:
					(this.memory)[arg1] = this.pop();
					this.ip += 2;
					break;
				case 4:
					(this.memory)[arg1] = this.read(this.ip + 2) == this.read(this.ip + 3) ? 1 : 0;
					this.ip += 4;
					break;
				case 5:
					(this.memory)[arg1] = this.read(this.ip + 2) > this.read(this.ip + 3) ? 1 : 0;
					this.ip += 4;
					break;
				case 6:
					this.ip = this.read(this.ip + 1);
					break;
				case 7:
					this.ip = this.read(this.ip + 1) != 0 ? this.read(this.ip + 2) : this.ip + 3;
					break;
				case 8:
					this.ip = this.read(this.ip + 1) == 0 ? this.read(this.ip + 2) : this.ip + 3;
					break;
				case 9:
					(this.memory)[arg1] = (this.read(this.ip + 2) + this.read(this.ip + 3)) & 32767;
					this.ip += 4;
					break;
				case 10:
					(this.memory)[arg1] = (this.read(this.ip + 2) * this.read(this.ip + 3)) & 32767;
					this.ip += 4;
					break;
				case 11:
					(this.memory)[arg1] = (this.read(this.ip + 2) % this.read(this.ip + 3)) & 32767;
					this.ip += 4;
					break;
				case 12:
					(this.memory)[arg1] = (this.read(this.ip + 2) & this.read(this.ip + 3)) & 32767;
					this.ip += 4;
					break;
				case 13:
					(this.memory)[arg1] = (this.read(this.ip + 2) | this.read(this.ip + 3)) & 32767;
					this.ip += 4;
					break;
				case 14:
					(this.memory)[arg1] = ~this.read(this.ip + 2) & 32767;
					this.ip += 3;
					break;
				case 15:
					(this.memory)[arg1] = (this.memory)[(this.read(this.ip + 2))];
					this.ip += 3;
					break;
				case 16:
					(this.memory)[(this.read(this.ip + 1))] = this.read(this.ip + 2);
					this.ip += 3;
					break;
				case 17:
					this.push(this.ip + 2);
					this.ip = this.read(this.ip + 1);
					break;
				case 18:
					this.ip = this.pop();
					break;
				case 19:
					process.stdout.write(String.fromCharCode(this.read(this.ip + 1)));
					this.ip += 2;
					break;
				case 20:
					if (input.length > 0) {
						(this.memory)[arg1] = input.charCodeAt(0);
						input = input.substring(1);
						this.ip += 2;
					} else {
						return true;
					}
					break;
				case 21:
					this.ip++;
					break;
				default:
					console.log("invalid instruction", cmd);
					return false;
			}
		}
	}
}

async function main() {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
		terminal: true
	});

	const machine = new Machine();
	machine.load("challenge.bin");
	let line = "";
	while (true) {
		if (line == "save\n") {
			machine.save("save.bin");
			console.log("saved");
		} else if (line == "load\n") {
			machine.load("save.bin");
			console.log("loaded");
		} else {
			if (!machine.run(line)) {
				break;
			}
		}
		line = await new Promise(resolve => rl.question("> ", resolve)) + "\n";
	}
}

main();