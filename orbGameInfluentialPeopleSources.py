import requests
from bs4 import BeautifulSoup
import json
import time
from urllib.parse import quote_plus

# Historical figures from the original list
historical_figures = [
    "Archimedes", "Imhotep", "Hero of Alexandria", "Al-Jazari", "Johannes Gutenberg", "Li Shizhen",
    "James Watt", "Charles Babbage", "Samuel Morse", "Tim Berners-Lee", "Steve Jobs", "Hedy Lamarr",
    "Fei-Fei Li", "Elon Musk", "Demis Hassabis", "Hippocrates", "Euclid", "Aristotle", "Ibn al-Haytham",
    "Roger Bacon", "Hildegard of Bingen", "Charles Darwin", "Louis Pasteur", "Dmitri Mendeleev",
    "Rosalind Franklin", "Albert Einstein", "Jennifer Doudna", "Youyou Tu", "David Sinclair", "Phidias",
    "Polygnotus", "Giotto di Bondone", "Andrei Rublev", "Claude Monet", "William Blake", "Gustave Courbet",
    "Frida Kahlo", "Banksy", "Yayoi Kusama", "Refik Anadol", "Sofia Crespo", "Theophrastus", "Empedocles",
    "Huang Di", "Albertus Magnus", "Avicenna", "Saint Francis of Assisi", "John James Audubon", "Mary Anning",
    "Jane Goodall", "David Attenborough", "Wangari Maathai", "Mercedes Bustamante", "Paul Stamets",
    "Milo of Croton", "Leonidas of Rhodes", "Gaius Appuleius Diocles", "William Marshal", "Robin Hood",
    "Richard FitzAlan", "W.G. Grace", "Pierre de Coubertin", "James Naismith", "Serena Williams", "Pelé",
    "Simone Biles", "Sappho", "King David", "Narada", "Guillaume de Machaut", "Alfonso el Sabio",
    "Ludwig van Beethoven", "Fanny Mendelssohn", "Frédéric Chopin", "Louis Armstrong", "The Beatles", "BTS",
    "Holly Herndon", "Yannick Nézet-Séguin", "Ptolemy", "Aryabhata", "Hypatia", "Al-Battani",
    "Nasir al-Din al-Tusi", "Geoffrey Chaucer", "Galileo Galilei", "Edmond Halley", "Caroline Herschel",
    "Yuri Gagarin", "Katherine Johnson", "Stephen Hawking", "Mars Colony Leader", "Exoplanet Signal Analyst",
    "AI Probe Architect", "Zhang Heng", "Ctesibius", "Aeneas Tacticus", "Richard of Wallingford",
    "Leonardo Fibonacci", "Thomas Edison", "Nikola Tesla", "Alexander Graham Bell", "Grace Hopper",
    "Shigeru Miyamoto", "Fusion Energy Scientist", "Translingual AI Architect", "Synthetic Biology Entrepreneur"
]

