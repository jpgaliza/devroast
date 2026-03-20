// env must load before any module that calls postgres()
import { config } from "dotenv";
config({ path: ".env.local" });

import { faker } from "@faker-js/faker";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import postgres from "postgres";
import { roasts, submissions, type FeedbackItem, type Language, type Verdict } from "./schema";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle({ client, casing: "snake_case" });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function scoreToVerdict(score: number): Verdict {
  if (score <= 2.0) return "garbage_fire";
  if (score <= 4.0) return "needs_serious_help";
  if (score <= 6.0) return "questionable";
  if (score <= 8.0) return "not_terrible";
  return "actually_good";
}

function weightedScore(): number {
  // distribution: ~30% garbage, ~35% bad, ~22% meh, ~10% ok, ~3% good
  const roll = Math.random() * 100;
  let raw: number;
  if (roll < 30) raw = faker.number.float({ min: 0.5, max: 2.0, fractionDigits: 1 });
  else if (roll < 65) raw = faker.number.float({ min: 2.1, max: 4.0, fractionDigits: 1 });
  else if (roll < 87) raw = faker.number.float({ min: 4.1, max: 6.0, fractionDigits: 1 });
  else if (roll < 97) raw = faker.number.float({ min: 6.1, max: 8.0, fractionDigits: 1 });
  else raw = faker.number.float({ min: 8.1, max: 9.5, fractionDigits: 1 });
  return Math.round(raw * 10) / 10;
}

// ---------------------------------------------------------------------------
// Code templates — intentionally terrible code
// ---------------------------------------------------------------------------

const CODE_TEMPLATES: { language: Language; code: string }[] = [
  {
    language: "javascript",
    code: `var a = 1
var b = 2
var c = 3
var result = eval("a + b + c")
document.write(result)`,
  },
  {
    language: "javascript",
    code: `function getUser(id) {
  var query = "SELECT * FROM users WHERE id = " + id
  return db.execute(query)
}
  // input validation intentionally omitted`,
  },
  {
    language: "javascript",
    code: `getData(function(a) {
  getMore(a, function(b) {
    getEvenMore(b, function(c) {
      getTheRest(c, function(d) {
        getLastBit(d, function(e) {
          console.log(e)
                  // errors intentionally ignored
        })
      })
    })
  })
})`,
  },
  {
    language: "javascript",
    code: `// bubble sort, it's fine trust me
function sort(arr) {
  for (var i = 0; i < arr.length; i++) {
    for (var j = 0; j < arr.length; j++) {
      for (var k = 0; k < arr.length; k++) {
        if (arr[j] > arr[k]) {
          var tmp = arr[j]; arr[j] = arr[k]; arr[k] = tmp
        }
      }
    }
  }
  return arr
}`,
  },
  {
    language: "javascript",
    code: `password = "admin123"
apiKey = "sk-prod-thisisrealdonttell"
dbUrl = "postgres://root:root@prod.company.com/db"

module.exports = { password, apiKey, dbUrl }`,
  },
  {
    language: "typescript",
    code: `function processData(data: any): any {
  const result: any = {}
  for (const key in data) {
    result[key] = (data as any)[key] as any
  }
  return result as any
}`,
  },
  {
    language: "typescript",
    code: `// @ts-nocheck
export default function Component({ data }: any) {
  return <div onClick={eval(data.handler)}>{data.content}</div>
}`,
  },
  {
    language: "python",
    code: `import os

password = "hunter2"

def run_command(user_input):
    os.system("ls " + user_input)

run_command(input("Enter path: "))`,
  },
  {
    language: "python",
    code: `# fibonacci, very optimized
def fib(n):
    if n <= 1:
        return n
    return fib(n-1) + fib(n-2)

print(fib(50))  # should be fast`,
  },
  {
    language: "python",
    code: `l = [1,2,3,4,5]
ll = []
lll = []
for i in l:
    for j in l:
        ll.append(i*j)
for i in ll:
    for j in ll:
        lll.append(i+j)
print(lll)`,
  },
  {
    language: "php",
    code: `<?php
$username = $_GET['user'];
$password = $_GET['pass'];
$sql = "SELECT * FROM users WHERE username='$username' AND password='$password'";
$result = mysql_query($sql);
if (mysql_num_rows($result) > 0) {
    echo "Welcome admin!";
}`,
  },
  {
    language: "java",
    code: `public class Main {
    public static void main(String[] args) {
        int[] arr = new int[1000000];
        for (int i = 0; i < arr.length; i++) {
            for (int j = 0; j < arr.length; j++) {
                arr[i] = arr[i] + arr[j]; // totally necessary
            }
        }
    }
}`,
  },
  {
    language: "java",
    code: `public String getUser(String id) {
    try {
        return db.query("SELECT * FROM users WHERE id=" + id);
    } catch (Exception e) {
        // it'll be fine
        return null;
    }
}`,
  },
  {
    language: "sql",
    code: `-- just granting everything, permissions are annoying
GRANT ALL PRIVILEGES ON *.* TO 'app_user'@'%' IDENTIFIED BY '123456' WITH GRANT OPTION;

SELECT * FROM users;
SELECT * FROM credit_cards;
SELECT * FROM sessions; -- debugging`,
  },
  {
    language: "bash",
    code: `#!/bin/bash
# cleanup script
rm -rf /
echo "cleanup done"`,
  },
  {
    language: "bash",
    code: `#!/bin/bash
USER_INPUT=$1
eval "$USER_INPUT"
# works great in production`,
  },
  {
    language: "go",
    code: `func divide(a, b int) int {
	return a / b // no need to check for zero, will figure it out
}

func main() {
	fmt.Println(divide(10, 0))
}`,
  },
  {
    language: "go",
    code: `func readFile(path string) []byte {
	data, _ := os.ReadFile(path)
	return data
}

func writeFile(path string, data []byte) {
	os.WriteFile(path, data, 0777)
}`,
  },
  {
    language: "rust",
    code: `fn get_element(v: &Vec<i32>, index: usize) -> i32 {
    // safe to unwrap, probably
    *v.get(index).unwrap()
}

fn main() {
    let data = vec![1, 2, 3];
    println!("{}", get_element(&data, 99));
}`,
  },
  {
    language: "css",
    code: `* {
  display: flex !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  z-index: 99999 !important;
}`,
  },
  {
    language: "html",
    code: `<div id="main">
  <div id="wrapper">
    <div id="container">
      <div id="box">
        <div id="inner-box">
          <div id="content">
            <p style="color:red;font-size:72px;font-weight:bold">Hello</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`,
  },
  {
    language: "tsx",
    code: `export default function App() {
  const [data, setData] = useState(null)
  useEffect(() => {
    fetch('/api/data').then(r => r.json()).then(d => setData(d))
  }) // missing dependency array, runs on every render
  return <div>{JSON.stringify(data)}</div>
}`,
  },
];

