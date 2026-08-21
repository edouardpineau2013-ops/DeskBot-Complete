import threading
from datetime import datetime

import requests


TOPIC_NTFY = "deskbot_notifs"


def notifier_telephone(titre, message):
    try:
        response = requests.post(
            f"https://ntfy.sh/{TOPIC_NTFY}",
            data=message.encode("utf-8"),
            headers={
                "Title": titre
            },
            timeout=5
        )

        print("NTFY STATUS :", response.status_code)
        print("NTFY REPONSE :", response.text)

    except Exception as e:
        print("Erreur notification ntfy :", e)


def creer_notification(jour, mois, heure, minute, contenu):

    maintenant = datetime.now()

    date_notification = datetime(
        maintenant.year,
        mois,
        jour,
        heure,
        minute,
        0
    )

    # Si la date est déjà passée, on ne fait rien
    if date_notification <= maintenant:
        return

    delai = (
        date_notification - maintenant
    ).total_seconds()

    def attendre_et_notifier():

        threading.Event().wait(delai)

        notifier_telephone(
            "🔔 Notification du DeskBot",
            contenu
        )

    threading.Thread(
        target=attendre_et_notifier,
        daemon=True
    ).start()
