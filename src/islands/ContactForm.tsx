import { createSignal } from 'solid-js';

type Fields = { name: string; email: string; budget: string; timeline: string; message: string };

export default function ContactForm() {
  const [fields, setFields] = createSignal<Fields>({
    name: '',
    email: '',
    budget: '$35k – $75k',
    timeline: '1–2 months',
    message: '',
  });
  const [errors, setErrors] = createSignal<Partial<Record<keyof Fields, string>>>({});
  const [state, setState] = createSignal<'idle' | 'sending' | 'done'>('idle');

  const set = (k: keyof Fields) => (e: Event) =>
    setFields((f) => ({ ...f, [k]: (e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).value }));

  // Zod 4 treeified error shape: { errors, properties: { field: { errors } } }
  type FieldTree = { properties?: Record<string, { errors?: string[] } | undefined> };
  const firstError = (tree: FieldTree, key: keyof Fields): string | undefined =>
    tree.properties?.[key]?.errors?.[0];

  const submit = (e: Event) => {
    e.preventDefault();
    if (state() !== 'idle') return;
    setState('sending');
    // Zod (~80KB) loads only when the user actually submits
    Promise.all([import('../lib/site'), import('zod')]).then(
      ([{ ContactSchema }, zmod]) => {
        const parsed = ContactSchema.safeParse(fields());
        if (!parsed.success) {
          // Zod 4: treeified error gives per-field message arrays
          const tree = zmod.treeifyError(parsed.error) as unknown as FieldTree;
          setErrors({
            name: firstError(tree, 'name'),
            email: firstError(tree, 'email'),
            message: firstError(tree, 'message'),
          });
          setState('idle');
          return;
        }
        setErrors({});
        setTimeout(() => setState('done'), 900);
      },
      () => setState('idle'),
    );
  };

  return (
    <form id="leadForm" onSubmit={submit} noValidate>
      <div class="f-row">
        <div class="field">
          <label for="cf-name">Name *</label>
          <input id="cf-name" placeholder="June Park" value={fields().name} onInput={set('name')} autocomplete="name" />
          {errors().name && <div class="field-error">{errors().name}</div>}
        </div>
        <div class="field">
          <label for="cf-email">Email *</label>
          <input
            id="cf-email"
            type="email"
            placeholder="june@fieldday.co"
            value={fields().email}
            onInput={set('email')}
            autocomplete="email"
          />
          {errors().email && <div class="field-error">{errors().email}</div>}
        </div>
      </div>
      <div class="f-row">
        <div class="field">
          <label for="cf-budget">Budget</label>
          <select id="cf-budget" value={fields().budget} onChange={set('budget')}>
            <option>$20k – $35k</option>
            <option>$35k – $75k</option>
            <option>$75k – $150k</option>
            <option>$150k+</option>
          </select>
        </div>
        <div class="field">
          <label for="cf-time">Timeline</label>
          <select id="cf-time" value={fields().timeline} onChange={set('timeline')}>
            <option>ASAP</option>
            <option>1–2 months</option>
            <option>3+ months</option>
          </select>
        </div>
      </div>
      <div class="field">
        <label for="cf-msg">What should move?</label>
        <textarea
          id="cf-msg"
          placeholder="A launch film, a rename, a store — tell us the dream and the deadline"
          value={fields().message}
          onInput={set('message')}
        />
        {errors().message && <div class="field-error">{errors().message}</div>}
      </div>
      <button
        class="btn btn-dark magnetic"
        type="submit"
        style={{ width: '100%', 'justify-content': 'center' }}
        data-hover
        id="sendBtn"
        disabled={state() !== 'idle'}
      >
        {state() === 'idle' ? 'Send it over →' : state() === 'sending' ? 'Sending…' : '✓ Received — talk in two days'}
      </button>
    </form>
  );
}
