import prompts from "prompts";

let exit = false;
while (!exit) {
  const { consoleRunner } = await prompts({
    name: "consoleRunner",
    type: "select",
    message: "Which console-runner do you want to run?",
    choices: [
      "api-arcgis-to-json-file",
      "local-json-file-to-mongo-database",
      "exit",
    ].map((option) => ({
      title: option,
      value: option,
    })),
  });

  if (consoleRunner !== "exit") {
    const { run } = await import(`./${consoleRunner}.runner.js`);
    await run();
  } else {
    exit = true;
  }
}
