import os
import json
from tqdm import tqdm
import ollama

from pinecone import Pinecone


# # Load the Pinecone API key from the environment variable
api_key = os.environ["PINECONE_API_KEY"]

pc = Pinecone(api_key=api_key)
index = pc.Index("gov-nomic")

# # Load the data into the Pinecone index

files = [
    f"llama_summaries/{file}"
    for file in os.listdir("llama_summaries")
    if file.endswith(".json")
]


# for file in tqdm(files):
#     with open(file, "r") as f:
#         data = json.load(f)
#         to_embed = "\n".join(f"{k}: {v}" for k, v in data.items())

#         emebddings = ollama.embed(input=to_embed, model="nomic-embed-text")

#         # index.upsert(items=[{"id": file, "embedding": emebddings[0]}])
#         em = emebddings.embeddings[0]
#         print(em, type(em), len(em))
#         break
batch_size = 200
embeddings_batch = []
data_batch = []

for file in tqdm(files):
    with open(file, "r") as f:
        data = json.load(f)
        to_embed = "\n".join(f"{k}: {v}" for k, v in data.items())
        emebddings = ollama.embed(input=to_embed, model="nomic-embed-text")
        em = emebddings.embeddings[0]
        embeddings_batch.append(em)
        data_batch.append(data)

        if len(embeddings_batch) >= batch_size:
            try:
                vectors = [
                    {"id": file, "values": em, "metadata": data}
                    for em, data in zip(embeddings_batch, data_batch)
                ]
                index.upsert(vectors=vectors)
            except Exception as e:
                print(e)

            embeddings_batch = []
            data_batch = []

# Process remaining items if any
if embeddings_batch:
    vectors = [
        {"id": file, "values": em, "metadata": data}
        for em, data in zip(embeddings_batch, data_batch)
    ]
    index.upsert(vectors=vectors)
    embeddings_batch = []
    data_batch = []
