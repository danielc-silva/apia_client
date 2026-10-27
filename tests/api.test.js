import assert from 'node:assert/strict';
import test from 'node:test';
import { api } from '../src/services/api.js';

test('falha ao carregar animais é propagada em vez de virar lista vazia', async (context) => {
  context.mock.method(globalThis, 'fetch', async () =>
    new Response('serviço indisponível', {
      status: 503,
      headers: { 'content-type': 'text/plain' },
    })
  );

  await assert.rejects(api.getAnimals(), /HTTP 503/);
});

test('falha ao carregar eventos é propagada em vez de virar lista vazia', async (context) => {
  context.mock.method(globalThis, 'fetch', async () =>
    Response.json({ success: false, message: 'Banco indisponível.' }, { status: 500 })
  );

  await assert.rejects(api.getEvents(), /Banco indisponível/);
});

test('dados de lista em formato inesperado geram erro explícito', async (context) => {
  context.mock.method(globalThis, 'fetch', async () => Response.json({ data: null }));

  await assert.rejects(api.getAnimals(), /formato de resposta inválido/);
});

test('a lista administrativa usa endpoint protegido e envia o token', async (context) => {
  const armazenamentoOriginal = globalThis.localStorage;
  globalThis.localStorage = {
    getItem(chave) {
      return chave === 'ong_apia_token' ? 'token-de-teste' : null;
    },
  };
  context.after(() => {
    if (armazenamentoOriginal === undefined) {
      delete globalThis.localStorage;
    } else {
      globalThis.localStorage = armazenamentoOriginal;
    }
  });

  let requisicao;
  context.mock.method(globalThis, 'fetch', async (url, options) => {
    requisicao = { url, options };
    return Response.json({ data: [] });
  });

  assert.deepEqual(await api.getEvents(true), []);
  assert.equal(requisicao.url, '/api/events/admin');
  assert.equal(requisicao.options.headers.Authorization, 'Bearer token-de-teste');
});
