console.log("SCRIPT CHARGÉ", Date.now());

let TOKEN = localStorage.getItem("deskbot_token") || sessionStorage.getItem("deskbot_token");

function afficherLogin() {
    document.getElementById("popup-login").style.display = "flex";
}

function seConnecter() {
    const motDePasse = document.getElementById("mot-de-passe").value;
    const seSouvenir = document.getElementById("checkbox-se-souvenir").checked;

    fetch("https://api.gogekko.fr/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mot_de_passe: motDePasse })
    })
    .then(r => r.json())
    .then(data => {
        if (data.succes) {
            TOKEN = data.token;
            if (seSouvenir) {
                localStorage.setItem("deskbot_token", TOKEN);
            } else {
                sessionStorage.setItem("deskbot_token", TOKEN);
            }
            document.getElementById("popup-login").style.display = "none";
            chargerChronometre();
        } else {
            document.getElementById("erreur-login").textContent = "Mot de passe incorrect.";
        }
    });
}

if (!TOKEN) {
    afficherLogin();
}

function envoyerCommande() {
    const commande = document.getElementById("commande").value;

    fetch("https://api.gogekko.fr/commande", {        
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + TOKEN
        },
        body: JSON.stringify({
            texte: commande
        })
    })
    .then(r => r.json())
    .then(data => {

        document.getElementById("reponse").textContent =
            "Réponse: " + data.reponse;
        let reponse = data.reponse;

        afficherReponse(commande, reponse);

        chargerChronometre();
    });
}

function envoyerCommandePrédéfinie(commande) {
    fetch("https://api.gogekko.fr/commande", {        
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + TOKEN
        },
        body: JSON.stringify({
            texte: (commande)
        })
    })
    .then(r => r.json())
    .then(data => {

        document.getElementById("reponse").textContent =
            "Réponse: " + data.reponse;

        let reponse = data.reponse;

        afficherReponse(commande, reponse);

        chargerChronometre();

    });
}

function afficherReponse(commande, reponse) {
    if (commande.includes("stats youtube") || commande.includes("youtube") || commande.includes("statistiques") || commande.includes("Statistiques YouTube")) {
        document.getElementById("reponse-stats-yt").textContent = reponse;
    }
    else if (commande.includes("recherche") || commande.includes("google") || commande.includes("Recherche sur google")) {
        document.getElementById("reponse-recherche").textContent = reponse;
    }
    else if (commande.includes("calculer") || commande.includes("trajet") || commande.includes("Calculer le trajet")) {
        document.getElementById("reponse-trajet").textContent = reponse;
    }
    else if (commande.includes("demande") || commande.includes("IA") || commande.includes("Demande à l'IA")) {
        document.getElementById("reponse-question-ia").textContent = reponse;
    }
    else if (commande.includes("convertis") || commande.includes("Convertis")) {
        document.getElementById("reponse-convertir").textContent = reponse;
    }
    else if (commande.includes("traduis") || commande.includes("Traduis")) {
        document.getElementById("reponse-traduction").textContent = reponse;
    }
    else if (commande.includes("hasard") || commande.includes("aléatoire") || commande.includes("pile") || commande.includes("face") || commande.includes("nombre") || commande.includes("choix")) {
        document.getElementById("reponse-hasard").textContent = reponse;
    }
    else if (commande.includes("résume") || commande.includes("resume") || commande.includes("résumer") || commande.includes("resumer") || commande.includes("résume ce texte: ")) {
        document.getElementById("reponse-resumer").textContent = reponse;
    }
    else if (commande.includes("corrige") || commande.includes("corriger") || commande.includes("Corrige ce texte")) {
        document.getElementById("reponse-corriger").textContent = reponse;
    }
}

let derniereReponseDeskBot = "";

function surveillerReponseDeskBot() {

    if (!TOKEN) {
        return;
    }

    fetch("https://api.gogekko.fr/etat", {
        headers: {
            "Authorization": "Bearer " + TOKEN
        }
    })
    .then(r => r.json())
    .then(data => {

        const reponse = data.reponse;

        if (!reponse) {
            return;
        }

        // Ne pas afficher plusieurs fois la même réponse
        if (reponse === derniereReponseDeskBot) {
            return;
        }

        derniereReponseDeskBot = reponse;

        // AFFICHER LA RÉPONSE DU MODE VOCAL DANS #reponse
        document.getElementById("reponse").textContent =
            "Réponse : " + reponse;

    })
    .catch(erreur => {
        console.error("Erreur récupération réponse DeskBot :", erreur);
    });
}

setInterval(surveillerReponseDeskBot, 500);

function rechercherCommandes() {

    const input = document.getElementById("recherche-commandes");

    if (!input) {
        return;
    }

    const recherche = input.value
        .toLowerCase()
        .trim();

    const classes = document.querySelectorAll(".classe-commandes");

    classes.forEach(classe => {

        const commandes = classe.querySelectorAll(".commande-prédéfinie");

        let commandeTrouvee = false;

        commandes.forEach(commande => {

            const texteElement = commande.querySelector(".commande-texte");

            if (!texteElement) {
                return;
            }

            const texte = texteElement.textContent
                .toLowerCase()
                .trim();

            if (recherche === "" || texte.includes(recherche)) {

                commande.classList.remove("commande-cachee");

                commandeTrouvee = true;

            } else {

                commande.classList.add("commande-cachee");

            }

        });


        /*
         * Si aucune commande de la classe
         * ne correspond, on cache la classe.
         */

        if (commandeTrouvee) {

            classe.classList.remove("classe-cachee");

        } else {

            classe.classList.add("classe-cachee");

        }

    });
}

function ouvrirMusique(){
    document.getElementById("popup-musique").style.display="flex";
}

function fermerMusique(){
    document.getElementById("popup-musique").style.display="none";
}

function definirVolume(){
    const volume = document.getElementById("input-volume").value

    envoyerCommandePrédéfinie("mets le volume à " + volume)
}

function ouvrirMeteo(){
    document.getElementById("popup-meteo").style.display="flex";
}

function fermerMeteo(){
    document.getElementById("popup-meteo").style.display="none";
}

function envoyerMeteo() {
    const ville = document.getElementById("ville").value;
    const date = document.getElementById("date").value;

    fetch("https://api.gogekko.fr/commande", {        
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + TOKEN
        },
        body: JSON.stringify({
            texte: "quelle est la météo à " + ville + " " + date
        })
    })
    .then(r => r.json())
    .then(data => {
        document.getElementById("reponse").textContent = "Réponse: " + data.reponse;
        document.getElementById("reponse-meteo").textContent = "Réponse: " + data.reponse;
    });
}

let departChrono = null;
let chronoActif = false;
let pauseTotale = 0;
let tempsPause = null;
let enMarche = false;
let enPause = false;
let secondes = 0;

function chargerChronometre() {

    fetch("https://api.gogekko.fr/chronometre", {
        headers: { "Authorization": "Bearer " + TOKEN }
    })
        .then(response => response.json())
        .then(data => {

            departChrono = data.depart;
            pauseTotale = data.pause_totale;
            tempsPause = data.temps_pause;
            enMarche = data.en_marche;
            enPause = data.en_pause;
            secondes = data.secondes;

            const bouton = document.getElementById("PausePlay");

            if (enPause) {
                bouton.src = "img/play.svg";
            } else {
                bouton.src = "img/pause.svg";
            }

        });
}

chargerChronometre();


setInterval(() => {

    if (enMarche && !enPause) {
        secondes++;
    }

    let minutes = Math.floor(secondes / 60);
    let secondesRestantes = secondes % 60;

    document.getElementById("chrono").textContent =
        `Chronomètre : ${minutes} min ${secondesRestantes} sec`;

}, 1000);

function PausePlayChrono() {

    let commande;

    if (enPause) {
        commande = "reprends le chronomètre";
    } else {
        commande = "pause le chronomètre";
    }

    fetch("https://api.gogekko.fr/commande", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + TOKEN
        },
        body: JSON.stringify({
            texte: commande
        })
    })
    .then(r => r.json())
    .then(data => {

        document.getElementById("reponse").textContent =
            "Réponse : " + data.reponse;

        chargerChronometre();

    });
}

function StopChrono() {
    envoyerCommandePrédéfinie("stop le chronomètre")
}

function RepeatChrono() {
    envoyerCommandePrédéfinie("remets le chronomètre à zéro");
}

function GoChrono() {
    envoyerCommandePrédéfinie("démarre le chronomètre")
}

