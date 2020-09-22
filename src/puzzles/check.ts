import {Writer} from "../io/writer";

export function checkPrecondition(
    location: string, expectedLocations: string[],
    things: string[], expectedThings: string[],
    writer: Writer
) {
    if (expectedLocations.indexOf(location) >= 0 && expectedThings.every(expectedThing => things.indexOf(expectedThing) >= 0)) {
        return true;
    } else {
        writer.writeln("\n\nYou don't have an idea at this point.");
        return false;
    }
}