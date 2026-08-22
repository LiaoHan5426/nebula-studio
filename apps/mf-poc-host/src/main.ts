import {
  mountFederationRemote,
  registerStaticRemotes,
} from '@nebula-studio/application-runtime';
import { createPocHostCapabilities } from '@nebula-studio/host-capabilities';

type PocRemoteId = 'hello' | 'hello-style-b' | 'hello-dual';

function pocMode(): 'file' | 'http' {
  return new URLSearchParams(location.search).get('mf') === 'file'
    ? 'file'
    : 'http';
}

function remoteEntry(id: PocRemoteId): string {
  if (pocMode() === 'file') {
    return `mf-poc://${id}/mf-manifest.json`;
  }
  const ports: Record<PocRemoteId, number> = {
    hello: 5191,
    'hello-style-b': 5192,
    'hello-dual': 5193,
  };
  return `http://localhost:${ports[id]}/mf-manifest.json`;
}

const pocRegistry = [
  {
    name: 'nebula_hello',
    entry: remoteEntry('hello'),
    expose: 'application',
  },
  {
    name: 'nebula_hello_style_b',
    entry: remoteEntry('hello-style-b'),
    expose: 'application',
  },
  {
    name: 'nebula_hello_dual',
    entry: remoteEntry('hello-dual'),
    expose: 'runtime-application',
  },
] as const;

const pocHostCapabilities = createPocHostCapabilities();

async function mountRemote(
  name: string,
  expose: string,
  host: HTMLElement,
): Promise<() => Promise<void> | void> {
  const handle = await mountFederationRemote({
    name,
    expose,
    container: host,
    capabilities: pocHostCapabilities,
    application: { id: name, version: '0.0.0' },
  });
  return () => handle.unmount();
}

function colorOf(host: HTMLElement): string {
  const box = host.querySelector('.poc-box');
  if (!(box instanceof HTMLElement)) {
    return 'missing';
  }
  return getComputedStyle(box).color;
}

function paint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

async function main(): Promise<void> {
  registerStaticRemotes(pocRegistry);

  const root = document.querySelector('#app');
  if (!(root instanceof HTMLElement)) {
    throw new Error('mf-poc-host missing #app');
  }

  const fileMode = pocMode() === 'file';
  const standaloneLinks = fileMode
    ? [
        ['mf-poc://hello/index.html', '打开 hello standalone'],
        ['mf-poc://hello-style-b/index.html', '打开 hello-style-b'],
        ['mf-poc://hello-dual/index.html', '打开 hello-dual'],
      ]
    : [
        ['http://localhost:5191/', '打开 hello standalone (5191)'],
        ['http://localhost:5192/', '打开 hello-style-b (5192)'],
        ['http://localhost:5193/', '打开 hello-dual (5193)'],
      ];
  const standaloneHtml = standaloneLinks
    .map(
      ([href, label]) =>
        `<a href="${href}" target="_blank" rel="noreferrer">${label}</a>`,
    )
    .join('\n      ·\n      ');

  root.innerHTML = `
    <h1>MF Phase 0 Host</h1>
    <p>${
      fileMode
        ? 'Electron 自定义协议 mf-poc://（packaged extraResources 同布局）。槽位里的红/蓝块是 Remote 渲染结果。'
        : '先启动 5191–5193 三个 Remote，再打开本页 5190。槽位里的红/蓝块是 Remote 渲染结果，不是链接。'
    }</p>
    <p>${standaloneHtml}</p>
    <div class="row">
      <section>
        <h2>槽 A（最终应为红 hello-a）</h2>
        <div id="slot-a"></div>
      </section>
      <section>
        <h2>槽 B（最终应为蓝 hello-b）</h2>
        <div id="slot-b"></div>
      </section>
    </div>
    <section>
      <h2>dual runtime</h2>
      <div id="slot-runtime"></div>
    </section>
    <pre id="report"></pre>
  `;

  const slotA = document.querySelector('#slot-a');
  const slotB = document.querySelector('#slot-b');
  const slotRuntime = document.querySelector('#slot-runtime');
  const report = document.querySelector('#report');
  if (
    !(slotA instanceof HTMLElement) ||
    !(slotB instanceof HTMLElement) ||
    !(slotRuntime instanceof HTMLElement) ||
    !(report instanceof HTMLElement)
  ) {
    throw new Error('mf-poc-host missing slots');
  }

  const unmountA = await mountRemote('nebula_hello', 'application', slotA);
  const unmountB = await mountRemote(
    'nebula_hello_style_b',
    'application',
    slotB,
  );
  await paint();
  const first = { a: colorOf(slotA), b: colorOf(slotB) };
  await unmountA();
  await unmountB();

  const unmountB2 = await mountRemote(
    'nebula_hello_style_b',
    'application',
    slotA,
  );
  const unmountA2 = await mountRemote('nebula_hello', 'application', slotB);
  await paint();
  const swapped = { a: colorOf(slotA), b: colorOf(slotB) };
  await unmountB2();
  await unmountA2();

  await mountRemote('nebula_hello', 'application', slotA);
  await mountRemote('nebula_hello_style_b', 'application', slotB);
  await mountRemote('nebula_hello_dual', 'runtime-application', slotRuntime);
  await paint();

  const isolated =
    first.a === swapped.b && first.b === swapped.a && first.a !== first.b;

  report.textContent = JSON.stringify(
    { first, swapped, isolated, dual: slotRuntime.textContent?.trim() },
    null,
    2,
  );
}

void main().catch((error) => {
  const text =
    error instanceof Error ? (error.stack ?? error.message) : String(error);
  const root = document.querySelector('#app');
  const report = document.querySelector('#report');
  if (report instanceof HTMLElement) {
    report.textContent = text;
  } else if (root instanceof HTMLElement) {
    root.innerHTML = `<h1>MF Phase 0 Host</h1><pre id="report">${text}</pre>`;
  }
  console.error(error);
});