document.getElementById("commande").addEventListener("keydown", (event) => {
    if (event.key === "Enter") envoyerCommande();
});

function ouvrirMinuteur() {
    document.getElementById("popup-set-minuteur").style.display = "flex";
}

function fermerMinuteur() {
    document.getElementById("popup-set-minuteur").style.display = "none";
}

function SetMinuteur() {
    ouvrirMinuteur();
}

function ajusterMinuteur(unite, delta) {
    const champ = document.getElementById(unite === "minutes" ? "minuteur-minutes" : "minuteur-secondes");
    let valeur = parseInt(champ.value, 10) || 0;
    valeur += delta;

    if (valeur < 0) valeur = 0;
    if (unite === "secondes" && valeur > 59) valeur = 59;

    champ.value = valeur;
}

function demarrerMinuteurDepuisPopup() {
    const minutes = parseInt(document.getElementById("minuteur-minutes").value, 10) || 0;
    const secondes = parseInt(document.getElementById("minuteur-secondes").value, 10) || 0;

    envoyerCommandePrédéfinie(`démarre un minuteur de ${minutes} minutes et ${secondes} secondes`);
    fermerMinuteur();
    setTimeout(chargerMinuteur, 300);  // laisse le temps au serveur de traiter la commande
}

let enMarcheMinuteur = false;
let enPauseMinuteur = false;
let secondesMinuteur = 0;
let notificationEnvoyee = false;
let minuteurActifPrecedent = false;

function afficherMinuteur() {
    let minutes = Math.floor(secondesMinuteur / 60);
    let secondesRestantes = secondesMinuteur % 60;
    document.getElementById("minuteur-texte").textContent =
        `Minuteur : ${minutes} min ${secondesRestantes} sec`;
}

function chargerMinuteur() {
    fetch("https://api.gogekko.fr/minuteur", {
        headers: { "Authorization": "Bearer " + TOKEN }
    })
        .then(response => response.json())
        .then(data => {

            const nouveauDemarrage = data.actif && !minuteurActifPrecedent;
            minuteurActifPrecedent = data.actif;

            enMarcheMinuteur = data.actif;
            enPauseMinuteur = data.en_pause;
            secondesMinuteur = data.secondes;

            if (nouveauDemarrage) {
                notificationEnvoyee = false;
            }

            const bouton = document.getElementById("PausePlayMinuteur");
            bouton.src = enPauseMinuteur ? "img/play.svg" : "img/pause.svg";

            afficherMinuteur();
        });
}

chargerMinuteur();

if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
}

setInterval(() => {

    if (enMarcheMinuteur && !enPauseMinuteur) {
        if (secondesMinuteur > 0) {
            secondesMinuteur--;
        } else if (!notificationEnvoyee) {
            notificationEnvoyee = true;
            enMarcheMinuteur = false;

            if ("Notification" in window && Notification.permission === "granted") {
                new Notification("🔔 Minuteur terminé");
            } else {
                document.getElementById("reponse").textContent = "🔔 Minuteur terminé";
            }
        }
    }

    afficherMinuteur();

}, 1000);

// Petite synchronisation périodique avec le serveur, utile si le minuteur
// est démarré ou arrêté à la voix pendant que le site reste ouvert
setInterval(chargerMinuteur, 5000);

function PausePlayMinuteur() {

    let commande = enPauseMinuteur ? "reprends le minuteur" : "pause le minuteur";

    fetch("https://api.gogekko.fr/commande", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + TOKEN
        },
        body: JSON.stringify({ texte: commande })
    })
    .then(r => r.json())
    .then(data => {
        document.getElementById("reponse").textContent = "Réponse : " + data.reponse;
        chargerMinuteur();
    });
}

function RepeatMinuteur() {
    envoyerCommandePrédéfinie("arrête le minuteur");
    chargerMinuteur();
}

let alarmeActive = false;
let dernierEtatAlarme = null;

function chargerAlarme() {
    fetch("https://api.gogekko.fr/alarme", {
        headers: { "Authorization": "Bearer " + TOKEN }
    })
        .then(r => r.json())
        .then(data => {
            dernierEtatAlarme = data;
            alarmeActive = data.existe && data.active;

            let texte;
            if (!data.existe || data.jours_restants === null) {
                texte = "Alarme : --";
            } else if (data.jours_restants > 0) {
                texte = `Alarme : dans ${data.jours_restants}j ${data.heures_restantes}h${String(data.minutes_restantes).padStart(2,"0")}`;
            } else {
                texte = `Alarme : dans ${data.heures_restantes}h${String(data.minutes_restantes).padStart(2,"0")}`;
            }

            document.getElementById("alarme-texte").textContent = texte;

            const cloche = document.getElementById("ActiveSlashAlarme");
            cloche.src = alarmeActive ? "img/bell-active.svg" : "img/bell-slash.svg";
        });
}

chargerAlarme();
setInterval(chargerAlarme, 30000);

function SetAlarme() {

    if (dernierEtatAlarme && dernierEtatAlarme.existe) {
        document.getElementById("alarme-heure").value = dernierEtatAlarme.heure;
        document.getElementById("alarme-minute").value = dernierEtatAlarme.minute;
        document.querySelectorAll(".jour-checkbox").forEach(cb => {
            cb.checked = dernierEtatAlarme.jours.includes(parseInt(cb.value, 10));
        });
    } else {
        document.getElementById("alarme-heure").value = 0;
        document.getElementById("alarme-minute").value = 0;
        document.querySelectorAll(".jour-checkbox").forEach(cb => cb.checked = false);
    }

    document.getElementById("popup-set-alarme").style.display = "flex";
}

function fermerReglageAlarme() {
    document.getElementById("popup-set-alarme").style.display = "none";
}

function ajusterAlarme(unite, delta) {
    const champ = document.getElementById(unite === "heure" ? "alarme-heure" : "alarme-minute");
    let valeur = parseInt(champ.value, 10) || 0;
    valeur += delta;

    const max = unite === "heure" ? 23 : 59;
    if (valeur < 0) valeur = max;
    if (valeur > max) valeur = 0;

    champ.value = valeur;
}

function enregistrerAlarme() {
    const heure = parseInt(document.getElementById("alarme-heure").value, 10) || 0;
    const minute = parseInt(document.getElementById("alarme-minute").value, 10) || 0;

    const nomsJours = ["lundi","mardi","mercredi","jeudi","vendredi","samedi","dimanche"];
    const joursCoches = Array.from(document.querySelectorAll(".jour-checkbox:checked"))
        .map(cb => nomsJours[parseInt(cb.value, 10)]);

    let texte = `programme une alarme à ${heure}h${String(minute).padStart(2,"0")}`;
    if (joursCoches.length > 0) {
        texte += " " + joursCoches.join(" ");
    }

    envoyerCommandePrédéfinie(texte);
    fermerReglageAlarme();
    setTimeout(chargerAlarme, 300);
}

function ActiveSlashAlarme() {
    const commande = alarmeActive ? "eteins l'alarme" : "allume l'alarme";
    envoyerCommandePrédéfinie(commande);
    setTimeout(chargerAlarme, 300);
}

function supprimerAlarme() {
    envoyerCommandePrédéfinie("supprime l'alarme");
    setTimeout(chargerAlarme, 300);
}

function sonnerieAlarme() {
    document.getElementById("popup-sonnerie-alarme").style.display = "flex";
}

function fermerSonnerieAlarme() {
    document.getElementById("popup-sonnerie-alarme").style.display = "none";
}

function enregistrerSonnerie() {
    const choix = document.querySelector('input[name="sonnerie"]:checked');
    if (!choix) return;

    const numero = choix.value.replace("alarme", "");
    envoyerCommandePrédéfinie(`choisis la sonnerie alarme ${numero}`);
    fermerSonnerieAlarme();
}

function ouvrirMails() {
    document.getElementById("popup-mails").style.display = "flex";
    chargerMails();
}

function fermerMails() {
    document.getElementById("popup-mails").style.display = "none";
}

