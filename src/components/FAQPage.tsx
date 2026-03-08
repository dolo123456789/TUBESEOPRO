import React from 'react';
import { HelpCircle } from 'lucide-react';

export function FAQPage() {
  const faqs = [
    {
      question: "How does TubeSEO Pro work?",
      answer: "TubeSEO Pro uses advanced AI models to analyze your video metadata and compare it with real-time YouTube trends to provide actionable SEO insights."
    },
    {
      question: "Is it free to use?",
      answer: "We offer a free tier with basic analysis features. For advanced features like A/B testing and competitor channel audits, we have a Pro subscription."
    },
    {
      question: "Can I cancel my subscription?",
      answer: "Yes, you can cancel your subscription at any time from your account settings."
    }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-center gap-2">
          <HelpCircle className="h-8 w-8 text-indigo-600" />
          Frequently Asked Questions
        </h1>
        <p className="text-slate-500 dark:text-slate-400">Everything you need to know about TubeSEO Pro.</p>
      </div>
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-white dark:bg-[#1a1b20] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{faq.question}</h3>
            <p className="text-slate-600 dark:text-slate-300">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
