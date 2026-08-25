# =========================================================
# VIDÉOS YOUTUBE - DESKBOT
# =========================================================

import os
import json
import requests
from pathlib import Path


# =========================================================
# CONFIGURATION
# =========================================================

YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3"

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
ABONNEMENTS_FILE = DATA_DIR / "youtube_abonnements.json"

DATA_DIR.mkdir(exist_ok=True)


# =========================================================
# API KEY
# =========================================================

def obtenir_cle_api():
    """
    Récupère la clé API YouTube depuis la variable
    d'environnement YOUTUBE_API_KEY.
    """

    cle = os.getenv("YOUTUBE_API_KEY")

    if not cle:
        print("❌ Variable YOUTUBE_API_KEY introuvable.")

    return cle


# =========================================================
# REQUÊTE API
# =========================================================

def requete_youtube(endpoint, params):
    """
    Effectue une requête vers l'API YouTube Data API v3.
    """

    cle = obtenir_cle_api()

    if not cle:
        return None

    params = dict(params)
    params["key"] = cle

    try:
        response = requests.get(
            f"{YOUTUBE_API_URL}/{endpoint}",
            params=params,
            timeout=15
        )

        if response.status_code != 200:
            print(
                "❌ Erreur YouTube API :",
                response.status_code,
                response.text
            )
            return None

        return response.json()

    except requests.RequestException as e:
        print(f"❌ Erreur réseau YouTube : {e}")
        return None


# =========================================================
# FORMATAGE VIDÉO
# =========================================================

def formater_video(video):
    """
    Transforme une vidéo YouTube en objet utilisable
    directement par le JavaScript.
    """

    snippet = video.get("snippet", {})
    video_id = video.get("id")

    if isinstance(video_id, dict):
        video_id = video_id.get("videoId")

    if not video_id:
        return None

    thumbnails = snippet.get("thumbnails", {})

    miniature = (
        thumbnails.get("maxres", {}).get("url")
        or thumbnails.get("high", {}).get("url")
        or thumbnails.get("medium", {}).get("url")
        or thumbnails.get("default", {}).get("url")
    )

    return {
        "id": video_id,
        "titre": snippet.get("title", "Sans titre"),
        "description": snippet.get("description", ""),
        "chaine": snippet.get("channelTitle", "Chaîne inconnue"),
        "channel_id": snippet.get("channelId"),
        "date": snippet.get("publishedAt"),
        "miniature": miniature,
        "url": f"https://www.youtube.com/watch?v={video_id}"
    }


# =========================================================
# RECHERCHE DE VIDÉOS
# =========================================================

def rechercher_videos(recherche, nombre=24):
    """
    Recherche des vidéos YouTube.
    """

    if not recherche or not recherche.strip():
        return []

    nombre = max(1, min(int(nombre), 50))

    data = requete_youtube(
        "search",
        {
            "part": "snippet",
            "q": recherche.strip(),
            "type": "video",
            "maxResults": nombre,
            "order": "relevance",
            "regionCode": "FR",
            "relevanceLanguage": "fr"
        }
    )

    if not data:
        return []

    videos = []

    for item in data.get("items", []):
        video = formater_video(item)

        if video:
            videos.append(video)

    return videos


# =========================================================
# VIDÉO PAR ID
# =========================================================

def obtenir_video(video_id):
    """
    Récupère les informations d'une vidéo précise.
    """

    if not video_id:
        return None

    data = requete_youtube(
        "videos",
        {
            "part": "snippet,contentDetails,statistics",
            "id": video_id
        }
    )

    if not data or not data.get("items"):
        return None

    video = formater_video(data["items"][0])

    if not video:
        return None

    item = data["items"][0]

    statistiques = item.get("statistics", {})
    contenu = item.get("contentDetails", {})

    video["vues"] = statistiques.get("viewCount", 0)
    video["likes"] = statistiques.get("likeCount", 0)
    video["duree"] = contenu.get("duration")

    return video


# =========================================================
# ABONNEMENTS
# =========================================================

def charger_abonnements():
    """
    Charge les abonnements depuis youtube_abonnements.json.
    """

    if not ABONNEMENTS_FILE.exists():
        return []

    try:
        with open(
            ABONNEMENTS_FILE,
            "r",
            encoding="utf-8"
        ) as fichier:
            donnees = json.load(fichier)

        if not isinstance(donnees, list):
            return []

        return donnees

    except (json.JSONDecodeError, OSError):
        return []


def sauvegarder_abonnements(abonnements):
    """
    Sauvegarde les abonnements.
    """

    try:
        with open(
            ABONNEMENTS_FILE,
            "w",
            encoding="utf-8"
        ) as fichier:
            json.dump(
                abonnements,
                fichier,
                ensure_ascii=False,
                indent=4
            )

        return True

    except OSError as e:
        print(f"❌ Impossible de sauvegarder les abonnements : {e}")
        return False