function chargerMails() {
    fetch("https://api.gogekko.fr/mails", {
        headers: {
            "Authorization": "Bearer " + TOKEN
        }
    })
    .then(r => r.json())
    .then(data => {

        const texteNonLus =
            data.non_lus === 0
                ? "Vous n'avez aucun mail non lu."
                : data.non_lus === 1
                    ? "Vous avez 1 mail non lu."
                    : `Vous avez ${data.non_lus} mails non lus.`;

        document.getElementById("mails-non-lus").textContent = texteNonLus;

        const conteneur = document.getElementById("mail");
        conteneur.innerHTML = "";

        if (data.mails.length === 0) {
            conteneur.innerHTML = "<p class='indication'>Aucun mail non lu.</p>";
            return;
        }

        data.mails.forEach(mail => {
            conteneur.innerHTML += `
                <div class="mail-item">
                    <p><strong>Expéditeur :</strong> ${mail.expediteur}</p>
                    <p><strong>Objet :</strong> ${mail.objet}</p>
                </div>
            `;
        });

    })
    .catch(() => {
        document.getElementById("mails-non-lus").textContent =
            "Impossible de récupérer les mails.";

        document.getElementById("mail").innerHTML = "";
    });
}

function ouvrirImportCours() {
    document.getElementById("popup-import-cours").style.display = "flex";
}

function fermerImportCours() {
    document.getElementById("popup-import-cours").style.display = "none";
}

function envoyerImportCours() {
    const matiere = document.getElementById("import-matiere").value;
    const chapitre = document.getElementById("import-chapitre").value;
    const fichier = document.getElementById("import-fichier").files[0];

    if (!matiere || !chapitre || !fichier) {
        document.getElementById("import-cours-statut").textContent = "Remplis tous les champs.";
        return;
    }

    const donnees = new FormData();
    donnees.append("matiere", matiere);
    donnees.append("chapitre", chapitre);
    donnees.append("fichier", fichier);
    document.getElementById("import-cours-statut").textContent = `Chargement...`;

    fetch("https://api.gogekko.fr/cours/importer", {
        method: "POST",
        headers: { "Authorization": "Bearer " + TOKEN },
        body: donnees
    })
        .then(r => r.json())
        .then(data => {
            if (data.succes) {
                document.getElementById("import-cours-statut").textContent =
                    `Importé (${data.caracteres_extraits} caractères extraits).`;
            } else {
                document.getElementById("import-cours-statut").textContent = "Erreur : " + data.erreur;
            }
        });
}

function ouvrirStatsYoutube() {
    document.getElementById("popup-stats-yt").style.display = "flex";
}

function fermerStatsYoutube() {
    document.getElementById("popup-stats-yt").style.display = "none";
}

function envoyerStatsYoutube() {
    const chaine = document.getElementById("stats-yt-chaine").value;
    envoyerCommandePrédéfinie(`Statistiques YouTube de ${chaine}`);
}

function ouvrirRecherche() {
    document.getElementById("popup-recherche").style.display = "flex";
}

function fermerRecherche() {
    document.getElementById("popup-recherche").style.display = "none";
}

function envoyerRecherche() {
    const texte = document.getElementById("recherche-texte").value;
    envoyerCommandePrédéfinie(`Recherche sur google "${texte}"`);
}

function ouvrirTrajet() {
    document.getElementById("popup-trajet").style.display = "flex";
}

function fermerTrajet() {
    document.getElementById("popup-trajet").style.display = "none";
}

function envoyerTrajet() {
    const depart = document.getElementById("trajet-depart").value;
    const destination = document.getElementById("trajet-destination").value;
    const moyen = document.getElementById("trajet-moyen").value;
    envoyerCommandePrédéfinie(`Calculer le trajet de ${depart} à ${destination} en ${moyen}`);
}

function ouvrirPronote() {
    document.getElementById("popup-pronote").style.display = "flex";
}

function fermerPronote() {
    document.getElementById("popup-pronote").style.display = "none";
}

let dernierProfilRevision = null;

function ouvrirRevisionAccueil() {
    document.getElementById("popup-revision-accueil").style.display = "flex";
    chargerProfilRevision();
}

function fermerRevisionAccueil() {
    document.getElementById("popup-revision-accueil").style.display = "none";
}

function chargerProfilRevision() {
    fetch("https://api.gogekko.fr/revision/profil", {
        headers: { "Authorization": "Bearer " + TOKEN }
    })
        .then(r => r.json())
        .then(data => {
            dernierProfilRevision = data;

            document.getElementById("revision-points-total").textContent =
                data.points;

            document.getElementById("revision-serie-total").textContent =
                data.serie || 0;

            document.getElementById("bouton-ouvrir-boite").disabled =
                data.points < 20;
        });
}

function ouvrirStatistiquesRevision() {
    document.getElementById("popup-statistiques-revision").style.display = "flex";

    fetch("https://api.gogekko.fr/revision/profil", {
        headers: { "Authorization": "Bearer " + TOKEN }
    })
        .then(r => r.json())
        .then(data => {
            const conteneurStats = document.getElementById("revision-stats-matieres");
            conteneurStats.innerHTML = "";

            for (const matiere in data.stats_matieres) {
                const s = data.stats_matieres[matiere];
                const pourcentage = s.tentatives > 0 ? Math.round(100 * s.correctes / s.tentatives) : 0;
                conteneurStats.innerHTML += `<p>${matiere} : ${pourcentage}%</p>`;
            }

            const conteneurCollection = document.getElementById("revision-collection");
            conteneurCollection.innerHTML = "";

            data.collection.forEach(entree => {
                const image = entree.obtenu
                    ? `img/profs/${entree.slug}.png`
                    : `img/profs/silhouette-inconnue.png`;

                conteneurCollection.innerHTML += `
                    <div class="carte-collection rarete-${entree.rarete}">
                        <img src="${image}" class="image-collection">
                        <p>${entree.obtenu ? entree.nom : "???"}</p>
                    </div>
                `;
            });
        });
}

function fermerStatistiquesRevision() {
    document.getElementById("popup-statistiques-revision").style.display = "none";
}

function ouvrirBoiteMystere() {
    document.getElementById("popup-ouverture-boite").style.display = "flex";

    const animation = document.getElementById("animation-ouverture-boite");
    const resultatTexte = document.getElementById("resultat-ouverture-boite");
    const boutonFermer = document.getElementById("bouton-fermer-resultat");
    const iconeProfObtenu = document.getElementById("icone-prof-obtenu");

    animation.style.display = "block";

    resultatTexte.textContent = "";
    iconeProfObtenu.innerHTML = "";
    iconeProfObtenu.className = "";

    boutonFermer.style.display = "none";

    animation.currentTime = 0;
    animation.play();

    fetch("https://api.gogekko.fr/revision/boite", {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + TOKEN
        }
    })
    .then(r => r.json())
    .then(data => {

        const afficherResultat = () => {

            animation.style.display = "none";

            if (!data.succes) {

                resultatTexte.textContent =
                    "Pas assez de points pour ouvrir une boîte.";

                iconeProfObtenu.className = "sans-skin";
                iconeProfObtenu.textContent = "🥲";

            } else if (data.type === "skin") {

                resultatTexte.textContent =
                    `Nouveau skin obtenu : ${data.prof} (${data.rarete}) !`;

                iconeProfObtenu.className =
                    `rarete-${data.rarete}`;

                iconeProfObtenu.innerHTML =
                    `<img src="img/profs/${data.slug}.png" class="image-collection">`;

            } else if (data.type === "doublon") {

                resultatTexte.textContent =
                    `Tu avais déjà ${data.prof} : +${data.points_gagnes} points bonus.`;

                iconeProfObtenu.className =
                    `rarete-${data.rarete}`;

                iconeProfObtenu.innerHTML =
                    `<img src="img/profs/${data.slug}.png" class="image-collection">`;

            } else {

                resultatTexte.textContent =
                    `Pas de skin cette fois : +${data.points_gagnes} points.`;

                iconeProfObtenu.className = "sans-skin";
                iconeProfObtenu.textContent = "🥲";
            }

            boutonFermer.style.display = "inline-block";

            chargerProfilRevision();
        };

        if (animation.ended) {
            afficherResultat();
        } else {
            animation.onended = afficherResultat;
        }
    });
}

function fermerOuvertureBoite() {
    document.getElementById("popup-ouverture-boite").style.display = "none";
}

function demarrerRevisionDepuisPopup() {

    const matiere = document.getElementById("revision-matiere").value;
    const chapitre = document.getElementById("revision-chapitre").value;

    if (!matiere || !chapitre) return;

    fetch("https://api.gogekko.fr/revision/demarrer", {

        method: "POST",

        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + TOKEN
        },

        body: JSON.stringify({
            matiere: matiere,
            chapitre: chapitre
        })

    })
    .then(r => r.json())
    .then(data => {

        if (!data.succes) {
            alert(data.erreur);
            return;
        }

        revisionIndex = 0;
        revisionTotal = data.nb_questions;
        premierEssai = true;
        revisionScore = 0;

        fermerRevisionAccueil();

        ouvrirRevision();

        afficherQuestion(data.question, data.stats);

    });

}

