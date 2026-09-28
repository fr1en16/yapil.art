interface PickerOptions {
  options: readonly string[];
  placeholder?: string;
  onChange?: () => void;
  onClose?: () => void;
}

const parse = (value: string) => value.split(',').map((item) => item.trim()).filter(Boolean);

// Checkbox dropdown rendered into `host`; keeps `input` (comma-separated) in sync.
export function mountPicker(host: HTMLElement, input: HTMLInputElement, { options, placeholder = 'Выберите', onChange, onClose }: PickerOptions) {
  host.classList.add('picker');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'picker-button';
  button.setAttribute('aria-haspopup', 'true');
  button.setAttribute('aria-expanded', 'false');
  const text = document.createElement('span');
  text.className = 'picker-label';
  button.append(text);
  const menu = document.createElement('div');
  menu.className = 'picker-menu';
  menu.hidden = true;
  const checkboxes = options.map((option) => {
    const label = document.createElement('label');
    label.className = 'picker-option';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = option;
    checkbox.dataset.pickerOption = '';
    label.append(checkbox, option);
    menu.append(label);
    return checkbox;
  });
  host.replaceChildren(button, menu);

  const refresh = () => {
    const selected = new Set(parse(input.value));
    checkboxes.forEach((checkbox) => { checkbox.checked = selected.has(checkbox.value); });
    text.textContent = selected.size ? [...selected].join(', ') : placeholder;
    button.classList.toggle('is-empty', !selected.size);
  };

  const outsideClick = (event: Event) => { if (!host.contains(event.target as Node)) close(); };
  function close() {
    if (menu.hidden) return;
    menu.hidden = true;
    button.setAttribute('aria-expanded', 'false');
    document.removeEventListener('click', outsideClick, true);
    onClose?.();
  }
  const open = () => {
    menu.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    document.addEventListener('click', outsideClick, true);
  };

  button.addEventListener('click', () => (menu.hidden ? open() : close()));
  host.addEventListener('keydown', (event) => { if (event.key === 'Escape') { close(); button.focus(); } });
  menu.addEventListener('change', () => {
    input.value = options.filter((_, index) => checkboxes[index].checked).join(', ');
    refresh();
    onChange?.();
  });

  refresh();
  return { refresh };
}
