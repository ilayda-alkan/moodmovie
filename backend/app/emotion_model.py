from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch


MODEL_NAME = "maymuni/bert-base-turkish-cased-emotion-analysis"

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, local_files_only=True)
model = AutoModelForSequenceClassification.from_pretrained(
    MODEL_NAME, local_files_only=True
)

DEFAULT_ID2LABEL = {
    0: "anger",
    1: "disgust",
    2: "fear",
    3: "happiness",
    4: "sadness",
    5: "surprise",
}

MODEL_LABEL_ALIASES = {
    "anger": "kızgın",
    "disgust": "iğrenme",
    "fear": "korku",
    "happiness": "mutlu",
    "sadness": "üzgün",
    "surprise": "şaşkın",
    "kızgın": "kızgın",
    "korku": "korku",
    "mutlu": "mutlu",
    "üzgün": "üzgün",
    "şaşkın": "şaşkın",
    "surpriz": "şaşkın",
    "iğrenme": "iğrenme",
}

TARGET_EMOTIONS = [
    "mutlu",
    "huzurlu",
    "heyecanlı",
    "romantik",
    "üzgün",
    "yalnız",
    "nostaljik",
    "kaygılı",
    "gergin",
    "öfkeli",
    "korkmuş",
    "şaşkın",
    "nötr",
]

BASE_LABEL_WEIGHTS = {
    "kızgın": {"öfkeli": 1.0, "gergin": 0.55},
    "iğrenme": {"öfkeli": 0.7, "gergin": 0.45},
    "korku": {"kaygılı": 0.95, "korkmuş": 0.92, "gergin": 0.5},
    "mutlu": {
        "mutlu": 0.85,
        "huzurlu": 0.45,
        "heyecanlı": 0.3,
        "romantik": 0.2,
    },
    "üzgün": {
        "üzgün": 0.95,
        "yalnız": 0.6,
        "nostaljik": 0.52,
        "nötr": 0.08,
    },
    "şaşkın": {"şaşkın": 0.95, "heyecanlı": 0.55},
}

KEYWORD_RULES = {
    "mutlu": [
        "mutluyum",
        "mutlu hissediyorum",
        "çok mutluyum",
        "çok mutlu hissediyorum",
        "bugün mutluyum",
        "sevindim",
        "çok sevindim",
        "harika hissediyorum",
        "keyfim yerinde",
        "moralim çok iyi",
    ],
    "huzurlu": [
        "huzurluyum",
        "huzurlu hissediyorum",
        "çok huzurluyum",
        "içim rahat",
        "rahatlamış hissediyorum",
        "rahat hissediyorum",
        "dinginim",
        "sakin hissediyorum",
        "sakinim",
    ],
    "heyecanlı": [
        "heyecanlıyım",
        "heyecanlı hissediyorum",
        "çok heyecanlıyım",
        "çok heyecanlı hissediyorum",
        "sabırsızlanıyorum",
        "içim içime sığmıyor",
    ],
    "romantik": [
        "romantik hissediyorum",
        "romantik bir ruh halindeyim",
        "aşığım",
        "aşık oldum",
        "kalbim kıpır kıpır",
        "özledim",
        "aşk",
    ],
    "üzgün": [
        "üzgünüm",
        "üzgün hissediyorum",
        "çok üzgünüm",
        "moralim bozuk",
        "kederliyim",
        "hüzünlüyüm",
        "canım sıkkın",
        "içimden hiçbir şey gelmiyor",
    ],
    "yalnız": [
        "yalnızım",
        "yalnız hissediyorum",
        "tek başımayım",
        "kimsem yok",
    ],
    "nostaljik": [
        "nostaljik hissediyorum",
        "eski günleri özledim",
        "geçmişi özledim",
        "çocukluğumu özledim",
        "anılar aklıma geldi",
    ],
    "kaygılı": [
        "kaygılıyım",
        "kaygılı hissediyorum",
        "endişeliyim",
        "stresliyim",
        "içim daralıyor",
        "tedirginim",
    ],
    "gergin": [
        "gerginim",
        "gergin hissediyorum",
        "çok gerginim",
        "bunaldım",
        "gerildim",
        "sıkıştım kaldım",
    ],
    "öfkeli": [
        "öfkeliyim",
        "öfkeli hissediyorum",
        "sinirliyim",
        "çok kızgınım",
        "delirmek üzereyim",
        "sinir oldum",
    ],
    "korkmuş": [
        "korkuyorum",
        "korkmuş hissediyorum",
        "çok korktum",
        "ödüm koptu",
    ],
    "şaşkın": [
        "şaşkınım",
        "şaşkın hissediyorum",
        "inanamıyorum",
        "şok oldum",
        "beklemiyordum",
    ],
    "nötr": [
        "nötr hissediyorum",
        "normal hissediyorum",
        "normalim",
        "idare eder",
        "fena değilim",
    ],
}

NEGATIVE_SIGNAL_RULES = {
    "mutlu": ["üzgün", "canım sıkkın", "moralim bozuk", "stresliyim", "öfkeliyim"],
    "huzurlu": ["stresliyim", "gerginim", "kaygılıyım", "endişeliyim", "canım sıkkın"],
    "romantik": ["sinirliyim", "öfkeliyim", "gerginim"],
}

