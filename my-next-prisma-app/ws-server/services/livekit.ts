import { AccessToken } from 'livekit-server-sdk';

let fallbackForced = false;

export const livekitService = {
  isFallbackActive() {
    return fallbackForced || !process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET || !process.env.NEXT_PUBLIC_LIVEKIT_URL;
  },
  async generateToken(userId: string, roomId: string, opts?: { canPublish?: boolean; canSubscribe?: boolean; canPublishData?: boolean; metadata?: string }) {
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    if (!apiKey || !apiSecret) throw new Error('LIVEKIT credentials missing');
    const at = new AccessToken(apiKey, apiSecret, {
      identity: userId,
      metadata: opts?.metadata,
    });
    at.addGrant({
      roomJoin: true,
      room: roomId,
      canPublish: opts?.canPublish ?? true,
      canSubscribe: opts?.canSubscribe ?? true,
      canPublishData: opts?.canPublishData ?? true,
    });
    return await at.toJwt();
  },
  forceFallback() {
    fallbackForced = true;
  },
  getHealthStatus() {
    return {
      status: this.isFallbackActive() ? 'degraded' : 'ok',
      forced: fallbackForced,
      hasCreds: !!process.env.LIVEKIT_API_KEY && !!process.env.LIVEKIT_API_SECRET,
      urlSet: !!process.env.NEXT_PUBLIC_LIVEKIT_URL,
    };
  },
};
