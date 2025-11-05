import { z } from 'zod';

export const votePayloadSchema = z.object({
  roomId: z.string().min(1),
  mode: z.string().min(1),
  type: z.string().min(1),
  // Accept arbitrary vote payload but limit size to avoid abuse
  vote: z.unknown()
});

export type VotePayload = z.infer<typeof votePayloadSchema>;