let revisionIndex = 0;
let revisionTotal = 0;
let premierEssai = true;
let revisionScore = 0;

function ouvrirRevision(){

    document.getElementById("popup-revision").style.display="flex";

}

function fermerRevision(){

    document.getElementById("popup-revision").style.display="none";

}

function afficherQuestion(question, stats) {

    premierEssai = revisionIndex+1 < 6;

    document.getElementById("revision-question").textContent=question;

    document.getElementById("revision-reponse").value="";

    const barre = document.getElementById("revision-progression-barre");

    const nbQuestionsIncorrectes = stats.nb_incorrectes;
    const revisionNumero = document.getElementById("revision-numero");
    
    if (revisionIndex+1 < 6) {
        document.getElementById("revision-numero").textContent =
            `Question: ${revisionIndex+1} / ${revisionTotal}`;
            barre.style.backgroundColor = "#00ff00";
            revisionNumero.style.color = "#00ff00";
    } else {
        document.getElementById("revision-numero").textContent =
            `Rattrapage: ${revisionIndex-4} / ${nbQuestionsIncorrectes}`;
            barre.style.backgroundColor = "#ff0000";
            revisionNumero.style.color = "#ff0000";
    }

    let pourcentage;

    if (revisionIndex < 5) {
        pourcentage = ((revisionIndex + 1) / revisionTotal) * 100;
    } else {
        const indexRattrapage = revisionIndex - revisionTotal + 1;
        pourcentage = (indexRattrapage / nbQuestionsIncorrectes) * 100;
    }

    barre.style.transition = "width .45s ease";
    barre.style.width = pourcentage + "%";

    revisionScore = stats.nb_correctes + (stats.nb_incorrectes - nbQuestionsIncorrectes);

}

document
    .getElementById("revision-valider")
    .addEventListener("click", validerReponseRevision);

function validerReponseRevision() {
    const bouton=document.getElementById("revision-valider");

    bouton.disabled=true;

    const reponse = document.getElementById("revision-reponse").value.trim();

    if (!reponse) {
        bouton.disabled = false;
        return;
    }

    fetch("https://api.gogekko.fr/revision/repondre", {

        method: "POST",

        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + TOKEN
        },

        body: JSON.stringify({
            reponse: reponse
        })

    })
    .then(r => r.json())
    .then(data => {

        afficherFeedback(data);

    });

}

function afficherFeedback(data){

    const panneau = document.getElementById("revision-resultat");

    const icone = document.getElementById("revision-resultat-icone");

    const titre = document.getElementById("revision-resultat-titre");

    const explication = document.getElementById("revision-resultat-explication");


    panneau.classList.remove("correct");
    panneau.classList.remove("incorrect");
    const barre = document.getElementById("revision-progression-barre");


    if(data.correcte){
        panneau.classList.add("correct");
        icone.textContent="✅";
        titre.textContent="Bonne réponse !";
        if (premierEssai) {
            afficherGainOrbes(1);
        }
    }
    else{
        premierEssai = false;

        panneau.classList.add("incorrect");
        icone.textContent="❌";
        titre.textContent="Ce n'est pas ça";
    }


    explication.textContent=data.explication;


    panneau.classList.add("visible");


    // On prépare le bouton
    document.getElementById("revision-continuer").style.display="block";


    if(data.termine){

        document.getElementById("revision-continuer").textContent="Voir le résultat";

    }
    else{

        document.getElementById("revision-continuer").textContent="Continuer";

    }


    // On garde la réponse pour après le clic
    window.feedbackRevision = data;

}

function afficherGainOrbes(nb){

    const gain=document.getElementById("gain-orbes");

    gain.textContent="+"+nb;

    gain.classList.remove("cache");

    setTimeout(()=>{

        gain.classList.add("cache");

    },800);

}

function afficherFinRevision(stats) {


    document.getElementById("revision-note-image").src =
        `img/notes/${stats.note_sur_5}_sur_5.png`;

    const commentaires = [
        "Il va falloir relire le cours 📚",
        "Encore un petit effort !",
        "Pas mal !",
        "Très bon travail !",
        "Excellent !",
        "Parfait, tu maîtrises ce chapitre !"
    ];

    document.getElementById("revision-commentaire").textContent =
        commentaires[stats.note_sur_5];
    
    document.getElementById("revision-score").textContent = `+${revisionScore}`;

    document.getElementById("popup-fin-revision").style.display = "flex";

    const bouton=document.getElementById("revision-valider");

    bouton.disabled=false;
}

function fermerFinRevision() {
    document.getElementById("popup-fin-revision").style.display = "none";
    chargerProfilRevision();
}

function questionSuivanteRevision(){

    const data = window.feedbackRevision;

    const panneau = document.getElementById("revision-resultat");

    panneau.classList.remove("visible");


    setTimeout(()=>{


        if(data.termine){

            fermerRevision();

            afficherFinRevision(data.stats);

            return;

        }


        revisionIndex++;

        afficherQuestion(data.question, data.stats);

        document.getElementById("revision-valider").disabled = false;


    },300);

}


// =========================================================
// TO-DO LIST
// =========================================================

function ouvrirTodo() {
    document.getElementById("popup-todo").style.display = "flex";

    chargerTodo();

    setTimeout(() => {
        document.getElementById("todo-input").focus();
    }, 100);
}


function fermerTodo() {
    document.getElementById("popup-todo").style.display = "none";
}


/* ---------------------------------------------------------
   Charger les tâches
   --------------------------------------------------------- */

function chargerTodo() {

    fetch("https://api.gogekko.fr/taches", {
        headers: {
            "Authorization": "Bearer " + TOKEN
        }
    })
    .then(response => response.json())
    .then(data => {

        afficherTodo(data.taches);

    })
    .catch(error => {

        console.error("Erreur chargement To-Do :", error);

        document.getElementById("todo-liste").innerHTML =
            `<p class="todo-vide">
                Impossible de récupérer les tâches.
            </p>`;
    });
}


/* ---------------------------------------------------------
   Afficher les tâches
   --------------------------------------------------------- */

function afficherTodo(taches) {

    const liste = document.getElementById("todo-liste");

    liste.innerHTML = "";

    if (!taches || taches.length === 0) {

        liste.innerHTML = `
            <p class="todo-vide">
                🎉 Aucune tâche ! Ta liste est vide.
            </p>
        `;

        return;
    }

    taches.forEach(tache => {

        const element = document.createElement("div");

        element.className =
            "todo-tache" +
            (tache.terminee ? " terminee" : "");

        element.innerHTML = `

            <input
                type="checkbox"
                class="todo-checkbox"
                ${tache.terminee ? "checked" : ""}
                onchange="changerEtatTache(${tache.id}, this.checked)"
            >

            <span class="todo-texte">
                ${echapperHTML(tache.texte)}
            </span>

            <button
                class="todo-supprimer"
                onclick="supprimerTacheDepuisSite(${tache.id})"
                title="Supprimer"
            >
                🗑️
            </button>

        `;

        liste.appendChild(element);
    });
}


/* ---------------------------------------------------------
   Ajouter une tâche
   --------------------------------------------------------- */

function ajouterTacheDepuisSite() {

    const input = document.getElementById("todo-input");

    const texte = input.value.trim();

    if (!texte) {
        afficherMessageTodo("Écris une tâche avant de l'ajouter.");
        return;
    }

    envoyerCommandePrédéfinie(`ajoute "${texte}"`);
    setTimeout(chargerTodo, 300);
}


/* ---------------------------------------------------------
   Terminer / réactiver une tâche
   --------------------------------------------------------- */

function changerEtatTache(id, terminee) {

    const commande = terminee
        ? `termine la tâche ${id}`
        : `annule la tâche ${id}`;

    envoyerCommandePrédéfinie(commande)
    setTimeout(chargerTodo, 300)
}


/* ---------------------------------------------------------
   Supprimer une tâche
   --------------------------------------------------------- */

function supprimerTacheDepuisSite(id) {
    envoyerCommandePrédéfinie(`supprime la tâche ${id}`)
    setTimeout(chargerTodo, 300);
}


/* ---------------------------------------------------------
   Supprimer les tâches terminées
   --------------------------------------------------------- */

function supprimerTachesTerminees() {
    envoyerCommandePrédéfinie("supprime les tâches terminées")
    setTimeout(chargerTodo, 300)
}


/* ---------------------------------------------------------
   Vider toute la To-Do
   --------------------------------------------------------- */