def ajouter_abonnement(channel_id, nom=None):
    """
    Ajoute une chaîne aux abonnements.
    """

    if not channel_id:
        return False

    abonnements = charger_abonnements()

    for abonnement in abonnements:
        if abonnement.get("channel_id") == channel_id:
            return True

    abonnements.append({
        "channel_id": channel_id,
        "nom": nom or "Chaîne inconnue"
    })

    return sauvegarder_abonnements(abonnements)


def supprimer_abonnement(channel_id):
    """
    Supprime une chaîne des abonnements.
    """

    abonnements = charger_abonnements()

    nouveaux = [
        abonnement
        for abonnement in abonnements
        if abonnement.get("channel_id") != channel_id
    ]

    if len(nouveaux) == len(abonnements):
        return False

    return sauvegarder_abonnements(nouveaux)


def est_abonne(channel_id):
    """
    Vérifie si une chaîne est actuellement suivie.
    """

    return any(
        abonnement.get("channel_id") == channel_id
        for abonnement in charger_abonnements()
    )


def obtenir_abonnements():
    """
    Retourne tous les abonnements.
    """

    return charger_abonnements()


# =========================================================
# VIDÉOS D'UNE CHAÎNE
# =========================================================

def obtenir_videos_chaine(channel_id, nombre=12):
    """
    Récupère les vidéos récentes d'une chaîne.
    """

    if not channel_id:
        return []

    nombre = max(1, min(int(nombre), 50))

    data = requete_youtube(
        "search",
        {
            "part": "snippet",
            "channelId": channel_id,
            "type": "video",
            "order": "date",
            "maxResults": nombre
        }
    )

    if not data:
        return []

    videos = []

    for item in data.get("items", []):
        video = formater_video(item)

        if video:
            videos.append(video)

    return videos


# =========================================================
# RECOMMANDATIONS
# =========================================================

def obtenir_recommandations(nombre=24):
    """
    Génère une page d'accueil personnalisée.

    Les chaînes auxquelles l'utilisateur est abonné
    ont davantage de poids dans les recommandations.
    """

    nombre = max(1, min(int(nombre), 50))

    abonnements = charger_abonnements()

    recommandations = []
    ids_deja_vus = set()

    # -----------------------------------------------------
    # 1. Vidéos des abonnements
    # -----------------------------------------------------

    for abonnement in abonnements:
        channel_id = abonnement.get("channel_id")

        if not channel_id:
            continue

        videos = obtenir_videos_chaine(
            channel_id,
            nombre=6
        )

        for video in videos:
            if video["id"] in ids_deja_vus:
                continue

            video["source"] = "abonnement"

            recommandations.append(video)
            ids_deja_vus.add(video["id"])

    # -----------------------------------------------------
    # 2. Compléter avec une recherche générale
    # -----------------------------------------------------

    if len(recommandations) < nombre:

        recherches = [
            "technologie",
            "gaming",
            "science",
            "informatique",
            "actualité",
            "divertissement"
        ]

        for recherche in recherches:

            videos = rechercher_videos(
                recherche,
                nombre=8
            )

            for video in videos:

                if video["id"] in ids_deja_vus:
                    continue

                video["source"] = "general"

                recommandations.append(video)
                ids_deja_vus.add(video["id"])

                if len(recommandations) >= nombre:
                    break

            if len(recommandations) >= nombre:
                break

    return recommandations[:nombre]


# =========================================================
# RECHERCHE DE CHAÎNES
# =========================================================

def rechercher_chaines(recherche, nombre=10):
    """
    Recherche des chaînes YouTube.
    """

    if not recherche or not recherche.strip():
        return []

    nombre = max(1, min(int(nombre), 50))

    data = requete_youtube(
        "search",
        {
            "part": "snippet",
            "q": recherche.strip(),
            "type": "channel",
            "maxResults": nombre,
            "regionCode": "FR",
            "relevanceLanguage": "fr"
        }
    )

    if not data:
        return []

    chaines = []

    for item in data.get("items", []):

        snippet = item.get("snippet", {})
        channel_id = item.get("id", {}).get("channelId")

        if not channel_id:
            continue

        thumbnails = snippet.get("thumbnails", {})

        avatar = (
            thumbnails.get("high", {}).get("url")
            or thumbnails.get("medium", {}).get("url")
            or thumbnails.get("default", {}).get("url")
        )

        chaines.append({
            "channel_id": channel_id,
            "nom": snippet.get(
                "title",
                "Chaîne inconnue"
            ),
            "description": snippet.get(
                "description",
                ""
            ),
            "avatar": avatar,
            "abonne": est_abonne(channel_id)
        })

    return chaines