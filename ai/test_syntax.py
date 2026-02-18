import sys
try:
    from matcher import JobMatcher
    print("SUCCESS: JobMatcher imported successfully.")
except Exception as e:
    print(f"FAILURE: {e}")
    sys.exit(1)
