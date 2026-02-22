#!/usr/bin/env node
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type CallToolRequest,
} from "@modelcontextprotocol/sdk/types.js";

type PublishArgs = {
  packagePath?: string;
  tag?: string;
  access?: "public" | "restricted";
  otp?: string;
};

type UnpublishArgs = {
  packagePath?: string;
  packageName?: string;
  version?: string;
  otp?: string;
};

type ViewArgs = {
  packagePath?: string;
  packageName?: string;
  version?: string;
  field?: string;
  json?: boolean;
};

const server = new Server(
  {
    name: "lamy-npm-mcp-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

function getNpmTokenFromEnv(): string | undefined {
  const fromAccessToken = process.env.NPM_ACCESS_TOKEN?.trim();
  const fromNpmToken = process.env.NPM_TOKEN?.trim();
  return fromAccessToken || fromNpmToken;
}

function parseObject(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {};
  }
  return input as Record<string, unknown>;
}

function getString(input: Record<string, unknown>, key: string): string | undefined {
  const value = input[key];
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function getBoolean(input: Record<string, unknown>, key: string): boolean | undefined {
  const value = input[key];
  return typeof value === "boolean" ? value : undefined;
}

async function resolvePackageName(packagePath: string, providedName?: string): Promise<string> {
  if (providedName) {
    return providedName;
  }

  const packageJsonPath = join(packagePath, "package.json");
  const raw = await readFile(packageJsonPath, "utf8");
  const parsed = JSON.parse(raw) as Record<string, unknown>;
  const name = typeof parsed.name === "string" ? parsed.name.trim() : "";

  if (!name) {
    throw new Error("package name is required. Provide packageName or ensure package.json has a valid name field.");
  }

  return name;
}

async function runNpmPublish(args: PublishArgs): Promise<string> {
  const npmToken = getNpmTokenFromEnv();
  if (!npmToken) {
    throw new Error("npm token is not set. Provide NPM_ACCESS_TOKEN or NPM_TOKEN in server env.");
  }

  const packagePath = resolve(args.packagePath ?? process.cwd());
  const tag = args.tag ?? "latest";
  const access = args.access ?? "public";

  const tmpBase = await mkdtemp(join(tmpdir(), "npm-mcp-"));
  const userConfigPath = join(tmpBase, ".npmrc");

  try {
    await writeFile(
      userConfigPath,
      `//registry.npmjs.org/:_authToken=${npmToken}\n`,
      { encoding: "utf8", mode: 0o600 }
    );

    const publishArgs = ["publish", "--tag", tag, "--access", access, "--userconfig", userConfigPath];
    if (args.otp) {
      publishArgs.push("--otp", args.otp);
    }

    const output = await runCommand("npm", publishArgs, packagePath);
    return output;
  } finally {
    await rm(tmpBase, { recursive: true, force: true });
  }
}

async function runNpmUnpublish(args: UnpublishArgs): Promise<string> {
  const npmToken = getNpmTokenFromEnv();
  if (!npmToken) {
    throw new Error("npm token is not set. Provide NPM_ACCESS_TOKEN or NPM_TOKEN in server env.");
  }

  const packagePath = resolve(args.packagePath ?? process.cwd());
  const packageName = await resolvePackageName(packagePath, args.packageName);
  if (!args.version) {
    throw new Error("version is required for npm_unpublish.");
  }

  const packageSpec = `${packageName}@${args.version}`;
  const tmpBase = await mkdtemp(join(tmpdir(), "npm-mcp-"));
  const userConfigPath = join(tmpBase, ".npmrc");

  try {
    await writeFile(
      userConfigPath,
      `//registry.npmjs.org/:_authToken=${npmToken}\n`,
      { encoding: "utf8", mode: 0o600 }
    );

    const unpublishArgs = ["unpublish", packageSpec, "--userconfig", userConfigPath];
    if (args.otp) {
      unpublishArgs.push("--otp", args.otp);
    }

    return await runCommand("npm", unpublishArgs, packagePath);
  } finally {
    await rm(tmpBase, { recursive: true, force: true });
  }
}

async function runNpmView(args: ViewArgs): Promise<string> {
  const packagePath = resolve(args.packagePath ?? process.cwd());
  const packageName = await resolvePackageName(packagePath, args.packageName);
  const packageSpec = args.version ? `${packageName}@${args.version}` : packageName;

  const viewArgs = ["view", packageSpec];
  if (args.field) {
    viewArgs.push(args.field);
  }
  if (args.json) {
    viewArgs.push("--json");
  }

  return await runCommand("npm", viewArgs, packagePath);
}

function runCommand(command: string, args: string[], cwd: string): Promise<string> {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, {
      cwd,
      shell: process.platform === "win32",
      env: process.env,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      rejectPromise(error);
    });

    child.on("close", (code) => {
      const fullOutput = [stdout.trim(), stderr.trim()].filter(Boolean).join("\n");
      if (code === 0) {
        resolvePromise(fullOutput || "Command finished without output.");
        return;
      }
      rejectPromise(new Error(fullOutput || `Command failed with exit code ${code}.`));
    });
  });
}

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "npm_publish",
      description: "Publish an npm package using NPM_ACCESS_TOKEN or NPM_TOKEN from server env.",
      inputSchema: {
        type: "object",
        properties: {
          packagePath: { type: "string" },
          tag: { type: "string" },
          access: {
            type: "string",
            enum: ["public", "restricted"],
          },
          otp: { type: "string" },
        },
      },
    },
    {
      name: "npm_unpublish",
      description: "Unpublish a specific npm package version.",
      inputSchema: {
        type: "object",
        properties: {
          packagePath: { type: "string" },
          packageName: { type: "string" },
          version: { type: "string" },
          otp: { type: "string" },
        },
      },
    },
    {
      name: "npm_view_package",
      description: "View published package metadata using npm view.",
      inputSchema: {
        type: "object",
        properties: {
          packagePath: { type: "string" },
          packageName: { type: "string" },
          version: { type: "string" },
          field: { type: "string" },
          json: { type: "boolean" },
        },
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
  const toolName = request.params.name;
  const args = parseObject(request.params.arguments);

  try {
    switch (toolName) {
      case "npm_publish": {
        const output = await runNpmPublish({
          packagePath: getString(args, "packagePath"),
          tag: getString(args, "tag"),
          access: (getString(args, "access") as "public" | "restricted" | undefined) ?? "public",
          otp: getString(args, "otp"),
        });

        return {
          content: [
            {
              type: "text",
              text: output,
            },
          ],
        };
      }

      case "npm_unpublish": {
        const output = await runNpmUnpublish({
          packagePath: getString(args, "packagePath"),
          packageName: getString(args, "packageName"),
          version: getString(args, "version"),
          otp: getString(args, "otp"),
        });

        return {
          content: [
            {
              type: "text",
              text: output,
            },
          ],
        };
      }

      case "npm_view_package": {
        const output = await runNpmView({
          packagePath: getString(args, "packagePath"),
          packageName: getString(args, "packageName"),
          version: getString(args, "version"),
          field: getString(args, "field"),
          json: getBoolean(args, "json"),
        });

        return {
          content: [
            {
              type: "text",
              text: output,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: error instanceof Error ? error.message : String(error),
        },
      ],
      isError: true,
    };
  }
});

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  process.stderr.write(`Fatal error: ${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exit(1);
});

