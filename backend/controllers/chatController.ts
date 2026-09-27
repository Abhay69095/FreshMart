import { Request, Response } from 'express';
import { generateChatResponse, ChatMessage, ChatMode } from '../services/geminiService.js';

export const handleChatMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, history = [], mode = 'general' } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      res.status(400).json({
        success: false,
        message: 'Message is required and must be non-empty.',
      });
      return;
    }

    // Validate and sanitize history
    const sanitizedHistory: ChatMessage[] = Array.isArray(history)
      ? history
          .filter((item) => item && (item.role === 'user' || item.role === 'model') && typeof item.text === 'string')
          .slice(-15) // Keep last 15 messages to preserve relevant context without exceeding token window
      : [];

    const validMode: ChatMode = ['general', 'fast', 'complex'].includes(mode) ? mode : 'general';

    const result = await generateChatResponse(message, sanitizedHistory, validMode);

    res.status(200).json({
      success: true,
      data: {
        role: 'model',
        reply: result.reply,
        modelUsed: result.modelUsed,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[Chat Controller] Unhandled error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process chat message.',
      error: error.message || 'Internal server error',
    });
  }
};
