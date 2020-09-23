import {command} from "./command";

export const save = command(
    ["save", "<string>"],
    "Use the 'save <file.bin>' command to save your progress.",
    async (env, file) => {
        env.vm.save(file);
        env.writer.writeln("\n\nSaved.");
    }
);