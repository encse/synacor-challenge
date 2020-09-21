# Synacor Challenge
The [Synacor Challenge](https://challenge.synacor.com/) is about implementing a virtual machine and 
completing a text adventure with a few algorithmic puzzles.

My implementation is written in TypeScript, because that's what I usually use these days. It's a 
console application with some standard tricks one would expect, like ANSI colors, text layout 
(line breaks) and tab completion.

## To run the program

The repo doesn't have many external dependecies, but you need to have `node` and `npm` installed.

1. Clone the repo.
2. Run `npm install`.
3. Start with `npm start`.

Although the challenge is completed now, the game is still playable. It's more like an interactive 
walkthrough. I've added a special `solve` command so that when you encounter a puzzle, you just need 
to collect the necessary items and ask for a hint to continue.

![Demo](resources/demo.gif)