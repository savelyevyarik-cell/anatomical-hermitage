'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FORMATS } from '@/lib/content';

type Data = {
  format: string;
  date: string;
  people: string;
  name: string;
  contact: string;
  comment: string;
};

const STEPS = ['Формат', 'Дата и группа', 'Контакты'] as const;

/**
 * Многошаговая форма записи. Валидация на каждом шаге, переходы
 * между шагами направленные (вперёд/назад), кнопка имеет
 * состояния idle / pending / done.
 *
 * Отправки на сервер нет — это витринный прототип, поэтому
 * сабмит только имитирует ответ и показывает сводку заявки.
 */
export default function BookingForm() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [status, setStatus] = useState<'idle' | 'pending' | 'done'>('idle');
  const [errors, setErrors] = useState<Partial<Record<keyof Data, string>>>({});
  const [data, setData] = useState<Data>({
    format: FORMATS[0].id,
    date: '',
    people: '',
    name: '',
    contact: '',
    comment: '',
  });

  const set = (key: keyof Data, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (current: number) => {
    const next: Partial<Record<keyof Data, string>> = {};

    if (current === 1) {
      if (!data.date) next.date = 'Укажите желаемую дату';
      else {
        const day = new Date(data.date).getDay();
        if (day === 0 || day === 6) next.date = 'Музей принимает группы только в будние дни';
      }
      const count = Number(data.people);
      if (!data.people || Number.isNaN(count) || count < 1) next.people = 'Укажите число человек';
      else if (count > 25) next.people = 'Группы больше 25 человек делим на две — напишите об этом в комментарии';
    }

    if (current === 2) {
      if (data.name.trim().length < 2) next.name = 'Как к вам обращаться?';
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contact);
      const isPhone = /^\+?[\d\s()-]{10,}$/.test(data.contact);
      if (!isEmail && !isPhone) next.contact = 'Оставьте телефон или e-mail для ответа';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const go = (delta: number) => {
    if (delta > 0 && !validate(step)) return;
    setDir(delta);
    setStep((s) => Math.min(Math.max(s + delta, 0), STEPS.length - 1));
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate(2)) return;
    setStatus('pending');
    window.setTimeout(() => setStatus('done'), 1100);
  };

  const field =
    'w-full border border-slate/20 bg-paper/40 px-4 py-4 text-base text-navy outline-none transition-colors duration-300 placeholder:text-slate/35 focus:border-azure';

  if (status === 'done') {
    const format = FORMATS.find((f) => f.id === data.format);
    return (
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="border border-azure/40 bg-paper/60 p-8 lg:p-12"
      >
        <p className="plaque text-azure">Заявка принята</p>
        <h3 className="mt-4 font-display text-h3 text-navy">Мы свяжемся с вами в рабочее время</h3>
        <p className="mt-4 max-w-prose2 text-small text-slate/75">
          Запись подтверждается ответным сообщением: экскурсовод сверяет дату с расписанием занятий
          кафедры и предлагает точное время.
        </p>
        <dl className="mt-8 grid gap-4 border-t border-slate/15 pt-6 sm:grid-cols-2">
          <div>
            <dt className="plaque text-slate/45">Формат</dt>
            <dd className="mt-1 text-small text-navy">{format?.title}</dd>
          </div>
          <div>
            <dt className="plaque text-slate/45">Дата</dt>
            <dd className="mt-1 text-small text-navy">{data.date}</dd>
          </div>
          <div>
            <dt className="plaque text-slate/45">Человек</dt>
            <dd className="mt-1 text-small text-navy">{data.people}</dd>
          </div>
          <div>
            <dt className="plaque text-slate/45">Связь</dt>
            <dd className="mt-1 text-small text-navy">{data.contact}</dd>
          </div>
        </dl>
      </motion.div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="border border-slate/15 bg-paper/40 p-6 lg:p-10">
      <ol className="mb-10 flex flex-wrap gap-6" aria-label="Шаги записи">
        {STEPS.map((title, i) => (
          <li key={title} className="flex items-center gap-3">
            <span
              className={`plaque flex h-8 w-8 items-center justify-center rounded-full border transition-colors duration-300 ${
                i === step
                  ? 'border-azure text-azure'
                  : i < step
                    ? 'border-azure/60 text-azure/80'
                    : 'border-slate/20 text-slate/40'
              }`}
            >
              {`0${i + 1}`}
            </span>
            <span className={`plaque ${i === step ? 'text-navy' : 'text-slate/45'}`}>{title}</span>
          </li>
        ))}
      </ol>

      <div className="relative min-h-[320px]">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            initial={{ opacity: 0, x: dir * 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -28 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {step === 0 ? (
              <fieldset>
                <legend className="plaque mb-5 text-slate/60">Выберите формат посещения</legend>
                <div className="grid gap-3">
                  {FORMATS.map((format) => (
                    <label
                      key={format.id}
                      className={`flex cursor-pointer items-start justify-between gap-4 border p-5 transition-colors duration-300 ${
                        data.format === format.id
                          ? 'border-azure bg-azure/5'
                          : 'border-slate/15 hover:border-slate/40'
                      }`}
                    >
                      <span>
                        <span className="block font-grotesk text-h4 text-navy">{format.title}</span>
                        <span className="plaque mt-2 block text-slate/50">
                          {format.audience} · {format.duration} · {format.price}
                        </span>
                      </span>
                      <input
                        type="radio"
                        name="format"
                        value={format.id}
                        checked={data.format === format.id}
                        onChange={(e) => set('format', e.target.value)}
                        className="mt-1 h-4 w-4 accent-[#BFD8E6]"
                      />
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : null}

            {step === 1 ? (
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="date" className="plaque mb-3 block text-slate/60">
                    Желаемая дата (будний день)
                  </label>
                  <input
                    id="date"
                    type="date"
                    value={data.date}
                    onChange={(e) => set('date', e.target.value)}
                    className={field}
                    aria-invalid={Boolean(errors.date)}
                    aria-describedby={errors.date ? 'date-error' : undefined}
                  />
                  {errors.date ? (
                    <p id="date-error" className="plaque mt-2 text-[#B3261E]">
                      {errors.date}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label htmlFor="people" className="plaque mb-3 block text-slate/60">
                    Количество человек
                  </label>
                  <input
                    id="people"
                    type="number"
                    min={1}
                    max={25}
                    inputMode="numeric"
                    placeholder="например, 12"
                    value={data.people}
                    onChange={(e) => set('people', e.target.value)}
                    className={field}
                    aria-invalid={Boolean(errors.people)}
                    aria-describedby={errors.people ? 'people-error' : undefined}
                  />
                  {errors.people ? (
                    <p id="people-error" className="plaque mt-2 text-[#B3261E]">
                      {errors.people}
                    </p>
                  ) : null}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="comment" className="plaque mb-3 block text-slate/60">
                    Комментарий (необязательно)
                  </label>
                  <textarea
                    id="comment"
                    rows={4}
                    placeholder="Тема учебного курса, особые пожелания, необходимость сопровождения"
                    value={data.comment}
                    onChange={(e) => set('comment', e.target.value)}
                    className={`${field} resize-none`}
                  />
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="plaque mb-3 block text-slate/60">
                    Имя и фамилия
                  </label>
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    value={data.name}
                    onChange={(e) => set('name', e.target.value)}
                    className={field}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                  />
                  {errors.name ? (
                    <p id="name-error" className="plaque mt-2 text-[#B3261E]">
                      {errors.name}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label htmlFor="contact" className="plaque mb-3 block text-slate/60">
                    Телефон или e-mail
                  </label>
                  <input
                    id="contact"
                    type="text"
                    placeholder="+7 (XXX) XXX-XX-XX"
                    value={data.contact}
                    onChange={(e) => set('contact', e.target.value)}
                    className={field}
                    aria-invalid={Boolean(errors.contact)}
                    aria-describedby={errors.contact ? 'contact-error' : undefined}
                  />
                  {errors.contact ? (
                    <p id="contact-error" className="plaque mt-2 text-[#B3261E]">
                      {errors.contact}
                    </p>
                  ) : null}
                </div>

                <p className="plaque sm:col-span-2 text-slate/45">
                  Отправляя заявку, вы соглашаетесь с правилами посещения музея. Прототип не передаёт
                  данные на сервер.
                </p>
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-slate/15 pt-6">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={step === 0}
          className="plaque px-5 py-4 text-slate/60 transition-colors duration-300 enabled:hover:text-navy disabled:opacity-30"
        >
          Назад
        </button>

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => go(1)}
            className="plaque btn-primary px-8 py-4"
          >
            Далее
          </button>
        ) : (
          <button
            type="submit"
            disabled={status === 'pending'}
            className="plaque btn-primary px-8 py-4 disabled:opacity-60"
          >
            {status === 'pending' ? 'Отправляем…' : 'Отправить заявку'}
          </button>
        )}
      </div>
    </form>
  );
}
