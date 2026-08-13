"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import type { Invitation, RsvpStatus } from "@/lib/types";
import { addRsvp } from "@/lib/storage";
import { t } from "@/lib/i18n";
import { formatLongDate, cn } from "@/lib/utils";
import { InvPanel, InvReveal } from "./parts";
import { Turnstile } from "./turnstile";

const schema = z.object({
  name: z.string().min(2, "Please tell us your name"),
  email: z.string().email("That email doesn't look right").or(z.literal("")),
  status: z.enum(["attending", "not-attending", "maybe"]),
  guests: z.number().int().min(1).max(20),
  meal: z.string().optional(),
  message: z.string().max(600).optional(),
});

type Values = z.infer<typeof schema>;

export function RsvpForm({ invitation }: { invitation: Invitation }) {
  const copy = t(invitation.language);
  const [done, setDone] = useState(false);
  const [sendError, setSendError] = useState("");
  const { rsvp } = invitation;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { status: "attending", guests: 1, email: "", meal: "", message: "" },
  });

  const status = watch("status");

  const options: { value: RsvpStatus; label: string }[] = [
    { value: "attending", label: copy.attending },
    { value: "not-attending", label: copy.notAttending },
    { value: "maybe", label: copy.maybe },
  ];

  async function onSubmit(values: Values) {
    /* This now crosses a network, so a failure has to be visible — silently
       showing "thank you" for a reply that never arrived is the worst
       possible outcome for a host counting heads. */
    try {
      setSendError("");
      await addRsvp({
        invitationId: invitation.id,
        name: values.name,
        email: values.email,
        status: values.status,
        guests: values.status === "attending" ? values.guests : 0,
        meal: values.meal,
        message: values.message,
      });
      setDone(true);
    } catch (err) {
      setSendError(
        err instanceof Error
          ? err.message
          : "We couldn't send that. Please check your connection and try again.",
      );
    }
  }

  const field =
    "w-full rounded-xl border bg-transparent px-4 py-3 text-sm outline-none transition-colors duration-300 focus:ring-4";

  const fieldStyle = {
    borderColor: "var(--t-line)",
    color: "var(--t-ink)",
    fontFamily: "var(--t-body)",
  } as React.CSSProperties;

  return (
    <InvReveal>
      <InvPanel glass className="p-7 sm:p-9">
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="thanks"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="py-10 text-center"
            >
              <span
                className="mx-auto grid size-14 place-items-center rounded-full"
                style={{ background: "var(--t-accent)", color: "var(--t-bg)" }}
              >
                <Check className="size-6" strokeWidth={1.8} />
              </span>
              <p
                className="mt-6 text-2xl font-light"
                style={{ color: "var(--t-ink)", fontFamily: "var(--t-display)" }}
              >
                {copy.rsvpThanks}
              </p>
              <button
                type="button"
                onClick={() => setDone(false)}
                className="mt-5 text-xs underline underline-offset-4"
                style={{ color: "var(--t-ink-soft)" }}
              >
                Send another reply
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit(onSubmit)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-5"
              noValidate
            >
              {rsvp.deadline ? (
                <p
                  className="text-center text-xs"
                  style={{ color: "var(--t-ink-soft)", fontFamily: "var(--t-body)" }}
                >
                  Kindly reply by {formatLongDate(rsvp.deadline)}
                </p>
              ) : null}

              {/* attendance */}
              <fieldset>
                <legend className="sr-only">Will you attend?</legend>
                <div className="grid gap-2 sm:grid-cols-3">
                  {options.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => setValue("status", o.value)}
                      aria-pressed={status === o.value}
                      className={cn(
                        "rounded-xl border px-3 py-3 text-xs transition-all duration-300",
                      )}
                      style={{
                        borderColor:
                          status === o.value ? "var(--t-accent)" : "var(--t-line)",
                        background:
                          status === o.value
                            ? "color-mix(in oklab, var(--t-accent) 14%, transparent)"
                            : "transparent",
                        color: status === o.value ? "var(--t-accent)" : "var(--t-ink-soft)",
                        fontFamily: "var(--t-label)",
                      }}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="rsvp-name" className="sr-only">
                    {copy.yourName}
                  </label>
                  <input
                    id="rsvp-name"
                    {...register("name")}
                    placeholder={copy.yourName}
                    className={field}
                    style={fieldStyle}
                    aria-invalid={!!errors.name}
                  />
                  {errors.name ? (
                    <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
                  ) : null}
                </div>
                <div>
                  <label htmlFor="rsvp-email" className="sr-only">
                    {copy.yourEmail}
                  </label>
                  <input
                    id="rsvp-email"
                    type="email"
                    {...register("email")}
                    placeholder={copy.yourEmail}
                    className={field}
                    style={fieldStyle}
                  />
                  {errors.email ? (
                    <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                  ) : null}
                </div>
              </div>

              {rsvp.askGuestCount && status === "attending" ? (
                <div>
                  <label
                    htmlFor="rsvp-guests"
                    className="mb-2 block text-[0.625rem] uppercase tracking-[0.22em]"
                    style={{ color: "var(--t-ink-soft)", fontFamily: "var(--t-label)" }}
                  >
                    {copy.guestCount}
                  </label>
                  <select
                    id="rsvp-guests"
                    {...register("guests", { valueAsNumber: true })}
                    className={field}
                    style={fieldStyle}
                  >
                    {Array.from({ length: Math.max(1, rsvp.maxGuests) }, (_, i) => (
                      <option key={i} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              {rsvp.askMeal && status === "attending" ? (
                <div>
                  <label
                    htmlFor="rsvp-meal"
                    className="mb-2 block text-[0.625rem] uppercase tracking-[0.22em]"
                    style={{ color: "var(--t-ink-soft)", fontFamily: "var(--t-label)" }}
                  >
                    {copy.mealPreference}
                  </label>
                  <select
                    id="rsvp-meal"
                    {...register("meal")}
                    className={field}
                    style={fieldStyle}
                  >
                    {rsvp.mealOptions.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              {rsvp.askMessage ? (
                <div>
                  <label htmlFor="rsvp-message" className="sr-only">
                    {copy.aMessage}
                  </label>
                  <textarea
                    id="rsvp-message"
                    {...register("message")}
                    placeholder={copy.aMessage}
                    rows={3}
                    className={cn(field, "resize-y")}
                    style={fieldStyle}
                  />
                </div>
              ) : null}

              <Turnstile />

              {sendError ? (
                <p
                  role="alert"
                  className="rounded-xl border border-red-400/40 bg-red-500/8 px-4 py-3 text-xs leading-relaxed text-red-500"
                >
                  {sendError}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-xs uppercase tracking-[0.18em] transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-60"
                style={{
                  background: "var(--t-accent)",
                  color: "var(--t-bg)",
                  fontFamily: "var(--t-label)",
                }}
              >
                {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
                {copy.sendRsvp}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </InvPanel>
    </InvReveal>
  );
}
