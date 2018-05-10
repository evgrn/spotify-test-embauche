"use strict";
/**
 * Classe gérant le système de la recherche d'artistes
 */
var ArtistManager = /** @class */ (function () {
    /**
     * Récupère les données textuelles de l'app relatives à la partie "artist", stocke une instance d'AlertManager et d'AuthorizationManager entrées en paramètre, initialise les sélecteurs des éléments du dom correspondant au conteneur de la liste des artistes et au champ de recherche des artistes,
     * et écoute les frappes dans le champ de recherche.
     *
     * @param {AlertManager} alertManager
     * @param {AuthorizationManager} listTarget
     * @param {string} inputTarget
     * @param {string} authorizationManager
     * @param {string} albumListTarget
     */
    function ArtistManager(alertManager, authorizationManager, listTarget, inputTarget, albumListTarget) {
        this.unableToLoadConfigMessage = 'Impossible de charger le fichier de configuration';
        var that = this;
        // Récupération des données textuelles de l'app relatives à la partie "artist"
        $.ajax({
            dataType: "json",
            url: "config/config.json",
            success: function (data) {
                that.setupStrings(data);
            },
            error: function () {
                that.alertManager.displayError(that.unableToLoadConfigMessage);
            }
        });
        // Initialisation des sélecteurs
        this.alertManager = alertManager;
        this.authorizationManager = authorizationManager;
        this.listTarget = listTarget;
        this.inputTarget = inputTarget;
        this.searchboxTarget = inputTarget + ' input';
        this.hidingTriggerTarget = albumListTarget + ', ' + listTarget;
        // Initialisation de l'écoute des évènements
        this.listenTyping();
        this.listenToggleEvents();
    }
    /**
     * Initialisation des des données textuelles de l'app relatives à la partie "artist"
     *
     * @param {object} data
     */
    ArtistManager.prototype.setupStrings = function (data) {
        this.loadingProblemMessage = data.alert_messages.unable_to_load.artists;
        this.defaultImgUrl = data.default_image_url.artist;
    };
    /**
     * Affiche les resultats liés à la chaîne correspondant à la valeur de la barre de recherche
     * si sa longueur n'est pas nulle.
     */
    ArtistManager.prototype.listenTyping = function () {
        var _this = this;
        $(this.searchboxTarget).on('keyup paste', function (e) {
            if ($(_this.searchboxTarget).val().length > 0) {
                _this.loadItems($(_this.searchboxTarget).val());
            }
        });
    };
    /**
     * Effectue une recherche d'artistes relative à la chaîne entrée en paramètre et affiche le résultat.
     * En cas d'erreur, s'il s'agit d'une erreur d'autorisation, redirige vers la page d'autorisation, sinon affiche un message d'erreur.
     */
    ArtistManager.prototype.loadItems = function (searchTerm) {
        var _this = this;
        var that = this;
        $.ajax({
            url: 'https://api.spotify.com/v1/search',
            headers: {
                'Authorization': 'Bearer ' + this.authorizationManager.getToken()
            },
            data: {
                q: searchTerm,
                type: "artist",
                offset: 0,
                limit: 50
            },
            success: function (response) {
                // Affichage du résultat sur la page
                that.handleLoading(response);
            },
            error: function (data) {
                // S'il s'agit d'une erreur 401, affichage du message expliquant que l'autorisation a expiré et redirection vers la page d'autorisation
                if (data.status === 401) {
                    that.authorizationManager.redirectToAuthorization();
                    return;
                }
                // Sinon affichage d'un message d'erreur
                that.alertManager.displayError(_this.loadingProblemMessage);
            }
        });
    };
    /**
     * Efface la liste des artistes courante.
     * Pour chaque élément correspondant à un artiste du tableau issu de l'objet passé en paramètre, remplace l'url de l'image par celle par défaut si elle est inexistante
     * et insère un élément "artiste" généré dynamiquement à partir des données dans la liste des albums.
     *
     * @param response
     */
    ArtistManager.prototype.handleLoading = function (response) {
        var that = this;
        // Vidange la liste des artistes.
        $(this.listTarget).empty();
        // Génération les éléments "artist"
        $.map(response.artists.items, function (artist) {
            // Remplacement de l'url de l'url de l'image par celle par défaut si inexistante
            var imgUrl = $(artist.images).length > 0 ? artist.images[2].url : that.defaultImgUrl;
            $(that.listTarget).append(that.template(artist.name, artist.id, imgUrl));
        });
    };
    /**
     * Génère un élément "artiste" à partir des paramètres entrés et d'un template.
     *
     * @param name
     * @param id
     * @param imgUrl
     * @returns {string}
     */
    ArtistManager.prototype.template = function (name, id, imgUrl) {
        return "\n            <div class=\"artist col-12\" id=\"" + id + "\">\n                <div class=\"row\">\n                    <div class=\"col-1 img-container\">\n                        <img src=\"" + imgUrl + "\" alt=\"" + name + "\" />\n                   </div>\n                    <div class=\"col-11\">\n                        <p class=\"artist-name\">" + name + "</p>\n                    </div>\n                </div>\n                \n            </div>\n        ";
    };
    /**
     * Affiche la liste des suggestions d'artistes au clic sur la barre de recherche,
     * La cache lorsqu'elle est cliquée ou au clic sur la liste des albums
     *
     */
    ArtistManager.prototype.listenToggleEvents = function () {
        var _this = this;
        $(this.searchboxTarget).on('click', function () {
            $(_this.listTarget).fadeIn(200);
        });
        $(this.hidingTriggerTarget).on('click', function () {
            $(_this.listTarget).fadeOut(200);
        });
    };
    return ArtistManager;
}());
