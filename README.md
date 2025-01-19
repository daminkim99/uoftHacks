# Coalescence

By Oliver Harrison, Ada Selcuk, Grace Li, Elena Kim

![Coalescence gif](https://github.com/user-attachments/assets/175bdf7b-6e45-45c7-b0b5-114a25692b5f)

Introducing Coalescence, your personal research assistant playing devil's advocate. It challenges your perspectives, questions your logic, and pushes your thinking further by relating academic papers that support or oppose your argument. This ensures your academic paper is bulletproof and is always backed by the best available research. 

## Navigate the Website

Begin by entering some keywords of your research topic. This, in turn, enables you to shape Coalescence's understanding of your project by fine tuning its ground truth theme comparison. When you have stopped writing for 5 seconds or have highlighted a passage for 3 seconds, Coalescence will do all its mathematical and technical calculations. Now, you can consider your argument fully with one research paper that backs and one that counterbalances yours.

## Technologies Used

- Python
- React
- JavaScript
- HTML/CSS
- Framer Motion
- Figma
- FastAPI
- Semantic Scholar API

## Technical Logic

Coalescence takes sentences or paragraphs you toss into its text editor and puts them under a metaphorical microscope using a custom, real-time Natural Language Processing pipeline. Think of it as a brainy robot librarian on caffeine.

This includes a Named Entity Recognition model with a loss function powered by a custom implementation of a Bidirectional Encoder Representations from Transformers model, trained on a vast network of academic texts. Our algorithm also maximizes relevance using a comparison of user-entered keywords. 

Afterwards, it gets sent as a query to Semantic Scholar, a massive treasure trove of over 214 million academic texts. Then, Coalescence flexes its optimization muscles, using constraint and multi-objective optimization techniques to serve up the two texts where one of them vibes most with your input and the other one runs the opposite way. 

## Impact

Armed with NLPs, fancy optimizations, and a whole lot of academic papers available to be compared to your paper, you can guarantee your argument is comprehensive. Whether you're drafting a thesis, getting ready to debate, or writing for the sake of it, Coalescence ensures you're always thinking smarter and researching deeper, reassuring every word you write stands on the strongest foundation.

