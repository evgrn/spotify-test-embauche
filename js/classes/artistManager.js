"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/**
 * Classe gérant le système de la recherche d'artistes
 */
var ArtistManager = /** @class */ (function (_super) {
    __extends(ArtistManager, _super);
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
        var _this = _super.call(this, authorizationManager) || this;
        _this.unableToLoadConfigMessage = 'Impossible de charger le fichier de configuration';
        var that = _this;
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
        _this.alertManager = alertManager;
        _this.listTarget = listTarget;
        _this.inputTarget = inputTarget;
        _this.searchboxTarget = inputTarget + ' input';
        _this.hidingTriggerTarget = albumListTarget + ', ' + listTarget;
        // Initialisation de l'écoute des évènements
        _this.listenTyping();
        _this.listenToggleEvents();
        return _this;
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
     * si sa longueur n'est pas nulle et ignore les retours clavier.
     */
    ArtistManager.prototype.listenTyping = function () {
        var _this = this;
        $(this.searchboxTarget).on('keyup paste', function (e) {
            // Ignorer les retours clavier
            if (e.which == 13) {
                e.preventDefault();
            }
            // Afficher les résultats liés à la chaîne entrée
            if ($(_this.searchboxTarget).val().length > 0) {
                _this.loadArtists($(_this.searchboxTarget).val());
            }
        });
    };
    /**
     * Effectue une recherche d'artistes relative à la chaîne entrée en paramètre et affiche le résultat.
     * En cas d'erreur, s'il s'agit d'une erreur d'autorisation, redirige vers la page d'autorisation, sinon affiche un message d'erreur.
     */
    ArtistManager.prototype.loadArtists = function (searchTerm) {
        var _this = this;
        this.loadItems({
            "requestUrl": 'https://api.spotify.com/v1/search',
            "query": searchTerm,
            "type": "artist",
            "offset": 0,
            "limit": 50,
            "successCallback": function (data) { return _this.handleLoadingSuccess(data); },
            "errorCallback": function (error) { return _this.handleLoadingError(error); }
        });
    };
    /**
     * Efface la liste des artistes courante.
     * Pour chaque élément correspondant à un artiste du tableau issu de l'objet passé en paramètre, remplace l'url de l'image par celle par défaut si elle est inexistante
     * et insère un élément "artiste" généré dynamiquement à partir des données dans la liste des albums.
     *
     * @param response
     */
    ArtistManager.prototype.handleLoadingSuccess = function (response) {
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
        return "\n            <div class=\"artist col-12\" id=\"" + id + "\">\n                <div class=\"row\">\n                    <div class=\"col-sm-1 col-5 img-container\">\n                        <img src=\"" + imgUrl + "\" alt=\"" + name + "\" />\n                   </div>\n                    <div class=\"col-sm-11 col-7\">\n                        <p class=\"artist-name\">" + name + "</p>\n                    </div>\n                </div>\n                \n            </div>\n        ";
    };
    /**
     * Si l'erreur en paramètre correspond à un code 401, affiche du message expliquant que l'autorisation a expiré et redirige vers la page d'autorisation.
     * Affiche un message d'erreur sinon.
     *
     * @param {object} error
     */
    ArtistManager.prototype.handleLoadingError = function (error) {
        // S'il s'agit d'une erreur 401, affichage du message expliquant que l'autorisation a expiré et redirection vers la page d'autorisation
        if (error.status === 401) {
            this.authorizationManager.redirectToAuthorization();
            return;
        }
        // Sinon affichage d'un message d'erreur
        this.alertManager.displayError(this.loadingProblemMessage);
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
}(APICallManager));