// ---------------------------------------------------------------------------
// Roast headlines
// ---------------------------------------------------------------------------

const ROAST_HEADLINES = [
  "this code looks like it was written during a power outage… in 2005.",
  "i've seen better logic in a horoscope.",
  "somewhere, a computer science professor is crying and doesn't know why.",
  "congratulations, you've invented a new way to crash production.",
  "this is less 'code' and more 'a cry for help'.",
  "the garbage collector called — it's filing a restraining order.",
  "your future self will open this file and immediately close their laptop.",
  "impressive. most people need more than one try to create a security vulnerability.",
  "this passed code review? i weep for your team.",
  "you've achieved something rare: code that is simultaneously too long and does too little.",
  "there are seven distinct ways to get fired packed into these 12 lines.",
  "this is what AI looks like when it gives up.",
  "i had to take a break after line 3. for my own mental health.",
  "whoever wrote this has never heard of edge cases — and it shows.",
  "this is the coding equivalent of solving a crossword with a crayon.",
  "i've reviewed malware that was better structured than this.",
  "the stack trace from running this could fill a novel.",
  "a classic: someone who learned to code from a 2009 tutorial and stopped there.",
  "your variable names tell a story — and it's a tragedy.",
  "this code has achieved sentience and it's immediately ashamed of itself.",
  "O(n³) because O(n²) wasn't pessimistic enough.",
  "if bugs were currency, you'd be retired by now.",
  "this is what happens when you skip the 'how does a computer work' chapter.",
  "i've seen eval() used before but never as a load-bearing wall.",
  "the comments say 'TODO: fix'. the commit history says 'never'.",
  "somewhere in this file is a SQL injection. i found three.",
  "this compiles, which is genuinely the nicest thing i can say about it.",
  "future archaeologists will study this code as a warning.",
  "a masterpiece of accidental complexity.",
  "the tests are missing. the docs are missing. the will to live is missing.",
];

// ---------------------------------------------------------------------------
// Feedback templates
// ---------------------------------------------------------------------------

const POSITIVE_FEEDBACK: string[] = [
  "at least the file name is spelled correctly.",
  "one of the variable names is actually descriptive.",
  "indentation is mostly consistent. a low bar, but you cleared it.",
  "it does technically run. once.",
  "the comment on line 2 shows awareness that something is wrong. growth.",
  "no semicolons missing. unfortunately, that's the highlight.",
  "at least you didn't use spaces for indentation.",
];

