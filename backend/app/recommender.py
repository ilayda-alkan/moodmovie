import os
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "movies.csv")

movies_df = pd.read_csv(DATA_PATH)

EMOTION_TO_GENRES = {
    "mutlu": ["Comedy", "Adventure", "Animation", "Family"],
    "huzurlu": ["Family", "Fantasy", "Adventure", "Romance"],
    "heyecanlı": ["Action", "Adventure", "Sci-Fi", "Thriller"],
    "romantik": ["Romance", "Drama", "Comedy"],
    "üzgün": ["Drama", "Romance", "Family"],
    "yalnız": ["Drama", "Mystery", "Romance"],
    "nostaljik": ["Drama", "Romance", "Musical"],
    "kaygılı": ["Comedy", "Animation", "Family", "Fantasy"],
    "gergin": ["Thriller", "Action", "Crime"],
    "öfkeli": ["Action", "Crime", "Thriller"],
    "korkmuş": ["Thriller", "Mystery", "Horror"],
    "şaşkın": ["Mystery", "Sci-Fi", "Adventure"],
    "nötr": ["Adventure", "Sci-Fi", "Fantasy"],
}


def _build_genre_pattern(primary_emotion: str, secondary_emotion: str | None):
    genres = []
    genres.extend(EMOTION_TO_GENRES.get(primary_emotion, []))
    if secondary_emotion:
        for genre in EMOTION_TO_GENRES.get(secondary_emotion, []):
            if genre not in genres:
                genres.append(genre)

    if not genres:
        genres = ["Drama"]

    return "|".join(genres), genres


def recommend_movies_for_profile(profile: dict, k: int = 10):
    primary_emotion = (profile.get("primary_emotion") or "nötr").lower()
    secondary_emotion = profile.get("secondary_emotion")
    if secondary_emotion:
        secondary_emotion = secondary_emotion.lower()

    pattern, target_genres = _build_genre_pattern(primary_emotion, secondary_emotion)

    mask = movies_df["genres"].str.contains(pattern, case=False, na=False)
    subset = movies_df[mask]

    if subset.empty:
        subset = movies_df

    sample = subset.sample(n=min(k, len(subset)))
    return [
        {
            "movieId": int(row["movieId"]),
            "title": row["title"],
            "genres": row["genres"],
            "match_reason": ", ".join(target_genres[:3]),
        }
        for _, row in sample.iterrows()
    ]
