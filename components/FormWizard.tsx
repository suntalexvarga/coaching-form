"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { config } from "@/lib/config";

type Answers = {
  help: string;
  duration: string;
  tried: string;
  how: string;
  impact: string;
  vision: string;
  email: string;
  name: string;
};

const EMPTY_ANSWERS: Answers = {
  help: "",
  duration: "",
  tried: "",
  how: "",
  impact: "",
  vision: "",
  email: "",
  name: "",
};

type Step =
  | { kind: "intro" }
  | {
      kind: "question";
      id: keyof Answers;
      title: string;
      subtitle?: string;
      input: "text" | "textarea" | "email" | "choice";
      options?: string[];
      required: boolean;
      placeholder?: string;
      showIf?: (a: Answers) => boolean;
    }
  | { kind: "name" };

const STEPS: Step[] = [
  { kind: "intro" },
  {
    kind: "question",
    id: "help",
    title: "Iti plac manelele?",
    subtitle: "Raspunde sincer.",
    input: "choice",
    options: ["Da", "Nu"],
    required: true,
  },
  {
    kind: "question",
    id: "duration",
    title: "De cât timp?",
    subtitle: "De cât timp te confrunți cu această situație?",
    input: "text",
    required: true,
    placeholder: "Ex: 6 luni, 2 ani...",
  },
  {
    kind: "question",
    id: "tried",
    title: "Ai încercat să o rezolvi?",
    subtitle: "Ai încercat să rezolvi această situație până acum?",
    input: "choice",
    options: ["Da", "Nu"],
    required: true,
  },
  {
    kind: "question",
    id: "how",
    title: "Cum anume?",
    subtitle: "Ce ai încercat până acum?",
    input: "textarea",
    required: false,
    placeholder: "Scrie aici...",
    showIf: (a) => a.tried === "Da",
  },
  {
    kind: "question",
    id: "impact",
    title: "Cum te afectează?",
    subtitle: "Cum îți afectează această situație viața de zi cu zi?",
    input: "textarea",
    required: true,
    placeholder: "Scrie aici...",
  },
  {
    kind: "question",
    id: "vision",
    title: "Cum ar arăta viața ta?",
    subtitle: "Cum ar arăta viața ta fără această provocare?",
    input: "textarea",
    required: true,
    placeholder: "Scrie aici...",
  },
  {
    kind: "question",
    id: "email",
    title: "Care e emailul tău?",
    subtitle: "Ca să pot ține legătura cu tine.",
    input: "email",
    required: true,
    placeholder: "nume@exemplu.ro",
  },
  { kind: "name" },
];

