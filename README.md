# Taxplore

## A simple tool that aims to answer: "Where are my taxes going?"

Searches the public Government of Canada databases of contract tenders to find how the government is spending your tax dollars on different areas.

<img width="1625" alt="image" src="https://github.com/user-attachments/assets/35f404a1-ffe9-40bb-bd4e-7ece00914aad">

Built in 16 hours for the Llama 3.1 Impact Hackathon @ Toronto!

## Uses of LLama 3.1

Llama 3.1 and 3.2 is a critical part of this project. For the RAG process, we found that the raw table data "CanadaData.csv" was not comprehensible. We used Llama 3.2 (11B) on a H100 server to convert each row into a seachable, filterable entry and to rephrase the data in a more human-readable and concise format. This greatly improved the quality of the final LLM results.

Additionally, we use Llama 3.1 8B through the Groq API for our generation functionality. We use in-context learning techniques to help the model learn about context about the user's query and generate an accurate response. Using Groq and Llama 3.1, enables us to access "insanely" fast inference times, making our tool closer to a search engine than a traditional chatbot.

### Per-file use

You can find uses of Llama 3 models in the following files:

- nebius/server.py (used to preprocess data)
- app/(preview)/api/completion/route.ts (used to generate completions with groq)