# Enhanced image sources with licensing and search strategies
image_sources = {
    "primarySources": [
        {
            "name": "Wikimedia Commons",
            "url": "https://commons.wikimedia.org/wiki/Special:Search?search={}&go=Go",
            "licensing": "Public Domain / Creative Commons",
            "bestUse": "Portraits, invention diagrams, artifacts",
            "reliability": "High",
            "searchFormat": "direct"
        },
        {
            "name": "Library of Congress (PPOC, Brady‑Handy)",
            "url": "https://www.loc.gov/photos/?q={}",
            "licensing": "Public Domain",
            "bestUse": "Historical portraits (19th century US)",
            "reliability": "High",
            "searchFormat": "direct"
        },
        {
            "name": "NYPL Free to Use Collections",
            "url": "https://digitalcollections.nypl.org/search/index?utf8=✓&keywords={}",
            "licensing": "Public Domain",
            "bestUse": "Photos, prints, documents, artifacts",
            "reliability": "High",
            "searchFormat": "direct"
        },
        {
            "name": "Internet Archive",
            "url": "https://archive.org/search.php?query={}",
            "licensing": "Public Domain / Creative Commons",
            "bestUse": "Illustrations, museum catalogs, scans",
            "reliability": "Medium",
            "searchFormat": "direct"
        },
        {
            "name": "Public Domain Archive",
            "url": "https://picryl.com/search?q={}",
            "licensing": "Public Domain",
            "bestUse": "Curated historical images",
            "reliability": "Medium",
            "searchFormat": "direct"
        },
        {
            "name": "Web Gallery of Art",
            "url": "https://www.wga.hu/",
            "licensing": "Public Domain (work dependent)",
            "bestUse": "Historic paintings / classical art",
            "reliability": "High",
            "searchFormat": "manual"
        },
        {
            "name": "Frick Photoarchive",
            "url": "https://photoarchive.frick.org/",
            "licensing": "Public Domain (art reproductions)",
            "bestUse": "Artworks pre-1900",
            "reliability": "High",
            "searchFormat": "manual"
        }
    ],
    "secondarySources": [
        {
            "name": "LookAndLearn, PxHere, Dreamstime CC0",
            "url": "https://pxhere.com/en/search?q={}",
            "licensing": "CC0 Public Domain",
            "bestUse": "Stock illustrations and photos",
            "reliability": "Medium",
            "searchFormat": "direct"
        },
        {
            "name": "Google Arts & Culture",
            "url": "https://artsandculture.google.com/search?q={}",
            "licensing": "Mixed (check individual items)",
            "bestUse": "Museum collections, artworks",
            "reliability": "High",
            "searchFormat": "direct"
        },
        {
            "name": "British Library",
            "url": "https://www.bl.uk/catalogues-and-collections/digital-collections?q={}",
            "licensing": "Public Domain",
            "bestUse": "Historical documents, illustrations",
            "reliability": "High",
            "searchFormat": "direct"
        },
        {
            "name": "Smithsonian Collections",
            "url": "https://collections.si.edu/search/results.htm?q={}",
            "licensing": "Public Domain",
            "bestUse": "Artifacts, historical objects",
            "reliability": "High",
            "searchFormat": "direct"
        },
        {
            "name": "National Archives",
            "url": "https://catalog.archives.gov/search?q={}",
            "licensing": "Public Domain",
            "bestUse": "Historical documents, government records",
            "reliability": "High",
            "searchFormat": "direct"
        },
        {
            "name": "Europeana",
            "url": "https://www.europeana.eu/en/search?page=1&query={}",
            "licensing": "Mixed (check individual items)",
            "bestUse": "European cultural heritage",
            "reliability": "Medium",
            "searchFormat": "direct"
        },
        {
            "name": "Metropolitan Museum",
            "url": "https://www.metmuseum.org/art/collection/search#!?q={}",
            "licensing": "Public Domain",
            "bestUse": "Artworks, artifacts",
            "reliability": "High",
            "searchFormat": "direct"
        },
        {
            "name": "Rijksmuseum",
            "url": "https://www.rijksmuseum.nl/en/search?q={}",
            "licensing": "Public Domain",
            "bestUse": "Dutch art and history",
            "reliability": "High",
            "searchFormat": "direct"
        },
        {
            "name": "Getty Museum",
            "url": "https://www.getty.edu/art/collection/search?q={}",
            "licensing": "Public Domain",
            "bestUse": "Artworks, photographs",
            "reliability": "High",
            "searchFormat": "direct"
        },
        {
            "name": "NASA Images",
            "url": "https://images.nasa.gov/search-results?q={}",
            "licensing": "Public Domain",
            "bestUse": "Space exploration, scientific imagery",
            "reliability": "High",
            "searchFormat": "direct"
        },
        {
            "name": "Unsplash",
            "url": "https://unsplash.com/s/photos/{}",
            "licensing": "Free to use",
            "bestUse": "Modern photography, stock images",
            "reliability": "Medium",
            "searchFormat": "direct"
        }
    ]
}

# Search strategies for different content types
search_strategies = {
    "portraits": {
        "primarySources": ["Wikimedia Commons", "Library of Congress", "NYPL Free to Use Collections"],
        "searchTerms": ["portrait", "painting", "bust", "statue", "engraving"],
        "licensing": "Public Domain"
    },
    "achievements": {
        "primarySources": ["Wikimedia Commons", "Internet Archive", "Smithsonian Collections"],
        "searchTerms": ["invention", "discovery", "work", "achievement", "contribution"],
        "licensing": "Public Domain / Creative Commons"
    },
    "inventions": {
        "primarySources": ["Wikimedia Commons", "Internet Archive", "Metropolitan Museum"],
        "searchTerms": ["invention", "device", "machine", "tool", "apparatus"],
        "licensing": "Public Domain / Creative Commons"
    },
    "artifacts": {
        "primarySources": ["Smithsonian Collections", "Metropolitan Museum", "Rijksmuseum"],
        "searchTerms": ["artifact", "object", "relic", "item", "piece"],
        "licensing": "Public Domain"
    }
}

