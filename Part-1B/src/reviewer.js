import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { validateReport } from './schema-validator.js';

export async function reviewContent(content, filePath = 'input.js') {
  const timestamp = new Date().toISOString();
  const baseMetadata = { timestamp, filePath };

  let systemInstruction = '';
  try {
    const promptPath = new URL('../prompts/system-prompt.txt', import.meta.url);
    systemInstruction = fs.readFileSync(promptPath, 'utf8');
  } catch (e) {
    try {
      const fallbackPath = path.resolve('prompts/system-prompt.txt');
      systemInstruction = fs.readFileSync(fallbackPath, 'utf8');
    } catch (e2) {
      systemInstruction = 'You are an expert SAP UI5 code reviewer.';
    }
  }

  let ai;
  try {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  } catch (err) {
    return {
      status: 'service_error',
      metadata: baseMetadata,
      findings: []
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-flash-lite-latest',
      contents: [
        {
          role: 'user',
          parts: [{ text: `Analyze the following UI5 file content:\n\n${content}` }]
        }
      ],
      config: {
        systemInstruction,
        responseMimeType: 'application/json'
      }
    });

    let rawText = '';
    if (typeof response.text === 'function') {
      rawText = response.text();
    } else if (typeof response.text === 'string') {
      rawText = response.text;
    } else if (response.response && typeof response.response.text === 'function') {
      rawText = response.response.text();
    } else if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
      rawText = response.candidates[0].content.parts[0].text;
    }

    if (!rawText) {
      return {
        status: 'invalid_model_response',
        metadata: baseMetadata,
        findings: []
      };
    }

    let cleanedText = rawText.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    let parsed;
    try {
      parsed = JSON.parse(cleanedText);
    } catch (jsonErr) {
      return {
        status: 'invalid_model_response',
        metadata: baseMetadata,
        findings: []
      };
    }

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {
        status: 'invalid_model_response',
        metadata: baseMetadata,
        findings: []
      };
    }

    if (!parsed.status) {
      parsed.status = 'success';
    }
    if (!parsed.metadata) {
      parsed.metadata = baseMetadata;
    } else {
      parsed.metadata.timestamp = timestamp;
      parsed.metadata.filePath = filePath;
    }
    if (!Array.isArray(parsed.findings)) {
      parsed.findings = [];
    }

    const validation = validateReport(parsed);
    if (!validation.valid) {
      return {
        status: 'invalid_model_response',
        metadata: baseMetadata,
        findings: []
      };
    }

    return parsed;

    } catch (apiErr) {
    return {
      status: 'service_error',
      metadata: baseMetadata,
      findings: []
    };
  }
}

export async function reviewFile(filePath) {
  const fullPath = path.resolve(filePath);
  const content = fs.readFileSync(fullPath, 'utf8');
  return reviewContent(content, filePath);
}
