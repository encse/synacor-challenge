import {command} from "./command";
import {hexdump} from "../synachor/hexdump";

export const dump = command(
    ["dump", "<number>", "<number>"],
    "Dump the VM's memory with 'dump <address> <length>'.",
    async (env, line, length) => {
        env.writer.writeln(hexdump(env.vm.memory, line, length));
    }
);
