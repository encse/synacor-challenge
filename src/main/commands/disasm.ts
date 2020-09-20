import {command} from "./command";
import {disassemble} from "../vm/disassembler";

export const disasm = command(
	["disasm", "<number>", "<number>"],
	"Disassemble the VM's memory with 'disasm <address> <length>'.",
	(env, line, length) => {
		env.writer.writeln(disassemble(env.synachorVm.memory, line, length));
	}
);
