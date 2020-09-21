# Synacor Challenge
The [Synacor Challenge](https://challenge.synacor.com/) is about implementing a virtual machine and completing a text adventure with a few algorithmic puzzles.

My implementation is written in TypeScript, because that's what I usually use these days. It's a console application with some standard tricks one would expect, like ANSI colors, text layout (line breaks) and tab completion.

## To run the program

The repo doesn't have many external dependecies, but you need to have `node` and `npm` installed.

1. Clone the repo.
2. Run `npm install`.
3. Start with `npm run start`.

Although the challenge is completed now, the game is still playable. It's more like an interactive walkthrough now. I've added a special `solve` command so that when you encounter a puzzle, you just need to collect the necessary items and ask for a hint to continue.

![Demo](demo.gif)

## The virtual machine

The machine has three storage regions:
  - memory with 15-bit address space storing 16-bit values
  - eight registers
  - an unbounded stack which holds individual 16-bit values
All numbers are unsigned integers `0..32767` (15-bit) and all math is modulo `32768` so `32758 + 15 == 5`

The binary format:
- each number is stored as a 16-bit little-endian pair (low byte, high byte)
- numbers `0..32767` mean a literal value
- numbers `32768..32775` instead mean registers `0..7`
- numbers `32776..65535` are invalid
- programs are loaded into memory starting at address `0`
- address `0` is the first 16-bit value, address `1` is the second 16-bit value, etc.


After an operation is executed, the next instruction to read is immediately after the last 
argument of the current operation.  If a jump was performed, the next operation is instead 
the exact destination of the jump.

Encountering a register as an operation argument should be taken as reading from the register or setting into the register as appropriate.

### Opcodes
**halt**: `0`

  Stop execution and terminate the program.
  
**set**: `1 a b`

  Set register `a` to the value of `b`.
  
**push**  `2 a`

  Push `a` onto the stack.
  
**pop**: `3 a`

  Remove the top element from the stack and write it into `a`
  Empty stack results in an error.
  
**eq**: `4 a b c`

  Set `a` to `1` if `b` is equal to `c`; set it to `0` otherwise.
  
**gt**: `5 a b c`

  Set `a` to `1` if `b` is greater than `c`; set it to `0` otherwise.
  
**jmp**: `6 a`

  Jump to `a`.
  
**jt**: `7 a b`

  If `a` is nonzero, jump to `b`.
  
**jf**: `8 a b`

  If `a` is zero, jump to `b`.
  
**add**: `9 a b c`

  Assign into `a` the sum of `b` and `c` (modulo `32768`).
  
**mult**: `10 a b c`

  Store into `a` the product of `b` and `c` (modulo `32768`).
  
**mod**: `11 a b c`

  Store into `a` the remainder of `b` divided by `c`.
  
**and**: `12 a b c`

  Stores into `a` the bitwise and of `b` and `c`.
  
**or**: `13 a b c`

  Stores into `a` the bitwise or of `b` and `c`.
  
**not**: `14 a b`

  Stores 15-bit bitwise inverse of `b` in `a`.
  
**rmem**: `15 a b`

  Read memory at address `b` and write it to `a`.
  
**wmem**: `16 a b`

  Write the value from `b` into memory at address `a`.
  
**call**: `17 a`

  Write the address of the next instruction to the stack and jump to `a`.
  
**ret**: `18`

  Remove the top element from the stack and jump to it; empty stack = halt.
  
**out**: `19 a`

  Write the character represented by ascii code `a` to the terminal.
  
**in**: `20 a`

  Read a character from the terminal and write its ascii code to `a`. It can be assumed that once input starts, it will continue until a newline is encountered; this means that you can safely read whole lines from the keyboard and trust that they will be fully read.

**noop**: `21`

  No operation.
