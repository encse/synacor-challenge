import {Opres} from "./opres";
import {SynachorVm} from "./synachorVm";


function opcode(asm: string, step: (synachorVm: SynachorVm) => Opres) {
	return { asm, step };
}

function readMem(synachorVm: SynachorVm, addr: number) {
	const val = synachorVm.memory[addr];
	return val < 32768 ? val : synachorVm.memory[val];
}

function addr1(synachorVm: SynachorVm) {
	return synachorVm.memory[synachorVm.ip + 1];
}

function val1(synachorVm: SynachorVm) {
	return readMem(synachorVm, synachorVm.ip + 1);
}

function val2(synachorVm: SynachorVm) {
	return readMem(synachorVm, synachorVm.ip + 2);
}

function val3(synachorVm: SynachorVm) {
	return readMem(synachorVm, synachorVm.ip + 3);
}

export const opcodes = [
	opcode("break", () => {
		return Opres.Stop;
	}),
	opcode("set <arg1> <arg2>", (synachorVm: SynachorVm) => {
		synachorVm.memory[addr1(synachorVm)] =val2(synachorVm);
		synachorVm.ip += 3;
		return Opres.Contine;
	}),

	opcode("push <arg1>", (synachorVm: SynachorVm) => {
		synachorVm.push(val1(synachorVm));
		synachorVm.ip += 2;
		return Opres.Contine;
	}),

	opcode("pop <arg1>", (synachorVm: SynachorVm) => {
		synachorVm.memory[addr1(synachorVm)] = synachorVm.pop();
		synachorVm.ip += 2;
		return Opres.Contine;
	}),

	opcode("eq <arg1> <arg2> <arg3>", (synachorVm: SynachorVm) => {
		synachorVm.memory[addr1(synachorVm)] = val2(synachorVm) === val3(synachorVm) ? 1 : 0;
		synachorVm.ip += 4;
		return Opres.Contine;
	}),

	opcode("gt <arg1> <arg2> <arg3>", (synachorVm: SynachorVm) => {
		synachorVm.memory[addr1(synachorVm)] =val2(synachorVm) >val3(synachorVm) ? 1 : 0;
		synachorVm.ip += 4;
		return Opres.Contine;
	}),

	opcode("jmp <arg1>", (synachorVm: SynachorVm) => {
		synachorVm.ip =val1(synachorVm);
		return Opres.Contine;
	}),

	opcode("jt <arg1> <arg2>", (synachorVm: SynachorVm) => {
		synachorVm.ip =val1(synachorVm) != 0 ?val2(synachorVm) : synachorVm.ip + 3;
		return Opres.Contine;
	}),

	opcode("jf <arg1> <arg2>", (synachorVm: SynachorVm) => {
		synachorVm.ip =val1(synachorVm) == 0 ?val2(synachorVm) : synachorVm.ip + 3;
		return Opres.Contine;
	}),

	opcode("add <arg1> <arg2> <arg3>", (synachorVm: SynachorVm) => {
		synachorVm.memory[addr1(synachorVm)] = (val2(synachorVm) +val3(synachorVm)) & 32767;
		synachorVm.ip += 4;
		return Opres.Contine;
	}),

	opcode("mul <arg1> <arg2> <arg3>", (synachorVm: SynachorVm) => {
		synachorVm.memory[addr1(synachorVm)] = (val2(synachorVm) *val3(synachorVm)) & 32767;
		synachorVm.ip += 4;
		return Opres.Contine;
	}),

	opcode("mod <arg1> <arg2> <arg3>", (synachorVm: SynachorVm) => {
		synachorVm.memory[addr1(synachorVm)] = (val2(synachorVm) %val3(synachorVm)) & 32767;
		synachorVm.ip += 4;
		return Opres.Contine;
	}),

	opcode("and <arg1> <arg2> <arg3>", (synachorVm: SynachorVm) => {
		synachorVm.memory[addr1(synachorVm)] = (val2(synachorVm) &val3(synachorVm)) & 32767;
		synachorVm.ip += 4;
		return Opres.Contine;
	}),

	opcode("or <arg1> <arg2> <arg3>", (synachorVm: SynachorVm) => {
		synachorVm.memory[addr1(synachorVm)] = (val2(synachorVm) |val3(synachorVm)) & 32767;
		synachorVm.ip += 4;
		return Opres.Contine;
	}),

	opcode("not <arg1> <arg2>", (synachorVm: SynachorVm) => {
		synachorVm.memory[addr1(synachorVm)] = ~val2(synachorVm) & 32767;
		synachorVm.ip += 3;
		return Opres.Contine;
	}),

	opcode("rmem <arg1> <arg2>", (synachorVm: SynachorVm) => {
		synachorVm.memory[addr1(synachorVm)] = synachorVm.memory[val2(synachorVm)];
		synachorVm.ip += 3;
		return Opres.Contine;
	}),

	opcode("wmem <arg1> <arg2>", (synachorVm: SynachorVm) => {
		synachorVm.memory[val1(synachorVm)] =val2(synachorVm);
		synachorVm.ip += 3;
		return Opres.Contine;
	}),

	opcode("call <arg1>", (synachorVm: SynachorVm) => {
		synachorVm.push(synachorVm.ip + 2);
		synachorVm.ip =val1(synachorVm);
		return Opres.Contine;
	}),

	opcode("ret", (synachorVm: SynachorVm) => {
		synachorVm.ip = synachorVm.pop();
		return Opres.Contine;
	}),

	opcode("out <arg1>", (synachorVm: SynachorVm) => {
		synachorVm.output += String.fromCharCode(val1(synachorVm));
		synachorVm.ip += 2;
		return Opres.Contine;
	}),

	opcode("in <arg1>", (synachorVm: SynachorVm) => {
		if (synachorVm.input.length > 0) {
			synachorVm.memory[addr1(synachorVm)] = synachorVm.input.charCodeAt(0);
			synachorVm.input = synachorVm.input.substring(1);
			synachorVm.ip += 2;
			return Opres.Contine;
		} else {
			return Opres.Break;
		}
	}),

	opcode("nop", (synachorVm: SynachorVm) => {
		synachorVm.ip++;
		return Opres.Contine;
	}),
];