function viderTodoDepuisSite() {
    envoyerCommandePrédéfinie("vide la liste de tâches");
    setTimeout(chargerTodo, 300);
}


/* ---------------------------------------------------------
   Message
   --------------------------------------------------------- */

function afficherMessageTodo(message) {

    const element = document.getElementById("todo-message");

    element.textContent = message;

    clearTimeout(window.todoMessageTimeout);

    window.todoMessageTimeout = setTimeout(() => {
        element.textContent = "";
    }, 2500);
}


/* ---------------------------------------------------------
   Sécurité HTML
   --------------------------------------------------------- */

function echapperHTML(texte) {

    const div = document.createElement("div");

    div.textContent = texte;

    return div.innerHTML;
}


/* ---------------------------------------------------------
   Entrée clavier
   --------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {

    const input = document.getElementById("todo-input");

    if (!input) return;

    input.addEventListener("keydown", event => {

        if (event.key === "Enter") {
            ajouterTacheDepuisSite();
        }

    });

});

function ouvrirQuestionIA() {
    document.getElementById("popup-question-ia").style.display = "flex";
}

function fermerQuestionIA() {
    document.getElementById("popup-question-ia").style.display = "none";
}

function questionIA() {
    const question = document.getElementById("question-ia-input").value;
    envoyerCommandePrédéfinie(`Demande à l'IA ${question}`)
}

function ouvrirRepeter(){
    document.getElementById("popup-repeter").style.display = "flex";
}

function fermerRepeter(){
    document.getElementById("popup-repeter").style.display = "none";
}

function repeter() {
    const repeter = document.getElementById("repeter-input").value;
    envoyerCommandePrédéfinie(`Répète ${repeter}`)
}

// =========================================================
// CALCULATRICE
// =========================================================

let calculatriceExpression = "";

function ouvrirCalculatrice() {
    document.getElementById("popup-calculatrice").style.display = "flex";

    calculatriceExpression = "";
    afficherCalculatrice();
}

function fermerCalculatrice() {
    document.getElementById("popup-calculatrice").style.display = "none";
}

function afficherCalculatrice() {

    const affichage = document.getElementById("calculatrice-affichage");

    if (!calculatriceExpression) {
        affichage.textContent = "0";
        return;
    }

    affichage.textContent = calculatriceExpression
        .replace(/\*/g, "×")
        .replace(/\//g, "÷")
        .replace(/\./g, ",");
}

function calculatriceEntrer(valeur) {

    if (calculatriceExpression === "Erreur") {
        calculatriceExpression = "";
    }

    calculatriceExpression += valeur;

    afficherCalculatrice();
}

function calculatriceEffacer() {

    calculatriceExpression = "";

    afficherCalculatrice();
}

function calculatriceSupprimer() {

    calculatriceExpression = calculatriceExpression.slice(0, -1);

    afficherCalculatrice();
}

function calculatricePourcentage() {

    if (!calculatriceExpression) return;

    calculatriceExpression += "%";

    afficherCalculatrice();
}

function calculatriceCalculer() {

    if (!calculatriceExpression) return;

    try {

        let expression = calculatriceExpression;

        // Remplace les pourcentages par /100
        expression = expression.replace(
            /(\d+(?:\.\d+)?)%/g,
            "($1/100)"
        );

        // Vérification des caractères autorisés
        if (!/^[0-9+\-*/().%\s]+$/.test(expression)) {
            throw new Error("Expression invalide");
        }

        // Calcul
        const resultat = Function(
            '"use strict"; return (' + expression + ')'
        )();

        if (!Number.isFinite(resultat)) {
            throw new Error("Calcul impossible");
        }

        calculatriceExpression = String(
            Math.round((resultat + Number.EPSILON) * 100000000) / 100000000
        );

        afficherCalculatrice();

    } catch (erreur) {

        calculatriceExpression = "Erreur";

        afficherCalculatrice();

        setTimeout(() => {
            calculatriceExpression = "";
            afficherCalculatrice();
        }, 1000);
    }
}

const unitésConversion = {
    longueur: {
        mm: "millimètre",
        cm: "centimètre",
        m: "mètre",
        km: "kilomètre",
        in: "pouce",
        ft: "pied",
        yd: "yard",
        mile: "mile"
    },
    masse: {
        mg: "milligramme",
        g: "gramme",
        kg: "kilogramme",
        t: "tonne",
        oz: "once",
        lb: "livre"
    },
    volume: {
        ml: "millilitre",
        cl: "centilitre",
        dl: "décilitre",
        l: "litre",
        m3: "mètre cube",
        gal: "gallon"
    },
    surface: {
        mm2: "millimètre carré",
        cm2: "centimètre carré",
        m2: "mètre carré",
        km2: "kilomètre carré",
        hectare: "hectare",
        acre: "acre"
    },
    vitesse: {
        "m/s": "mètre par seconde",
        "km/h": "kilomètre par heure",
        mph: "mile par heure",
        noeud: "nœud"
    },
    temps: {
        ms: "milliseconde",
        s: "seconde",
        min: "minute",
        h: "heure",
        jour: "jour",
        semaine: "semaine"
    },
    monnaie: {
        EUR: "euro",
        USD: "dollar",
        GBP: "livre sterling",
        JPY: "yen",
        CHF: "franc suisse",
        CAD: "dollar canadien",
        AUD: "dollar australien",
        CNY: "yuan",
        DKK: "couronne danoise",
        SEK: "couronne suédoise",
        NOK: "couronne norvégienne",
        PLN: "zloty",
        CZK: "couronne tchèque",
        HUF: "forint",
        TRY: "livre turque",
        BRL: "real brésilien",
        RUB: "rouble"
    }
};

function ouvrirConvertir() {
    document.getElementById("popup-convertir").style.display = "flex";
    changerCategorieConversion();
}

function fermerConvertir() {
    document.getElementById("popup-convertir").style.display = "none";
}

function changerCategorieConversion() {
    const catégorie = document.getElementById("unité-convertir").value;
    const départ = document.getElementById("select-mesures-unitées");
    const arrivée = document.getElementById("select-mesures-unitées-fin");

    départ.innerHTML = "";
    arrivée.innerHTML = "";

    Object.entries(unitésConversion[catégorie]).forEach(([value, nom]) => {
        départ.innerHTML += `<option value="${value}">${nom}</option>`;
        arrivée.innerHTML += `<option value="${value}">${nom}</option>`;
    });

    if (arrivée.options.length > 1) {
        arrivée.selectedIndex = 1;
    }
}

function convertir() {
    const valeur = document.getElementById("chiffre-de-depart").value;
    const unitéDépart = document.getElementById("select-mesures-unitées").value;
    const unitéArrivée = document.getElementById("select-mesures-unitées-fin").value;

    if (!valeur) {
        return;
    }

    envoyerCommandePrédéfinie(
        `Convertis ${valeur} ${unitéDépart} en ${unitéArrivée}`
    );
}

function ouvrirTraduction() {
    document.getElementById("popup-traduction").style.display = "flex";
}

function fermerTraduction() {
    document.getElementById("popup-traduction").style.display = "none";
}

function traduire() {
    const mot_traduction = document.getElementById("traduction-mot-input").value;
    const langue_traduction = document.getElementById("traduction-langue-input").value;

    envoyerCommandePrédéfinie(`Traduis ${mot_traduction} en ${langue_traduction}`)
}

function ouvrirNotification() {
    document.getElementById("popup-notification").style.display = "flex";
}

function fermerNotification() {
    document.getElementById("popup-notification").style.display = "none";
}

function programmerNotification() {
    const maintenant = new Date();

    const mois = [
        "janvier",
        "février",
        "mars",
        "avril",
        "mai",
        "juin",
        "juillet",
        "août",
        "septembre",
        "octobre",
        "novembre",
        "décembre"
    ];

    const champJour = document.getElementById("notification-jour");
    const champMois = document.getElementById("notification-mois");
    const champHeure = document.getElementById("notification-heure");
    const champMinutes = document.getElementById("notification-minutes");
    const champContenu = document.getElementById("notification-contenu");

    const jour = champJour.value || maintenant.getDate();

    const moisChoisi = champMois.value || mois[maintenant.getMonth()];

    const heure = champHeure.value !== ""
        ? champHeure.value
        : maintenant.getHours();

    const minutes = champMinutes.value !== ""
        ? champMinutes.value
        : maintenant.getMinutes();

    const contenu = champContenu.value.trim();

    if (!contenu) {
        return;
    }

    const commande =
        `Programme une notification le ${jour} ${moisChoisi} à ${heure} heures ${minutes} ${contenu}`;

    envoyerCommandePrédéfinie(commande);

    fermerNotification();
}

