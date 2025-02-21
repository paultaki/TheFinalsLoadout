const PunishmentFAQ = () => {
    const [openIndex, setOpenIndex] = React.useState(null);

    const toggleFAQ = (index) => {
        setOpenIndex(prevIndex => (prevIndex === index ? null : index));
    };

    const faqData = [
        { question: "What is a Punishment Loadout?", answer: "A Punishment Loadout is a randomized selection of weapons and gadgets meant to challenge you with unconventional and often suboptimal setups." },
        { question: "Can I customize my loadout?", answer: "Nope! The whole point is to test your adaptability with whatever you get." },
        { question: "Why would I use this?", answer: "Because it’s hilarious, chaotic, and a great way to push your limits as a player." },
        { question: "Is this an official tool?", answer: "Nope! This is a fan-made challenge mode for those who love suffering in The Finals." }
    ];

    return React.createElement("section", { className: "faq-section" }, [
        React.createElement("h2", { className: "faq-title", key: "title" }, "Punishment Loadout FAQ"),
        ...faqData.map((item, index) =>
            React.createElement("div", { className: "faq-item", key: index }, [
                React.createElement("button", {
                    className: "faq-question",
                    onClick: () => toggleFAQ(index)
                }, [
                    item.question,
                    React.createElement("span", {
                        className: `faq-toggle ${openIndex === index ? 'open' : ''}`
                    }, openIndex === index ? "−" : "+")
                ]),
                React.createElement("p", {
                    className: "faq-answer",
                    style: { display: openIndex === index ? "block" : "none" }
                }, item.answer)
            ])
        )
    ]);
};

// Render the component
const punishmentFaqRoot = document.getElementById("punishment-faq-root");
if (punishmentFaqRoot) {
    const root = ReactDOM.createRoot(punishmentFaqRoot);
    root.render(React.createElement(PunishmentFAQ));
}
