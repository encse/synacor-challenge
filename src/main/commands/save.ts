import {command} from "./command";

export const save = command(
	["save", "<string>"],
	"Use the 'save <file.bin>' command to save your progress.",
	(env, file) => {
		env.synachorVm.save(file);
		env.writer.writeln("\n\nSaved.");
	}
);