import { test, expect } from "@playwright/test";
import { execFileSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import path from "path";

const distDir = path.resolve("dist", "safari");
const manifestPath = path.join(distDir, "manifest.json");

function readManifest(): Record<string, unknown> {
    return JSON.parse(readFileSync(manifestPath, "utf8"));
}

function contentScripts(manifest: Record<string, unknown>): Array<Record<string, unknown>> {
    const scripts = manifest.content_scripts;
    expect(Array.isArray(scripts)).toBe(true);
    return scripts as Array<Record<string, unknown>>;
}

test.describe("Safari compatibility track", () => {
    test("Safari build output exists", () => {
        expect(existsSync(distDir)).toBe(true);
        expect(existsSync(manifestPath)).toBe(true);
    });

    test("Safari manifest keeps Safari-compatible browser fields", () => {
        const manifest = readManifest();
        const background = manifest.background as Record<string, unknown> | undefined;

        expect(manifest.manifest_version).toBe(3);
        expect(background?.service_worker).toBe("background.js");
        expect(background?.type).toBeUndefined();
        expect(manifest.minimum_chrome_version).toBeUndefined();
        expect(manifest.browser_specific_settings).toBeUndefined();
        expect(manifest.permissions).toEqual(expect.arrayContaining(["storage"]));
    });

    test("Safari content scripts keep deterministic injection order", () => {
        const scripts = contentScripts(readManifest());
        const names = scripts.map((script) => script.js).flat();

        expect(names).toEqual([
            "settingsBridge.js",
            "fetchInterceptor.js",
            "content.js",
        ]);
        expect(scripts[0].run_at).toBe("document_start");
        expect(scripts[1].run_at).toBe("document_start");
        expect(scripts[2].run_at).toBe("document_idle");
    });

    test("generated Safari app output is not tracked", () => {
        const tracked = execFileSync("git", ["ls-files", "safari-app"], {
            encoding: "utf8",
        }).trim();
        expect(tracked).toBe("");
    });
});
