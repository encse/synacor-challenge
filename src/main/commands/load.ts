import {command} from "./command";

export const load = command(
	["load", "<string>"],
	"Load back your progress from a .bin file with 'load <file.bin>'.",
	(env, file) => {
		env.synachorVm.load(file);
		env.writer.writeln("\n\nLoaded.");
	}
);
