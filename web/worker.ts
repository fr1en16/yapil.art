interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  LEADS: { fetch(request: Request): Promise<Response> };
}
const json = (
  data: Record<string, unknown>,
  status = 200,
  extra: Record<string, string> = {},
) =>
  Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store", ...extra },
  });
const clean = (value: unknown, limit: number) =>
  typeof value === "string" ? value.trim().slice(0, limit) : "";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(request);
    if (url.pathname !== "/api/lead")
      return json({ success: false, error: "Not found" }, 404);
    if (request.method !== "POST")
      return json({ success: false, error: "Method not allowed" }, 405, {
        Allow: "POST",
      });
    if (
      !request.headers
        .get("content-type")
        ?.toLowerCase()
        .startsWith("application/json")
    )
      return json({ success: false, error: "Ожидается JSON" }, 415);
    const origin = request.headers.get("Origin");
    if (origin && origin !== url.origin)
      return json({ success: false, error: "Недопустимый источник" }, 403);
    // Do not trust Content-Length alone; bound the streamed request as well.
    if (Number(request.headers.get("Content-Length")) > 16000)
      return json({ success: false, error: "Слишком большой запрос" }, 413);
    const reader = request.body?.getReader();
    if (!reader) return json({ success: false, error: "Пустой запрос" }, 400);
    const chunks: Uint8Array[] = [];
    let bytes = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > 16000) {
          await reader.cancel();
          return json({ success: false, error: "Слишком большой запрос" }, 413);
        }
        chunks.push(value);
      }
      const buffer = new Uint8Array(bytes);
      let offset = 0;
      for (const chunk of chunks) {
        buffer.set(chunk, offset);
        offset += chunk.length;
      }
      let data;
      try {
        data = JSON.parse(new TextDecoder().decode(buffer));
      } catch {
        return json({ success: false, error: "Некорректный JSON" }, 400);
      }
      if (!data || typeof data !== "object" || Array.isArray(data))
        return json({ success: false, error: "Некорректный запрос" }, 400);
      if (clean(data.company, 100))
        return json(
          { success: false, error: "Не удалось отправить форму" },
          400,
        );
      const name = clean(data.name, 100),
        phone = clean(data.phone, 30),
        email = clean(data.email, 200);
      const digits = phone.replace(/\D/g, "");
      if (
        name.length < 2 ||
        digits.length < 10 ||
        digits.length > 15 ||
        data.consent !== true
      )
        return json(
          { success: false, error: "Проверьте имя, телефон и согласие" },
          400,
        );
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        return json({ success: false, error: "Проверьте email" }, 400);
      const utm: Record<string, string> = {};
      if (data.utm && typeof data.utm === "object")
        for (const key of [
          "utm_source",
          "utm_medium",
          "utm_campaign",
          "utm_term",
          "utm_content",
        ]) {
          const value = clean(data.utm[key], 300);
          if (value) utm[key] = value;
        }
      const allowedFormats = [
        "Лендинг",
        "Сайт компании",
        "Магазин и каталог",
        "Веб-сервис",
        "Обсудим вместе",
      ];
      const format = allowedFormats.includes(data.format)
        ? data.format
        : "Обсудим вместе";
      const payload = {
        id: `WEB-${crypto.randomUUID()}`,
        name,
        phone,
        rawPhone: phone,
        email,
        message: clean(data.message, 4000),
        services: ["Сайты"],
        source: "web.yapil.art",
        sourceDetails: `Веб-направление Yapil · ${format}`,
        pageUrl: "https://web.yapil.art/contact",
        referrer: clean(data.referrer, 1500),
        utm,
      };
      const upstream = await env.LEADS.fetch(
        new Request("https://yapil.art/api/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(15000),
          redirect: "error",
        }),
      );
      const result = (await upstream.json()) as { success?: boolean };
      if (!upstream.ok || result.success !== true)
        return json(
          {
            success: false,
            error: "Не удалось доставить заявку. Напишите в WhatsApp.",
          },
          502,
        );
      return json({ success: true });
    } catch {
      return json(
        {
          success: false,
          error:
            "Не удалось отправить заявку. Попробуйте ещё раз или напишите в WhatsApp.",
        },
        502,
      );
    } finally {
      reader.releaseLock();
    }
  },
};
