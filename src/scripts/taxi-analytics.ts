const descriptions: Record<string, [string, string]> = {
  sessions: ['Сессии', '19 224 сессии за период. В отчёте отмечено снижение на 3,10%. Сессии — посещения сайта, а не количество уникальных людей.'],
  devices: ['Устройства', '93,27% — мобильные устройства, 6,73% — десктоп. Выберите устройство ниже, чтобы выделить его долю.'],
  leads: ['Заявки', '2 252 заявки за период. В отчёте отмечен рост на 102,70%. Заявка — обращение с сайта, а не подтверждённый выход на линию.'],
  conversion: ['Конверсия', '11,71% за период: 2 252 заявки / 19 224 сессии × 100, с округлением. Изменение в отчёте — +6,11%; способ расчёта этого изменения на скриншоте не раскрыт.'],
};

class TaxiAnalytics extends HTMLElement {
  connectedCallback() {
    if (this.dataset.ready) return;
    this.dataset.ready = 'true';
    this.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const metric = target.closest<HTMLButtonElement>('button[data-metric]');
      if (metric) {
        const entry = descriptions[metric.dataset.metric ?? ''];
        if (!entry) return;
        this.querySelectorAll('button[data-metric]').forEach(button => button.setAttribute('aria-pressed', String(button === metric)));
        this.querySelector('[data-detail-title]')!.textContent = entry[0];
        this.querySelector('[data-detail-copy]')!.textContent = entry[1];
        this.querySelector<HTMLElement>('[data-devices-panel]')!.hidden = metric.dataset.metric !== 'devices';
      }
      const device = target.closest<HTMLButtonElement>('button[data-device]');
      if (device) {
        const desktop = device.dataset.device === 'desktop';
        this.querySelectorAll('button[data-device]').forEach(button => button.setAttribute('aria-pressed', String(button === device)));
        this.querySelector('.analytics-device-bar')!.classList.toggle('is-desktop', desktop);
        this.querySelector('[data-device-copy]')!.textContent = desktop
          ? '6,73% — доля десктопных устройств в отчёте.'
          : '93,27% — доля мобильных устройств в отчёте.';
      }
    });
  }
}
if (!customElements.get('taxi-analytics')) customElements.define('taxi-analytics', TaxiAnalytics);
