import sys
print(f"Python: {sys.version}")

try:
    import spacy
    print("spacy imported")
    try:
        nlp = spacy.load("en_core_web_sm")
        print("model loaded")
    except Exception as e:
        print(f"model load failed: {e}")
except ImportError:
    print("spacy missing")

try:
    import sklearn
    print("sklearn imported")
except ImportError:
    print("sklearn missing")
