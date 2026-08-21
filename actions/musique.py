from rapidfuzz import process
from yt_dlp import YoutubeDL


# ============================================================
# LECTEUR GLOBAL
# ============================================================

player = None
vlc_instance = None


# ============================================================
# MUSIQUES
# ============================================================

MUSIQUES = {

    "lofi relax":
        "https://www.youtube.com/watch?v=cyzx45mupcQ",

    "lofi pour coder":
        "https://www.youtube.com/watch?v=fhL67fnDXcU",

    "lofi pour travailler":
        "https://www.youtube.com/watch?v=JCKBaJDRMw4",

    "lofi pour dormir":
        "https://www.youtube.com/watch?v=eTP5PZ8NoeU",

    "lofi pour se concentrer":
        "https://www.youtube.com/watch?v=8b3fqIBrNW0",

    "lofi gaming":
        "https://www.youtube.com/watch?v=cyzx45mupcQ",

}


# ============================================================
# CHARGEMENT DE VLC
# ============================================================

def obtenir_vlc():

    try:

        import vlc

        return vlc

    except ImportError:

        print(
            "🎵 VLC n'est pas disponible sur cet environnement."
        )

        return None


# ============================================================
# JOUER UNE MUSIQUE
# ============================================================

def jouer_musique(texte):

    global player
    global vlc_instance

    texte = texte.lower()

    # Enlever les mots inutiles
    for mot in [
        "mets",
        "met",
        "joue",
        "lance",
        "écoute",
        "musique"
    ]:

        texte = texte.replace(mot, "")

    texte = texte.strip()

    resultat = process.extractOne(
        texte,
        MUSIQUES.keys(),
        score_cutoff=60
    )

    if resultat is None:
        return "Je ne connais pas cette musique."

    nom = resultat[0]
    url = MUSIQUES[nom]

    # --------------------------------------------------------
    # Vérification VLC
    # --------------------------------------------------------

    vlc = obtenir_vlc()

    if vlc is None:

        return (
            "La musique n'est pas disponible "
            "sur ce serveur."
        )

    # --------------------------------------------------------
    # Récupération de l'audio YouTube
    # --------------------------------------------------------

    ydl_opts = {
        "format": "bestaudio",
        "quiet": True,
        "noplaylist": True,
    }

    try:

        with YoutubeDL(ydl_opts) as ydl:

            info = ydl.extract_info(
                url,
                download=False
            )

            audio_url = info["url"]

    except Exception as e:

        print(
            "❌ Erreur récupération musique :",
            e
        )

        return "Impossible de récupérer cette musique."

    # --------------------------------------------------------
    # Arrêter la musique précédente
    # --------------------------------------------------------

    if player is not None:

        try:
            player.stop()

        except Exception:
            pass

    # --------------------------------------------------------
    # Création du lecteur VLC
    # --------------------------------------------------------

    try:

        vlc_instance = vlc.Instance(
            "--no-video"
        )

        media = vlc_instance.media_new(
            audio_url
        )

        player = vlc_instance.media_player_new()

        player.set_media(media)

        player.play()

    except Exception as e:

        print(
            "❌ Erreur VLC :",
            e
        )

        player = None

        return (
            "Impossible de démarrer "
            "la lecture audio."
        )

    return f"Je lance {nom}."


# ============================================================
# ARRÊTER
# ============================================================

def arreter_musique():

    global player

    if player is not None:

        try:
            player.stop()

        except Exception:
            pass

        player = None

        return "Musique arrêtée."

    return "Aucune musique n'est en cours."


# ============================================================
# PAUSE
# ============================================================

def pause_musique():

    global player

    if player is not None:

        try:

            player.pause()

            return "Musique en pause."

        except Exception:

            return "Impossible de mettre la musique en pause."

    return "Aucune musique."


# ============================================================
# VOLUME
# ============================================================

def volume_musique(volume):

    global player

    if player is None:
        return "Aucune musique."

    try:

        volume = max(
            0,
            min(100, volume)
        )

        player.audio_set_volume(
            volume
        )

        return (
            f"Volume réglé à {volume} pour cent."
        )

    except Exception as e:

        print(
            "❌ Erreur volume :",
            e
        )

        return "Impossible de régler le volume."


# ============================================================
# AUGMENTER LE VOLUME
# ============================================================

def augmenter_volume(pas=10):

    global player

    if player is None:
        return "Aucune musique."

    try:

        volume_actuel = player.audio_get_volume()

        if volume_actuel < 0:
            volume_actuel = 0

        nouveau_volume = max(
            0,
            min(
                100,
                volume_actuel + pas
            )
        )

        player.audio_set_volume(
            nouveau_volume
        )

        return (
            f"Volume monté à "
            f"{nouveau_volume} pour cent."
        )

    except Exception as e:

        print(
            "❌ Erreur augmentation volume :",
            e
        )

        return "Impossible d'augmenter le volume."


# ============================================================
# DIMINUER LE VOLUME
# ============================================================

def diminuer_volume(pas=10):

    global player

    if player is None:
        return "Aucune musique."

    try:

        volume_actuel = player.audio_get_volume()

        if volume_actuel < 0:
            volume_actuel = 0

        nouveau_volume = max(
            0,
            min(
                100,
                volume_actuel - pas
            )
        )

        player.audio_set_volume(
            nouveau_volume
        )

        return (
            f"Volume baissé à "
            f"{nouveau_volume} pour cent."
        )

    except Exception as e:

        print(
            "❌ Erreur diminution volume :",
            e
        )

        return "Impossible de diminuer le volume."
    volume_actuel = player.audio_get_volume()
    nouveau_volume = max(0, min(100, volume_actuel - pas))
    player.audio_set_volume(nouveau_volume)

    return f"Volume baissé à {nouveau_volume} pour cent."
