import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

function buildSystemPrompt(langName: string, withVision: boolean, detailed: boolean): string {
  if (withVision) {
    return `你是宠物兽医助手"Mini Vet"。用户会上传一张宠物的照片，请你仔细观察照片中宠物的外观、皮肤、毛发、眼睛、耳朵、体态等可见状况，结合用户选择的宠物类型和症状，生成简洁实用的护理建议。

要求：
1. 使用${langName}，语气专业亲切。使用 Markdown 标题和列表。
2. 先简要描述你在照片中观察到的可见异常（如有），再给出建议。
3. 只包含四个部分，每部分尽量精简，用要点而非段落：
   - 照片观察：照片中可见的异常或值得关注的部位，1-2 句话。
   - 初步判断：结合照片与症状的可能原因，一句话概括，不危言耸听。
   - 护理建议：3-5 条要点，含居家护理和常规处理；涉及用药注明"需遵兽医医嘱"。
   - 警示信号：2-3 条需立即就医的情况。
4. 严禁确切诊断或绝对化结论。用量用"参考剂量"措辞。
5. 全文控制在 350 字以内，重点突出，不写免责声明（页面已展示）。
6. 若照片不清晰或与宠物无关，说明无法从照片判断，仅依据症状给出建议。`;
  }
  if (detailed) {
    return `你是宠物兽医助手"Mini Vet"。根据用户选择的宠物类型和症状，生成详细、精准的护理方案。

要求：
1. 使用${langName}，语气专业亲切。使用 Markdown 标题和列表。
2. 包含以下部分，每部分用要点而非段落：
   - 初步判断：可能原因，结合物种/品种/年龄/体重分析，2-3 句话。
   - 护理建议：5-8 条要点，含居家护理、环境调整、饮食建议；涉及用药注明"需遵兽医医嘱"并给出参考剂量范围。
   - 用药参考：常见药物名称、参考剂量（按体重计算）、禁忌药物。
   - 就医判断流程：用条件列表说明什么情况可在家观察、什么情况需 24h 内就医、什么情况需立即急诊。
   - 警示信号：3-5 条需立即就医的情况。
3. 严禁确切诊断或绝对化结论。用量用"参考剂量"措辞。
4. 全文控制在 800 字以内，重点突出，不写免责声明（页面已展示）。`;
  }
  return `你是宠物兽医助手"Mini Vet"。根据用户选择的宠物类型和症状，生成简洁实用的护理建议。

要求：
1. 使用${langName}，语气专业亲切。使用 Markdown 标题和列表。
2. 只包含三个部分，每部分尽量精简，用要点而非段落：
   - 初步判断：可能原因，一句话概括，不危言耸听。
   - 护理建议：3-5 条要点，含居家护理和常规处理；涉及用药注明"需遵兽医医嘱"。
   - 警示信号：2-3 条需立即就医的情况。
3. 严禁确切诊断或绝对化结论。用量用"参考剂量"措辞。
4. 全文控制在 300 字以内，重点突出，不写免责声明（页面已展示）。`;
}



Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { petType, symptoms, extra, image, lang, detailed } = await req.json();

    if (!petType || !Array.isArray(symptoms) || symptoms.length === 0) {
      return new Response(
        JSON.stringify({ error: "请选择宠物类型和至少一项症状。" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Supabase 服务端配置缺失。" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data, error: dbError } = await supabase
      .from("app_config")
      .select("value")
      .eq("key", "OPENROUTER_API_KEY")
      .maybeSingle();

    if (dbError || !data?.value) {
      return new Response(
        JSON.stringify({ error: "无法读取 AI 密钥配置。" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const apiKey = data.value;

    const langCode = lang === "en" || lang === "ja" ? lang : "zh";
    const langInstr: Record<string, string> = {
      zh: "简体中文",
      en: "English",
      ja: "日本語",
    };
    const langName = langInstr[langCode] ?? "简体中文";
    const hasImage = typeof image === "string" && image.length > 0;

    const petLabel: Record<string, Record<string, string>> = {
      zh: { mouse: "鼠", cat: "猫", dog: "狗", rabbit: "兔", bird: "鸟类", reptile: "爬宠", fish: "观赏鱼", ferret: "雪貂" },
      en: { mouse: "rodent", cat: "cat", dog: "dog", rabbit: "rabbit", bird: "bird", reptile: "reptile", fish: "fish", ferret: "ferret" },
      ja: { mouse: "小動物", cat: "猫", dog: "犬", rabbit: "ウサギ", bird: "鳥類", reptile: "爬虫類", fish: "観賞魚", ferret: "フェレット" },
    };
    const symptomLabels: Record<string, Record<string, string>> = {
      zh: { eating: "摄食异常", excretion: "排泄异常", behavior: "行为异常", appearance: "外貌异常", respiratory: "呼吸异常", neuro: "神经异常" },
      en: { eating: "eating issues", excretion: "excretion issues", behavior: "behavior issues", appearance: "appearance issues", respiratory: "respiratory issues", neuro: "neurological issues" },
      ja: { eating: "摂食異常", excretion: "排泄異常", behavior: "行動異常", appearance: "外見異常", respiratory: "呼吸異常", neuro: "神経異常" },
    };
    const pl = petLabel[langCode] ?? petLabel.zh;
    const sl = symptomLabels[langCode] ?? symptomLabels.zh;

    const userContent = `${langCode === "zh" ? "宠物类型" : langCode === "ja" ? "ペットの種類" : "Pet type"}：${pl[petType] ?? petType}
${langCode === "zh" ? "观察到的症状" : langCode === "ja" ? "観察された症状" : "Observed symptoms"}：${symptoms.map((s: string) => sl[s] ?? s).join("、")}
${extra ? `${langCode === "zh" ? "补充说明" : langCode === "ja" ? "補足説明" : "Additional notes"}：${extra}` : ""}

${langCode === "zh" ? `请为这只${pl[petType] ?? petType}生成护理建议参考。` : langCode === "ja" ? `この${pl[petType] ?? petType}のケアアドバイス参考を生成してください。` : `Please generate care advice reference for this ${pl[petType] ?? petType}.`}`;

    const model = hasImage ? "nvidia/nemotron-nano-12b-v2-vl:free" : "deepseek/deepseek-v4-flash";
    const systemPrompt = buildSystemPrompt(langName, hasImage, !!detailed);

    const userMessage: Record<string, unknown> = hasImage
      ? {
          role: "user",
          content: [
            { type: "text", text: userContent },
            { type: "image_url", image_url: { url: image } },
          ],
        }
      : { role: "user", content: userContent };

    const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://bolt.new",
        "X-Title": "Mini Veterinarian",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          userMessage as never,
        ],
        stream: true,
        temperature: 0.5,
        max_tokens: detailed ? 2000 : 1200,
      }),
    });

    if (!upstream.ok || !upstream.body) {
      const text = await upstream.text().catch(() => "");
      return new Response(
        JSON.stringify({ error: `AI 服务返回错误（${upstream.status}）。${text.slice(0, 500)}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = upstream.body!.getReader();
        let buffer = "";
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith("data:")) continue;
              const data = trimmed.slice(5).trim();
              if (data === "[DONE]") {
                controller.close();
                return;
              }
              try {
                const json = JSON.parse(data);
                const delta = json?.choices?.[0]?.delta?.content;
                if (delta) controller.enqueue(encoder.encode(delta));
              } catch {
                // ignore malformed keepalive lines
              }
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ error: `Edge function error: ${msg}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