// =========================================================
// AGENDA
// =========================================================

let dateAgenda = new Date();


// ---------------------------------------------------------
// OUVRIR / FERMER
// ---------------------------------------------------------

function ouvrirAgenda() {

    document.getElementById("popup-agenda").style.display = "flex";

    fermerFormulairesAgenda();

    document.getElementById("agenda-reponse").textContent = "";

    chargerEvenementsAgenda();
}

function fermerAgenda() {
    document.getElementById("popup-agenda").style.display = "none";
}


// ---------------------------------------------------------
// CALENDRIER
// ---------------------------------------------------------

function afficherCalendrierAgenda() {

    const calendrier = document.getElementById("agenda-calendrier");
    const titre = document.getElementById("agenda-mois-annee");

    const mois = [
        "janvier",
        "février",
        "mars",
        "avril",
        "mai",
        "juin",
        "juillet",
        "août",
        "septembre",
        "octobre",
        "novembre",
        "décembre"
    ];

    const annee = dateAgenda.getFullYear();
    const moisActuel = dateAgenda.getMonth();

    titre.textContent = `${mois[moisActuel]} ${annee}`;

    calendrier.innerHTML = "";

    const premierJour = new Date(annee, moisActuel, 1);

    let jourDebut = premierJour.getDay();

    if (jourDebut === 0) {
        jourDebut = 6;
    } else {
        jourDebut--;
    }

    const nombreJours = new Date(annee, moisActuel + 1, 0).getDate();

    for (let i = 0; i < jourDebut; i++) {
        const caseVide = document.createElement("div");
        caseVide.className = "agenda-case agenda-case-vide";
        calendrier.appendChild(caseVide);
    }

    const maintenant = new Date();

    for (let jour = 1; jour <= nombreJours; jour++) {

        const caseJour = document.createElement("div");
        caseJour.className = "agenda-case";

        const dateJour =
            `${annee}-${String(moisActuel + 1).padStart(2, "0")}-${String(jour).padStart(2, "0")}`;

        if (
            jour === maintenant.getDate() &&
            moisActuel === maintenant.getMonth() &&
            annee === maintenant.getFullYear()
        ) {
            caseJour.classList.add("agenda-aujourd-hui");
        }

        const numeroJour = document.createElement("div");
        numeroJour.className = "agenda-jour";
        numeroJour.textContent = jour;

        caseJour.appendChild(numeroJour);

        caseJour.dataset.date = dateJour;

        caseJour.onclick = function() {
            document.getElementById("agenda-ajout-date").value = dateJour;
        };

        // Vérifie s'il y a un événement ce jour-là
        const evenementsDuJour = evenementsAgenda.filter(
            evenement => evenement.date === dateJour
        );

        if (evenementsDuJour.length > 0) {

            const point = document.createElement("div");

            point.className = "agenda-evenement-point";

            caseJour.appendChild(point);
        }

        calendrier.appendChild(caseJour);
    }
}


// ---------------------------------------------------------
// CHANGER DE MOIS
// ---------------------------------------------------------

function changerMoisAgenda(delta) {

    dateAgenda.setMonth(
        dateAgenda.getMonth() + delta
    );

    chargerEvenementsAgenda();
}


// ---------------------------------------------------------
// FORMULAIRES
// ---------------------------------------------------------

function fermerFormulairesAgenda() {

    document.getElementById("agenda-ajout").style.display = "none";
    document.getElementById("agenda-suppression").style.display = "none";
    document.getElementById("agenda-modification").style.display = "none";
}

function ouvrirAjoutEvenement() {

    fermerFormulairesAgenda();

    document.getElementById("agenda-ajout").style.display = "block";
}

function ouvrirSuppressionEvenement() {

    fermerFormulairesAgenda();

    document.getElementById("agenda-suppression").style.display = "block";
}

function ouvrirModificationEvenement() {

    fermerFormulairesAgenda();

    document.getElementById("agenda-modification").style.display = "block";
}


// ---------------------------------------------------------
// CONVERSION DATE
// ---------------------------------------------------------

function dateEnTexteAgenda(date) {

    const [annee, mois, jour] = date.split("-");

    const moisNoms = [
        "janvier",
        "février",
        "mars",
        "avril",
        "mai",
        "juin",
        "juillet",
        "août",
        "septembre",
        "octobre",
        "novembre",
        "décembre"
    ];

    return `${parseInt(jour)} ${moisNoms[parseInt(mois) - 1]}`;
}


// ---------------------------------------------------------
// CONVERSION HEURE
// ---------------------------------------------------------

function heureEnTexteAgenda(heure) {

    const [heures, minutes] = heure.split(":");

    return `${parseInt(heures)} heures ${parseInt(minutes)} minutes`;
}


// ---------------------------------------------------------
// AJOUTER
// ---------------------------------------------------------

function ajouterEvenementAgenda() {

    const titre = document.getElementById("agenda-ajout-titre").value.trim();
    const date = document.getElementById("agenda-ajout-date").value;
    const heure = document.getElementById("agenda-ajout-heure").value;

    if (!titre || !date || !heure) {

        document.getElementById("agenda-reponse").textContent =
            "Remplis tous les champs.";

        return;
    }

    const [annee, mois, jour] = date.split("-");
    const dateTexte = `${jour}/${mois}/${annee}`;
    const heureTexte = heureEnTexteAgenda(heure);

    const commande = `Ajoute un événement ${titre} ${dateTexte} à ${heureTexte}`;

    envoyerCommandePrédéfinie(commande);
    setTimeout(chargerEvenementsAgenda, 2000);

    fermerFormulairesAgenda();

    document.getElementById("agenda-ajout-titre").value = "";
    document.getElementById("agenda-ajout-date").value = "";
    document.getElementById("agenda-ajout-heure").value = "";
}


// ---------------------------------------------------------
// PROCHAINS ÉVÉNEMENTS
// ---------------------------------------------------------

function afficherProchainsEvenements() {

    fermerFormulairesAgenda();

    envoyerCommandePrédéfinie(
        "Donne-moi mes prochains événements"
    );
    setTimeout(chargerEvenementsAgenda, 2000);
}


// ---------------------------------------------------------
// SUPPRIMER
// ---------------------------------------------------------

function supprimerEvenementAgenda() {

    const titre = document.getElementById("agenda-suppression-titre").value.trim();
    const date = document.getElementById("agenda-suppression-date").value;
    const heure = document.getElementById("agenda-suppression-heure").value;

    if (!titre || !date || !heure) {

        document.getElementById("agenda-reponse").textContent =
            "Remplis tous les champs.";

        return;
    }

    const dateTexte = dateEnTexteAgenda(date);
    const heureTexte = heureEnTexteAgenda(heure);

    const commande =
        `Supprime l'événement ${titre} le ${dateTexte} à ${heureTexte}`;

    envoyerCommandePrédéfinie(commande);
    setTimeout(chargerEvenementsAgenda, 3000);

    fermerFormulairesAgenda();

    document.getElementById("agenda-suppression-titre").value = "";
    document.getElementById("agenda-suppression-date").value = "";
    document.getElementById("agenda-suppression-heure").value = "";
}


// ---------------------------------------------------------
// MODIFIER
// ---------------------------------------------------------

function modifierEvenementAgenda() {

    const ancien = document.getElementById("agenda-modification-ancien").value.trim();
    const date = document.getElementById("agenda-modification-date").value;
    const heure = document.getElementById("agenda-modification-heure").value;

    if (!ancien || !date || !heure) {

        document.getElementById("agenda-reponse").textContent =
            "Remplis tous les champs.";

        return;
    }

    const dateTexte = dateEnTexteAgenda(date);
    const heureTexte = heureEnTexteAgenda(heure);

    const commande =
        `Modifie l'événement ${ancien} le ${dateTexte} à ${heureTexte}`;

    envoyerCommandePrédéfinie(commande);
    setTimeout(chargerEvenementsAgenda, 2000);

    fermerFormulairesAgenda();

    document.getElementById("agenda-modification-ancien").value = "";
    document.getElementById("agenda-modification-date").value = "";
    document.getElementById("agenda-modification-heure").value = "";
}

let evenementsAgenda = [];

