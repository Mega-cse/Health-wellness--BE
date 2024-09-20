// Function to generate a motivational quote
export const getMotivationalQuote = () => {
    const quotes = [
        "The only way to do great work is to love what you do. – Steve Jobs",
        "Happiness is not by chance, but by choice. – Jim Rohn",
        "The greatest wealth is to live content with little. – Plato",
        "In the middle of difficulty lies opportunity. – Albert Einstein",
        "Believe you can and you're halfway there. – Theodore Roosevelt"
    ];
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
};
