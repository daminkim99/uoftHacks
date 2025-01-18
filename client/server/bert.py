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
import json
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

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
def NER_with_SciBERT(text: str, similarity_threshold: float = 0.56):
    """
    Apply NER to identify research-related entities and validate them using SciBERT similarity.
    Returns a list of unique, contextually relevant entities.
    
    Parameters:
    - text: The input text to process.
    - similarity_threshold: Minimum cosine similarity score to retain an entity.
    """
    # Extract entities using spaCy NER
    #preprocess the text
    text = preprocess_text(text)
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

def keyword_pull_article(
    string,
    #first_sentences,
    keywords,
    similarity,
    similarity_threshold: float = 0.3,  
    sentiment_weight: float = 0.2,     
    similarity_cap: float = 0.9445,
    top_k: int = 140,                    
    string_similarity_threshold: float = 0.1):  
    #if first_sentences:
    # Preprocess the first sentences
       # sorted_keywords = first_sentences(string, first_sentences)
    #else:
    # Sort keywords by their corresponding similarity scores in descending order
    sorted_keywords = [kw for _, kw in sorted(zip(similarity, keywords), reverse=True)]
    # Determine the split index at roughly one-third of the keywords
    split_idx = max(1, len(sorted_keywords) // 7)
    
    # Join the first third of the keywords with '+'
    primary_keywords = "+".join([k+"~5" for k in sorted_keywords[:split_idx]])
    
    # Join the remaining keywords with '|'
    secondary_keywords = "|".join([k+"~5" for k in sorted_keywords[split_idx:]]) if len(sorted_keywords) > split_idx else ""
    
    # Construct the final query
    query = f"{primary_keywords}+({secondary_keywords})" if secondary_keywords else primary_keywords

    url = "https://api.semanticscholar.org/graph/v1/paper/search/bulk"
    querystring = {"query": query, "fields": "title,abstract,url,authors,url"}
    response = requests.request("GET", url, params=querystring)
    response = response.json()
    
    # Parse article data
    articles = response.get('data', [])
    titles = []
    abstracts = []
    authors_1 = []
    urls = []
    for i,article in enumerate(articles):
        titles.append(article.get('title'))
        abstracts.append(article.get('abstract'))
        authors = article.get('authors')
        authors_1.append([])
        for j, author in enumerate(authors):
            if author.get('name') is not None:
                authors_1[i].append(author.get('name'))
        urls.append(article.get('url'))

    
    if not abstracts:
        return {"keywords": keywords,"results": dict(response)}
    
    # Remove non-string abstracts and their corresponding titles
    valid_indices = [i for i, abstract in enumerate(abstracts) if isinstance(abstract, str) and len(abstract) > 0]
    abstracts = [abstracts[i] for i in valid_indices]
    titles = [titles[i] for i in valid_indices]
    authors = [authors_1[i] for i in valid_indices]
    urls = [urls[i] for i in valid_indices]

    # Remove duplicate abstracts and their corresponding titles
    unique_abstracts = list(dict.fromkeys(abstracts))
    unique_titles = []
    unique_authors = []
    unique_urls = []
    seen = set()
    for i, abstract in enumerate(abstracts):
        if abstract in unique_abstracts and abstract not in seen:
            unique_titles.append(titles[i])
            seen.add(abstract)
            unique_authors.append(authors[i])
            unique_urls.append(urls[i])

            
    
    abstracts = unique_abstracts
    titles = unique_titles
    
    # Vectorize all abstracts
    vectorizer = TfidfVectorizer()
    vectors = vectorizer.fit_transform(abstracts)
    similarity_matrix = cosine_similarity(vectors)
    
    # Precompute sentiment scores for all abstracts
    sentiment_scores = [sia.polarity_scores(abstract)['compound'] for abstract in abstracts]
    
    # Vectorize the 'string' for comparison
    string_vec = vectorizer.transform([string])
    string_similarities = cosine_similarity(string_vec, vectors).squeeze()
    
    # Identify the optimal pair based on sentiment difference
    import numpy as np
    np.fill_diagonal(similarity_matrix, 0)  # Exclude self-similarity
    
    number_of_abstracts = len(abstracts)
    number_of_pairs = number_of_abstracts * (number_of_abstracts - 1) // 2
    
    adjusted_top_k = min(top_k, number_of_pairs) if number_of_pairs > 0 else 0
    
    if adjusted_top_k == 0:
        return {"error": "Not enough unique pairs of abstracts to perform analysis."+str(len(abstracts))}
    
    # Flatten the similarity matrix and get indices of the top_k most similar pairs
    flat_indices = np.argpartition(similarity_matrix.flatten(), -adjusted_top_k)[-adjusted_top_k:]
    top_pairs = np.array(np.unravel_index(flat_indices, similarity_matrix.shape)).T
    
    best_sentiment_gap = -float('inf')
    best_pair = (None, None)
    best_similarity = 0
    best_sentiments = (None, None)
    
    # Convert top_pairs to a list for easier random selection
    top_pairs_list = list(top_pairs)
    import random
    
    for pair in top_pairs_list:
        i, j = pair
        sim = similarity_matrix[i, j]
        avg_string_similarity = (string_similarities[i] + string_similarities[j]) / 2
        if sim < similarity_threshold or sim > similarity_cap:
            continue
        if avg_string_similarity < string_similarity_threshold:
            continue
        gap = abs(sentiment_scores[i] - sentiment_scores[j])
        combined_score = sentiment_weight * gap + (1 - sentiment_weight) * avg_string_similarity
        if combined_score > best_sentiment_gap:
            best_sentiment_gap = combined_score
            best_pair = pair
            best_similarity = sim
            best_sentiments = (
                sentiment_scores[i],
                sentiment_scores[j]
            )
    
    if len(abstracts) < 2:
        return {"error": "Not enough valid abstracts found"}
    
    # Fix the array comparison
    if (best_pair[0] is None and best_pair[1] is None) or best_sentiment_gap < 0:
        return {"error": "No suitable pair of abstracts found based on the given thresholds."}

    top_index, bot_index = best_pair

    if best_similarity > similarity_cap:
        best_similarity = similarity_cap

    similarity_to_string_top = string_similarities[top_index]
    similarity_to_string_bot = string_similarities[bot_index]

    res =  {
        "titles": [titles[top_index], titles[bot_index]],
        "authors": [authors[top_index], authors[bot_index]],
        "urls": [urls[top_index], urls[bot_index]],
        "abstracts": [abstracts[top_index], abstracts[bot_index]],
        "sentiments": best_sentiments,
        "similarity": best_similarity,
        "similarity_to_string": [similarity_to_string_top, similarity_to_string_bot]
    }
    #save the jason file
    #make json nice to look at when export
    res = json.dumps(res, indent=4)
    res = json.loads(res)
    with open("data.json", "w") as f:
        json.dump(res, f, indent=4)
    return {"status": "Oliver's Keywords saved successfully!"}


def first_sentences(keywords: str, doc_level,cut_off: float = 0.5):
    """
    cosine similarity between the first sentences of the document and the keywords
    """
    text1 = ' '.join(keywords)
    text2 = ' '.join(doc_level)

    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform([text1, text2])
    cosine_sim = cosine_similarity(tfidf_matrix[0], tfidf_matrix[1])[0][0]
    if cosine_sim > cut_off:
        #return union of the two lists
        return list(set(keywords + doc_level))
    else:
        return keywords

    