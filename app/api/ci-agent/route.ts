import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function deepFindFileId(obj: any): any {
  if (!obj || typeof obj !== "object") return null;

  if ("file_id" in obj && obj.file_id) {
    return obj.file_id;
  }

  if (Array.isArray(obj)) {
    for (const item of obj) {
      const found = deepFindFileId(item);
      if (found) return found;
    }
    return null;
  }

  for (const value of Object.values(obj)) {
    const found = deepFindFileId(value);
    if (found) return found;
  }

  return null;
}

function extractFileIdFromResponse(content: any[]): any {
  for (const block of content) {
    if (block?.type === "bash_code_execution_tool_result") {
      const inner = block?.content?.content;
      if (Array.isArray(inner)) {
        for (const item of inner) {
          if (item?.file_id) return item.file_id;
        }
      }
    }

    if (block?.type === "text_editor_code_execution_tool_result") {
      const inner = block?.content?.content;
      if (Array.isArray(inner)) {
        for (const item of inner) {
          if (item?.file_id) return item.file_id;
        }
      }
    }

    const maybe = deepFindFileId(block);
    if (maybe) return maybe;
  }

  return null;
}

export async function POST(req: Request) {
  try {
    console.log("API KEY PRESENT:", !!process.env.ANTHROPIC_API_KEY);
    console.log("CWD:", process.cwd());

    const { competitor, persona, dealContext } = await req.json();

    const prompt = `
Create a simple 1-page PDF battlecard about competing against ${competitor}.

Audience:
- ${persona}

Context:
- The rep is selling Claude Code
- ${dealContext}

Instructions:
- Keep it concise
- Plain text only
- No icons
- No charts
- No custom styling
- Include these sections:
  1. Competitor strengths
  2. Competitor weaknesses
  3. How to position Claude Code
  4. Three sales talk tracks
- Generate the PDF file directly
`.trim();

    console.log("STARTING ANTHROPIC CALL");

    const response = await anthropic.beta.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 6000,
      betas: ["code-execution-2025-08-25", "skills-2025-10-02"],
      container: {
        skills: [
          {
            type: "anthropic",
            skill_id: "pdf",
            version: "latest",
          },
        ],
      },
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      tools: [
        {
          type: "code_execution_20250825",
          name: "code_execution",
        },
      ],
    });

    console.log("ANTHROPIC CALL FINISHED");
    console.log("STOP REASON:", response.stop_reason);
    console.dir(response.content, { depth: null });    const fileId = extractFileIdFromResponse(response.content as any[]);

    const normalizedFileId =
      typeof fileId === "string"
        ? fileId
        : typeof fileId === "object" &&
            fileId !== null &&
            "file_id" in (fileId as any)
          ? String((fileId as any).file_id)
          : `${fileId}`;

    console.log("EXTRACTED FILE ID RAW:", fileId);
    console.log("EXTRACTED FILE ID TYPE:", typeof fileId);
    console.log("NORMALIZED FILE ID:", normalizedFileId);
    console.log("NORMALIZED FILE ID TYPE:", typeof normalizedFileId);

    if (
      !normalizedFileId ||
      normalizedFileId === "undefined" ||
      normalizedFileId === "null"
    ) {
      return NextResponse.json(
        {
          error: "No usable file_id found in Claude response",
          stop_reason: response.stop_reason,
        },
        { status: 500 }
      );
    }
    const fileContent = await anthropic.beta.files.download(
      normalizedFileId,
      { betas: ["files-api-2025-04-14"] }
    );

    const outputDir = path.join(process.cwd(), "public", "generated");
    fs.mkdirSync(outputDir, { recursive: true });

    const filePath = path.join(outputDir, "battlecard.pdf");
    console.log("WRITING TO:", filePath);

    const arrayBuffer = await fileContent.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, buffer);

    console.log("FILE WRITTEN OK");

    return NextResponse.json({
      ok: true,
      downloadUrl: "/generated/battlecard.pdf",
    });
  } catch (e: any) {
    console.error("API ERROR:", e);

    return NextResponse.json(
      {
        error: e?.message || "Unknown error",
        stack: e?.stack || null,
      },
      { status: 500 }
    );
  }
}
