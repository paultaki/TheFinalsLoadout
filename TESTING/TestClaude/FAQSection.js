const FAQSection = () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return React.createElement('section', {
        className: 'faq-section'
    }, [
        React.createElement('button', {
            className: 'faq-button',
            onClick: () => setIsOpen(!isOpen),
            key: 'button'
        }, [
            React.createElement('h2', {
                className: 'faq-title',
                key: 'heading'
            }, 'Frequently Asked Questions'),
            React.createElement('span', {
                className: `faq-toggle ${isOpen ? 'open' : ''}`,
                key: 'plus'
            }, isOpen ? '−' : '+') // Toggle symbol
        ]),
        React.createElement('div', {
            className: `faq-content ${isOpen ? 'open' : ''}`, // Toggle display
            key: 'content'
        }, React.createElement('div', {
            className: 'faq-content-inner'
        }, [
            React.createElement('div', { key: 'section1' }, [
                React.createElement('h3', { key: 'question1' }, 'Are Season 5 weapons included?'),
                React.createElement('p', { key: 'answer1' },
                    'Yes, this loadout randomizer is fully updated with all Season 5 weapons, builds, and gear, ensuring you can randomly generate the most current options available in The Finals.'
                )
            ]),
            React.createElement('div', { key: 'section2' }, [
                React.createElement('h3', { key: 'question2' }, 'How do I use this tool?'),
                React.createElement('p', { key: 'answer2p1' }, [
                    'Using this loadout randomizer is simple! Click on ',
                    React.createElement('strong', { key: 's1' }, 'Light'),
                    ', ',
                    React.createElement('strong', { key: 's2' }, 'Medium'),
                    ', or ',
                    React.createElement('strong', { key: 's3' }, 'Heavy'),
                    ' to generate a loadout tailored to a specific class, or select ',
                    React.createElement('strong', { key: 's4' }, 'Random'),
                    ' to embrace the chaos with a completely unpredictable loadout.'
                ]),
                React.createElement('p', { key: 'answer2p2' }, [
                    'Want to share your randomized loadout with teammates? Just hit ',
                    React.createElement('strong', null, '\'Copy Loadout\''),
                    ' and send it to them.'
                ])
            ])
        ]))
    ]);
};

// Render the component
const faqRoot = document.getElementById('faq-root');
if (faqRoot) {
    const root = ReactDOM.createRoot(faqRoot);
    root.render(React.createElement(FAQSection));
}
