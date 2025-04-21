import litellm
import os
import logging
import json
from datetime import datetime

# Configure logging
log_directory = os.getenv("LOG_DIR", "logs")
os.makedirs(log_directory, exist_ok=True)
log_file = os.path.join(log_directory, f"llm_calls_{datetime.now().strftime('%Y%m%d')}.log")

# Set up logger
logger = logging.getLogger("llm_logger")
logger.setLevel(logging.INFO)
logger.propagate = False  # Prevent propagation to root logger
file_handler = logging.FileHandler(log_file)
file_handler.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))
logger.addHandler(file_handler)

# Simple cache configuration
cache_file = "llm_cache.json"

# By default, we Google Gemini 2.5 pro, as it shows great performance for code understanding
def call_llm(prompt: str, use_cache: bool = True) -> str:
    # Log the prompt
    logger.info(f"PROMPT: {prompt}")
    
    # Check cache if enabled
    if use_cache:
        # Load cache from disk
        cache = {}
        if os.path.exists(cache_file):
            try:
                with open(cache_file, 'r') as f:
                    cache = json.load(f)
            except:
                logger.warning(f"Failed to load cache, starting with empty cache")
        
        # Return from cache if exists
        if prompt in cache:
            logger.info(f"RESPONSE: {cache[prompt]}")
            return cache[prompt]
    
    model = os.getenv("GEMINI_MODEL", "gemini/gemini-2.5-pro-exp-03-25") # Keep using GEMINI_MODEL for now
    litellm_model_name = f"{model}"
    
    try:
        response = litellm.completion(
            api_key=os.getenv("AI_API_KEY"),
            model=litellm_model_name,
            messages=[{"role": "user", "content": prompt}]
        )
        # Extract the response text from the structured response
        response_text = response.choices[0].message.content
    except Exception as e:
        logger.error(f"LiteLLM call failed: {e}")
        # Reraise or return an error message
        raise e # Or return "LLM call failed."

    # Log the response
    logger.info(f"RESPONSE: {response_text}")
    
    # Update cache if enabled
    if use_cache:
        # Load cache again to avoid overwrites
        cache = {}
        if os.path.exists(cache_file):
            try:
                with open(cache_file, 'r') as f:
                    cache = json.load(f)
            except:
                pass
        
        # Add to cache and save
        cache[prompt] = response_text
        try:
            with open(cache_file, 'w') as f:
                json.dump(cache, f)
        except Exception as e:
            logger.error(f"Failed to save cache: {e}")
    
    return response_text

# # Use Anthropic Claude 3.7 Sonnet Extended Thinking (Example with litellm)
# def call_llm(prompt, use_cache: bool = True):
#     model = "claude-3-7-sonnet-20250219"
#     try:
#         response = litellm.completion(
#             model=model,
#             messages=[{"role": "user", "content": prompt}],
#             max_tokens=21000,
#             # Litellm might pass additional parameters differently, check docs
#             # For thinking parameters, you might need specific litellm config
#         )
#         response_text = response.choices[0].message.content
#     except Exception as e:
#         logger.error(f"LiteLLM call failed: {e}")
#         raise e
#     return response_text

# # Use OpenAI o1 (Example with litellm)
# def call_llm(prompt, use_cache: bool = True):
#     model="o1"
#     try:
#         response = litellm.completion(
#             model=model,
#             messages=[{"role": "user", "content": prompt}],
#             response_format={ # Check litellm docs for exact parameter names
#                 "type": "text"
#             },
#             # Reasoning effort and store might be passed via metadata or specific keys
#         )
#         response_text = response.choices[0].message.content
#     except Exception as e:
#         logger.error(f"LiteLLM call failed: {e}")
#         raise e
#     return response_text

if __name__ == "__main__":
    test_prompt = "Hello, how are you?"
    
    # First call - should hit the API
    print("Making call...")
    response1 = call_llm(test_prompt, use_cache=False)
    print(f"Response: {response1}")
    
