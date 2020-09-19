import * as fs from "fs";

type Env = {
	stop: boolean,
	break: boolean,
	memory: Uint16Array,
	ip: number,
	addr1: number,
	val1: number,
	val2: number,
	val3: number,
	push: (v: number) => void,
	pop: () => number,
	input: string,
	output: string,
};

const cmd = (asm: string, step: (env: Env) => void) => {
	return { asm, step };
};

const cmds = [
	cmd("break", (env) => {
		env.stop = true;
	}),
	cmd("set <arg1> <arg2>", (env) => {
		env.memory[env.addr1] = env.val2;
		env.ip += 3;
	}),

	cmd("push <arg1>", (env) => {
		env.push(env.val1);
		env.ip += 2;
	}),

	cmd("pop <arg1>", (env) => {
		env.memory[env.addr1] = env.pop();
		env.ip += 2;
	}),

	cmd("eq <arg1> <arg2> <arg3>", (env) => {
		env.memory[env.addr1] = env.val2 === env.val3 ? 1 : 0;
		env.ip += 4;
	}),

	cmd("gt <arg1> <arg2> <arg3>", (env) => {
		env.memory[env.addr1] = env.val2 > env.val3 ? 1 : 0;
		env.ip += 4;
	}),

	cmd("jmp <arg1>", (env) => {
		env.ip = env.val1;
	}),

	cmd("jt <arg1> <arg2>", (env) => {
		env.ip = env.val1 != 0 ? env.val2 : env.ip + 3;
	}),

	cmd("jf <arg1> <arg2>", (env) => {
		env.ip = env.val1 == 0 ? env.val2 : env.ip + 3;
	}),

	cmd("add <arg1> <arg2> <arg3>", (env) => {
		env.memory[env.addr1] = (env.val2 + env.val3)  & 32767;
		env.ip += 4;
	}),

	cmd("mul <arg1> <arg2> <arg3>", (env) => {
		env.memory[env.addr1] = (env.val2 * env.val3)  & 32767;
		env.ip += 4;
	}),

	cmd("mod <arg1> <arg2> <arg3>", (env) => {
		env.memory[env.addr1] = (env.val2 % env.val3)  & 32767;
		env.ip += 4;
	}),

	cmd("and <arg1> <arg2> <arg3>", (env) => {
		env.memory[env.addr1] = (env.val2 & env.val3)  & 32767;
		env.ip += 4;
	}),

	cmd("or <arg1> <arg2> <arg3>", (env) => {
		env.memory[env.addr1] = (env.val2 | env.val3)  & 32767;
		env.ip += 4;
	}),

	cmd("not <arg1> <arg2>", (env) => {
		env.memory[env.addr1] = ~env.val2 & 32767;
		env.ip += 3;
	}),

	cmd("rmem <arg1> <arg2>", (env) => {
		env.memory[env.addr1] = env.memory[env.val2];
		env.ip += 3;
	}),

	cmd("wmem <arg1> <arg2>", (env) => {
		env.memory[env.val1] = env.val2;
		env.ip += 3;
	}),

	cmd("call <arg1>", (env) => {
		env.push(env.ip + 2);
		env.ip = env.val1;
	}),

	cmd("ret", (env) => {
		env.ip = env.pop();
	}),

	cmd("out <arg1>", (env) => {
		env.output += String.fromCharCode(env.val1);
		env.ip += 2;
	}),

	cmd("in <arg1>", (env) => {
		if(env.input.length > 0){
			env.memory[env.addr1] = env.input.charCodeAt(0);
			env.input = env.input.substring(1);
			env.ip += 2;
		} else {
			env.break = true;
		}
	}),

	cmd("nop", (env) => {
		env.ip++;
	}),
];

export class Machine {
	public readonly memory: Uint16Array;
	public tracing = false;

	get ax(): number { return this.memory[0x8000]; }
	set ax(num: number) { this.memory[0x8000] = num; }

	get bx(): number { return this.memory[0x8001]; }
	set bx(num: number) { this.memory[0x8001] = num; }

	get cx(): number { return this.memory[0x8002]; }
	set cx(num: number) { this.memory[0x8002] = num; }

	get dx(): number { return this.memory[0x8003]; }
	set dx(num: number) { this.memory[0x8003] = num; }

	get ex(): number { return this.memory[0x8004]; }
	set ex(num: number) { this.memory[0x8004] = num; }

	get fx(): number { return this.memory[0x8005]; }
	set fx(num: number) { this.memory[0x8005] = num; }

	get gx(): number { return this.memory[0x8006]; }
	set gx(num: number) { this.memory[0x8006] = num; }

	get hx(): number { return this.memory[0x8007]; }
	set hx(num: number) { this.memory[0x8007] = num; }

	get ip(): number { return this.memory[0x8008]; }
	set ip(num: number) { this.memory[0x8008] = num; }

	get sp(): number { return this.memory[0x8009]; }
	set sp(num: number) { this.memory[0x8009] = num; }


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

	public run(input: string): { output: string, stop: boolean } {

		const read = (addr: number) => {
			const val = this.memory[addr];
			return val < 32768 ? val : this.memory[val];
		};


		let output = '';
		while (true) {

			const env: Env = {
				output: output,
				input: input,
				addr1: this.memory[this.ip + 1],
				val1: read(this.ip + 1),
				val2: read(this.ip + 2),
				val3: read(this.ip + 3),
				break: false,
				ip: this.ip,
				memory: this.memory,
				pop: () => this.memory[++this.sp],
				push: val => this.memory[this.sp--] = val,
				stop: false,
			};

			if (this.tracing) {
				env.output += this.disasm(env.ip, 1);
			}

			let op = this.memory[env.ip];
			const cmd = cmds[op];
			if (cmd == null) {
				output += `invalid instruction ${op} at ${env.ip.toString(16)}\n`;
				return {output: output, stop: true};
			} else {
				cmd.step(env);
				this.ip = env.ip;
				output = env.output;
				input = env.input;

				if (env.stop) {
					return {output: env.output, stop: true};
				} else if (env.break) {
					return {output: env.output, stop: false};
				}
			}
		}
	}

	public disasm(ip: number, length: number): string {

		let res = '';
		const stArg = (x: number) => (x < 32768 ? '0x' + x.toString(16) : "abcdefgh"[x-32768]+'x');

		for (let i = 0; i < length; i++) {
			const op = this.memory[ip];
			const cmdTemplate = cmds[op]?.asm ?? op.toString(10);
			const cmd = cmdTemplate
				.replace("<arg3>", stArg(this.memory[ip+3]))
				.replace("<arg2>", stArg(this.memory[ip+2]))
				.replace("<arg1>", stArg(this.memory[ip+1]));

			res += `0x${ip.toString(16).padStart(4, '0')} ${cmd}\n`;
			ip += cmdTemplate.split(' ').length;
		}
		return res;
	}

}