def get_image_links_enhanced(figure_name, content_type="portraits"):
    """
    Enhanced image search function with content type targeting
    """
    image_links = {}
    strategy = search_strategies.get(content_type, search_strategies["portraits"])
    
    # Get relevant sources for this content type
    relevant_sources = []
    for source in image_sources["primarySources"] + image_sources["secondarySources"]:
        if source["name"] in strategy["primarySources"]:
            relevant_sources.append(source)
    
    # Add secondary sources if primary sources don't have enough results
    for source in image_sources["secondarySources"]:
        if source not in relevant_sources:
            relevant_sources.append(source)
    
    for source in relevant_sources:
        try:
            # Create search terms combining figure name with content type terms
            search_terms = []
            for term in strategy["searchTerms"]:
                search_terms.append(f"{figure_name} {term}")
            
            # Try each search term
            for search_term in search_terms[:3]:  # Limit to first 3 terms
                formatted_url = source["url"].format(quote_plus(search_term))
                
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
                
                response = requests.get(formatted_url, headers=headers, timeout=10)
                if response.status_code == 200:
                    soup = BeautifulSoup(response.text, 'html.parser')
                    
                    # Extract image links based on source type
                    links = []
                    if "wikimedia" in source["url"].lower():
                        # Wikimedia specific extraction
                        for img in soup.find_all('img', src=True):
                            if 'http' in img['src'] and ('thumb' in img['src'] or 'commons' in img['src']):
                                links.append(img['src'])
                    elif "loc.gov" in source["url"]:
                        # Library of Congress specific extraction
                        for img in soup.find_all('img', src=True):
                            if 'http' in img['src'] and 'loc.gov' in img['src']:
                                links.append(img['src'])
                    else:
                        # Generic image extraction
                        for img in soup.find_all('img', src=True):
                            if 'http' in img['src']:
                                links.append(img['src'])
                    
                    if links:
                        image_links[source["name"]] = {
                            "urls": links[:5],  # Limit to first 5 images
                            "licensing": source["licensing"],
                            "reliability": source["reliability"],
                            "searchTerm": search_term
                        }
                        break  # Found images for this source, move to next
                
                time.sleep(1)  # Be respectful to servers
                
        except Exception as e:
            print(f"Error searching {source['name']} for {figure_name}: {str(e)}")
            continue
    
    return image_links

def generate_figure_image_data():
    """
    Generate comprehensive image data for all historical figures
    """
    figure_image_data = {}
    
    for figure in historical_figures:
        print(f"Fetching images for {figure}...")
        
        figure_data = {
            "portraits": get_image_links_enhanced(figure, "portraits"),
            "achievements": get_image_links_enhanced(figure, "achievements"),
            "inventions": get_image_links_enhanced(figure, "inventions"),
            "artifacts": get_image_links_enhanced(figure, "artifacts")
        }
        
        figure_image_data[figure] = figure_data
        
        # Save progress periodically
        if len(figure_image_data) % 10 == 0:
            with open('figure_image_progress.json', 'w') as f:
                json.dump(figure_image_data, f, indent=2)
    
    return figure_image_data

def save_image_data_to_json(data, filename='orbGameFiguresImageData.json'):
    """
    Save the image data to a JSON file
    """
    with open(filename, 'w') as f:
        json.dump(data, f, indent=2)
    print(f"Image data saved to {filename}")

if __name__ == "__main__":
    # Generate comprehensive image data
    print("Starting enhanced image search for historical figures...")
    figure_image_data = generate_figure_image_data()
    
    # Save the complete dataset
    save_image_data_to_json(figure_image_data)
    
    # Output sample data for verification
    if "Archimedes" in figure_image_data:
        print("\nSample data for Archimedes:")
        print(json.dumps(figure_image_data["Archimedes"], indent=2))
    
    print(f"\nCompleted image search for {len(figure_image_data)} historical figures.")
