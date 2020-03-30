import test from "ava";
import { parseTokens, Scanner, stringifyTokens, Token } from "./tokens";

test("parse", (t) => {
  t.deepEqual(parseTokens(""), []);
  t.deepEqual(parseTokens(" "), []);
  t.deepEqual(parseTokens(" A  "), [{ name: "A", value: null }]);
  t.deepEqual(parseTokens(' A ; b = ; c = ""; '), [
    { name: "A", value: null },
    { name: "b", value: null },
    { name: "c", value: '""' },
  ]);
  t.deepEqual(parseTokens(" A = 1 ;b=2; c  = 3 ; "), [
    { name: "A", value: "1" },
    { name: "b", value: "2" },
    { name: "c", value: "3" },
  ]);
});

test("stringify", (t) => {
  t.is(stringifyTokens([]), "");
  t.is(stringifyTokens([{ name: "a", value: null }]), "a");
  t.is(stringifyTokens([{ name: "a", value: "1" }]), "a=1");
  t.is(
    stringifyTokens([
      { name: "a", value: "1" },
      { name: "b", value: "2" },
    ]),
    "a=1; b=2",
  );
});

test("escape special characters", (t) => {
  const tokens: Token[] = [
    { name: "a", value: "1" },
    { name: "b", value: "2" },
    { name: "c", value: "3" },
  ];
  t.deepEqual(parseTokens(stringifyTokens(tokens)), tokens);
});

test("read quoted string", (t) => {
  // Not a quoted string.
  t.is(new Scanner(``).readQuotedString(), null);
  t.is(new Scanner(`abc`).readQuotedString(), null);

  // A quoted string.
  t.is(new Scanner(`""`).readQuotedString(), ``);
  t.is(new Scanner(`",;="`).readQuotedString(), `,;=`);
  t.is(new Scanner(`" abc "`).readQuotedString(), ` abc `);
  t.is(new Scanner(`"\\"abc\\""`).readQuotedString(), `"abc"`);

  // Not properly terminated.
  t.is(new Scanner(`"`).readQuotedString(), ``);
  t.is(new Scanner(`"\\`).readQuotedString(), `\\`);
  t.is(new Scanner(`"\\"`).readQuotedString(), `"`);
});
