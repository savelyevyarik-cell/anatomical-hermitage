'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

type Errors = Partial<Record<'name' | 'contact' | 'message', string>>;

/** Короткая форма обратной связи. Прототип: данные не отправляются на сервер. */
export default function ContactForm() {
  const [values, setValues] = useState({ name: '', contact: '', message: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<'idle' | 'pending' | 'done'>('idle');

  const field =
    'w-full border-b border-slate/25 bg-transparent py-4 text-base text-navy outline-none transition-colors duration-300 placeholder:text-slate/30 focus:border-azure';

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: Errors = {};
    if (values.name.trim().length < 2) next.name = 'Как к вам обращаться?';
    const ok =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.contact) || /^\+?[\d\s()-]{10,}$/.test(values.contact);
    if (!ok) next.contact = 'Телефон или e-mail для ответа';
    if (values.message.trim().length < 10) next.message = 'Опишите вопрос хотя бы одним предложением';

    setErrors(next);
    if (Object.keys(next).length) return;

    setStatus('pending');
    window.setTimeout(() => setStatus('done'), 900);
  };

  if (status === 'done') {
    return (
      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="border border-azure/40 p-8 text-base text-slate/85"
      >
        Сообщение записано. В реальной версии сайта письмо ушло бы хранителю собрания — ответ
        приходит в рабочие дни.
      </motion.p>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-8">
      <div>
        <label htmlFor="c-name" className="plaque mb-2 block text-slate/50">
          Имя
        </label>
        <input
          id="c-name"
          type="text"
          autoComplete="name"
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          className={field}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'c-name-error' : undefined}
        />
        {errors.name ? (
          <p id="c-name-error" className="plaque mt-2 text-[#B3261E]">
            {errors.name}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="c-contact" className="plaque mb-2 block text-slate/50">
          Телефон или e-mail
        </label>
        <input
          id="c-contact"
          type="text"
          placeholder="+7 (XXX) XXX-XX-XX"
          value={values.contact}
          onChange={(e) => setValues((v) => ({ ...v, contact: e.target.value }))}
          className={field}
          aria-invalid={Boolean(errors.contact)}
          aria-describedby={errors.contact ? 'c-contact-error' : undefined}
        />
        {errors.contact ? (
          <p id="c-contact-error" className="plaque mt-2 text-[#B3261E]">
            {errors.contact}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="c-message" className="plaque mb-2 block text-slate/50">
          Вопрос
        </label>
        <textarea
          id="c-message"
          rows={4}
          value={values.message}
          onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
          className={`${field} resize-none`}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? 'c-message-error' : undefined}
        />
        {errors.message ? (
          <p id="c-message-error" className="plaque mt-2 text-[#B3261E]">
            {errors.message}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={status === 'pending'}
        className="plaque w-fit btn-primary px-8 py-4 disabled:opacity-60"
      >
        {status === 'pending' ? 'Отправляем…' : 'Отправить сообщение'}
      </button>
    </form>
  );
}
