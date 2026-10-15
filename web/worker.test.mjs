import { test, mock } from "node:test";
import assert from "node:assert/strict";
import worker from "./worker.ts";

const assets = {
  ASSETS: { fetch: async () => new Response("asset") },
  LEADS: {
    fetch: async () => {
      throw new Error("Unexpected upstream call");
    },
  },
};
const valid = {
  name: "Тестовый клиент",
  phone: "+77001234567",
  consent: true,
  message: "Тест: не отправлять в production",
  format: "Лендинг",
};
const request = (body, headers = {}) =>
  new Request("https://web.yapil.art/api/lead", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://web.yapil.art",
      ...headers,
    },
    body: JSON.stringify(body),
  });

test("invalid or unconsented submissions never reach the lead service", async () => {
  const fetchMock = mock.method(assets.LEADS, "fetch", async () => {
    throw new Error("Unexpected upstream call");
  });
  try {
    for (const body of [
      { ...valid, consent: false },
      { ...valid, phone: "123" },
      { ...valid, name: "" },
      { ...valid, email: "bad-mail" },
      { ...valid, company: "bot" },
    ])
      assert.equal((await worker.fetch(request(body), assets)).status, 400);
    assert.equal(
      (
        await worker.fetch(
          request(valid, { Origin: "https://elsewhere.test" }),
          assets,
        )
      ).status,
      403,
    );
    assert.equal(
      (
        await worker.fetch(
          request(valid, { "Content-Length": "20000" }),
          assets,
        )
      ).status,
      413,
    );
    const malformed = new Request("https://web.yapil.art/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{",
    });
    assert.equal((await worker.fetch(malformed, assets)).status, 400);
    assert.equal(fetchMock.mock.callCount(), 0);
  } finally {
    fetchMock.mock.restore();
  }
});

test("the streamed body is bounded even without Content-Length", async () => {
  const response = await worker.fetch(
    request({ ...valid, message: "x".repeat(18000) }),
    assets,
  );
  assert.equal(response.status, 413);
});

test("confirmed delivery forwards only bounded lead fields with the web source", async () => {
  let forwarded;
  const fetchMock = mock.method(assets.LEADS, "fetch", async (request) => {
    assert.equal(request.url, "https://yapil.art/api/lead");
    forwarded = await request.json();
    return Response.json({
      success: true,
      dbSaved: true,
      internal: "not public",
    });
  });
  try {
    const response = await worker.fetch(
      request({
        ...valid,
        source: "spoof",
        pageUrl: "https://bad.test",
        utm: { utm_source: "campaign", private: "do not forward" },
      }),
      assets,
    );
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { success: true });
    assert.equal(forwarded.source, "web.yapil.art");
    assert.equal(forwarded.pageUrl, "https://web.yapil.art/contact");
    assert.deepEqual(forwarded.services, ["Сайты"]);
    assert.deepEqual(forwarded.utm, { utm_source: "campaign" });
    assert.match(forwarded.id, /^WEB-/);
  } finally {
    fetchMock.mock.restore();
  }
});

test("unconfirmed delivery stays an error and static paths use the asset binding", async () => {
  const fetchMock = mock.method(assets.LEADS, "fetch", async () =>
    Response.json({ success: false }, { status: 502 }),
  );
  try {
    const response = await worker.fetch(request(valid), assets);
    assert.equal(response.status, 502);
    assert.equal((await response.json()).success, false);
    assert.equal(
      await (
        await worker.fetch(new Request("https://web.yapil.art/"), assets)
      ).text(),
      "asset",
    );
    assert.equal(
      (
        await worker.fetch(
          new Request("https://web.yapil.art/api/lead"),
          assets,
        )
      ).status,
      405,
    );
    assert.equal(
      (
        await worker.fetch(
          new Request("https://web.yapil.art/api/unknown"),
          assets,
        )
      ).status,
      404,
    );
  } finally {
    fetchMock.mock.restore();
  }
});
