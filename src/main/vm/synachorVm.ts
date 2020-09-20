import * as fs from "fs";
import {disassemble} from "./disassembler";
import {Opres} from "./opres";
import {opcodes} from "./opcodes";

export class SynachorVm {
	public readonly memory: Uint16Array;
	public tracing = false;
	public output: string = '';
	public input: string = '';

	get ax(): number {
		return this.memory[0x8000];
	}

	set ax(num: number) {
		this.memory[0x8000] = num;
	}

	get bx(): number {
		return this.memory[0x8001];
	}

	set bx(num: number) {
		this.memory[0x8001] = num;
	}

	get cx(): number {
		return this.memory[0x8002];
	}

	set cx(num: number) {
		this.memory[0x8002] = num;
	}

	get dx(): number {
		return this.memory[0x8003];
	}

	set dx(num: number) {
		this.memory[0x8003] = num;
	}

	get ex(): number {
		return this.memory[0x8004];
	}

	set ex(num: number) {
		this.memory[0x8004] = num;
	}

	get fx(): number {
		return this.memory[0x8005];
	}

	set fx(num: number) {
		this.memory[0x8005] = num;
	}

	get gx(): number {
		return this.memory[0x8006];
	}

	set gx(num: number) {
		this.memory[0x8006] = num;
	}

	get hx(): number {
		return this.memory[0x8007];
	}

	set hx(num: number) {
		this.memory[0x8007] = num;
	}

	get ip(): number {
		return this.memory[0x8008];
	}

	set ip(num: number) {
		this.memory[0x8008] = num;
	}

	get sp(): number {
		return this.memory[0x8009];
	}

	set sp(num: number) {
		this.memory[0x8009] = num;
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
		const prog = fs.readFileSync(file);
		const challenge = new Uint16Array(prog.buffer, 0, prog.buffer.byteLength / Uint16Array.BYTES_PER_ELEMENT);
		this.memory.set(challenge, 0);
	}

	pop() {
		return this.memory[++this.sp]
	}

	push(val: number) {
		this.memory[this.sp--] = val;
	}


	public run(input: string): { output: string, stop: boolean } {
		this.input = input;
		this.output = '';
		let opres = Opres.Contine;
		while (opres == Opres.Contine) {
			if (this.tracing) {
				this.output += disassemble(this.memory, this.ip, 1);
			}

			let opcode = this.memory[this.ip];
			const cmd = opcodes[opcode];
			if (cmd == null) {
				this.output += `invalid instruction ${opcode} at ${this.ip.toString(16)}\n`;
				opres = Opres.Stop;
			} else {
				opres = cmd.step(this);
			}
		}

		return {output: this.output, stop: opres === Opres.Stop};
	}

}