EXPLICIT_OVERRIDE_EMOTIONS = {
    "huzurlu",
    "heyecanlı",
    "romantik",
    "üzgün",
    "yalnız",
    "nostaljik",
    "kaygılı",
    "gergin",
    "öfkeli",
    "korkmuş",
    "şaşkın",
}

INTENSITY_HINTS = {
    "yüksek": ["çok", "aşırı", "fazlasıyla", "resmen"],
    "düşük": ["biraz", "galiba", "sanırım", "hafif", "bir tık"],
}

id2label = getattr(model.config, "id2label", DEFAULT_ID2LABEL)


def normalize_text(text: str) -> str:
    return (
        text.replace("I", "ı")
        .replace("İ", "i")
        .lower()
        .strip()
    )


def simplify_turkish(text: str) -> str:
    replacements = str.maketrans(
        {
            "ı": "i",
            "ö": "o",
            "ü": "u",
            "ğ": "g",
            "ş": "s",
            "ç": "c",
        }
    )
    return text.translate(replacements)


def normalize_label(label: str) -> str:
    normalized = normalize_text(label)
    simplified = simplify_turkish(normalized)
    return MODEL_LABEL_ALIASES.get(normalized, MODEL_LABEL_ALIASES.get(simplified, normalized))


def predict_emotion_distribution(text: str):
    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=128,
    )

    with torch.no_grad():
        outputs = model(**inputs)
        probs = torch.softmax(outputs.logits, dim=1)[0]

    distribution = {}
    for idx, probability in enumerate(probs.tolist()):
        raw_label = id2label.get(idx, str(idx))
        label = normalize_label(raw_label)
        distribution[label] = distribution.get(label, 0.0) + float(probability)

    return distribution


def count_phrase_matches(text: str, phrase: str) -> int:
    normalized_phrase = normalize_text(phrase)
    simplified_text = simplify_turkish(text)
    simplified_phrase = simplify_turkish(normalized_phrase)

    return int(
        normalized_phrase in text
        or simplified_phrase in simplified_text
    )


def apply_keyword_rules(normalized_text: str, emotion_scores: dict):
    for emotion, phrases in KEYWORD_RULES.items():
        matches = sum(count_phrase_matches(normalized_text, phrase) for phrase in phrases)
        if matches:
            base_bonus = 1.15 + (0.35 * (matches - 1))
            if emotion in EXPLICIT_OVERRIDE_EMOTIONS:
                base_bonus += 0.9
                emotion_scores["mutlu"] = max(0.0, emotion_scores["mutlu"] - (0.55 * matches))
                emotion_scores["huzurlu"] = max(0.0, emotion_scores["huzurlu"] - (0.25 * matches))
            emotion_scores[emotion] += base_bonus

    for emotion, phrases in NEGATIVE_SIGNAL_RULES.items():
        matches = sum(count_phrase_matches(normalized_text, phrase) for phrase in phrases)
        if matches:
            emotion_scores[emotion] = max(0.0, emotion_scores[emotion] - (0.35 * matches))


def build_emotion_profile(text: str):
    normalized_text = normalize_text(text)
    base_distribution = predict_emotion_distribution(text)

    emotion_scores = {emotion: 0.0 for emotion in TARGET_EMOTIONS}

    for base_label, probability in base_distribution.items():
        for emotion, weight in BASE_LABEL_WEIGHTS.get(base_label, {}).items():
            emotion_scores[emotion] += probability * weight

    apply_keyword_rules(normalized_text, emotion_scores)

    if any(symbol in text for symbol in ["!", "!!", "?!"]):
        emotion_scores["heyecanlı"] += 0.08
        emotion_scores["öfkeli"] += 0.04
        emotion_scores["şaşkın"] += 0.06

    if any(word in normalized_text for word in ["ama", "fakat", "yine de"]):
        emotion_scores["nötr"] += 0.06

    total_score = sum(emotion_scores.values())
    if total_score <= 0:
        emotion_scores["nötr"] = 1.0
        total_score = 1.0

    ranked_emotions = sorted(
        (
            {
                "emotion": emotion,
                "score": round(score, 4),
                "percentage": round((score / total_score) * 100, 2),
            }
            for emotion, score in emotion_scores.items()
            if score > 0
        ),
        key=lambda item: item["score"],
        reverse=True,
    )

    primary = ranked_emotions[0] if ranked_emotions else {"emotion": "nötr", "percentage": 100.0}

    intensity = "orta"
    if any(word in normalized_text for word in INTENSITY_HINTS["yüksek"]) or text.count("!") >= 2:
        intensity = "yüksek"
    elif any(word in normalized_text for word in INTENSITY_HINTS["düşük"]):
        intensity = "düşük"
    elif primary["percentage"] >= 55:
        intensity = "yüksek"
    elif primary["percentage"] <= 22:
        intensity = "düşük"

    return {
        "primary_emotion": primary["emotion"],
        "emotion_label": max(base_distribution, key=base_distribution.get),
        "confidence": round(max(base_distribution.values()) if base_distribution else 0.0, 4),
        "intensity": intensity,
        "top_emotions": ranked_emotions[:4],
        "emotion_distribution": base_distribution,
    }
