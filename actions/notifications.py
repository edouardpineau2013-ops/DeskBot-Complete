import threading
from datetime import datetime
from audio.voix import notifier_telephone

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

    delai = (date_notification - maintenant).total_seconds()

    def attendre_et_notifier():
        threading.Event().wait(delai)
        notifier_telephone("🔔 Notification du DeskBot", contenu)

    threading.Thread(
        target=attendre_et_notifier,
        daemon=True
    ).start()