FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

RUN python -c "from transformers import AutoTokenizer, AutoModelForSequenceClassification; model_name='maymuni/bert-base-turkish-cased-emotion-analysis'; AutoTokenizer.from_pretrained(model_name); AutoModelForSequenceClassification.from_pretrained(model_name)"

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
