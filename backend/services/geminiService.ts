import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { db } from '../data/dbStore.js';

dotenv.config();

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export type ChatMode = 'general' | 'fast' | 'complex';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

/**
 * Builds live store catalog context to ground Gemini responses in real FreshMart inventory
 */
function getStoreContext(): string {
  try {
    const products = db.getCollection('products');
    const categories = db.getCollection('categories');

    const categoryNames = categories.map((c: any) => c.name).join(', ');
    const sampleProducts = products
      .slice(0, 20)
      .map(
        (p: any) =>
          `• ${p.name} (Category: ${p.category}): ₹${p.price}/${p.unit} ${
            p.discountPercent ? `(${p.discountPercent}% off)` : ''
          } - ${p.inStock ? 'In Stock' : 'Out of Stock'}`
      )
      .join('\n');

    return `
STORE DETAILS:
- Store Name: FreshMart (Palghar Market & Regional Farm Outlet)
- Delivery Promise: 10 to 45-minute doorstep delivery in local zone
- Free Delivery: Orders over ₹499 (Standard delivery ₹30)
- Quality Guarantee: 100% money-back freshness guarantee on all produce
- Accepted Payments: Cash on Delivery (COD), UPI (Google Pay, PhonePe, Paytm), Debit/Credit Cards
- Categories Available: ${categoryNames}

CURRENT LIVE FEATURED PRODUCTS IN STORE:
${sampleProducts}
`;
  } catch {
    return 'FreshMart provides fresh farm vegetables, seasonal fruits, organic greens, dairy, and pantry staples.';
  }
}

/**
 * Generates an AI response for customer multi-turn chat using the official @google/genai SDK
 */
export async function generateChatResponse(
  message: string,
  history: ChatMessage[] = [],
  mode: ChatMode = 'general'
): Promise<{ reply: string; modelUsed: string }> {
  // Select appropriate model based on prompt instruction:
  // - gemini-3.1-pro-preview for complex tasks
  // - gemini-3.5-flash for general tasks
  // - gemini-3.1-flash-lite for tasks that should happen fast
  let model = 'gemini-3.5-flash';
  if (mode === 'fast') {
    model = 'gemini-3.1-flash-lite';
  } else if (mode === 'complex') {
    model = 'gemini-3.1-pro-preview';
  }

  const storeContext = getStoreContext();

  const systemInstruction = `You are "Freshy", the enthusiastic, helpful, and knowledgeable AI Shopping Assistant and Produce Sommelier for FreshMart.

ROLE & PERSONALITY:
- Warm, polite, friendly, and practical.
- Expert in fresh vegetables, seasonal fruits, herbs, nutrition, and Indian home cooking.
- Always guide customers to fresh, healthy choices available at FreshMart.

CORE CAPABILITIES:
1. Recommend fruits and vegetables based on taste, season, diet, health goals (e.g., immunity, weight loss, diabetic-friendly).
2. Suggest quick, tasty recipes using fresh ingredients sold at FreshMart and list the needed ingredients clearly.
3. Provide produce storage tips (e.g., how to keep coriander fresh, ripening bananas or mangoes, storing leafy greens).
4. Answer questions about FreshMart delivery (10-45 mins, free over ₹499), 100% freshness guarantee, and payment options.
5. If the customer asks for a product or price, quote the real items from the live store inventory provided below.

FORMATTING RULES:
- Use clean Markdown formatting: bold titles, bullet points (•), and numbered steps for recipes.
- Include appropriate food and produce emojis (🍎, 🥦, 🍋, 🥗, ⏱️, 🛒) to keep it delightful.
- Keep responses concise, organized, and easy to read on mobile devices.
- Do NOT provide medical diagnoses; offer general dietary knowledge and culinary joy.

${storeContext}
`;

  // Fallback if API key is not configured
  const aiClient = getAiClient();
  if (!aiClient) {
    return {
      reply: `Hello from FreshMart! 🍎 I'm Freshy, your shopping assistant. Our live AI service is standing by. We have fresh seasonal fruits, crisp farm vegetables, and organic herbs in stock ready for 10-minute delivery!`,
      modelUsed: 'local-fallback',
    };
  }

  try {
    // Format conversation history for @google/genai
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    // Add previous turns
    for (const item of history) {
      if (item.text && item.text.trim()) {
        contents.push({
          role: item.role === 'model' ? 'model' : 'user',
          parts: [{ text: item.text.trim() }],
        });
      }
    }

    // Add the current user query
    contents.push({
      role: 'user',
      parts: [{ text: message.trim() }],
    });

    const response = await aiClient.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const text = response.text || "I'm here to help you choose the freshest produce! How can I assist your order today?";
    return {
      reply: text,
      modelUsed: model,
    };
  } catch (error: any) {
    console.error(`[Gemini API] Chat error with model ${model}:`, error.message);

    // If complex/flash-lite fails, try fallback to gemini-3.5-flash
    if (model !== 'gemini-3.5-flash') {
      try {
        const fallbackRes = await aiClient.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: [{ role: 'user', parts: [{ text: message }] }],
          config: { systemInstruction },
        });
        return {
          reply: fallbackRes.text || 'FreshMart has a wide variety of fresh fruits and vegetables in stock today!',
          modelUsed: 'gemini-3.5-flash',
        };
      } catch (fallbackErr: any) {
        console.error('[Gemini API] Fallback error:', fallbackErr.message);
      }
    }

    return {
      reply: `I'm having a brief connection hiccup, but I'm here! 🥦 FreshMart delivers farm-fresh fruits, vegetables, and pantry essentials in 10-45 minutes. Free delivery on orders over ₹499! How can I help you find something today?`,
      modelUsed: 'offline-fallback',
    };
  }
}