function chargerEvenementsAgenda() {

    const annee = dateAgenda.getFullYear();
    const mois = dateAgenda.getMonth() + 1;

    fetch(`https://api.gogekko.fr/agenda?annee=${annee}&mois=${mois}`, {
        headers: {
            "Authorization": "Bearer " + TOKEN
        }
    })
    .then(response => response.json())
    .then(data => {

        if (!data.succes) {
            console.error("Erreur récupération agenda :", data.erreur);
            evenementsAgenda = [];
            afficherCalendrierAgenda();
            return;
        }

        evenementsAgenda = data.evenements || [];

        afficherCalendrierAgenda();

    })
    .catch(error => {

        console.error(
            "Erreur connexion agenda :",
            error
        );

    });
}

function ouvrirHasard() {
    document.getElementById("popup-hasard").style.display = "flex";
}

function fermerHasard() {
    document.getElementById("popup-hasard").style.display = "none";
}

function pileOuFace() {
    envoyerCommandePrédéfinie("pile ou face");
}


function lancerDe() {
    const input = document.getElementById("lancer-de-input");
    const faces = parseInt(input.value);

    if (isNaN(faces) || faces < 2) {
        document.getElementById("reponse-hasard").textContent =
            "Réponse : un dé doit avoir au moins 2 faces.";
        return;
    }

    envoyerCommandePrédéfinie(`lance un dé de ${faces} faces`);
}

function choixAleatoire() {
    const input = document.getElementById("choix-hasard-input");
    const texte = input.value.trim();

    if (!texte) {
        document.getElementById("reponse-hasard").textContent =
            "Réponse : entre au moins deux choix.";
        return;
    }

    const choix = texte
        .split(",")
        .map(element => element.trim())
        .filter(element => element.length > 0);

    if (choix.length < 2) {
        document.getElementById("reponse-hasard").textContent =
            "Réponse : entre au moins deux choix.";
        return;
    }

    envoyerCommandePrédéfinie(
        `choix au hasard entre ${choix.join(", ")}`
    );
}

function nombreAleatoireSite() {
    const minimum = parseInt(
        document.getElementById("nombre-min-input").value
    );

    const maximum = parseInt(
        document.getElementById("nombre-max-input").value
    );

    if (isNaN(minimum) || isNaN(maximum)) {
        document.getElementById("reponse-hasard").textContent =
            "Réponse : entre deux nombres valides.";
        return;
    }

    if (minimum > maximum) {
        document.getElementById("reponse-hasard").textContent =
            "Réponse : le minimum doit être inférieur au maximum.";
        return;
    }

    envoyerCommandePrédéfinie(
        `nombre au hasard entre ${minimum} et ${maximum}`
    );
}

/* ---------------------------------------------------------
   NOTES
   --------------------------------------------------------- */

function ouvrirNotes() {

    document.getElementById("popup-notes").style.display = "flex";

    chargerNotes();
}


function fermerNotes() {

    document.getElementById("popup-notes").style.display = "none";
}


/* ---------------------------------------------------------
   Charger les notes
   --------------------------------------------------------- */

async function chargerNotes() {

    const liste = document.getElementById("notes-liste");
    const message = document.getElementById("notes-message");

    liste.innerHTML = '<p class="notes-vide">Chargement...</p>';
    message.textContent = "";

    try {

        const reponse = await fetch(
            "https://api.gogekko.fr/notes",
            {
                method: "GET",

                headers: {
                    "Authorization": "Bearer " + TOKEN
                }
            }
        );

        const resultat = await reponse.json();

        if (!reponse.ok) {
            throw new Error(
                resultat.erreur || "Erreur lors du chargement."
            );
        }

        const notes = resultat.notes || [];

        liste.innerHTML = "";

        if (notes.length === 0) {

            liste.innerHTML =
                '<p class="notes-vide">Aucune note enregistrée.</p>';

            return;
        }

        notes.forEach(note => {

            const bloc = document.createElement("div");
            bloc.className = "note";

            const contenu = document.createElement("div");
            contenu.className = "note-contenu";

            const titre = document.createElement("h3");
            titre.textContent = note.titre;

            const texte = document.createElement("p");
            texte.textContent =
                note.texte || "Cette note est vide.";

            const actions = document.createElement("div");
            actions.className = "note-actions";

            const boutonModifier = document.createElement("button");

            boutonModifier.className = "note-modifier";
            boutonModifier.textContent = "Modifier";

            boutonModifier.onclick = function () {
                modifierNoteDepuisSite(note);
            };


            const boutonSupprimer = document.createElement("button");

            boutonSupprimer.className = "note-supprimer";
            boutonSupprimer.textContent = "Supprimer";

            boutonSupprimer.onclick = function () {
                supprimerNoteDepuisSite(note.titre);
            };

            actions.appendChild(boutonModifier);
            actions.appendChild(boutonSupprimer);

            contenu.appendChild(titre);
            contenu.appendChild(texte);
            contenu.appendChild(actions);

            bloc.appendChild(contenu);

            liste.appendChild(bloc);
        });

    } catch (erreur) {

        console.error("Erreur notes :", erreur);

        liste.innerHTML =
            '<p class="notes-vide">Impossible de charger les notes.</p>';

        message.textContent = erreur.message;
    }
}


/* ---------------------------------------------------------
   Ajouter une note
   --------------------------------------------------------- */

async function ajouterNoteDepuisSite() {

    const titreInput =
        document.getElementById("note-titre");

    const texteInput =
        document.getElementById("note-texte");

    const message =
        document.getElementById("notes-message");

    const titre = titreInput.value.trim();
    const texte = texteInput.value.trim();

    if (!titre) {

        message.textContent =
            "Le titre de la note est obligatoire.";

        return;
    }

    try {

        const reponse = await fetch(
            "https://api.gogekko.fr/notes",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + TOKEN
                },

                body: JSON.stringify({
                    titre: titre,
                    texte: texte
                })
            }
        );

        const resultat = await reponse.json();

        if (!reponse.ok) {

            message.textContent =
                resultat.erreur || "Impossible d'ajouter la note.";

            return;
        }

        titreInput.value = "";
        texteInput.value = "";

        message.textContent = "Note ajoutée !";

        chargerNotes();

    } catch (erreur) {

        console.error("Erreur ajout note :", erreur);

        message.textContent =
            "Erreur lors de l'ajout de la note.";
    }
}


/* ---------------------------------------------------------
   Modifier une note
   --------------------------------------------------------- */

async function modifierNoteDepuisSite(note) {

    const nouveauTexte = prompt(
        "Modifier la note « " + note.titre + " » :",
        note.texte || ""
    );

    if (nouveauTexte === null) {
        return;
    }

    try {

        const reponse = await fetch(
            "https://api.gogekko.fr/notes/" +
            encodeURIComponent(note.titre),
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + TOKEN
                },

                body: JSON.stringify({
                    texte: nouveauTexte
                })
            }
        );

        const resultat = await reponse.json();

        if (!reponse.ok) {

            document.getElementById("notes-message").textContent =
                resultat.erreur ||
                "Impossible de modifier la note.";

            return;
        }

        document.getElementById("notes-message").textContent =
            "Note modifiée !";

        chargerNotes();

    } catch (erreur) {

        console.error("Erreur modification note :", erreur);

        document.getElementById("notes-message").textContent =
            "Erreur lors de la modification.";
    }
}


/* ---------------------------------------------------------
   Supprimer une note
   --------------------------------------------------------- */

async function supprimerNoteDepuisSite(titre) {

    if (!confirm(
        'Supprimer la note "' + titre + '" ?'
    )) {
        return;
    }

    try {

        const reponse = await fetch(
            "https://api.gogekko.fr/notes/" +
            encodeURIComponent(titre),
            {
                method: "DELETE",

                headers: {
                    "Authorization": "Bearer " + TOKEN
                }
            }
        );

        const resultat = await reponse.json();

        if (!reponse.ok) {

            document.getElementById("notes-message").textContent =
                resultat.erreur ||
                "Impossible de supprimer la note.";

            return;
        }

        document.getElementById("notes-message").textContent =
            "Note supprimée !";

        chargerNotes();

    } catch (erreur) {

        console.error("Erreur suppression note :", erreur);

        document.getElementById("notes-message").textContent =
            "Erreur lors de la suppression.";
    }
}

function ouvrirResumer() {
    document.getElementById("popup-resumer").style.display = "flex";
}

function fermerResumer() {
    document.getElementById("popup-resumer").style.display = "none";
}

function resumer() {
    const texte = document.getElementById("resumer-textarea").value;
    envoyerCommandePrédéfinie(`Résume ce texte: ${texte}`)
}

// =========================================================
// ANALYSE D'IMAGE
// =========================================================

