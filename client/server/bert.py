import re
import torch
from transformers import BertTokenizer, BertModel
from nltk.corpus import stopwords
from nltk.sentiment import SentimentIntensityAnalyzer
from nltk.stem import WordNetLemmatizer
import requests
from gensim.parsing.preprocessing import STOPWORDS  # Added Gensim's stopwords
import spacy
import torch.nn.functional as F

# Initialize WordNetLemmatizer
lemmatizer = WordNetLemmatizer()

tokenizer = BertTokenizer.from_pretrained("allenai/scibert_scivocab_uncased")
model = BertModel.from_pretrained("allenai/scibert_scivocab_uncased")
model.eval()  # Set model to evaluation mode
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

# Load stopwords and add custom stopwords
stop_words = set(stopwords.words('english')).union(STOPWORDS)  # Updated to include Gensim's stopwords

# Load NLTK sentiment analyzer
sia = SentimentIntensityAnalyzer()

def preprocess_text(text: str) -> str:
    """
    Preprocess the input text by removing non-alphanumeric characters,
    converting to lowercase, removing stopwords, and lemmatizing.
    """
    # Remove non-alphanumeric characters
    text = re.sub(r'\W+', ' ', text)
    # Convert to lowercase
    text = text.lower()
    # Tokenize and remove stopwords
    tokens = [word for word in text.split() if word not in stop_words]
    # Lemmatize tokens
    lemmatized_tokens = [lemmatizer.lemmatize(token) for token in tokens]
    # Reconstruct the text
    preprocessed_text = ' '.join(lemmatized_tokens)
    return preprocessed_text
def NER(text: str):
    """
    Apply NER to identify research-related entities
    """
    nlp = spacy.load("en_core_sci_sm")
    doc = nlp(text)
    research_entities = [ent.text for ent in doc.ents]
    unique_entities = list(set(research_entities))
    return unique_entities
def extract_keywords(text: str):
    """
    Extract top 10 keywords from the preprocessed text using SciBERT's attention weights.
    """
    # Preprocess the text
    text = preprocess_text(text)
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True).to(device)
    outputs = model(**inputs)
    
    # Extract keywords using attention weights
    attention = outputs.attentions[-1]  # Get the attention weights from the last layer
    attention = attention.mean(dim=1)    # Average over all heads
    attention = attention.mean(dim=1)    # Average over all tokens
    attention = attention.squeeze(0)     # Remove batch dimension
    
    tokens = tokenizer.convert_ids_to_tokens(inputs['input_ids'].squeeze(0))
    token_attention = [(token, attention[i].item()) for i, token in enumerate(tokens)]
    token_attention = sorted(token_attention, key=lambda x: x[1], reverse=True)
    
    # Filter out special tokens and ensure meaningful keywords
    keywords = []
    confidence_score = []
    for token, score in token_attention:
        if token not in stop_words and token.isalnum() and token not in tokenizer.all_special_tokens:
            keywords.append(lemmatizer.lemmatize(token))
            confidence_score.append(score)
        if len(keywords) >= 10:
            break
    return keywords,confidence_score

def compute_entity_similarity(text: str, entity: str):
    """
    Compute similarity between the entity and the entire text using SciBERT embeddings.
    Returns a similarity score.
    """
    # Tokenize and encode the entire text
    inputs_text = tokenizer(text, return_tensors="pt", truncation=True, padding=True).to(device)
    with torch.no_grad():
        outputs_text = model(**inputs_text)
    # Obtain the [CLS] token embedding for the entire text
    cls_text = outputs_text.last_hidden_state[:, 0, :]  # Shape: (1, hidden_size)
    
    # Tokenize and encode the entity
    inputs_entity = tokenizer(entity, return_tensors="pt", truncation=True, padding=True).to(device)
    with torch.no_grad():
        outputs_entity = model(**inputs_entity)
    # Obtain the [CLS] token embedding for the entity
    cls_entity = outputs_entity.last_hidden_state[:, 0, :]  # Shape: (1, hidden_size)
    
    # Compute cosine similarity
    cosine_sim = F.cosine_similarity(cls_text, cls_entity).item()
    return cosine_sim
def NER_with_SciBERT(text: str, similarity_threshold: float = 0.55):
    """
    Apply NER to identify research-related entities and validate them using SciBERT similarity.
    Returns a list of unique, contextually relevant entities.
    
    Parameters:
    - text: The input text to process.
    - similarity_threshold: Minimum cosine similarity score to retain an entity.
    """
    # Extract entities using spaCy NER
    entities = NER(text)
    
    # List to store validated entities
    validated_entities = []
    
    for entity in entities:
        similarity = compute_entity_similarity(text, entity)
        if similarity >= similarity_threshold:
            validated_entities.append({
                "keyword": entity,
                "similarity": similarity
            })
    
    # Remove duplicates based on keywords
    unique_validated_entities = {}
    for ve in validated_entities:
        key = ve["keyword"].lower()
        if key not in unique_validated_entities or ve["similarity"] > unique_validated_entities[key]["similarity"]:
            unique_validated_entities[key] = ve
    
    return list(unique_validated_entities.values())

def keyword_pull_article(keywords):
    # Pull from Semantic Scholar API using keywords to search for articles
    query = "+".join(keywords)  # Join keywords with "+"
    url = "https://api.semanticscholar.org/graph/v1/paper/search/bulk"
    querystring = {"query": query, "fields": "title,abstract"}
    response = requests.request("GET", url, params=querystring)
    response = response.json()
    
    # Parse article data
    articles = response.get('data', [])
    titles = []
    abstracts = []
    for article in articles:
        titles.append(article.get('title'))
        abstracts.append(article.get('abstract'))
    
    if not abstracts:
        return {"keywords": keywords,"results": dict(response)}
    
    # Remove non-string abstracts and their corresponding titles
    valid_indices = [i for i, abstract in enumerate(abstracts) if isinstance(abstract, str) and len(abstract) > 0]
    abstracts = [abstracts[i] for i in valid_indices]
    titles = [titles[i] for i in valid_indices]
    
    # Analyze sentiment of each abstract
    sentiments = [sia.polarity_scores(abstract) for abstract in abstracts]

    if not sentiments:
        return {"error": "Sentiment analysis failed"}

    # Return the title and abstract and link of the two extremes in sentiment
    bot = min(sentiments, key=lambda x: x['compound'])
    top = max(sentiments, key=lambda x: x['compound'])

    top_index = sentiments.index(top)
    bot_index = sentiments.index(bot) 
    return {"titles": [titles[top_index], titles[bot_index]], "abstracts": [abstracts[top_index], abstracts[bot_index]], "sentiments": [top, bot]}




