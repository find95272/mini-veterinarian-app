import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return jsonError('请求格式不正确。', 400);
  }

  const petType: string = body?.petType ?? '';
  const symptoms: string[] = Array.isArray(body?.symptoms) ? body.symptoms : [];
  const extra: string = body?.extra ?? '';

  if (!petType || symptoms.length === 0) {
    return jsonError('请选择宠物类型和至少一项症状。', 400);
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    try {
      const fs = await import('fs');
      const path = await import('path');
      const envPath = path.join(process.cwd(), '.env');
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/^OPENROUTER_API_KEY=(.+)$/m);
      if (match) {
        return forwardToEdge(match[1].trim(), petType, symptoms, extra);
      }
    } catch (e) {
      return jsonError(
        `服务未配置 AI 密钥，且读取 .env 失败：${e instanceof Error ? e.message : String(e)}`,
        500
      );
    }
    return jsonError('服务未配置 AI 密钥，请联系管理员。', 500);
  }

  return forwardToEdge(apiKey, petType, symptoms, extra);
}

async function forwardToEdge(
  apiKey: string,
  petType: string,
  symptoms: string[],
  extra: string
) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return jsonError('Supabase 配置缺失。', 500);
  }

  const edgeUrl = `${SUPABASE_URL}/functions/v1/ai-plan`;

  let upstream: Response;
  try {
    upstream = await fetch(edgeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ petType, symptoms, extra, apiKey }),
    });
  } catch (err) {
    const e = err as Error & { cause?: unknown };
    const cause = e.cause;
    let causeStr: string;
    if (cause instanceof Error) {
      causeStr = `${cause.name}: ${cause.message}\n${cause.stack ?? ''}`;
    } else {
      causeStr = String(cause);
    }
    return jsonError(
      `无法连接 AI 服务（edge function）：\n\n${e.stack ?? e.message}\n\ncause:\n${causeStr}`,
      502
    );
  }

  if (!upstream.ok) {
    const text = await upstream.text().catch(() => '');
    let errMsg = text;
    try {
      const j = JSON.parse(text);
      if (j?.error) errMsg = j.error;
    } catch {}
    return jsonError(`AI 服务返回错误（${upstream.status}）：${errMsg.slice(0, 500)}`, 502);
  }

  return new Response(upstream.body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  });
}

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
