import {command} from "./command";
import {disassemble} from "../synachor/disassembler";

export const disasm = command(
    ["disasm", "<number>", "<number>"],
    "Disassemble the VM's memory with 'disasm <address> <length>'.",
    async (env, line, length) => {
        env.writer.writeln(disassemble(env.vm.memory, line, length));
    }
);