function ouvrirAnalyserImage() {

    const popup = document.getElementById("popup-analyser-image");
    const input = document.getElementById("image-a-analyser");
    const statut = document.getElementById("statut-analyse-image");
    const resultat = document.getElementById("resultat-analyse-image");
    const texte = document.getElementById("texte-image");
    const apercuContainer = document.getElementById("apercu-image-container");
    const apercu = document.getElementById("apercu-image");

    if (popup) {
        popup.style.display = "flex";
    }

    if (input) {
        input.value = "";
    }

    if (statut) {
        statut.textContent = "";
    }

    if (resultat) {
        resultat.style.display = "none";
    }

    if (texte) {
        texte.value = "";
    }

    if (apercuContainer) {
        apercuContainer.style.display = "none";
    }

    if (apercu) {
        apercu.src = "";
    }
}


function fermerAnalyserImage() {

    const popup = document.getElementById("popup-analyser-image");

    if (popup) {
        popup.style.display = "none";
    }
}


async function analyserImage() {

    const input = document.getElementById("image-a-analyser");
    const statut = document.getElementById("statut-analyse-image");
    const resultat = document.getElementById("resultat-analyse-image");
    const texteImage = document.getElementById("texte-image");
    const apercuContainer = document.getElementById("apercu-image-container");
    const apercu = document.getElementById("apercu-image");
    const bouton = document.getElementById("bouton-analyser-image");

    if (!input || input.files.length === 0) {
        statut.textContent = "Sélectionne une image.";
        return;
    }

    const fichier = input.files[0];

    if (!fichier.type.startsWith("image/")) {
        statut.textContent = "Le fichier sélectionné n'est pas une image.";
        return;
    }

    // Aperçu
    if (apercu && apercuContainer) {
        apercu.src = URL.createObjectURL(fichier);
        apercuContainer.style.display = "block";
    }

    statut.textContent = "Analyse de l'image en cours...";

    if (bouton) {
        bouton.disabled = true;
        bouton.textContent = "🔍 Analyse...";
    }

    const donnees = new FormData();
    donnees.append("image", fichier);

    try {

        const resultatRequete = await fetch(
            "https://api.gogekko.fr/analyser-image",
            {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + TOKEN
                },
                body: donnees
            }
        );

        const data = await resultatRequete.json();

        console.log("Réponse analyse image :", data);

        if (!resultatRequete.ok) {
            statut.textContent =
                data.erreur || "Impossible d'analyser l'image.";
            return;
        }

        if (!data.succes) {
            statut.textContent =
                data.erreur || "Impossible d'analyser l'image.";
            return;
        }

        // IMPORTANT :
        // Flask renvoie "texte"
        const texte = data.texte || "";

        if (!texte) {
            statut.textContent =
                "Aucun texte n'a été détecté.";
            return;
        }

        // Affichage du texte détecté
        texteImage.value = texte;

        resultat.style.display = "block";

        statut.textContent = "Analyse terminée.";

        // Affichage également dans la réponse principale
        document.getElementById("reponse").textContent =
            "Réponse : " + texte;

    } catch (erreur) {

        console.error("Erreur analyse image :", erreur);

        statut.textContent =
            "Erreur lors de l'analyse de l'image.";

    } finally {

        if (bouton) {
            bouton.disabled = false;
            bouton.textContent = "🔍 Analyser";
        }
    }
}


// =========================================================
// COPIER LE TEXTE DÉTECTÉ
// =========================================================

async function copierTexteImage() {

    const textarea =
        document.getElementById("texte-image");

    if (!textarea || !textarea.value.trim()) {
        return;
    }

    try {

        await navigator.clipboard.writeText(
            textarea.value
        );

        const statut =
            document.getElementById(
                "statut-analyse-image"
            );

        if (statut) {
            statut.textContent =
                "Texte copié dans le presse-papiers.";
        }

    } catch (erreur) {

        console.error(
            "Erreur copie texte image :",
            erreur
        );

        // Fallback pour les navigateurs qui bloquent
        textarea.select();
        document.execCommand("copy");

        const statut =
            document.getElementById(
                "statut-analyse-image"
            );

        if (statut) {
            statut.textContent =
                "Texte copié dans le presse-papiers.";
        }
    }
}


// =========================================================
// TÉLÉCHARGER TXT
// =========================================================

function telechargerTexteImage() {

    const textarea =
        document.getElementById("texte-image");

    if (!textarea || !textarea.value.trim()) {
        return;
    }

    const blob = new Blob(
        [textarea.value],
        {
            type: "text/plain;charset=utf-8"
        }
    );

    const url = URL.createObjectURL(blob);

    const lien = document.createElement("a");

    lien.href = url;
    lien.download = "texte-image.txt";

    document.body.appendChild(lien);

    lien.click();

    document.body.removeChild(lien);

    URL.revokeObjectURL(url);
}


// =========================================================
// TÉLÉCHARGER PDF
// =========================================================

function telechargerPdfImage() {

    const textarea =
        document.getElementById("texte-image");

    if (!textarea || !textarea.value.trim()) {
        return;
    }

    const texte = textarea.value;

    const fenetre = window.open(
        "",
        "_blank"
    );

    if (!fenetre) {
        alert(
            "Impossible d'ouvrir la fenêtre PDF. Vérifie que les popups sont autorisées."
        );
        return;
    }

    fenetre.document.write(`
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <title>Texte détecté</title>

            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 40px;
                    line-height: 1.6;
                    white-space: pre-wrap;
                }

                h1 {
                    margin-bottom: 30px;
                }
            </style>
        </head>

        <body>

            <h1>Texte détecté</h1>

            ${texte
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/\n/g, "<br>")
            }

        </body>
        </html>
    `);

    fenetre.document.close();

    fenetre.focus();

    setTimeout(() => {

        fenetre.print();

    }, 300);
}

function ouvrirCorrection() {
    document.getElementById("popup-correction").style.display = "flex";
}

function fermerCorrection() {
    document.getElementById("popup-correction").style.display = "none";
}

function corriger() {
    const texte = document.getElementById("corriger-textarea").value;

    envoyerCommandePrédéfinie(`Corrige ce texte: ${texte}`)
}































window.onclick = function(event) {
    const popups = ["popup-musique", "popup-meteo", "popup-set-minuteur", "popup-set-alarme", "popup-sonnerie-alarme", "popup-mails", "popup-import-cours", "popup-revision-accueil", "popup-statistiques-revision", "popup-ouverture-boite", "popup-stats-yt", "popup-recherche", "popup-trajet", "popup-pronote", "popup-question-ia", "popup-repeter", "popup-calculatrice", "popup-convertir", "popup-traduction", "popup-notification", "popup-agenda", "popup-hasard", "popup-notes", "popup-analyser-image", "popup-correction"];
    for (const id of popups) {
        const popup = document.getElementById(id);
        if (event.target === popup) {
            popup.style.display = "none";
        }
    }
};




let dernierEtatDeskBot = null;

const ETATS_DESKBOT = {
    attente: {
        nom: "En veille",
        image: "img/sleep.svg",
        classe: "etat-attente"
    },

    ecoute: {
        nom: "Écoute",
        image: "img/micro.svg",
        classe: "etat-ecoute"
    },

    reflexion: {
        nom: "Réflexion",
        image: "img/cerveau.svg",
        classe: "etat-reflexion"
    },

    parle: {
        nom: "Parle",
        image: "img/parler.svg",
        classe: "etat-parle"
    }
};


function afficherEtatDeskBot(etat) {

    const infos = ETATS_DESKBOT[etat];

    if (!infos) return;

    const image = document.getElementById("etat-deskbot-image");
    const texte = document.getElementById("etat-deskbot-texte");
    const carte = document.getElementById("etat-deskbot");

    if (!image || !texte || !carte) return;

    image.src = infos.image;
    texte.textContent = infos.nom;

    carte.className = "module etat-deskbot " + infos.classe;

    dernierEtatDeskBot = etat;
}


function chargerEtatDeskBot() {

    if (!TOKEN) return;

    fetch("https://api.gogekko.fr/etat", {
        headers: {
            "Authorization": "Bearer " + TOKEN
        }
    })
    .then(response => response.json())
    .then(data => {

        if (data.etat) {
            afficherEtatDeskBot(data.etat);
        }

        if (data.reponse) {
            document.getElementById("reponse").textContent =
                "Réponse: " + data.reponse;
        }

    })
    .catch(() => {
        afficherEtatDeskBot("attente");
    });
}

setInterval(chargerEtatDeskBot, 500);

chargerEtatDeskBot();