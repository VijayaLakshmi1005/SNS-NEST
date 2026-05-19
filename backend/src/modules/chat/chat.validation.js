import { z } from 'zod';

export const sendMessageSchema = z.object({
  body: z.object({
    conversationId: z.string({ required_error: 'Conversation ID is required' }),
    text: z.string().optional(),
    attachments: z.array(z.object({
      type: z.enum(['image', 'file', 'audio']),
      url: z.string(),
      name: z.string().optional(),
      size: z.number().optional(),
      duration: z.number().optional()
    })).optional(),
    replyTo: z.string().nullable().optional()
  })
});

export const editMessageSchema = z.object({
  body: z.object({
    text: z.string({ required_error: 'Message text is required' }).min(1, 'Message text cannot be empty')
  })
});

export const reactMessageSchema = z.object({
  body: z.object({
    emoji: z.string({ required_error: 'Emoji is required' }).min(1, 'Emoji is required')
  })
});