function buildWhatsAppUrl(a: Answers): string {
  const lines = [
    `Salut! Sunt ${a.name.trim()}. Am completat formularul „Primul pas către tine”:`,
    "",
    "1. Ii plac manelele:",
    a.help.trim(),
    "",
    "2. De cât timp mă confrunt cu situația:",
    a.duration.trim(),
    "",
    `3. Am încercat să o rezolv până acum: ${a.tried}`,
  ];
  if (a.tried === "Da" && a.how.trim()) {
    lines.push("", "4. Cum anume:", a.how.trim());
  }
  lines.push(
    "",
    "5. Cum îmi afectează viața de zi cu zi:",
    a.impact.trim(),
    "",
    "6. Cum ar arăta viața mea fără această provocare:",
    a.vision.trim(),
    "",
    `Email: ${a.email.trim()}`
  );
  return `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(
    lines.join("\n")
  )}`;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function FormWizard() {
  const [answers, setAnswers] = useState<Answers>(EMPTY_ANSWERS);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const visibleSteps = useMemo(
    () =>
      STEPS.filter(
        (s) => s.kind !== "question" || !s.showIf || s.showIf(answers)
      ),
    [answers]
  );

  const clampedIndex = Math.min(stepIndex, visibleSteps.length - 1);
  const step = visibleSteps[clampedIndex];
  const progress = ((clampedIndex + 1) / visibleSteps.length) * 100;

  useEffect(() => {
    inputRef.current?.focus();
  }, [clampedIndex]);

  function setAnswer(id: keyof Answers, value: string) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    setError("");
  }

  function goBack() {
    setError("");
    setStepIndex((i) => Math.max(0, i - 1));
  }

  function goNext() {
    if (step.kind === "question") {
      const value = answers[step.id].trim();
      if (step.required && !value) {
        setError("Te rog să completezi acest câmp înainte de a continua.");
        return;
      }
      if (step.input === "email" && !EMAIL_RE.test(value)) {
        setError("Te rog să introduci o adresă de email validă.");
        return;
      }
    }
    setError("");
    setStepIndex((i) => Math.min(visibleSteps.length - 1, i + 1));
  }

  function selectChoice(id: keyof Answers, option: string) {
    setAnswers((prev) => ({ ...prev, [id]: option }));
    setError("");
    setStepIndex((i) => Math.min(visibleSteps.length - 1, i + 1));
  }

  function submit() {
    const name = answers.name.trim();
    if (!name) {
      setError("Te rog să îmi spui cum te numești.");
      return;
    }
    window.location.href = buildWhatsAppUrl(answers);
  }

  function handleKeyDown(e: React.KeyboardEvent, isTextarea: boolean) {
    if (e.key !== "Enter") return;
    if (isTextarea && !(e.metaKey || e.ctrlKey)) return;
    e.preventDefault();
    if (step.kind === "name") {
      submit();
    } else {
      goNext();
    }
  }

  return (
    <div className="shell">
      <header className="header">
        <div className="logo" aria-hidden="true">
          {config.logoText}
        </div>
        <div className="brand">
          {config.brandName}
          <span>{config.brandTld}</span>
        </div>
      </header>

      <div
        className="progress-track"
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {step.kind === "intro" && (
        <section className="step">
          <h1 className="step-title">{config.formTitle}</h1>
          <p className="step-subtitle">{config.formDescription}</p>
          <button type="button" className="cta" onClick={goNext}>
            Începe <span aria-hidden="true">→</span>
          </button>
        </section>
      )}

      {step.kind === "question" && (
        <section className="step" key={step.id}>
          <h1 className="step-title">{step.title}</h1>
          {step.subtitle && (
            <p className="step-subtitle">
              {step.subtitle}{" "}
              {!step.required && (
                <span className="optional-tag">(opțional)</span>
              )}
            </p>
          )}

          {step.input === "choice" ? (
            <div className="choices">
              {step.options?.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`choice-btn ${
                    answers[step.id] === option ? "selected" : ""
                  }`}
                  onClick={() => selectChoice(step.id, option)}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : (
            <div className="field">
              {step.input === "textarea" ? (
                <textarea
                  ref={(el) => {
                    inputRef.current = el;
                  }}
                  className="textarea-input"
                  value={answers[step.id]}
                  placeholder={step.placeholder}
                  onChange={(e) => setAnswer(step.id, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, true)}
                />
              ) : (
                <input
                  ref={(el) => {
                    inputRef.current = el;
                  }}
                  className="text-input"
                  type={step.input === "email" ? "email" : "text"}
                  inputMode={step.input === "email" ? "email" : "text"}
                  value={answers[step.id]}
                  placeholder={step.placeholder}
                  onChange={(e) => setAnswer(step.id, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, false)}
                />
              )}
            </div>
          )}

          {error && <p className="error-msg">{error}</p>}

          {step.input !== "choice" && (
            <button type="button" className="cta" onClick={goNext}>
              Continuă <span aria-hidden="true">→</span>
            </button>
          )}

          <button type="button" className="back-link" onClick={goBack}>
            <span aria-hidden="true">‹</span> Înapoi
          </button>
        </section>
      )}

      {step.kind === "name" && (
        <section className="step">
          <h1 className="step-title">Ultimul pas</h1>
          <p className="step-subtitle">
            Cum te numești? Îți pregătesc răspunsul personalizat.
          </p>
          <div className="field">
            <input
              ref={(el) => {
                inputRef.current = el;
              }}
              className="text-input"
              type="text"
              autoComplete="name"
              value={answers.name}
              placeholder="Prenume și nume"
              onChange={(e) => setAnswer("name", e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, false)}
            />
          </div>

          {error && <p className="error-msg">{error}</p>}

          <button type="button" className="cta whatsapp" onClick={submit}>
            Trimite pe WhatsApp <span aria-hidden="true">→</span>
          </button>
          <p className="hint">
            Se deschide WhatsApp cu răspunsurile tale precompletate — tu doar
            apeși Send.
          </p>

          <button type="button" className="back-link" onClick={goBack}>
            <span aria-hidden="true">‹</span> Înapoi
          </button>
        </section>
      )}

      <footer className="footer">
        {config.brandName}
        {config.brandTld}
      </footer>
    </div>
  );
}
