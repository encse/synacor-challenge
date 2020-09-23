import {bold, green} from "../util/ansi";
import {Writer} from "../io/writer";
import {checkPrecondition} from "./check";
import {stripMargin} from "../util/stripMargin";

function* perm<T>(ts: T[]): Iterable<T[]> {
    if (ts.length == 0) {
        yield [];
    } else {
        for (let i = 0; i < ts.length; i++) {
            for (const p of perm(ts.filter((_, j) => i != j))) {
                yield [ts[i], ...p];
            }
        }
    }
}

export function solveCoins(writer: Writer, location: string, things: string[]) {

    if (!checkPrecondition(
        location, ["Ruins"],
        things, ["red coin", "corroded coin", "shiny coin", "concave coin", "blue coin"],
        writer
    )) {
        return;
    }

    let solution = '';
    for (const p of perm([2, 3, 5, 7, 9])) {
        if (p[0] + p[1] * p[2] * p[2] + p[3] * p[3] * p[3] - p[4] === 399) {
            solution = `${bold(p[0])} + ${bold(p[1])} * ${bold(p[2])} ^ 2 + ${bold(p[3])} ^ 3 - ${bold(p[4])} = ${bold(399)}`;
            break;
        }
    }

    writer.writeln(stripMargin`
		| 
		| 
		| You check the coins one by one. Each has a different symbol on it.
		| 
		|   red coin          ${green("two dots")}   ${bold(2)}
		|   corroded coin   ${green("a triangle")}   ${bold(3)} 
		|   shiny coin      ${green("a pentagon")}   ${bold(5)} 
		|   concave coin    ${green("seven dots")}   ${bold(7)}
		|   blue coin        ${green("nine dots")}   ${bold(9)}
		| 
		| You do some trial and error and figure that the following equality holds:
		| 
		|   ${solution}
		| 
		| You need to insert the coins in the right order.
	`);
}