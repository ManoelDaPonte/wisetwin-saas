"use client";

import { useTranslations } from "@/hooks/use-translations";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import Link from "next/link";

export function FaqSection() {
  const t = useTranslations();

  const faqs = [
    {
      question: t.home.faq.questions.password.question,
      answer: t.home.faq.questions.password.answer,
      link: {
        text: t.home.faq.questions.password.linkText,
        href: "/parametres",
      },
    },
    {
      question: t.home.faq.questions.organization.question,
      answer: t.home.faq.questions.organization.answer,
      link: {
        text: t.home.faq.questions.organization.linkText,
        href: "/organisation",
      },
    },
    {
      question: t.home.faq.questions.trainings.question,
      answer: t.home.faq.questions.trainings.answer,
      link: {
        text: t.home.faq.questions.trainings.linkText,
        href: "/wisetrainer",
      },
    },
    {
      question: t.home.faq.questions.certification.question,
      answer: t.home.faq.questions.certification.answer,
      link: {
        text: t.home.faq.questions.certification.linkText,
        href: "/tableau-de-bord/certifications",
      },
    },
    {
      question: t.home.faq.questions.switching.question,
      answer: t.home.faq.questions.switching.answer,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {t.home.faq.title}
          </h2>
          <p className="text-muted-foreground">{t.home.faq.subtitle}</p>
        </div>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <p className="text-muted-foreground">{faq.answer}</p>
                {faq.link && (
                  <Link
                    href={faq.link.href}
                    className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                  >
                    {faq.link.text} →
                  </Link>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