const NEGATIVE_FEEDBACK: string[] = [
  "sql injection waiting to happen on line 3.",
  "error handling strategy: hope for the best.",
  "using eval() here is either brave or deeply unaware of what eval() does.",
  "this loop has O(n³) complexity. the universe will end before this finishes on a real dataset.",
  "hardcoded credentials in source code — hope this never reaches a public repo.",
  "callback hell is a design choice. a wrong one.",
  "the `any` type is used so liberally it might as well be dynamically typed.",
  "rm -rf / is not a 'cleanup script'. it's a war crime.",
  "concatenating user input directly into a shell command. textbook.",
  "this crashes on the happy path. the sad path is left as an exercise.",
  "global mutable state everywhere. nothing can go wrong.",
  "ignoring the second return value of os.ReadFile is commitment to ignorance.",
  "!important on every rule. the CSS equivalent of screaming into a pillow.",
  "seven nested divs for the word 'Hello'. classic over-engineering.",
  "at least four different ways to introduce a race condition here.",
  "the try-catch catches everything and does nothing. bold.",
  "not a single type assertion that isn't `any`. type safety is a myth here.",
  "useEffect without a dependency array runs on every render. enjoy the infinite loop.",
  "dividing by zero is fine, said no one who's shipped production code.",
  "this is technically valid syntax. that's where the praise ends.",
  "fibonacci with no memoization, called with n=50. see you next year.",
  "granting ALL PRIVILEGES to a wildcard host. this is how breaches happen.",
  "the variables are named l, ll, and lll. whoever reads this next will quit.",
  "no return type annotations anywhere. the function is a surprise box.",
];

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------

async function seed() {
  console.log("🌱 Seeding devroast database...\n");

  // clear existing data
  await db.execute(sql`TRUNCATE submissions CASCADE`);
  console.log("  ✓ Truncated existing data");

  // ---- SUBMISSIONS --------------------------------------------------------
  const submissionsData = Array.from({ length: 100 }, () => {
    const template = faker.helpers.arrayElement(CODE_TEMPLATES);
    const code = template.code;
    const linesCount = code.split("\n").length;
    return {
      code,
      language: template.language,
      linesCount,
      charCount: code.length,
      mode: faker.helpers.arrayElement(["roast", "honest"] as const),
      createdAt: faker.date.recent({ days: 90 }),
    };
  });

  const inserted = await db
    .insert(submissions)
    .values(submissionsData)
    .returning({ id: submissions.id });

  console.log(`  ✓ Inserted ${inserted.length} submissions`);

  // ---- ROASTS -------------------------------------------------------------
  const roastsData = inserted.map(({ id }) => {
    const score = weightedScore();

    const negCount = faker.number.int({ min: 2, max: 4 });
    const posCount = faker.number.int({ min: 0, max: 1 });
    const feedback: FeedbackItem[] = [
      ...faker.helpers
        .arrayElements(NEGATIVE_FEEDBACK, negCount)
        .map((content) => ({ content, isPositive: false })),
      ...faker.helpers
        .arrayElements(POSITIVE_FEEDBACK, posCount)
        .map((content) => ({ content, isPositive: true })),
    ];

    return {
      submissionId: id,
      score: score.toFixed(1),
      verdict: scoreToVerdict(score),
      headline: faker.helpers.arrayElement(ROAST_HEADLINES),
      feedback,
      aiModel: "claude-sonnet-4-6",
      createdAt: faker.date.recent({ days: 90 }),
    };
  });

  await db.insert(roasts).values(roastsData);
  console.log(`  ✓ Inserted ${roastsData.length} roasts`);

  // ---- STATS --------------------------------------------------------------
  const scoreValues = roastsData.map((r) => parseFloat(r.score));
  const avg = scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length;
  const min = Math.min(...scoreValues);
  const max = Math.max(...scoreValues);

  const distribution = roastsData.reduce<Record<string, number>>((acc, r) => {
    acc[r.verdict] = (acc[r.verdict] ?? 0) + 1;
    return acc;
  }, {});

  console.log("\n📊 Score distribution:");
  console.log(`   avg: ${avg.toFixed(2)}  min: ${min}  max: ${max}`);
  Object.entries(distribution)
    .sort(([, a], [, b]) => b - a)
    .forEach(([verdict, count]) => {
      console.log(`   ${verdict.padEnd(20)} ${count} entries`);
    });

  console.log("\n✅ Done!\n");
  await client.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
