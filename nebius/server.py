"""
File used on the Nebius H100 GPU server
to summarize the CanadaData.csv dataset
to improve RAG performance significantly.
"""

from pydantic import BaseModel, Field
from vllm import LLM, SamplingParams
import pandas as pd
from typing import List, Optional
from tqdm import tqdm

from vllm.sampling_params import GuidedDecodingParams

df = pd.read_csv("CanadaData.csv")

from typing import Literal


class Entry(BaseModel):
    """
    One entry row represents a specific government tender announcement. It includes details such as the department or agency posting the tender, the procurement category (e.g. construction, goods, services, or services related to goods), a brief description of the project or goods/services being sought, the estimated value of the contract, and other relevant information. Each row provides a snapshot of a single tender announcement, allowing users to explore and analyze government procurement data.
    """

    CONTRACT_ID: str

    type: str
    department: str
    procurement_category: str

    short_summary: str = Field(
        ...,
        description="A 2 sentence description of the project or goods/services being sought.",
    )

    description: str = Field(
        ...,
        description="A detailed description of the project or goods/services being sought.",
    )

    estimated_value: float = Field(
        ...,
        description="The estimated value of the full contract.",
    )

    date_posted: str = Field(
        ...,
        description="The date the tender was posted in the format YYYY-MM-DD.",
    )

    duration_in_months: str = Field(
        ...,
        description="The duration of the contract in months.",
    )

    provinces: List[
        Literal[
            "Ontario",
            "Quebec",
            "Nova Scotia",
            "New Brunswick",
            "Manitoba",
            "British Columbia",
            "Prince Edward Island",
            "Saskatchewan",
            "Alberta",
            "Newfoundland and Labrador",
            "Northwest Territories",
            "Yukon",
            "Nunavut",
        ]
    ] = Field(
        ...,
        description="A list of provinces affected by the contract. Be sure to use capitalization and full names.",
    )

    tags: List[str] = Field(
        ...,
        description="A list of tags that describe the tender announcement. Used to help filter and search for specific tenders.",
    )


def prompt(obj, idx):
    return f"""
You are an expert AI assistant. Can you please explain and format this row of data for me?


DATA:
{str(obj)}


OUTPUT IN JSON

THE CONTRACT ID IS: {idx}
""".strip()


# %%


guided_decoding_params = GuidedDecodingParams(json=Entry.model_json_schema())

sampling_params = SamplingParams(
    guided_decoding=guided_decoding_params, max_tokens=4000
)

llm = LLM(model="meta-llama/Llama-3.1-8B-Instruct", gpu_memory_utilization=0.85)


prompts = [prompt(row[1].to_json(), i) for i, row in enumerate(df.iterrows())]

# DO THESE IN BATCHES OF 200. WRITE EVERY OUTPUT TO A DIFFERENT FFILE WITH A UNIQUE UUID IN OUTPUT/{UUID}.JSON

import os
import uuid
import json

batch_size = 200
output_dir = "output"
os.makedirs(output_dir, exist_ok=True)

for i in range(0, len(prompts), batch_size):
    try:
        batch_prompts = prompts[i : i + batch_size]
        outputs = llm.generate(batch_prompts, sampling_params)

        for output in outputs:
            try:
                generated_text = output.outputs[0].text
                result = json.loads(generated_text)

                output_file = os.path.join(output_dir, f"{uuid.uuid4()}.json")
                with open(output_file, "w") as f:
                    json.dump(result, f, indent=4)
            except Exception as e:
                print(e)
    except Exception as e:
        print(e)
