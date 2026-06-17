#!/usr/bin/env node
import { spawnSync } from "child_process";

const node = process.execPath;
const CI_PROJECTS = ["build", "extension", "safari"];
const includeIntegration = process.env.INTEGRATION_TESTS === "1";
const projects = includeIntegration ? [...CI_PROJECTS, "integration"] : CI_PROJECTS;

function run(command, args) {
    console.log(`\n$ ${[command, ...args].join(" ")}`);
    const result = spawnSync(command, args, {
        stdio: "inherit",
        shell: false,
    });

    if (result.error) {
        console.error(result.error.message);
        process.exit(1);
    }

    if (result.status !== 0) {
        process.exit(result.status ?? 1);
    }
}

const playwrightInstallArgs = process.env.CI === "true" && process.platform === "linux"
    ? ["node_modules/@playwright/test/cli.js", "install", "--with-deps", "chromium"]
    : ["node_modules/@playwright/test/cli.js", "install", "chromium"];

run(node, ["node_modules/typescript/bin/tsc", "--noEmit"]);
run(node, ["scripts/build.mjs", "--all"]);
run(node, playwrightInstallArgs);
run(node, ["node_modules/@playwright/test/cli.js", "test", ...projects.flatMap((project) => ["--project", project])]);
