import os
import json
import threading
import time

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

from audio.voix import parler, notifier_telephone
from actions.notifications import notifier_telephone

SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]

FICHIER_VUS = "data/mails_vus.json"

gestionnaire_mails_lance = False


def _chemin_secret(nom):
    chemin_render = f"/etc/secrets/{nom}"

    if os.path.exists(chemin_render):
        return chemin_render

    return nom


def _chemin_token_mail():
    # Sur Render, le token initial vient du Secret File.
    # Le token rafraîchi est conservé temporairement dans /tmp.
    if os.path.exists("/etc/secrets/token_mail.json"):
        return "/tmp/token_mail.json"

    return "token_mail.json"


def _obtenir_service():
    creds = None

    fichier_token_source = _chemin_secret("token_mail.json")
    fichier_token = _chemin_token_mail()
    fichier_credentials = _chemin_secret("credentials_mail.json")

    # Récupération de la connexion déjà enregistrée
    if os.path.exists(fichier_token):
        creds = Credentials.from_authorized_user_file(
            fichier_token,
            SCOPES
        )

    elif os.path.exists(fichier_token_source):
        creds = Credentials.from_authorized_user_file(
            fichier_token_source,
            SCOPES
        )

        # Copie initiale dans /tmp sur Render
        if fichier_token != fichier_token_source:
            with open(fichier_token, "w", encoding="utf-8") as f:
                f.write(creds.to_json())

    # Connexion encore valide
    if creds and creds.valid:
        return build(
            "gmail",
            "v1",
            credentials=creds
        )

    # Token expiré mais renouvelable
    if creds and creds.expired and creds.refresh_token:
        try:
            creds.refresh(Request())

            with open(fichier_token, "w", encoding="utf-8") as f:
                f.write(creds.to_json())

            return build(
                "gmail",
                "v1",
                credentials=creds
            )

        except Exception as e:
            print("⚠️ Impossible de renouveler le token Gmail :", e)
            print("⚠️ Le refresh token est invalide.")
            return None

    # Première connexion
    if os.path.exists("/etc/secrets/token_mail.json"):
        print("❌ Token Gmail Render invalide ou expiré sans refresh token.")
        return None
    
    flow = InstalledAppFlow.from_client_secrets_file(
        fichier_credentials,
        SCOPES
    )
    
    creds = flow.run_local_server(port=0)

    with open(fichier_token, "w", encoding="utf-8") as f:
        f.write(creds.to_json())

    return build(
        "gmail",
        "v1",
        credentials=creds
    )


def _charger_vus():
    if not os.path.exists(FICHIER_VUS):
        return set()
    with open(FICHIER_VUS, "r") as f:
        return set(json.load(f))


def _sauvegarder_vus(vus):
    os.makedirs("data", exist_ok=True)
    with open(FICHIER_VUS, "w") as f:
        json.dump(list(vus), f)


def _extraire_expediteur_sujet(service, message_id):

    message = service.users().messages().get(
        userId="me", id=message_id, format="metadata",
        metadataHeaders=["From", "Subject"]
    ).execute()

    headers = {h["name"]: h["value"] for h in message["payload"]["headers"]}
    expediteur = headers.get("From", "expéditeur inconnu")
    sujet = headers.get("Subject", "(sans objet)")

    if "<" in expediteur:
        expediteur = expediteur.split("<")[0].strip().strip('"')

    return expediteur, sujet


def etat_mails_non_lus(max_details=100):
    """Retourne (nombre_total, [(expediteur, sujet), ...]) hors promotions."""

    service = _obtenir_service()

    resultat = service.users().messages().list(
        userId="me", q="in:inbox is:unread -category:promotions", maxResults=100
    ).execute()

    messages = resultat.get("messages", [])
    total = len(messages)

    details = []
    for message in messages[:max_details]:
        expediteur, sujet = _extraire_expediteur_sujet(service, message["id"])
        details.append((expediteur, sujet))

    return total, details


def verifier_nouveaux_mails():
    """Retourne les (expediteur, sujet) des mails non lus jamais vus avant."""

    service = _obtenir_service()

    resultat = service.users().messages().list(
        userId="me", q="in:inbox is:unread -category:promotions", maxResults=20
    ).execute()

    messages = resultat.get("messages", [])
    vus = _charger_vus()
    nouveaux = []

    for message in messages:
        if message["id"] not in vus:
            expediteur, sujet = _extraire_expediteur_sujet(service, message["id"])
            nouveaux.append((expediteur, sujet))
            vus.add(message["id"])

    if nouveaux:
        _sauvegarder_vus(vus)

    return nouveaux


def _boucle_mails(intervalle_secondes=180):
    while True:
        try:
            nouveaux = verifier_nouveaux_mails()
            for expediteur, sujet in nouveaux:
                message = f"Nouveau mail de {expediteur} : {sujet}"
                parler(message)
                notifier_telephone("DeskBot", message)
        except Exception as e:
            print("Erreur vérification mails :", e)

        time.sleep(intervalle_secondes)


def lancer_gestionnaire_mails():
    global gestionnaire_mails_lance
    if gestionnaire_mails_lance:
        return
    thread = threading.Thread(target=_boucle_mails, daemon=True)
    thread.start()
    gestionnaire_mails_lance = True
    print("📧 Gestionnaire Mails lancé.")
