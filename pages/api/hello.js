// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const playwright = require("@recordreplay/playwright");
const cli = require("@recordreplay/recordings-cli");

async function recordTest(test) {
  console.log(`recording started`, test);
  const browser = await playwright.firefox.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(test);
  await page.waitForTimeout(1000);

  await page.close();
  await context.close();
  await browser.close();
  console.log(`recording finished`, test);
}

async function uploadTest(test) {
  console.log(`uploading test`, test);
  const recordings = cli.listAllRecordings();
  const lastRecording = recordings[recordings.length - 1];
  if (lastRecording.status == "uploaded") {
    return lastRecording.recordingId;
  }

  const id = await cli.uploadRecording(lastRecording.id);

  console.log(
    "finished test",
    { test, id },
    `https://app.replay.io/recording/${id}`
  );
  return id;
}

export default async function handler(req, res) {
  const test = req.query.test || "http://airbnb.com";
  try {
    await recordTest(test);
    const id = await uploadTest(test);
    res.status(200).json({ name: test, id });
  } catch (e) {
    res.status(400).json({ name: test });
    console.log(`failed test`, test, e);
  }
}
