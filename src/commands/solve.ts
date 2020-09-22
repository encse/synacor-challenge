import {solveCoins} from "../puzzles/coins";
import {solveTeleporter} from "../puzzles/teleporter";
import {solveVault} from "../puzzles/vault";
import {command} from "./command";

export const solve = command(
    ["solve", "<string>"],
    "Use 'solve <puzzle>' to progress further. Parameter can be 'coins' ('solve coins'), 'teleporter' or 'vault'.",
    (env, param) => {
        switch (param) {
            case "coins":
                solveCoins(env.writer, env.location, env.things);
                break;
            case "teleporter":
                solveTeleporter(env.writer, env.location, env.things, env.vm);
                break;
            case "vault":
                solveVault(env.writer, env.location);
                break;
            default:
                env.writer.writeln("");
                env.writer.writeln("");
                env.writer.writeln("I don't understand; try 'help' for instructions.");
                break;
        }
    }
);