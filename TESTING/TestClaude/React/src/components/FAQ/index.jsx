import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-700 last:border-none">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center py-4 text-left focus:outline-none"
      >
        <h3 className="text-lg font-semibold text-white">{question}</h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="text-yellow-500 w-5 h-5" />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-4 text-gray-300">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const FAQ = () => {
  const faqs = [
    {
      question: "Are Season 5 weapons included?",
      answer: "Yes, this loadout randomizer is fully updated with all Season 5 weapons, builds, and gear, ensuring you can randomly generate the most current options available in The Finals."
    },
    {
      question: "How do I use this tool?",
      answer: <>
        <p className="mb-2">
          Using this loadout randomizer is simple! Click on <strong>Light</strong>, <strong>Medium</strong>, or <strong>Heavy</strong> to generate a loadout tailored to a specific class, or select <strong>Random</strong> to embrace the chaos with a completely unpredictable loadout.
        </p>
        <p>
          Want to share your randomized loadout with teammates? Just hit <strong>'Copy Loadout'</strong> and send it to them.
        </p>
      </>
    },
    {
      question: "How often is the loadout generator updated?",
      answer: "We update the loadout generator as soon as new patches are released, typically within 24 hours of official game updates. This ensures you always have access to the most current weapon stats and game mechanics."
    },
    {
      question: "What are the odds of getting specific items?",
      answer: "All items within each category (weapons, specializations, and gadgets) have an equal chance of being selected. The randomization is completely fair and unbiased to encourage variety in gameplay styles."
    }
  ];

  return (
    <section className="bg-gray-900/50 p-8 rounded-lg mt-16">
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-center mb-8 text-yellow-500"
      >
        Frequently Asked Questions
      </motion.h2>

      <div className="max-w-3xl mx-auto divide-y divide-gray-700">
        {faqs.map((faq, index) => (
          <FAQItem
            key={index}
            question={faq.question}
            answer={faq.answer}
          />
        ))}
      </div>
    </section>
  );
};